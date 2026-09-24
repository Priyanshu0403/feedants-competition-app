const path = require('path');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const competitionService = require('../services/competitionService');
const { invalidateCompetitionCache } = require('../services/cacheService');

const VIDEO_EXT = ['.mp4', '.mov', '.m4v', '.avi', '.mkv'];

const createSubmission = catchAsync(async (req, res) => {
  const registration = await Registration.findOne({ _id: req.params.registrationId, user: req.user._id });
  if (!registration) throw new ApiError(404, 'Registration not found.');
  if (registration.status !== 'confirmed') {
    throw new ApiError(400, 'Only confirmed (paid) registrations can submit an entry.');
  }
  if (!req.file) throw new ApiError(400, 'A media file is required.');

  const ext = path.extname(req.file.originalname).toLowerCase();
  const mediaType = VIDEO_EXT.includes(ext) ? 'video' : 'image';
  const mediaUrl = `/uploads/${req.file.filename}`;

  // Upsert: re-submitting simply replaces the earlier entry, which keeps
  // this endpoint idempotent and lets a participant fix a bad upload.
  const submission = await Submission.findOneAndUpdate(
    { registration: registration._id },
    {
      registration: registration._id,
      competition: registration.competition,
      user: req.user._id,
      mediaUrl,
      mediaType,
      caption: req.body.caption || '',
      status: 'submitted',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  invalidateCompetitionCache(String(registration.competition));
  const details = await competitionService.getCompetitionDetails({ idOrSlug: String(registration.competition), user: req.user });
  success(res, 201, { submission, competition: details });
});

module.exports = { createSubmission };

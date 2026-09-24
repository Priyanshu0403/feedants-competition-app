const Competition = require('../models/Competition');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { success } = require('../utils/apiResponse');
const registrationService = require('../services/registrationService');
const competitionService = require('../services/competitionService');
const { confirmPaymentSchema } = require('../validators/registrationValidators');

const registerForCompetition = catchAsync(async (req, res) => {
  const competition = await Competition.findOne({
    $or: [{ _id: /^[0-9a-fA-F]{24}$/.test(req.params.idOrSlug) ? req.params.idOrSlug : null }, { slug: req.params.idOrSlug }],
  });
  if (!competition) throw new ApiError(404, 'Competition not found.');

  const registration = await registrationService.registerUserForCompetition({ competition, userId: req.user._id });
  const details = await competitionService.getCompetitionDetails({ idOrSlug: String(competition._id), user: req.user });
  success(res, 201, { registration, competition: details });
});

const confirmPayment = catchAsync(async (req, res) => {
  const { paymentReference } = confirmPaymentSchema.parse(req.body || {});
  const registration = await registrationService.confirmPayment({
    registrationId: req.params.registrationId,
    userId: req.user._id,
    paymentReference,
  });
  const details = await competitionService.getCompetitionDetails({ idOrSlug: String(registration.competition), user: req.user });
  success(res, 200, { registration, competition: details });
});

const cancelRegistration = catchAsync(async (req, res) => {
  const registration = await registrationService.cancelRegistration({
    registrationId: req.params.registrationId,
    userId: req.user._id,
  });
  const details = await competitionService.getCompetitionDetails({ idOrSlug: String(registration.competition), user: req.user });
  success(res, 200, { registration, competition: details });
});

module.exports = { registerForCompetition, confirmPayment, cancelRegistration };

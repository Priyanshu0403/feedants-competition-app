const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');
const { computeSpotsInfo, computeCountdown, computeUserActionState } = require('./competitionStateService');
const { releaseExpiredReservations } = require('./registrationService');
const { getCompetitionCache, setCompetitionCache } = require('./cacheService');

/** The parts of a competition that are the same for every viewer. */
function serializeCompetitionBase(competition, now) {
  const spots = computeSpotsInfo(competition);
  const countdown = computeCountdown(competition, now);
  return {
    id: competition._id,
    title: competition.title,
    slug: competition.slug,
    tags: competition.tags,
    badges: competition.badges,
    category: competition.category,
    description: competition.description,
    bannerImage: competition.bannerImage,
    currency: competition.currency,
    prizePool: competition.prizePool,
    entryFee: competition.entryFee,
    spots,
    dates: {
      registrationStart: competition.registrationStart,
      registrationEnd: competition.registrationEnd,
      submissionStart: competition.submissionStart,
      submissionEnd: competition.submissionEnd,
      resultDate: competition.resultDate,
    },
    countdown,
    judge: competition.judge,
    rewards: [...competition.rewards].sort((a, b) => a.position - b.position),
    previousWinners: competition.previousWinners,
    refundPolicyText: competition.refundPolicyText,
    paymentProvider: competition.paymentProvider,
    status: competition.status,
  };
}

async function listPublishedCompetitions({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Competition.find({ status: 'published' }).sort({ registrationEnd: 1 }).skip(skip).limit(limit),
    Competition.countDocuments({ status: 'published' }),
  ]);
  const now = new Date();
  return {
    items: items.map((c) => serializeCompetitionBase(c, now)),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit) || 1,
  };
}

async function getCompetitionDetails({ idOrSlug, user }) {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrSlug);
  const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };

  let competition = await Competition.findOne(query);
  if (!competition || (competition.status !== 'published' && !user)) {
    throw new ApiError(404, 'Competition not found.');
  }

  // Lazily reclaim spots from lapsed, unpaid reservations before reporting
  // availability, so "spots left" shown to this caller is always accurate,
  // even if the background sweep job hasn't run yet.
  const releasedCount = await releaseExpiredReservations(competition._id);
  if (releasedCount > 0) {
    competition = await Competition.findOne(query);
  }

  const now = new Date();
  const cacheKey = String(competition._id);
  let base = getCompetitionCache(cacheKey);
  if (!base) {
    base = serializeCompetitionBase(competition, now);
    setCompetitionCache(cacheKey, base);
  }

  if (!user) {
    const actionState = computeUserActionState({ competition, registration: null, submission: null, now, isAuthenticated: false });
    return { ...base, userState: { isAuthenticated: false, registration: null, submission: null, ...actionState } };
  }

  const registration = await Registration.findOne({
    competition: competition._id,
    user: user._id,
  }).sort({ createdAt: -1 });

  const submission = registration ? await Submission.findOne({ registration: registration._id }) : null;

  const actionState = computeUserActionState({ competition, registration, submission, now, isAuthenticated: true });

  const isActive = registration && ['pending_payment', 'confirmed'].includes(registration.status);

  return {
    ...base,
    userState: {
      isAuthenticated: true,
      registration: isActive
        ? {
            id: registration._id,
            status: registration.status,
            paymentExpiresAt: registration.paymentExpiresAt,
            entryFeeAmount: registration.entryFeeAmount,
          }
        : null,
      submission: submission
        ? { id: submission._id, mediaUrl: submission.mediaUrl, mediaType: submission.mediaType, status: submission.status }
        : null,
      ...actionState,
    },
  };
}

module.exports = { listPublishedCompetitions, getCompetitionDetails, serializeCompetitionBase };

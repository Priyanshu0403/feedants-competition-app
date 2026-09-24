const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const Submission = require('../models/Submission');
const ApiError = require('../utils/ApiError');
const config = require('../config/env');
const { getRegistrationWindowState, WINDOW } = require('./competitionStateService');
const { invalidateCompetitionCache } = require('./cacheService');

/**
 * Marks any pending_payment registrations whose reservation window has
 * lapsed as 'expired' and releases their reserved spot back to the pool.
 * Called lazily (whenever a competition is read or a new registration is
 * attempted) and by the background sweep job, so stale reservations never
 * block real registrations for long even if the sweep job is delayed.
 */
async function releaseExpiredReservations(competitionId) {
  const now = new Date();
  const stale = await Registration.find({
    competition: competitionId,
    status: 'pending_payment',
    paymentExpiresAt: { $lt: now },
  });

  let releasedCount = 0;
  for (const reg of stale) {
    // Conditional update so two concurrent sweeps can't both decrement the
    // same registration's reservation twice.
    // eslint-disable-next-line no-await-in-loop
    const updated = await Registration.findOneAndUpdate(
      { _id: reg._id, status: 'pending_payment' },
      { status: 'expired', cancelledAt: now },
      { new: true }
    );
    if (updated) {
      // eslint-disable-next-line no-await-in-loop
      await Competition.updateOne({ _id: competitionId }, { $inc: { registeredCount: -1 } });
      releasedCount += 1;
    }
  }
  if (releasedCount > 0) invalidateCompetitionCache(String(competitionId));
  return releasedCount;
}

/**
 * Reserves a spot and creates a registration for the given user.
 *
 * Concurrency strategy — chosen so this is correct under heavy concurrent
 * load *without* requiring a MongoDB replica set / multi-document
 * transaction (which a standalone `mongod` used for local development
 * doesn't support):
 *
 *   1. Atomically increment `registeredCount` ONLY if there is still room:
 *      `findOneAndUpdate({ registeredCount: { $lt: max } }, { $inc: { registeredCount: 1 } })`.
 *      A single-document update is inherently atomic in MongoDB, so this
 *      is safe no matter how many requests race for the last spot — at
 *      most `maxParticipants` increments can ever succeed.
 *   2. Create the Registration document. A partial unique index on
 *      {competition, user} (only covering pending/confirmed statuses)
 *      guarantees a user can only hold one active registration, so a
 *      double-submit race resolves as a duplicate-key error rather than a
 *      double booking.
 *   3. If step 2 fails for any reason, compensate by decrementing the
 *      counter back down so the reserved spot is released immediately.
 *
 * Trade-off: there's a theoretical window between steps 1 and 2 where a
 * crash could leave the counter incremented with no matching registration.
 * A production system handling this at true scale would instead wrap both
 * writes in a MongoDB transaction against a replica set (Atlas provides
 * this by default). See README for the full discussion.
 */
async function registerUserForCompetition({ competition, userId }) {
  await releaseExpiredReservations(competition._id);

  const now = new Date();
  const freshCompetition = await Competition.findById(competition._id);
  if (!freshCompetition) throw new ApiError(404, 'Competition not found.');

  if (freshCompetition.status !== 'published') {
    throw new ApiError(400, 'This competition is not open for registration.');
  }

  const windowState = getRegistrationWindowState(freshCompetition, now);
  if (windowState === WINDOW.NOT_STARTED) {
    throw new ApiError(400, 'Registration has not opened yet.');
  }
  if (windowState === WINDOW.CLOSED) {
    throw new ApiError(400, 'Registration is closed for this competition.');
  }

  const reserved = await Competition.findOneAndUpdate(
    { _id: competition._id, registeredCount: { $lt: freshCompetition.maxParticipants }, status: 'published' },
    { $inc: { registeredCount: 1 } },
    { new: true }
  );
  if (!reserved) {
    throw new ApiError(409, 'All spots for this competition have just been filled. Please check back for future openings.');
  }

  const entryFeeAmount = freshCompetition.entryFee;
  const isFree = entryFeeAmount === 0;

  try {
    const registration = await Registration.create({
      competition: competition._id,
      user: userId,
      status: isFree ? 'confirmed' : 'pending_payment',
      entryFeeAmount,
      confirmedAt: isFree ? now : null,
      paymentExpiresAt: isFree ? null : new Date(now.getTime() + config.reservationWindowMinutes * 60 * 1000),
    });
    invalidateCompetitionCache(String(competition._id));
    return registration;
  } catch (err) {
    // Compensate: release the spot we optimistically reserved above.
    await Competition.updateOne({ _id: competition._id }, { $inc: { registeredCount: -1 } });
    if (err.code === 11000) {
      throw new ApiError(409, 'You already have an active registration for this competition.');
    }
    throw err;
  }
}

async function confirmPayment({ registrationId, userId, paymentReference }) {
  const registration = await Registration.findOne({ _id: registrationId, user: userId });
  if (!registration) throw new ApiError(404, 'Registration not found.');
  if (registration.status === 'confirmed') return registration; // idempotent

  if (registration.status !== 'pending_payment') {
    throw new ApiError(400, `Registration is ${registration.status} and can no longer be paid for.`);
  }
  if (registration.paymentExpiresAt && registration.paymentExpiresAt < new Date()) {
    throw new ApiError(410, 'Your reserved spot has expired. Please register again.');
  }

  registration.status = 'confirmed';
  registration.confirmedAt = new Date();
  registration.paymentReference = paymentReference || `MOCK-${Date.now()}`;
  await registration.save();
  invalidateCompetitionCache(String(registration.competition));
  return registration;
}

async function cancelRegistration({ registrationId, userId }) {
  const registration = await Registration.findOne({ _id: registrationId, user: userId });
  if (!registration) throw new ApiError(404, 'Registration not found.');
  if (!['pending_payment', 'confirmed'].includes(registration.status)) {
    throw new ApiError(400, 'This registration is not active.');
  }

  const hasSubmission = await Submission.exists({ registration: registration._id });
  if (hasSubmission) {
    throw new ApiError(400, 'You cannot cancel after submitting your entry. Please contact support if you need help.');
  }

  registration.status = 'cancelled';
  registration.cancelledAt = new Date();
  await registration.save();
  await Competition.updateOne({ _id: registration.competition }, { $inc: { registeredCount: -1 } });
  invalidateCompetitionCache(String(registration.competition));
  return registration;
}

module.exports = {
  releaseExpiredReservations,
  registerUserForCompetition,
  confirmPayment,
  cancelRegistration,
};

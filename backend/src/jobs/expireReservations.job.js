const Registration = require('../models/Registration');
const { releaseExpiredReservations } = require('../services/registrationService');

const SWEEP_INTERVAL_MS = 60 * 1000;

/**
 * Periodic safety-net sweep. Expired reservations are already released
 * lazily whenever a competition is read or a new registration is
 * attempted (see registrationService), but that only covers competitions
 * someone happens to be looking at. This background sweep guarantees
 * `registeredCount` self-heals for every competition, even ones nobody is
 * currently viewing.
 */
function startExpiryJob() {
  const run = async () => {
    try {
      const competitionIds = await Registration.distinct('competition', {
        status: 'pending_payment',
        paymentExpiresAt: { $lt: new Date() },
      });
      // eslint-disable-next-line no-restricted-syntax
      for (const id of competitionIds) {
        // eslint-disable-next-line no-await-in-loop
        await releaseExpiredReservations(id);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[expiry-job] sweep failed:', err.message);
    }
  };

  run(); // run once on boot too, don't wait a full minute for the first pass
  return setInterval(run, SWEEP_INTERVAL_MS);
}

module.exports = { startExpiryJob };

/**
 * Pure, dependency-free "state machine" for a Competition.
 *
 * Every function here is a plain function of (competition, now, ...) with
 * no I/O, which is what makes it possible to unit test every business rule
 * (see tests/competitionStateService.test.js) without spinning up MongoDB.
 * The rest of the app (competitionService, registrationService) is
 * responsible for loading data and calling into this module to decide
 * what's true right now.
 */

const WINDOW = {
  NOT_STARTED: 'NOT_STARTED',
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
  FULL: 'FULL',
};

function getRegistrationWindowState(competition, now) {
  if (now < competition.registrationStart) return WINDOW.NOT_STARTED;
  if (now > competition.registrationEnd) return WINDOW.CLOSED;
  if (competition.registeredCount >= competition.maxParticipants) return WINDOW.FULL;
  return WINDOW.OPEN;
}

function getSubmissionWindowState(competition, now) {
  if (now < competition.submissionStart) return WINDOW.NOT_STARTED;
  if (now > competition.submissionEnd) return WINDOW.CLOSED;
  return WINDOW.OPEN;
}

function getResultsState(competition, now) {
  return now >= competition.resultDate ? 'DECLARED' : 'PENDING';
}

function computeSpotsInfo(competition) {
  const max = competition.maxParticipants;
  // Clamp defensively: registeredCount should never exceed max because of
  // the atomic conditional increment in registrationService, but a UI
  // should never show a negative "spots left" even if data is ever off.
  const registered = Math.min(Math.max(competition.registeredCount, 0), max);
  const spotsLeft = Math.max(max - registered, 0);
  return {
    maxParticipants: max,
    registeredCount: registered,
    spotsLeft,
    percentFilled: max > 0 ? Math.round((registered / max) * 100) : 0,
    isFull: spotsLeft === 0,
  };
}

/**
 * Decides what the single countdown banner on the screen should show.
 * The design shows one banner at a time, so we pick whichever deadline is
 * most relevant to the user's next action right now, in priority order.
 */
function computeCountdown(competition, now) {
  const regWindow = getRegistrationWindowState(competition, now);
  const subWindow = getSubmissionWindowState(competition, now);
  const results = getResultsState(competition, now);
  const DAY_MS = 24 * 60 * 60 * 1000;

  if (regWindow === WINDOW.NOT_STARTED) {
    return { label: 'Registration opens in', targetDate: competition.registrationStart, urgent: false };
  }
  if (regWindow === WINDOW.OPEN) {
    const msLeft = competition.registrationEnd.getTime() - now.getTime();
    return { label: 'Registration closes in', targetDate: competition.registrationEnd, urgent: msLeft < DAY_MS };
  }
  if (subWindow === WINDOW.NOT_STARTED) {
    return { label: 'Submissions open in', targetDate: competition.submissionStart, urgent: false };
  }
  if (subWindow === WINDOW.OPEN) {
    const msLeft = competition.submissionEnd.getTime() - now.getTime();
    return { label: 'Submission closes in', targetDate: competition.submissionEnd, urgent: msLeft < DAY_MS };
  }
  if (results === 'PENDING') {
    return { label: 'Results announce in', targetDate: competition.resultDate, urgent: false };
  }
  return null; // Nothing left to count down to — results are out.
}

/**
 * Derives the primary call-to-action (the bottom button + "Registered"
 * pill in the design) for a specific user, given their registration and
 * submission (or lack thereof). This is intentionally the single source of
 * truth for that decision so the client never has to re-derive it from
 * raw dates — it just renders what the server says.
 */
function computeUserActionState({ competition, registration, submission, now, isAuthenticated }) {
  const regWindow = getRegistrationWindowState(competition, now);
  const subWindow = getSubmissionWindowState(competition, now);

  if (competition.status === 'cancelled') {
    return { statusPill: 'Cancelled', ctaLabel: 'Competition Cancelled', ctaAction: 'NONE', ctaDisabled: true };
  }

  if (!isAuthenticated) {
    return { statusPill: null, ctaLabel: 'Login to Register', ctaAction: 'LOGIN', ctaDisabled: false };
  }

  const isActiveRegistration = registration && ['pending_payment', 'confirmed'].includes(registration.status);

  if (!isActiveRegistration) {
    if (regWindow === WINDOW.NOT_STARTED) {
      return { statusPill: null, ctaLabel: 'Registration Opens Soon', ctaAction: 'NONE', ctaDisabled: true };
    }
    if (regWindow === WINDOW.CLOSED) {
      return { statusPill: null, ctaLabel: 'Registration Closed', ctaAction: 'NONE', ctaDisabled: true };
    }
    if (regWindow === WINDOW.FULL) {
      return { statusPill: null, ctaLabel: 'Competition Full', ctaAction: 'NONE', ctaDisabled: true };
    }
    return {
      statusPill: null,
      ctaLabel: competition.entryFee > 0 ? `Register • Pay ₹${competition.entryFee}` : 'Register for Free',
      ctaAction: 'REGISTER',
      ctaDisabled: false,
    };
  }

  if (registration.status === 'pending_payment') {
    return {
      statusPill: 'Payment Pending',
      ctaLabel: `Complete Payment • ₹${competition.entryFee}`,
      ctaAction: 'PAY',
      ctaDisabled: false,
    };
  }

  // registration.status === 'confirmed' from here on.
  if (submission) {
    return { statusPill: 'Registered', ctaLabel: 'Submitted — View Entry', ctaAction: 'VIEW_SUBMISSION', ctaDisabled: false };
  }
  if (subWindow === WINDOW.NOT_STARTED) {
    return { statusPill: 'Registered', ctaLabel: 'Submissions Open Soon', ctaAction: 'NONE', ctaDisabled: true };
  }
  if (subWindow === WINDOW.CLOSED) {
    return { statusPill: 'Registered', ctaLabel: 'Submission Window Closed', ctaAction: 'NONE', ctaDisabled: true };
  }
  return { statusPill: 'Registered', ctaLabel: 'Upload Submission', ctaAction: 'UPLOAD_SUBMISSION', ctaDisabled: false };
}

module.exports = {
  WINDOW,
  getRegistrationWindowState,
  getSubmissionWindowState,
  getResultsState,
  computeSpotsInfo,
  computeCountdown,
  computeUserActionState,
};

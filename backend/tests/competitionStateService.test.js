const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getRegistrationWindowState,
  computeSpotsInfo,
  computeCountdown,
  computeUserActionState,
  WINDOW,
} = require('../src/services/competitionStateService');

function baseCompetition(overrides = {}) {
  const now = Date.now();
  return {
    status: 'published',
    entryFee: 99,
    maxParticipants: 20,
    registeredCount: 1,
    registrationStart: new Date(now - 5 * 86400000),
    registrationEnd: new Date(now + 1 * 86400000),
    submissionStart: new Date(now - 1 * 86400000),
    submissionEnd: new Date(now + 10 * 86400000),
    resultDate: new Date(now + 15 * 86400000),
    ...overrides,
  };
}

test('registration window is OPEN when within range and spots remain', () => {
  const c = baseCompetition();
  assert.equal(getRegistrationWindowState(c, new Date()), WINDOW.OPEN);
});

test('registration window is FULL once registeredCount reaches max', () => {
  const c = baseCompetition({ registeredCount: 20 });
  assert.equal(getRegistrationWindowState(c, new Date()), WINDOW.FULL);
});

test('registration window is CLOSED after registrationEnd', () => {
  const c = baseCompetition();
  const future = new Date(c.registrationEnd.getTime() + 1000);
  assert.equal(getRegistrationWindowState(c, future), WINDOW.CLOSED);
});

test('registration window is NOT_STARTED before registrationStart', () => {
  const c = baseCompetition();
  const past = new Date(c.registrationStart.getTime() - 1000);
  assert.equal(getRegistrationWindowState(c, past), WINDOW.NOT_STARTED);
});

test('computeSpotsInfo never reports negative spotsLeft, even if over-counted', () => {
  const c = baseCompetition({ registeredCount: 25, maxParticipants: 20 });
  const spots = computeSpotsInfo(c);
  assert.equal(spots.spotsLeft, 0);
  assert.equal(spots.isFull, true);
});

test('computeSpotsInfo reports the exact remaining count and percentage', () => {
  const c = baseCompetition({ registeredCount: 1, maxParticipants: 20 });
  const spots = computeSpotsInfo(c);
  assert.equal(spots.spotsLeft, 19);
  assert.equal(spots.percentFilled, 5);
});

test('countdown targets registration end while registration is open', () => {
  const c = baseCompetition();
  const countdown = computeCountdown(c, new Date());
  assert.equal(countdown.label, 'Registration closes in');
});

test('countdown targets submission end once registration has closed but submissions are open', () => {
  const c = baseCompetition();
  const afterRegEnd = new Date(c.registrationEnd.getTime() + 1000);
  const countdown = computeCountdown(c, afterRegEnd);
  assert.equal(countdown.label, 'Submission closes in');
});

test('countdown is null once results have been declared', () => {
  const c = baseCompetition();
  const afterResults = new Date(c.resultDate.getTime() + 1000);
  const countdown = computeCountdown(c, afterResults);
  assert.equal(countdown, null);
});

test('unauthenticated users are asked to log in', () => {
  const c = baseCompetition();
  const state = computeUserActionState({ competition: c, registration: null, submission: null, now: new Date(), isAuthenticated: false });
  assert.equal(state.ctaAction, 'LOGIN');
});

test('authenticated, unregistered user within an open window can register', () => {
  const c = baseCompetition();
  const state = computeUserActionState({ competition: c, registration: null, submission: null, now: new Date(), isAuthenticated: true });
  assert.equal(state.ctaAction, 'REGISTER');
  assert.match(state.ctaLabel, /Pay ₹99/);
});

test('a free competition prompts "Register for Free" instead of a payment amount', () => {
  const c = baseCompetition({ entryFee: 0 });
  const state = computeUserActionState({ competition: c, registration: null, submission: null, now: new Date(), isAuthenticated: true });
  assert.equal(state.ctaLabel, 'Register for Free');
});

test('a full competition blocks new registrations even for logged in users', () => {
  const c = baseCompetition({ registeredCount: 20 });
  const state = computeUserActionState({ competition: c, registration: null, submission: null, now: new Date(), isAuthenticated: true });
  assert.equal(state.ctaAction, 'NONE');
  assert.equal(state.ctaDisabled, true);
  assert.equal(state.ctaLabel, 'Competition Full');
});

test('a confirmed registrant inside the submission window is prompted to upload', () => {
  const c = baseCompetition();
  const registration = { status: 'confirmed' };
  const state = computeUserActionState({ competition: c, registration, submission: null, now: new Date(), isAuthenticated: true });
  assert.equal(state.ctaAction, 'UPLOAD_SUBMISSION');
  assert.equal(state.statusPill, 'Registered');
});

test('a registrant who already submitted sees a view-entry action, not upload', () => {
  const c = baseCompetition();
  const registration = { status: 'confirmed' };
  const submission = { id: 'submission-1' };
  const state = computeUserActionState({ competition: c, registration, submission, now: new Date(), isAuthenticated: true });
  assert.equal(state.ctaAction, 'VIEW_SUBMISSION');
});

test('a pending-payment registration prompts payment completion', () => {
  const c = baseCompetition();
  const registration = { status: 'pending_payment' };
  const state = computeUserActionState({ competition: c, registration, submission: null, now: new Date(), isAuthenticated: true });
  assert.equal(state.ctaAction, 'PAY');
  assert.equal(state.statusPill, 'Payment Pending');
});

test('a cancelled prior registration does not block a fresh registration attempt', () => {
  const c = baseCompetition();
  const registration = { status: 'cancelled' };
  const state = computeUserActionState({ competition: c, registration, submission: null, now: new Date(), isAuthenticated: true });
  assert.equal(state.ctaAction, 'REGISTER');
});

test('a cancelled competition disables all actions regardless of user state', () => {
  const c = baseCompetition({ status: 'cancelled' });
  const state = computeUserActionState({ competition: c, registration: null, submission: null, now: new Date(), isAuthenticated: true });
  assert.equal(state.ctaDisabled, true);
  assert.equal(state.ctaLabel, 'Competition Cancelled');
});

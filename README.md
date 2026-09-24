# Feedants — Competition Details Screen

A functional full-stack implementation of the **Feedants Competition Details screen**, built from the provided design reference as a real backend-driven feature rather than a static UI reproduction.

**Stack:** React Native (Expo) · Node.js + Express.js · MongoDB (Mongoose)

---

## 1. Features Implemented

- Dynamic competition information served from MongoDB:
  - Title, tags, prize pool, entry fee
  - Judge and rewards
  - Previous winners
  - About, Judging Parameters and Rules sections
- Server-driven competition availability and remaining spots.
- Registration lifecycle with:
  - Registration window
  - Submission window
  - Results announcement
  - Open, closed and full states
- User participation states:
  - Not registered
  - Payment pending
  - Confirmed
  - Submission uploaded
- Dynamic countdown based on the current competition lifecycle.
- Mock Razorpay-style payment flow.
- Free competitions confirm registration immediately.
- Paid competitions temporarily reserve a spot while payment is pending.
- Image/video submission upload using multipart form data.
- Validation and handling for:
  - Full competitions
  - Expired payment reservations
  - Duplicate registrations
  - Closed registration/submission windows
  - Cancelled competitions
  - Rate limiting
- JWT-based authentication.
- Unit-tested competition state-machine/business logic.

---

## 2. Project Structure

```text
feedants-competition-app/
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── config/          # Environment loading and DB connection
│   │   ├── models/          # User, Competition, Registration, Submission
│   │   ├── services/        # Business logic and state management
│   │   ├── controllers/     # HTTP handlers
│   │   ├── routes/          # Express routes
│   │   ├── middleware/      # Auth, validation, rate limiting, uploads
│   │   ├── jobs/            # Expired reservation cleanup
│   │   └── seed/            # Demo data
│   └── tests/               # Unit tests
│
└── frontend/
    └── src/
        ├── api/             # Axios client and API wrappers
        ├── context/         # Authentication/session context
        ├── screens/         # Login and Competition Details screens
        ├── components/      # Reusable and screen-specific components
        ├── hooks/           # useCountdown
        └── theme/           # Shared theme/colors
```

---

## 3. How to Run the Project

### Prerequisites

- Node.js
- npm
- MongoDB (local MongoDB or MongoDB Atlas)
- Expo Go for testing on a physical device, or an Android/iOS emulator

### Backend

```bash
cd backend
npm install
```

Create a `.env` file from `.env.example` and configure:

```env
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
```

Seed the demo data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:4000
```

Run backend tests:

```bash
npm test
```

### Frontend

```bash
cd frontend
npm install
```

Configure the API base URL in:

```text
frontend/src/config.js
```

Use the appropriate URL depending on how the app is being tested:

```text
iOS simulator:
http://localhost:4000/api

Android emulator:
http://10.0.2.2:4000/api

Physical device with Expo Go:
http://<YOUR-COMPUTER-LAN-IP>:4000/api
```

Start Expo:

```bash
npm start
```

Then press `a` for Android, `i` for iOS, or scan the QR code using Expo Go.

---

## 4. Demo Accounts

The seed script creates two demo accounts.

| Email | Password | Purpose |
|---|---|---|
| `registered@feedants.dev` | `password123` | Demonstrates registered/paid user flow and submission |
| `new@feedants.dev` | `password123` | Demonstrates registration → payment → submission flow |

The login screen also provides quick access to these demo accounts.

---

# 5. Business Logic and Concurrency

### Server-side state machine

The competition state is derived on the backend rather than reconstructed from raw dates in the client.

`backend/src/services/competitionStateService.js` calculates:

- Registration status
- Submission status
- Remaining spots
- Relevant countdown
- User participation state
- Bottom CTA and action
- Registration/status indicators

This keeps business rules centralized and makes the state-machine logic independently testable.

The state-machine tests cover window transitions, full/expired cases and CTA branches.

### Concurrent registration handling

Limited competition spots require protection against two users registering for the final available spot simultaneously.

Instead of:

```text
Read registeredCount
        ↓
Check available spots
        ↓
Increment registeredCount
```

the backend uses a single atomic MongoDB conditional update:

```js
Competition.findOneAndUpdate(
  {
    _id,
    registeredCount: { $lt: maxParticipants },
    status: 'published'
  },
  {
    $inc: { registeredCount: 1 }
  },
  {
    new: true
  }
);
```

This prevents the application from exceeding `maxParticipants` when multiple registration requests arrive concurrently.

A partial unique index on the competition/user registration relationship also prevents a user from holding multiple active registrations for the same competition.

### Pending payment reservations

Paid registrations initially enter `pending_payment` and reserve a spot for a limited period.

Expired reservations are released:

1. Lazily when the competition is accessed or another registration occurs.
2. Proactively through a background job that periodically checks for expired reservations.

This keeps the displayed availability accurate without requiring the user to refresh repeatedly.

---

# 6. API Reference

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Authenticate and receive JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/competitions` | Optional | List published competitions |
| GET | `/api/competitions/:idOrSlug` | Optional | Get competition details and computed user state |
| POST | `/api/competitions/:idOrSlug/register` | Yes | Reserve a competition spot |
| POST | `/api/registrations/:id/confirm-payment` | Yes | Confirm mock payment |
| POST | `/api/registrations/:id/cancel` | Yes | Cancel registration |
| POST | `/api/registrations/:id/submission` | Yes, multipart | Upload competition submission |

API responses follow:

```json
{
  "success": true,
  "data": {}
}
```

or:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

# 7. Assumptions

- One submission is allowed per registration. Uploading again replaces the previous submission.
- The competition entry fee is charged once during registration.
- A user is considered fully registered only after payment is confirmed.
- A pending payment registration is displayed separately from a confirmed registration.
- The provided design's bottom navigation is outside the scope of this assignment and is therefore presentational.
- The ENG/Hindi language switch is presentational in this build; a complete i18n layer was outside the assigned screen scope.
- The backend supports account registration, while the frontend focuses on the assigned Competition Details flow.
- Payment is mocked because real payment gateway credentials and webhook infrastructure were not part of the assignment.

---

# 8. Major Technical Decisions

### Backend-driven view model

The Competition Details API returns competition information together with the current user's registration/submission state.

This reduces frontend round trips and ensures that business-rule decisions are made consistently by the server.

### Pure state-machine service

Competition lifecycle logic is separated into a dependency-free service.

This makes the most important business rules easy to unit test without requiring a database or HTTP server.

### Atomic registration counter

A conditional atomic MongoDB update is used for limited spots instead of a simple read-then-write approach.

This directly addresses concurrent registration requests.

### JWT authentication

JWT was selected because it works well with a mobile client and allows authentication to remain stateless.

### Local file uploads for the assignment

Multer with local disk storage is used for submissions so the project can run without requiring external cloud credentials.

---

# 9. Trade-offs

### Atomic update vs. MongoDB transaction

The registration flow uses an atomic counter update plus compensation rather than a multi-document transaction.

This keeps the assignment runnable on a standard local MongoDB instance without requiring replica-set configuration.

For production on MongoDB Atlas, the reservation and registration writes should be wrapped in a transaction.

### In-process cache

A short-lived in-process cache is used for competition-only data.

This is simple and suitable for the assignment, but a distributed cache such as Redis would be more appropriate when running multiple backend instances.

### Mock payment

The payment flow is intentionally mocked.

A production implementation should use a real payment gateway with server-side payment verification and webhook handling.

### Local storage

Uploaded files are stored locally for simplicity.

This would be replaced with object storage in production.

---

# 10. Production Improvements

If this feature were developed further for production, I would:

- Use MongoDB transactions for the complete registration/reservation workflow.
- Integrate Razorpay or another payment gateway with server-side verification and webhooks.
- Move uploaded media to S3/Cloudinary using signed upload URLs.
- Use Redis for distributed caching and rate limiting.
- Add proper internationalization behind the language switch.
- Add admin roles and CRUD APIs for managing competitions.
- Add push notifications for registration deadlines and result announcements.
- Add refund handling for eligible paid registrations.
- Add stronger observability with structured logging, monitoring and error tracking.
- Add integration/load tests for high-concurrency registration scenarios.
- Deploy the frontend and backend with production environment variables and HTTPS.

---

# 11. Testing

Backend unit tests can be run with:

```bash
cd backend
npm test
```

The tests focus on the competition state machine, including lifecycle transitions, availability, expired states and CTA decisions.

---

# 12. Demo / Screen Recording

**Screen recording:**  
`https://drive.google.com/file/d/1D1NLYPu7cRLDyC-E3-CtbEsykkmkIWJ0/view?usp=drive_link`

The recording demonstrates:

1. Login
2. Competition Details screen
3. Dynamic competition information
4. Registration flow
5. Submission upload
6. Registered user state
7. Competition lifecycle/countdown behavior

---

## Submission Checklist

- [ ] GitHub repository link
- [ ] README with setup instructions
- [ ] Environment variable documentation
- [ ] Backend source code
- [ ] React Native source code
- [ ] MongoDB seed/demo data
- [ ] Unit tests
- [ ] Screen recording link

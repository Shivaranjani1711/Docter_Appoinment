# CareLine - Doctor Appointment, Telemedicine & Hospital Management Platform

A final-year project: appointment booking (online + in-person), teleconsultation,
medical records, prescriptions, emergency consultation, and hospital admin
analytics. See the architecture discussion earlier in this project's history
for the full design rationale, database schema, and API structure.

## Stack

- **Backend**: Node.js, Express, TypeScript, MongoDB + Mongoose, JWT auth with
  rotating refresh tokens, Razorpay (payments), Daily.co (video).
- **Frontend**: React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query.

## Running locally

### Backend
```
cd backend
cp .env.example .env     # fill in JWT secrets at minimum
npm install
npm run seed              # creates the Hospital record, starter specializations, and a bootstrap admin (prints its password once)
npm run dev                # http://localhost:4000
```
Requires a MongoDB **replica set** (not a standalone instance) because appointment
booking uses multi-document transactions. MongoDB Atlas free tier works out of
the box. For local development, run `mongod --replSet rs0` and initiate it with
`rs.initiate()` in the mongo shell, or use `mongodb-memory-server` as the test
suite does.

### Frontend
```
cd frontend
npm install
npm run dev                # http://localhost:5173, proxies /api to :4000
```

### Backend tests
```
cd backend
npm test                   # spins up an in-memory MongoDB replica set automatically
```

## What's implemented

- Full auth: register/login/refresh/logout, email verification, password reset,
  account lockout, rate limiting, RBAC middleware.
- Appointment engine: configurable per-doctor online/in-person slot ratio,
  concurrency-safe booking (DB unique index + atomic compare-and-swap, verified
  by an automated test that fires two simultaneous bookings at one slot),
  cancellation/reschedule/conversion-to-video with cutoff policies, no-show and
  pending-payment expiry background jobs.
- Medical reports: private storage, magic-byte file validation, object-level
  authorization (patient, their doctor, or admin only).
- Prescriptions, video consultations (Daily.co adapter), emergency consultation
  with a request/accept state machine, Razorpay payment + webhook + refunds,
  in-app notifications, admin analytics (all real queries, no fake data),
  audit logging.
- Frontend: full patient/doctor/admin dashboards, booking flow, legal pages
  (privacy/terms/cookie/refund - all marked for legal review), landing page
  built to the project's "no AI-slop" visual rules.

## Known gaps / what's left

- **Payment UI**: the backend Razorpay order-creation and webhook flow is complete
  and testable with real keys, but the frontend does not yet embed Razorpay's
  checkout widget after booking a fee-based appointment - this needs real
  `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` to build and test against.
- **Video/payment providers are unconfigured by default** - without `DAILY_API_KEY`
  or Razorpay keys in `.env`, those features return a clear "not configured" error
  rather than failing silently.
- No live browser testing was performed (no MongoDB replica set or API keys
  available in this environment) - verified via `tsc`, `vite build`, and the
  backend's automated test suite (6/6 passing) instead.
- UI has not had an accessibility/contrast audit pass, and SMTP email sending
  falls back to console logging in development.
- No CI pipeline, deployment configs, or production Dockerfiles yet.

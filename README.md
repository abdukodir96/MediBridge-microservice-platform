# MediBridge

Korea medical tourism marketplace — microservice platform connecting
international patients with verified Korean clinics.

## Screenshots

<!--
  Drop real PNGs from the running app into docs/screenshots/ using the
  filenames below (priority order — the first 2-3 matter most):
    1. landing.png        — Landing page
    2. find-clinics.png   — Find Clinics, filters/search visible
    3. booking.png        — Booking flow or Payment screen, escrow "locked
                             price" badge visible — the screen that shows the
                             most engineering depth
    4. dashboard.png      — Patient My Page or Clinic Dashboard, real data
    5. chat.png           — Chat, showing the real-time feature
-->

![Landing page](docs/screenshots/landing.png)
![Find Clinics](docs/screenshots/find-clinics.png)
![Booking flow](docs/screenshots/booking.png)
![Dashboard](docs/screenshots/dashboard.png)
![Chat](docs/screenshots/chat.png)

## Architecture

- **gateway** — API Gateway (NestJS)
- **core** — Core service (NestJS + GraphQL + MongoDB)
- **payment** — Payment service (NestJS + PostgreSQL)
- **chat** — Chat service (NestJS + Socket.io)
- **ai** — AI service (Python + FastAPI)
- **web** — Frontend (Next.js)

## Getting started

```bash
cp .env.example .env   # fill in JWT_SECRET (any value is fine for local dev)
docker compose up --build
```

This starts everything — MongoDB, PostgreSQL, and all five NestJS/Python
services (`core`, `gateway`, `payment`, `chat`, `ai`) — with services able
to reach each other by their Compose service name (e.g. `core`, `payment`)
instead of `localhost`. No cloud accounts or manual DB setup needed —
except optionally `GEMINI_API_KEY` (see Translation below), which just
disables chat translation if left blank.

Once it's up:

- Gateway GraphQL: http://localhost:3000/graphql
- Core GraphQL (direct): http://localhost:3001/graphql
- Payment: TCP-only (no public HTTP API), reachable from `core` on port 3004
- Chat (Socket.io): ws://localhost:3005
- AI service (translation): http://localhost:8000

Databases start empty. To seed fixture accounts (a verified clinic + a
patient) for manual testing:

```bash
docker compose exec core npx ts-node -r tsconfig-paths/register src/seed/seed-fixtures.ts
```

## Security

Login is hardened against brute-force and enumeration:

- **No user enumeration.** "No such email" and "wrong password" return the
  same `Invalid credentials` message, and a nonexistent-email login still
  pays for a `bcrypt.compare()` against a dummy hash — so a real account and
  a fake one take the same time to reject, closing the timing side-channel
  too.
- **Exponential-backoff lockout, scoped to email+IP** (not email alone) — a
  `LoginAttempt` record (no Redis needed) locks out further attempts for
  30s → 2m → 8m → up to 30m as failures pile up. Scoping to the IP pair
  means an attacker hammering one account from one IP can't lock the real
  owner out from logging in elsewhere.
- **Adaptive hCaptcha.** After 3 failures on the same email+IP, the next
  login attempt requires a verified hCaptcha token (checked server-side
  against hCaptcha's `siteverify` API) — real users essentially never see
  it, since 1-2 mistyped passwords are unpunished.

## Translation

Chat messages are translated by a small FastAPI service (`apps/ai`) calling
Gemini. Two deliberate design choices:

- **Never blocks sending.** A message is saved and broadcast (`newMessage`)
  immediately; translation happens afterward, best-effort, and patches the
  message in place with a follow-up `messageTranslated` event once (if) it
  succeeds. A slow or fully-down AI service never adds latency to sending a
  message — same failure-open philosophy as the Payment integration (core
  flow first, auxiliary service optional).
- **Per-message translation direction, not a single room language.** Each
  chat room has two independent sides (patient, clinic owner — or admin,
  clinic owner for support rooms), and their `memberLang` values are
  fetched from Core once and frozen onto the room (`roomPatientLang`,
  `roomClinicOwnerLang`) when it's opened — denormalized on purpose to
  avoid a live TCP round-trip to Core on every single message. Translation
  target is resolved per-message from `messageSenderId`: a patient's
  message is translated into the clinic's language and vice versa. Admin
  messages are assumed English (the panel's working language) rather than
  stored per-admin, since an `ADMIN_CLINIC` room is a shared inbox any
  admin can post in — there's no single admin to freeze a language for.

## Known limitations / tech debt

### Backend

- **Cloudinary uses the Root API key's secret**, not a scoped key — a
  scoped key was created but its dashboard role never granted upload
  permissions in the time available. Must be swapped for a properly scoped
  key before production; the Root key has unrestricted account access.
- **hCaptcha is running on the official public test site key + secret**
  (`10000000-ffff-ffff-ffff-000000000001` / a fixed test secret), which
  always passes verification. Must be swapped for real dashboard keys
  before production — right now the captcha step is a no-op against real
  attackers.
- **Rate limiting / login lockout state is in-memory**, per Node process
  (NestJS's default `ThrottlerModule` storage, and the `LoginAttempt`
  Mongo collection is per-document but the guard's own counters aren't
  distributed). Fine for a single instance; horizontally scaling `core`
  would need a shared store (Redis) so limits apply across all instances
  instead of resetting per-process.
- **~~A clinic owner with multiple clinics is not fully supported~~ —
  fixed at the source.** `createClinic` now rejects a second clinic for an
  owner that already has one, so the `getMyClinic` "which one?" ambiguity
  can't arise for any new account. Existing fixture data (one owner with ~25
  clinics, from earlier testing) still has the old duplicates — harmless
  test artifact, not a live bug, left as-is.
- **`clinicLicenses`** is ready at the schema and mutation level, but the
  frontend UI is deliberately not built: the correct version requires
  showing the clinic's uploaded documents in the Admin Clinic Review Queue
  and gating VERIFIED status on that review. The current Admin panel has no
  document-viewing capability yet — this is a separate, future feature.
- **Orphaned Cloudinary files.** Replacing or removing an uploaded image
  (gallery photo, procedure image, avatar) never deletes the old file from
  Cloudinary — accepted as an MVP tradeoff, no delete-asset flow exists yet.
- **Dashboard stat cards are computed client-side from a capped fetch**
  (`limit: 50`, the backend's `@Max(50)` DoS guard) rather than a true
  backend aggregation — accurate for any account with 50 or fewer bookings,
  approximate beyond that. Real scale needs a `$count`/`$sum` aggregation
  query instead.
- **`Booking` has no separate `paymentStatus` (HELD/RELEASED).** A
  `COMPLETED` booking doesn't distinguish "escrow released" from "patient
  hasn't confirmed yet" — the distinction currently lives only in whether
  `confirmCompletion` has been called, not in a queryable field.
- **Room languages are denormalized at room-creation time, not live.** If a
  member changes their `memberLang` after a chat room already exists, that
  room keeps translating into the old language — same staleness trade-off
  as booking price locking, made for the same reason (avoid a live Core
  round-trip per message). A settings change doesn't retroactively fix
  open rooms.
- **A failed translation is silently dropped, with no retry.** If Gemini
  times out or errors once, that message just never gets a
  `messageTranslatedText` — there's no retry queue or dead-letter handling.
  Acceptable for a best-effort feature; would need a job queue (which is
  exactly what RabbitMQ, below, would be for) to do better.

### Frontend

- **Clinic-initiated chat isn't supported** — a clinic can reply inside an
  existing room but can't start a new conversation with a patient; only the
  patient (or an admin) can open the first message.

### Deliberately not built

- **AI clinic recommendation** — matching a patient's stated needs (budget,
  procedure, language) to relevant clinics via the AI service. Chat
  translation was prioritized first since it serves the platform's core
  promise (the language barrier) directly and had a ready-made hook
  (`Message.messageTranslatedText`, already in the schema, unused until
  now); recommendation needs its own new UI surface (a results view) and
  is a separate, larger pass.
- **AI medical Q&A chatbot** — same reasoning: a new chat-like UI surface
  of its own, out of scope for this pass.
- **RabbitMQ** — no async message queue between services yet; everything
  is synchronous TCP (Gateway ↔ Core/Payment) or direct GraphQL/HTTP (Chat
  ↔ AI). Would matter most for retrying failed translations (see above).
- **`MedicalDocument` module / booking document uploads** — deferred as a
  separate, larger feature (distinct from the image-upload work already
  done for clinic galleries, procedures, and profile photos).

### Chat

- **No "new message" notification outside a joined room.** A member only
  receives `newMessage` events for rooms they've explicitly `joinRoom`'d in
  the current socket session — there's no unread-message signal for rooms
  they haven't joined yet. Plan: auto-join a member to all of their rooms
  (from `getMyRooms`) right after `handleConnection` authenticates them, so
  they get live updates across all their conversations without an explicit
  join per room.

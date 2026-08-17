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

This starts everything — MongoDB, PostgreSQL, and all four NestJS services
(`core`, `gateway`, `payment`, `chat`) — with services able to reach each
other by their Compose service name (e.g. `core`, `payment`) instead of
`localhost`. No cloud accounts or manual DB setup needed.

Once it's up:

- Gateway GraphQL: http://localhost:3000/graphql
- Core GraphQL (direct): http://localhost:3001/graphql
- Payment: TCP-only (no public HTTP API), reachable from `core` on port 3004
- Chat (Socket.io): ws://localhost:3005

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
- **A clinic owner with multiple clinics is not fully supported** —
  `getMyClinic` just returns the oldest match.
- **`ClinicInput` has no `clinicLicenses` field** — clinic verification
  documents aren't collected at signup.
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

### Frontend

- **Clinic-initiated chat isn't supported** — a clinic can reply inside an
  existing room but can't start a new conversation with a patient; only the
  patient (or an admin) can open the first message.
- **The clinic-search "Location" filter is UI-only.** It's a hardcoded list
  (`Gangnam-gu`, `Sinsa-dong`, `Apgujeong`) with no backend field behind
  it — unlike the price filter, which is fully wired
  (`priceMin`/`priceMax` on `ClinicSearchInput`). Selecting a location
  currently does nothing server-side.

### Deliberately not built

- **AI service** (Python) — planned but out of scope for this pass.
- **RabbitMQ** — no async message queue between services yet; everything
  is synchronous TCP (Gateway ↔ Core/Payment) or direct GraphQL.
- **`MedicalDocument` module / booking document uploads** — deferred as a
  separate, larger feature (distinct from the image-upload work already
  done for clinic galleries, procedures, and profile photos).

### Chat

- **No "new message" notification outside a joined room.** A member only
  receives `newMessage` events for rooms they've explicitly `joinRoom`'d in
  the current socket session — there's no unread-message signal for rooms
  they haven't joined yet. Plan: once the frontend exists, auto-join a member
  to all of their rooms (from `getMyRooms`) right after `handleConnection`
  authenticates them, so they get live updates across all their
  conversations without an explicit join per room.

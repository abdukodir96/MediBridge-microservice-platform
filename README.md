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

## SEO / Internationalization

The public route tree (`app/[locale]/...`) is served in 4 languages —
English, Chinese, Korean, Japanese — via `next-intl`, chosen deliberately in
that priority order: Google doesn't operate in China, so Chinese is the one
market standard SEO can't reach at all; Korean matters for local (Naver)
search; Japanese is lower priority since Google already indexes English
content reasonably well there.

- **`localePrefix: "as-needed"`** — the default locale (English) gets no URL
  prefix (`/clinics`, not `/en/clinics`), so every hardcoded `href="/clinics"`
  already in the codebase keeps working unchanged. Only non-default locales
  need a prefix (`/zh/clinics`). `/en/...` itself 307-redirects to the
  unprefixed path to avoid duplicate-content SEO issues.
- **`/clinics` is server-rendered**, not client-fetched — this was the
  highest-priority fix, since Baidu (the search engine that actually matters
  for the Chinese market) doesn't reliably execute JavaScript the way Google
  does. A client-rendered page is effectively invisible to it. Verified via
  plain `curl` (no JS) returning real clinic names in the HTML.
- **Root layout stays singular** — `app/layout.tsx` (fonts, Apollo
  `Providers`, global CSS) was deliberately *not* duplicated into a second
  "root layout" under `[locale]/`. It reads the locale itself via
  `getLocale()`/`getMessages()` (`next-intl/server`), which resolves to the
  default locale automatically for every route outside `[locale]`
  (dashboard, admin — English-only, unprefixed, unaffected).
- Internal links/pagination on translated pages use `@/i18n/navigation`'s
  `Link`/`useRouter` (not `next/navigation`'s) — the locale prefix is added
  automatically, so page code never manually threads a locale through a URL.
- Checkbox/filter state (specialty, language) is keyed on the backend enum
  value (e.g. `PLASTIC_SURGERY`), never on the displayed label — the label
  is resolved per-locale from `messages/*.json`. This was a deliberate fix:
  the original filter UI used the English label itself as the filter's
  identity, which would have silently broken filtering on every non-English
  page.

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

### SEO / Internationalization — next concrete steps

`/clinics/[id]`, `/login`, `/signup`, and `/booking/new` are now translated
(EN/ZH/KO/JA) alongside Landing and `/clinics`, using the same `useTranslations`
/`getTranslations` pattern. Checkbox/filter identity vs. display-label
separation, and cross-page navigation via `@/i18n/navigation` (not
`next/navigation`) so the locale prefix survives client-side pushes, both
carried over from `/clinics`.

- **Not every string in these three pages has a translation yet** — only
  the keys the translation files actually define were wired (e.g. auth's
  "Remember me"/"Forgot password?", booking's "Date of birth" label, and
  several `auth.signup.*` keys with no corresponding form field —
  `fullNameLabel`, `countryLabel`, `languageLabel` — stay English). Expected
  and deliberate: translating what exists, not inventing new form fields or
  copy to fill out an in-progress message catalog.
- **`booking.success`** (the "your request was submitted" banner) has a
  translation key but is never wired — it lives in `dashboard-screen.tsx`,
  which is deliberately outside `[locale]` (dashboard/admin stay English by
  design). Translating one string there without translating the rest of the
  dashboard would be inconsistent, so left as-is.
- **Mixed-target client navigation (`useRouter().push()`) is a latent
  trap**: `next-intl`'s `@/i18n/navigation` router blindly prefixes *any*
  path with the current locale — it has no idea `/dashboard/...` and
  `/admin/...` live outside `[locale]`. `clinic-booking-card.tsx` was fully
  safe to swap (both its push targets — `/login`, `/booking/new` — are
  in-scope). `booking-flow.tsx` and `auth-screen.tsx` were **not** touched
  because each mixes in-scope pushes (`/login`) with out-of-scope ones
  (`/dashboard/patient`, `/dashboard/clinic`, `/admin`) in the same
  component — swapping the router wholesale there would silently 404 the
  dashboard redirects. Needs either two router instances per component or a
  small helper that only prefixes known in-scope paths.
1. **Deploy phase (domain, VPS/hosting, SSL, swap every test credential for
   real ones — Cloudinary, hCaptcha, Gemini)** — not started. Blocks and is
   blocked by (2): search engines can't index what isn't live at a real
   domain.
2. **Search console registration — Baidu Webmaster Tools, Naver Search
   Advisor** (plus Google Search Console) — not started, depends on (1)
   being done first.

`sitemap.ts`/`robots.ts`/JSON-LD are now built (see below) — that closes out
Phase 2 entirely; only the two items above remain.

### Content translation (clinic/procedure names & descriptions)

Static UI strings are translated via message files (above); *content*
(`clinicName`, `clinicDesc`, `procedureName`, `procedureDesc` — typed in by a
clinic owner, always in English today) is a separate problem, solved
separately: `getClinic`/`getClinics`/`getProceduresByClinic` all take an
optional `locale` argument. English (or no `locale` at all — existing
callers are unaffected) returns content exactly as authored; any other
supported locale returns an AI-translated version, cached in a new
`ContentTranslation` collection (`{ entityType, entityId, locale, fields }`,
unique per triple) so the AI service is only ever called once per
entity+locale, not once per page view.

- **Fail-open, and only caches on full success.** If the AI service errors
  or times out, the field falls back to its original English text for that
  request — and the result is deliberately **not** cached, so the next
  request retries instead of a transient outage (confirmed live during
  testing — Gemini returned a real `503 UNAVAILABLE` "high demand" twice)
  freezing a clinic in English forever.
- **Sequential per-entity, not batched.** A `/clinics` listing page
  translates each clinic's name one request at a time; the first visitor to
  hit an untranslated locale for a given page pays for that (a few seconds,
  confirmed live: ~2-5s cold vs. ~0.1s once cached). Acceptable for a demo;
  a production version would add a `/translate-batch` endpoint to the AI
  service (one Gemini call for N strings) or a pre-warm script that
  populates the cache for all clinics/locales ahead of time.
- **Source language is hardcoded to English** — there's no clinic-facing
  UI for entering content in another language, so there's nothing to
  detect.

### Sitemap, robots.txt, structured data

- **`app/robots.ts`** — allows everything except `/dashboard/`, `/admin/`,
  `/booking/` (private or login-gated, not SEO targets), points crawlers at
  the sitemap.
- **`app/sitemap.ts`** — every static public path (`/`, `/clinics`, `/login`,
  `/signup`) × all 4 locales, plus every VERIFIED clinic's profile page ×
  all 4 locales, each with `alternates.languages` — Next.js's built-in way
  to emit `hreflang` annotations directly in the sitemap XML (Google's
  documented preferred method over per-page `<link rel="alternate">` tags
  for a multi-page site), including `x-default` pointing at the unprefixed
  English URL. Paginates through `getClinics` in batches of 50 (the
  backend's `@Max(50)` cap) rather than assuming everything fits in one
  request — correct at today's fixture size (27 clinics) and beyond it.
  Confirmed live: 124 `<loc>` entries = (4 static + 27 clinics) × 4 locales,
  each with all 4 `hreflang` alternates plus `x-default`.
- **JSON-LD (`MedicalBusiness` schema)** on `/clinics/[id]` — `name`/
  `description` reflect whatever this request's locale already resolved
  them to (English or AI-translated), so the structured data always matches
  what's actually displayed, not a separate/stale copy. Adds
  `aggregateRating` (rating stars in Google search results, a real
  click-through driver) when a clinic has reviews.
  - **Real security fix during implementation**: `clinicDesc` is
    clinic-owner-authored freeform text, and `JSON.stringify()` does *not*
    escape `</script>` — embedding it unescaped inside
    `dangerouslySetInnerHTML` would let a malicious clinic description break
    out of the `<script>` tag and inject arbitrary HTML/JS into every
    visitor's page (stored XSS). Fixed by escaping `<` to its Unicode form
    before embedding — same JSON-LD, safe either way.
- Not built: `BreadcrumbList` and `Organization`/`WebSite` structured data
  (lower-value, explicitly deferred), and `changeFrequency`/`priority`
  tuning beyond reasonable defaults.

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

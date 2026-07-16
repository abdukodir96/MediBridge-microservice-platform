# MediBridge

Korea medical tourism marketplace — microservice platform connecting
international patients with verified Korean clinics.

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

## Known limitations / tech debt

- **Chat: no "new message" notification outside a joined room.** A member only
  receives `newMessage` events for rooms they've explicitly `joinRoom`'d in
  the current socket session — there's no unread-message signal for rooms
  they haven't joined yet. Plan: once the frontend exists, auto-join a member
  to all of their rooms (from `getMyRooms`) right after `handleConnection`
  authenticates them, so they get live updates across all their
  conversations without an explicit join per room.

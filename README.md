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

(coming soon)

## Known limitations / tech debt

- **Chat: no "new message" notification outside a joined room.** A member only
  receives `newMessage` events for rooms they've explicitly `joinRoom`'d in
  the current socket session — there's no unread-message signal for rooms
  they haven't joined yet. Plan: once the frontend exists, auto-join a member
  to all of their rooms (from `getMyRooms`) right after `handleConnection`
  authenticates them, so they get live updates across all their
  conversations without an explicit join per room.

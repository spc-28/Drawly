# Drawly

A collaborative, real-time drawing app. Multiple people can draw on the same canvas and see each
other's changes instantly. Built as a Turborepo monorepo with a Next.js client, a WebSocket server
for live sync, an Express API, and a background worker that persists every change to PostgreSQL.

## Features

- **Real-time collaboration** — changes broadcast to everyone in a room via Redis pub/sub, so the
  app scales horizontally across multiple stateless WebSocket servers.
- **Drawing tools** — rectangle, circle, line, freehand pencil, and text, with a color palette.
- **Select, move & resize** — drag to select a shape, move it, or drag its handles to resize it.
- **Eraser** — geometric hit-testing removes the shape (or whole pencil stroke) under the cursor.
- **Undo / redo** — a command stack (Ctrl+Z / Ctrl+Shift+Z) that also syncs to other users.
- **Pan & zoom** — navigate large canvases.
- **Durable persistence** — edits are queued (BullMQ) and written to Postgres, so a board reloads
  exactly as you left it.

## Architecture

```
apps/web        Next.js client (canvas, tools, UI)
apps/ws-server  WebSocket server — Redis pub/sub fan-out + BullMQ producer + DB worker
apps/http-server  Express REST API — auth, rooms, shape fetch
packages/db     Prisma schema + client (PostgreSQL)
packages/*      shared config, UI, and common types
```

Each shape carries a UUID `code` that acts as its identity across the client, the socket messages,
and the database (`Shape.id`). Creates/moves/resizes upsert that row; erases soft-delete it.

## Tech Stack

- **Frontend:** Next.js, React, Canvas API, Tailwind CSS
- **Backend:** Express.js, `ws` (WebSocket), Redis (ioredis) for pub/sub, BullMQ for the write queue
- **Database:** PostgreSQL via Prisma
- **Monorepo:** Turborepo + pnpm

## Getting Started

### Prerequisites
- Node.js v18+ and pnpm
- A PostgreSQL database
- A running Redis instance

### Setup

1. Clone and install:
   ```bash
   git clone <repo-url>
   cd drawly
   pnpm install
   ```

2. Configure environment variables (each app reads its own `.env`):
   - `packages/db/.env` → `DATABASE_URL`
   - `apps/ws-server/.env` and `apps/http-server/.env` → `REDIS_URL`, `JWT_SECRET` (+ ports)
   - `apps/web/.env` → `NEXT_PUBLIC_HTTP_URL` and the WebSocket URL

3. Set up the database:
   ```bash
   pnpm --filter @repo/db exec prisma migrate deploy
   pnpm --filter @repo/db exec prisma generate
   ```

4. Start everything in dev:
   ```bash
   pnpm run dev
   ```

## Usage

- Open `http://localhost:3000`, sign in, and create or join a room.
- Draw, then share the room link (top-right) so others can join and collaborate live.


---

Happy drawing! 🎨

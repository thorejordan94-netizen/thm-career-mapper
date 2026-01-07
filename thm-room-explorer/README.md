# THM Room Explorer

Dark-mode dashboard + room grid + admin scraper for TryHackMe rooms.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- PostgreSQL + Prisma
- BullMQ + Redis (job queue)
- Playwright + Cheerio (scraper)
- NextAuth (Credentials) + simple RBAC (admin)

## Quickstart (Docker)

```bash
cd thm-room-explorer
docker compose up -d --build

# run migrations + seed (creates admin user + seeds room slugs)
docker compose exec web npm run db:migrate
docker compose exec web npm run db:seed

# open app
curl http://localhost:3000/api/health
```

Start a scrape:

- Open `http://localhost:3000/admin`
- Login using `ADMIN_EMAIL` / `ADMIN_PASSWORD` (from `docker-compose.yml` or `.env`)
- Go to **Scraper** and start **incremental** or **full**

## Local dev (without Docker)

1) Create Postgres + Redis locally
2) Copy/edit `thm-room-explorer/.env`

```bash
cd thm-room-explorer
npm i
npm run db:migrate
npm run db:seed

# terminal 1
npm run dev

# terminal 2
npm run worker
```

## Admin routes

- `/admin/scraper` start run + view queue
- `/admin/rooms` list/search rooms
- `/admin/rooms/[slug]` edit tags/tools/lessons and override relevance

## Exports

```bash
npm run export:json
npm run export:csv
```

Outputs: `export.rooms.json`, `export.rooms.csv`.

## Notes

- The spec markdown currently contains **954 unique slugs** due to duplicates in the list; the seed script uses the unique set.
- Scraper only fetches publicly accessible room pages and uses conservative delay + low concurrency.
- Optional authenticated mode exists via `SCRAPE_AUTH_COOKIE` (user-provided only).


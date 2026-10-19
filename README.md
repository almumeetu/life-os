# Saikat’s Life OS

A private, full-stack personal workspace built with Next.js App Router, React, PostgreSQL, Prisma and Better Auth. The interface keeps the original warm Life OS visual direction while putting each part of the workflow in its own module.

## What is included

- Email and password sign-up/sign-in, protected dashboard routes and per-user data ownership.
- Overview, task and life-area lists, habits and check-ins, application stages, interview practice, focus timer and weekly review.
- Money overview, transaction history, custom categories, bank/cash/mobile-wallet accounts, saved cards and optional card images.
- JSON backup and full workspace restore from Settings. Restore is validated and applied in a single database transaction.
- Responsive navigation, forms, empty states, feedback notices and mobile layouts.

## Local setup

Requirements: Node.js 20.9 or newer, npm, and Docker with Docker Compose. A PostgreSQL 16+ server can be used instead of Docker.

```bash
npm run setup:env
npm install
docker compose up -d db
npm run db:deploy
npm run dev
```

Open `http://localhost:3000`, create an account, then add your own data. `npm run setup:env` creates a local `.env` and generates a strong Better Auth secret. It never overwrites an existing `.env`.

The default Compose database is for local development only. If you already run PostgreSQL, update `DATABASE_URL` in `.env` and skip the Docker command.

## Useful commands

```bash
npm run dev          # Generate the Prisma client and start Next.js
npm run typecheck    # Check TypeScript
npm run lint         # Run ESLint
npm run db:push      # Apply the current Prisma schema to a development database
npm run db:studio    # Open Prisma Studio
npm run build        # Generate Prisma client and build the production app
npm run start        # Serve the production build
```

For a migration-based release, create and review a Prisma migration in development, commit `prisma/migrations`, and run `npm run db:deploy` as the release step. Keep `db:push` for local development and disposable environments.

## Configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma 7 and the `pg` adapter. |
| `BETTER_AUTH_SECRET` | At least 32 characters; `setup:env` creates a random local secret. Use a secret manager in production. |
| `BETTER_AUTH_URL` | The canonical base URL of the app, such as `https://life.example.com` in production. |

For production, use a managed PostgreSQL database, set the variables in the hosting provider’s secret manager, serve over HTTPS, and run `npm run db:deploy` before starting the new application version. Do not reuse the local database credentials or commit `.env`.

## Data and privacy notes

Every read and write is scoped to the signed-in user. Protected pages, server actions and the backup endpoint validate the session. Passwords and sessions are not included in exports. Card records are for labels, account links, last four digits and an optional image; the app does not ask for a full card number or CVV. Crop those details out of an uploaded image before saving it.

Speech practice uses browser speech recognition when available and supports typing as a fallback. Saved transcripts are stored with the user’s workspace and included in backups.

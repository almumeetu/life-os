# Preparation Hub

A private workspace for interview preparation, IELTS practice, English speaking, job search, study-abroad planning and personal documents. Built with Next.js App Router, React, PostgreSQL, Prisma and Better Auth.

## What is included

- Email and password sign-up/sign-in with user-scoped records.
- Interview practice for job and university questions, with voice or text answers and saved transcripts.
- IELTS goal and exam date, plus practice logs for Listening, Reading, Writing and Speaking.
- English speaking prompts with optional browser speech recognition, a timer, transcript review and saved practice history.
- Bangla beginner reading room at `/dashboard/learn`: original book pages, zoom, browser bookmarks and notes, a four-step daily routine, seven starter explanations, and record/replay/download for the learner's own voice.
- Learning playground at `/dashboard/practice`: three four-question English challenges with English/Bangla explanations, answer review and personal bests. Results are scoped to the account in this browser's local storage; they are not synced or included in account backups.
- A guided home screen with a read → challenge → speak routine, progress for the same 60-class Spoken English course opened by the continue link, and mobile quick navigation.
- Job tracker for roles, company names, links, stages, follow-up dates and notes.
- Study-abroad checklist for requirements, deadlines and official source links, plus university and scholarship tracking.
- Personal document storage for PDF, Word, JPG, PNG and WebP files. Each file can be up to 5 MB and the account limit is 15 MB.
- JSON backup and restore for saved records and document contents.

## Local setup

Requirements: Node.js 20.9 or newer, npm, and Docker with Docker Compose. You can use a PostgreSQL 16+ server instead.

```bash
npm run setup:env
npm install
docker compose up -d db
npm run db:deploy
npm run dev
```

Open `http://localhost:3000` and create an account. `npm run setup:env` creates `.env` with a strong Better Auth secret and never overwrites an existing `.env`.

The default Compose database is for local development only. If PostgreSQL is already running, point `DATABASE_URL` in `.env` to that database and skip the Docker command.

### Learning book files

The supplied books are prepared locally in `.local/learning-books/` (ignored by Git). All 104 Spoken English pages and 352 IELTS pages are served through an authenticated route; they are not public assets. Use the sidebar **Read & learn / বই পড়ে শিখি** to open them.

To prepare them on another server, install Poppler (`pdfinfo`, `pdftoppm`) and run:

```bash
node scripts/prepare-learning-books.mjs '/path/to/spoken.pdf' '/path/to/ielts.pdf'
```

The script copies the originals and renders JPEG pages. Alternatively, copy the prepared folder to persistent server storage and set `LEARNING_BOOKS_DIR` to its absolute path. Poppler is only needed during preparation. The assets are shared learning material for signed-in workspace users; deploy them only where those users should have access. They are not included in JSON account backups. A deployment without this folder shows a missing-book message and keeps the beginner exercises available.

Reader position and notes are scoped to the signed-in user in this browser's local storage, not synced to the database. Speaking/IELTS course progress continues to use existing account records. Voice replay uses browser MediaRecorder, requires microphone permission on HTTPS or localhost, and keeps audio only until the page is left; download it to retain a copy. It does not upload audio or read scanned PDF text aloud. English example playback uses the device's text-to-speech voice.

## Useful commands

```bash
npm run dev          # Generate the Prisma client and start Next.js
npm run typecheck    # Check TypeScript
npm run lint         # Run ESLint
npm run db:deploy    # Apply committed Prisma migrations
npm run db:studio    # Open Prisma Studio
npm run build        # Generate Prisma client and build the app
npm run start        # Serve the production build
```

For a migration-based release, create and review the migration in development, commit `prisma/migrations`, and run `npm run db:deploy` before starting the new app version.

## Configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma 7 and the `pg` adapter. |
| `BETTER_AUTH_SECRET` | At least 32 characters. `setup:env` creates a random local secret; use a secret manager in production. |
| `BETTER_AUTH_URL` | The app’s canonical base URL, such as `https://life.example.com` in production. |

For production, use a managed PostgreSQL database, set secrets in the hosting provider, serve over HTTPS, and run `npm run db:deploy` before starting a new app version. Do not commit `.env` or reuse local database credentials.

## Data and privacy

Every feature query is scoped to the signed-in user. Personal documents are stored in PostgreSQL and downloads require a valid session. The app does not store speaking audio; it saves a transcript only when the user chooses to save practice. Browser speech recognition is provided by the browser and may use its own speech service.

Backups include document contents, encoded inside the JSON file. Keep downloaded backups private. Passwords and sign-in sessions are excluded.

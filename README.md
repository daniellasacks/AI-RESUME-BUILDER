# AI Resume SaaS (Portfolio Project)

[![GitHub](https://img.shields.io/badge/GitHub-daniellasacks%2FAI--RESUME--BUILDER-181717?logo=github)](https://github.com/daniellasacks/AI-RESUME-BUILDER)

Production-style, AI-powered resume builder you can demo in technical interviews: **auth**, **structured resume JSON**, **immutable version history**, **job targets**, **ATS scoring + recommendations**, **template selection**, and **PDF/DOCX export**.

## What this demonstrates (interview talking points)

- **Domain modeling**: `Resume` container + immutable `ResumeVersion` snapshots + derived versions per `JobTarget`
- **AI reliability**: schema-validated JSON outputs; safe demo fallback if `OPENAI_API_KEY` is missing
- **File handling**: PDF/DOCX upload and text extraction
- **Real deliverables**: server-side PDF/DOCX generation and one-click downloads
- **Production UX**: onboarding, loading states, error handling, responsive layout, notifications

## Tech Stack

- **Web**: React + TypeScript + Tailwind CSS
- **API**: Node.js + NestJS
- **DB**: PostgreSQL + Prisma
- **AI**: OpenAI API

## Monorepo Layout

- `apps/api`: NestJS backend
- `apps/web`: React frontend
- `packages/shared`: shared types/validation helpers
- `infra`: docker compose + local infra configs

## Key product flows

- **Create base resume**: upload → extract structured JSON → save as Version 1 (or create a blank resume and edit)
- **Job targets**: store each job description (role/company/industry) for tailoring and ATS scoring
- **Versions**: every save creates a new immutable version; compare versions via structured JSON diff paths
- **ATS**: run evaluation against a job target → score + missing keywords + recommendations saved
- **Export**: download PDF/DOCX for any version

## Getting Started (local)

1. Start Postgres

```bash
cd infra
docker compose up -d
```

If you don't have Docker, install Postgres locally and set `DATABASE_URL`.

2. Install deps (workspace root)

```bash
npm install
```

3. Create API env

```bash
cp apps/api/.env.example apps/api/.env
```

4. Run Prisma (once DB is up)

```bash
cd apps/api
npx prisma migrate dev
```

5. Run API + Web

```bash
npm run dev
```

## Environment Variables

- `OPENAI_API_KEY`
- `DATABASE_URL`
- `JWT_SECRET`

## Docs

- `ARCHITECTURE.md`
- `apps/api/README.md`
- `apps/web/README.md`


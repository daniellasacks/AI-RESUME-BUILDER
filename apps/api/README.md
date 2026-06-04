# API (`apps/api`)

NestJS + Prisma + PostgreSQL backend for the AI Resume SaaS.

## Core modules & routes

- **Auth**
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
- **Uploads**
  - `POST /uploads` (PDF/DOCX multipart)
- **Resumes (versioned)**
  - `GET /resume`
  - `POST /resume`
  - `GET /resume/:id`
  - `POST /resume/versions`
  - `POST /resume/tailor`
  - `POST /resume/extract`
- **Job targets**
  - `GET /job-targets`
  - `POST /job-targets`
  - `GET /job-targets/:id`
  - `PUT /job-targets/:id`
  - `DELETE /job-targets/:id`
- **ATS**
  - `POST /ats/evaluate`
- **Templates**
  - `GET /templates` (ensures default templates are seeded)
- **Export**
  - `GET /export/resume/:versionId.pdf`
  - `GET /export/resume/:versionId.docx`
- **Cover letters**
  - `POST /cover-letter/generate`

## Local development

From repo root:

```bash
npm install
cd infra && docker compose up -d
cd apps/api && cp .env.example .env
cd apps/api && npx prisma migrate dev
npm run dev
```

## Environment variables

- `DATABASE_URL`
- `JWT_SECRET`
- `OPENAI_API_KEY` (optional; demo fallback mode if missing)
- `UPLOAD_DIR` (optional; defaults to local storage)


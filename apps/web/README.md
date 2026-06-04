# Web (`apps/web`)

React + TypeScript + Vite + Tailwind frontend for the AI Resume SaaS.

**Author:** Daniella Azar

## Pages

- `GET /` Landing page (portfolio-friendly)
- `GET /auth` Login / Register
- `GET /app/dashboard` Dashboard + conversational builder + upload/extract
- `GET /app/onboarding` Guided onboarding checklist
- `GET /app/resumes` Resume list
- `GET /app/resumes/:resumeId` Resume detail (versions, compare, ATS, export)
- `GET /app/resumes/:resumeId/edit` Structured resume editor (saves new version)
- `GET /app/job-targets` Job target management (CRUD)
- `GET /app/templates` Template browser + apply-to-version flow

## Dev

Run from repo root:

```bash
npm install
npm run dev
```

Configure API URL via `VITE_API_URL` (defaults to `http://localhost:3000`).


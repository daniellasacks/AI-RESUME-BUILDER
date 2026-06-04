# Architecture (Interview-Ready)

This project is designed like a small **production SaaS**: clear boundaries, scalable modules, versioned domain entities, and an AI layer that is **observable + safe by default**.

## High-level system

- **Web** (`apps/web`): React + TypeScript + Tailwind + React Router
- **API** (`apps/api`): NestJS + Prisma + PostgreSQL
- **AI**: OpenAI chat completions (with a **demo fallback mode** if `OPENAI_API_KEY` is missing)
- **Storage**: local disk uploads for dev (`UPLOAD_DIR`) → designed to swap to S3 later

## Key backend design decisions

- **Clean module boundaries** (NestJS)
  - `auth/*`: JWT-based auth (register/login/me)
  - `uploads/*`: multipart upload → file type validation → text extraction
  - `resume/*`: resume extraction JSON schema + resume CRUD + versioning + tailoring
  - `ats/*`: heuristic score + AI suggestions persisted to DB
  - `cover-letter/*`: generate tailored cover letters
  - `export/*`: PDF/DOCX export endpoints
  - `templates/*`: built-in templates (seeded via upsert)

- **Schema-first resume representation**
  - Resume “source of truth” is `ResumeVersion.structuredJson`
  - This makes it easy to:
    - render templates consistently
    - export in multiple formats
    - diff and version history
    - tailor to job descriptions without losing structure

- **Versioning strategy**
  - `Resume` is the container (title/status)
  - `ResumeVersion` is immutable snapshots (version number, createdAt, derivedFromVersionId)
  - Tailored versions link to a `JobTarget` so you can keep multiple variants per role/company

- **AI safety + reliability**
  - For structured tasks (extract/tailor), the AI is asked to return **JSON only**.
  - Output is validated with **Zod** (`ResumeSchema`). Invalid output is rejected.
  - `AiService` has a **demo mode**: it returns safe stub outputs when no key is provided.

- **Consistent error shape**
  - Global `HttpExceptionFilter` ensures the frontend receives consistent JSON errors.

## Database overview (Prisma)

Core tables:
- `User`
- `UploadedDocument` (PDF/DOCX uploads + extractedText + extractedJson)
- `Resume` → `ResumeVersion` (history/versioning)
- `JobTarget` (job description + role/company metadata)
- `CoverLetter`
- `AtsEvaluation`
- `ResumeTemplate`

## End-to-end flows

### 1) Upload + parse
1. Web uploads PDF/DOCX → `POST /uploads`
2. API extracts text (PDF `pdf-parse`, DOCX `mammoth`) and stores:
   - `UploadedDocument.extractedText`

### 2) Extract structured resume JSON
1. Web calls `POST /resume/extract { documentId }`
2. API runs LLM extraction → validates with `ResumeSchema` → stores `UploadedDocument.extractedJson`

### 3) Create resume + version history
1. Web creates resume → `POST /resume`
2. Web creates version → `POST /resume/versions`
3. Each new version increments `ResumeVersion.version`

### 4) Tailor to job description
1. Create `JobTarget` (next step to implement in UI; API model is ready)
2. Call `POST /resume/tailor { baseVersionId, jobTargetId }`
3. API creates a derived resume version linked to that job target

### 5) ATS evaluation + suggestions
1. `POST /ats/evaluate { resumeVersionId, jobTargetId }`
2. Saves `AtsEvaluation` with score/verdict and AI suggestions JSON

### 6) Cover letter
1. `POST /cover-letter/generate { resumeVersionId, jobTargetId, tone, length }`
2. Saves `CoverLetter`

### 7) Export
- `GET /export/resume/:versionId.pdf`
- `GET /export/resume/:versionId.docx`

## Frontend layout

- `src/lib/api.ts`: API client + token handling
- `src/lib/auth.tsx`: auth context provider
- `src/App.tsx`: routes:
  - `/` auth page
  - `/dashboard` chat + upload + next features

## What to highlight in interviews

- **Data modeling**: immutable resume versions; derived versions per job target
- **AI integration**: JSON-mode outputs validated via Zod; safe fallback mode
- **File handling**: multipart uploads; PDF/DOCX parsing; persistence for later LLM use
- **Export**: server-side PDF/DOCX generation via `pdfkit` + `docx`
- **Scalability path**:
  - swap local upload storage → S3
  - add background jobs (BullMQ) for parsing/generation
  - add streaming responses for chat
  - add audit logs + observability (OpenTelemetry)


# Lumi Project Health

Last updated: 2026-07-10

## Current Status

- Product: Lumi 恋语, local-first SPA for relationship communication support.
- Frontend: React 18, Vite 6, TypeScript, Tailwind CSS, Zustand, Dexie.
- Backend: Express 4, TypeScript, DeepSeek-compatible OpenAI SDK, Zod.
- Local data: browser IndexedDB via Dexie; selected UI preferences in localStorage.
- AI safety baseline added: request IDs, rate limiting, CORS environment config, and backend log redaction.
- Routing baseline added: main pages now have stable browser paths through `BrowserRouter`.
- Deployment baseline added: frontend/backend Dockerfiles, `docker-compose.yml`, and deployment notes exist.
- MinerU OCR is moving to the backend v4 precise parsing flow through `POST /api/mineru/parse-image-chat`.
- AI chat analysis now accepts 10+ messages instead of the earlier 20-message recommendation.
- V1.1 progress: emergency manual has static searchable content; reply generation prompts/mock responses now target six styles.
- V1.2 progress: local important-day reminders are available as a dedicated page plus Dashboard reminder card.
- Profile archive foundation: pursuit-stage profile setup now supports custom interests/boundaries and observation fields; profiles retain only the current saved version.

## Security Checklist

- `backend/.env` exists locally but must stay untracked.
- `backend/.env.example` documents safe placeholders only.
- Backend logs should not print raw chat messages, raw request bodies, or API keys.
- AI routes are protected by a stricter rate limit than the global API.
- MinerU token is read only by the backend.
- Frontend image OCR should call only `/api/mineru/parse-image-chat`; old OSS/Agent routes are compatibility-only until removed.

## Known Follow-Ups

- Run and refresh Playwright E2E coverage after the MinerU v4 and emergency-manual changes settle.
- Re-run Docker validation after the current uncommitted MinerU v4 work is frozen.
- Validate real large WeChat/QQ screenshots through the full flow: image upload, MinerU markdown, LLM cleanup, A/B preview, save, then AI analysis.
- Finish PRD V1.1: relationship portrait optimization and local Love Code article management.
- Start PRD V1.2 with important-day reminders before gift/date-guide recommendations.
- Connect the new pursuit-stage profile fields and independent important-date records to every AI prompt path, with explicit confidence rules for user observations.
- Decide whether `.claude/` is project config or personal local state before committing it.
- Rotate any real DeepSeek API key that may have been pasted into tools, screenshots, or chat.

# Lumi Project Health

Last updated: 2026-07-07

## Current Status

- Product: Lumi 恋语, local-first SPA for relationship communication support.
- Frontend: React 18, Vite 6, TypeScript, Tailwind CSS, Zustand, Dexie.
- Backend: Express 4, TypeScript, DeepSeek-compatible OpenAI SDK, Zod.
- Local data: browser IndexedDB via Dexie; selected UI preferences in localStorage.
- AI safety baseline added: request IDs, rate limiting, CORS environment config, and backend log redaction.

## Security Checklist

- `backend/.env` exists locally but must stay untracked.
- `backend/.env.example` documents safe placeholders only.
- Backend logs should not print raw chat messages, raw request bodies, or API keys.
- AI routes are protected by a stricter rate limit than the global API.
- MinerU token is read only by the backend.

## Known Follow-Ups

- Run and refresh Playwright E2E coverage after the routing and deployment changes settle.
- Decide whether `.claude/` is project config or personal local state before committing it.
- Rotate any real DeepSeek API key that may have been pasted into tools, screenshots, or chat.

# Deployment

## Environment Variables

Backend:

- `PORT`: backend port, default `3001`.
- `DEEPSEEK_API_KEY`: real AI key; leave empty for mock mode.
- `MOCK_MODE`: `true` for mock data, `false` for real AI calls.
- `ALLOWED_ORIGINS`: comma-separated frontend origins allowed by CORS.
- `RATE_LIMIT_WINDOW_MS`: rate limit window, default `900000`.
- `RATE_LIMIT_MAX`: global request limit per IP per window, default `100`.
- `AI_RATE_LIMIT_MAX`: AI request limit per IP per window, default `30`.
- `MINERU_TOKEN`: MinerU API token, backend only.

Frontend:

- `VITE_AI_API_BASE`: backend origin. Use `http://localhost:3001` in local dev. Use an empty string for same-origin nginx proxy builds.

## Docker Compose

```bash
copy backend\.env.example backend\.env
docker compose build
docker compose up
```

Open http://localhost:8080.

The frontend container proxies `/api/*` to the backend container, so production OCR and AI calls do not depend on the Vite dev server.

## Manual Smoke Test

1. Open the frontend.
2. Check backend health at `/api/health`.
3. Complete onboarding/profile/questionnaires.
4. Import chat records and save from preview.
5. Run AI analysis, reply assist, simulation, and export data from settings.

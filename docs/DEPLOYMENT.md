# Deployment

## Recommended production architecture

Production uses the repository-root `Dockerfile` as one web service. Express serves both the compiled React app and `/api/*` from the same origin. This avoids browser CORS and frontend/backend URL drift.

The process listens on `0.0.0.0:$PORT`, exposes `/api/health` for liveness and `/api/ready` for configuration readiness, and shuts down gracefully on `SIGTERM`.

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

Never put DeepSeek, MinerU, or Zhihu secrets in a `VITE_*` variable. Vite variables are shipped to every browser.

## Render Blueprint deployment

1. Push the repository to GitHub.
2. In Render, create a new Blueprint and select this repository. Render detects `render.yaml`.
3. Enter `DEEPSEEK_API_KEY`, `MINERU_TOKEN`, and `ZHIHU_ACCESS_SECRET` when prompted. They are declared with `sync: false` and are not stored in Git.
4. Wait for `/api/health` to pass, then verify `/api/ready` returns HTTP 200 and `mode: ai`.
5. Open the assigned `onrender.com` URL and run the manual smoke test below.

The free Render web-service plan sleeps after inactivity. Use a paid instance when consistent first-request latency is required.

## Docker Compose

```bash
copy backend\.env.example backend\.env
docker compose build
docker compose up
```

Open http://localhost:8080.

The frontend container proxies `/api/*` to the backend container, so production OCR and AI calls do not depend on the Vite dev server.

To validate the same single-container image used for public deployment:

```powershell
docker compose -f docker-compose.prod.yml up --build -d
Invoke-RestMethod http://localhost:8080/api/health
Invoke-RestMethod http://localhost:8080/api/ready
```

## Manual Smoke Test

1. Open the frontend.
2. Check backend health at `/api/health`.
3. Complete onboarding/profile/questionnaires.
4. Import chat records and save from preview.
5. Run AI analysis, reply assist, simulation, and export data from settings.

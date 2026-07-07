# Lumi

Lumi 恋语 is a local-first AI relationship communication companion.

## Project Structure

```text
Lumi/
  frontend/    React + Vite + Tailwind CSS frontend
  backend/     Express API server with AI integration
  docs/        Documentation, reports, and design specs
```

## Local Development

```bash
pnpm install
```

Create local env files:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env.local
```

Start the backend:

```bash
pnpm dev:server
```

Start the frontend:

```bash
pnpm dev
```

Default local URLs:

- Frontend: http://localhost:5173
- Backend health: http://localhost:3001/api/health

## Safety Notes

- Do not commit `backend/.env`, `.env.local`, API keys, `node_modules`, or build outputs.
- If a real `DEEPSEEK_API_KEY` was ever exposed locally or in chat logs, rotate it in the DeepSeek console.
- MinerU tokens must live only in `backend/.env` as `MINERU_TOKEN`.

## Verification

```bash
pnpm --filter lumi-server build
pnpm --filter @figma/my-make-file type-check
pnpm --filter @figma/my-make-file test
```

## Docker

```bash
docker compose build
docker compose up
```

Docker frontend: http://localhost:8080

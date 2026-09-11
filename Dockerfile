FROM node:20-alpine AS frontend-build

WORKDIR /app
ARG VITE_AI_API_BASE=
ENV VITE_AI_API_BASE=$VITE_AI_API_BASE

COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend-build

WORKDIR /app
COPY backend/package*.json ./
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=10000 \
    SERVE_FRONTEND=true

COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /app/dist ./public

USER node
EXPOSE 10000
CMD ["node", "dist/index.js"]

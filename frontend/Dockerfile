FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_AI_API_BASE=
ENV VITE_AI_API_BASE=$VITE_AI_API_BASE

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

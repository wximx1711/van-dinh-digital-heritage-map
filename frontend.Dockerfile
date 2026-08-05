# ─────────────────────────────────────────────────────────────
# Vân Đình Digital Heritage Map — Frontend image
# Builds the React SPA and serves it with nginx, which also
# reverse-proxies /api and /uploads to the backend service.
# ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

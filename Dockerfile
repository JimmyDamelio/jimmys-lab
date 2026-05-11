FROM node:20-bookworm AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-bookworm AS backend-deps
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=/data/jimmys-lab.sqlite
WORKDIR /app

COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules
COPY backend/package*.json ./backend/
COPY backend/server.js ./backend/
COPY backend/routes ./backend/routes
COPY backend/database/db.js backend/database/schema.sql ./backend/database/
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

RUN mkdir -p /data
VOLUME ["/data"]
EXPOSE 4000

WORKDIR /app/backend
CMD ["node", "server.js"]

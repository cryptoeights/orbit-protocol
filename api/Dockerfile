# syntax=docker/dockerfile:1
# ORBIT API — Hono + Drizzle, built with pnpm, served by Node 22.

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# --- install all deps (dev deps needed for tsc build + drizzle-kit migrations) ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- compile TypeScript -> dist/ ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# --- runtime image ---
FROM base AS runner
ENV NODE_ENV=production
# Keep full deps so `pnpm db:push` / `db:migrate` can run as a one-off task.
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY --from=build /app/dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]

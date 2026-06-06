# syntax=docker/dockerfile:1
# ORBIT Frontend — Next.js 16 (standalone output), built with pnpm.
#
# NOTE: NEXT_PUBLIC_* values are inlined at BUILD time, so they must be passed
# as build args (not just runtime env). See deploy/docker-compose.yml.

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# --- install deps ---
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# --- build (bakes in NEXT_PUBLIC_* args) ---
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_PRIVY_APP_ID
ARG NEXT_PUBLIC_STELLAR_NETWORK
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_PRIVY_APP_ID=$NEXT_PUBLIC_PRIVY_APP_ID \
    NEXT_PUBLIC_STELLAR_NETWORK=$NEXT_PUBLIC_STELLAR_NETWORK
RUN pnpm build

# --- minimal runtime: just the standalone server + static assets ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]

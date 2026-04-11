# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Add pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @kamusbahasamoy/web build

# Stage 2: Runner
FROM node:22-alpine AS runner

WORKDIR /app

RUN apk add --no-cache curl

# Add pnpm
RUN corepack enable && corepack prepare pnpm@10.20.0 --activate

# Copy necessary files from builder
COPY --from=builder /root/.cache/node/corepack /root/.cache/node/corepack
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web/dist ./dist
COPY --from=builder /app/apps/web/package.json ./package.json

ENV PORT=4321

# Copy and setup entrypoint
COPY apps/web/docker/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 4321

ENTRYPOINT ["/entrypoint.sh"]

# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Add pnpm
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# Copy workspace config and lockfile from root
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @kamus-bahasa-moy/web build

# Stage 2: Runtime
FROM node:22-alpine AS runtime

RUN apk add --no-cache curl

WORKDIR /app

# Add pnpm
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY --from=builder /app ./

EXPOSE 4321

CMD ["pnpm", "--filter", "@kamus-bahasa-moy/web", "preview", "--host"]
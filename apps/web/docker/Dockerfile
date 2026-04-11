FROM node:22-alpine AS base

# Install pnpm secara global
RUN npm install -g pnpm@10.20.0

WORKDIR /app

# Salin file workspace pnpm
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
# Salin package.json masing-masing folder (agar layer cache pnpm optimal)
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/package.json ./apps/api/package.json

# Install dependensi monorepo
RUN pnpm install --frozen-lockfile

# Salin seluruh kode (dengan Docker Compose volumes, ini biasanya ditimpa saat development)
COPY . .

# Expose port Astro
EXPOSE 4321

# Jalankan dalam mode development (dengan pnpm --filter)
CMD ["pnpm", "--filter", "@kamus-bahasa-moy/web", "dev", "--host"]

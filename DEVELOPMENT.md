# Panduan Development

## Struktur Proyek

Proyek ini menggunakan struktur monorepo dengan [Turborepo](https://turbo.build/) dan [pnpm workspaces](https://pnpm.io/workspaces).

```sh
kamusbahasamoy/
├── apps/
│   ├── web/          # Frontend Astro + React (Cloudflare Pages)
│   └── api/          # Backend FastAPI + SQLite
├── turbo.json        # Konfigurasi pipeline Turborepo
├── pnpm-workspace.yaml
└── package.json      # Root workspace
```

## Prasyarat

- [Node.js](https://nodejs.org/) 20 atau lebih baru
- [pnpm](https://pnpm.io/installation) 10 atau lebih baru
- [Python](https://www.python.org/) 3.13 atau lebih baru
- [uv](https://docs.astral.sh/uv/getting-started/installation/) — package manager Python

## Setup

1. Clone repositori:

   ```bash
   git clone https://github.com/papuaopensource/kamusbahasamoy.git
   cd kamusbahasamoy
   ```

2. Install semua dependensi:

   ```bash
   pnpm install
   ```

3. Salin file environment:

   ```bash
   # Untuk development lokal (host)
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env

   # UNTUK DOCKER (Global)
   cp .env.example .env
   ```

4. Jalankan migrasi database dan isi data awal:

   ```bash
   # Melalui host
   cd apps/api && uv run alembic upgrade head && uv run python scripts/seed.py

   # ATAU melalui Docker (jika kontainer sudah jalan)
   pnpm docker:migration
   pnpm docker:seed
   ```

5. Jalankan semua aplikasi sekaligus:

   ```bash
   pnpm dev
   ```

   - Frontend: `http://localhost:4321`
   - Backend API: `http://localhost:8000`

## Menjalankan Satu Aplikasi Saja

```bash
# Hanya frontend
pnpm --filter @kamus-bahasa-moy/web dev

# Hanya backend
pnpm --filter @kamus-bahasa-moy/api dev
```

## Menjalankan Development menggunakan Docker (Opsional)

```bash
# Menjalakan containers (DB, API, Frontend)
pnpm run docker:up

# Menjalankan migration + seed
pnpm run docker:init

# Stop containers
pnpm run docker:down

# Hapus containers & volume data
pnpm docker:rm
```

### Database

Secara default, API menggunakan **SQLite**. Data disimpan di `apps/api/kamus.db`.

Jika ingin menggunakan **PostgreSQL**:

Pastikan file `.env` ada di **root** (bisa copy dari `.env.example`).
Contoh:

```sh
#! Kamus Bahasa Moy - Global Environment Variables

#! Backend 
# Database configuration for PostgreSQL
DB_USER=postgres
DB_PASS=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kastau

# Database configuration for SQLite (uncomment the line below and comment out the above lines)
#DATABASE_URL=sqlite:///./kamus.db


#! Frontend
PUBLIC_API_URL=http://localhost:8000
```

## Build untuk Production

```bash
pnpm build
```

Hasil build frontend tersedia di `apps/web/dist/`.

## Migrasi Database

```bash
cd apps/api

# Terapkan semua migrasi
uv run alembic upgrade head

# Buat migrasi baru
uv run alembic revision --autogenerate -m "deskripsi perubahan"

# Rollback satu langkah
uv run alembic downgrade -1
```

## Menambah Dependensi

```bash
# Tambah dependensi ke package tertentu
pnpm --filter @kamusbahasamoy/web add <package>

# Tambah dependensi Python ke backend
cd apps/api && uv add <package>
```

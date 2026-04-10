# Panduan Development

## Struktur Proyek

Proyek ini menggunakan struktur monorepo dengan [Turborepo](https://turbo.build/) dan [pnpm workspaces](https://pnpm.io/workspaces).

```
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
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

4. Jalankan migrasi database dan isi data awal:

   ```bash
   cd apps/api
   uv run alembic upgrade head
   uv run python scripts/seed.py
   cd ../..
   ```

5. Jalankan semua aplikasi sekaligus:

   ```bash
   pnpm dev
   ```

   - Frontend: `http://localhost:4321`
   - Backend API: `http://localhost:8000`
   - Dokumentasi API: `http://localhost:8000/docs`

## Menjalankan Satu Aplikasi Saja

```bash
# Hanya frontend
pnpm --filter @kamusbahasamoy/web dev

# Hanya backend
cd apps/api && uv run uvicorn app.main:app --reload --port 8000
```

## Build untuk Produksi

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

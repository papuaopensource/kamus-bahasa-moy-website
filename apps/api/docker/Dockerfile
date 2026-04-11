FROM python:3.13-slim-bookworm

# Install uv secara langsung dari binary
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Salin file dependensi
COPY pyproject.toml .
# Salin folder app agar uv sync bisa mendeteksi source
COPY app ./app

# Install dependensi menggunakan uv
RUN uv sync --no-cache

# Salin sisa kode aplikasi
COPY . .

# Expose port FastAPI
EXPOSE 8000

# Jalankan uvicorn
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

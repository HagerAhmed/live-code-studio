# Stage 1: Build Frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Build Backend & Serve
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
# gcc and others valid if we want to compile other languages in future
# For now keeping it slim as requested for Python/Node logic
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy backend code
# Copy backend code
COPY backend/ /app/backend/
COPY backend/pyproject.toml backend/uv.lock /app/

# Sync dependencies
RUN uv sync --locked

# Copy built frontend static files
COPY --from=frontend-builder /app/frontend/dist /app/static

# Expose port
EXPOSE 8000

# Run the application
# We use 'backend.main:app' and --host 0.0.0.0 for external access
CMD ["uv", "run", "uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

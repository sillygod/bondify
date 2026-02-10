# syntax=docker/dockerfile:1

# Backend Dockerfile for English Learning API
# Uses Python 3.11 with uv for dependency management

FROM python:3.11-slim AS builder

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Copy dependency files (from root context)
COPY pyproject.toml uv.lock ./

# Install dependencies using uv (no dev dependencies)
RUN uv sync --frozen --no-dev --no-install-project

# Production stage
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Copy alembic configuration
COPY backend/alembic.ini ./
COPY backend/alembic/ ./alembic/

# Copy application code
COPY backend/app/ ./app/

# Create data directory for SQLite
RUN mkdir -p /app/data

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health', timeout=5)" || exit 1

# Run uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

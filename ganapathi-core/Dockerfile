# ══════════════════════════════════════════════════════════════════
# Ganapathi CLI v2.0 - Docker Image
# Multi-stage build for minimal image size
# ══════════════════════════════════════════════════════════════════
FROM python:3.12-slim AS builder

WORKDIR /app

# Install build deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY . .
RUN pip install --no-cache-dir --user -e .

# ── Production stage ──
FROM python:3.12-slim
WORKDIR /app

COPY --from=builder /root/.local /root/.local
COPY --from=builder /app /app

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# Pre-train ML model
RUN ganapathi ml train --samples 5000

ENTRYPOINT ["ganapathi"]
CMD ["--help"]

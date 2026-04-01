FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1

# System dependencies (psycopg2, build tools, etc.)
RUN apt-get update && \
	apt-get install -y --no-install-recommends \
	  build-essential \
	  libpq-dev && \
	rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
	pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY . .

# Generate Prisma client
RUN python -m prisma generate

EXPOSE 8000

# Default command (can be overridden by docker-compose)
CMD ["sh", "-c", "python -m prisma migrate deploy && uvicorn src.main:app --host 0.0.0.0 --port 8000"]


#!/bin/bash
set -e

# Load environment variables if .env exists
if [ -f "../../.env" ]; then
  export $(grep -v '^#' ../../.env | xargs)
elif [ -f ".env" ]; then
  export $(grep -v '^#' .env | xargs)
fi

DB_USER=${POSTGRES_USER:-linguoup}
DB_NAME=${POSTGRES_DB:-linguoup}
DB_PORT=${POSTGRES_PORT:-5435}
DB_HOST=${POSTGRES_HOST:-localhost}
SQL_FILE="$(dirname "$0")/demo_data.sql"

echo "⏳ Loading LinguoUp Demo Database..."

# Check if PostgreSQL container is running
if docker ps --format '{{.Names}}' | grep -q "linguoup_postgres"; then
  echo "🐳 Detected running Docker container 'linguoup_postgres'."
  echo "🚀 Running SQL script inside Docker..."
  docker exec -i linguoup_postgres psql -U "$DB_USER" -d "$DB_NAME" < "$SQL_FILE"
  echo "✅ Demo data loaded successfully via Docker."
else
  # Fallback to local psql
  echo "💻 Docker container not running or not found. Falling back to local psql..."
  if command -v psql &> /dev/null; then
    export PGPASSWORD=${POSTGRES_PASSWORD:-linguoup_dev}
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"
    echo "✅ Demo data loaded successfully via local psql."
  else
    echo "❌ Error: Neither running Docker container 'linguoup_postgres' nor local 'psql' command was found."
    echo "Please ensure the database container is started using: docker compose up -d"
    exit 1
  fi
fi

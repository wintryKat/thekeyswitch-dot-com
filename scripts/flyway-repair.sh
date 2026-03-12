#!/bin/bash
set -euo pipefail

if [ ! -f .env ]; then
  echo ".env is required to run Flyway repair."
  exit 1
fi

set -a
source ./.env
set +a

: "${DB_USER:?DB_USER must be set in .env}"
: "${DB_PASSWORD:?DB_PASSWORD must be set in .env}"

project_name="${COMPOSE_PROJECT_NAME:-$(basename "$PWD")}"
network_name="${project_name}_internal"

docker compose up -d db >/dev/null

docker run --rm \
  --network "$network_name" \
  -v "$PWD/api/src/main/resources/db/migration:/flyway/sql:ro" \
  flyway/flyway:11-alpine \
  -url="jdbc:postgresql://db:5432/thekeyswitch" \
  -user="$DB_USER" \
  -password="$DB_PASSWORD" \
  -connectRetries=60 \
  repair

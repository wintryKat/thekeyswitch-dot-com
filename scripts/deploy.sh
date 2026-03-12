#!/bin/bash
set -euo pipefail

echo "=== Deploying thekeyswitch.com ==="

ssh thekeyswitch "cd /opt/thekeyswitch && \
  git pull --ff-only origin main && \
  chmod +x ./scripts/flyway-repair.sh && \
  docker compose build --parallel && \
  ./scripts/flyway-repair.sh && \
  docker compose up -d && \
  docker compose ps"

echo "=== Deploy complete ==="

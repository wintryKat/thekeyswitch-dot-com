#!/bin/bash
set -euo pipefail

echo "=== Deploying thekeyswitch.com ==="

ssh thekeyswitch "cd /opt/thekeyswitch && \
  git pull origin main && \
  docker compose build --parallel && \
  docker compose up -d && \
  docker compose ps"

echo "=== Deploy complete ==="

#!/bin/bash
set -euo pipefail

echo "=== thekeyswitch.com VPS Setup ==="

# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# Firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create project directory
mkdir -p /opt/thekeyswitch

echo "=== VPS provisioned ==="
echo "Next: clone repo to /opt/thekeyswitch and run docker compose up -d"

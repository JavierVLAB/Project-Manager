#!/bin/bash
set -e

echo "Actualizando código..."
git pull origin main

echo "Levantando aplicación..."
docker compose up -d

echo "✅ Despliegue completado."

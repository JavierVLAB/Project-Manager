#!/bin/bash
set -e

echo "🔄 Deteniendo contenedores..."
docker compose down

echo "🧱 Reconstruyendo imágenes..."
docker compose build --no-cache

echo "🚀 Levantando aplicación..."
docker compose up -d

echo "✅ Despliegue completado correctamente."

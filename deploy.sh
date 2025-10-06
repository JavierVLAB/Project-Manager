#!/bin/bash
set -e

# Crear configuración Docker temporal y limpia
mkdir -p /tmp/docker-noconfig
echo '{ "auths": {}, "credsStore": "" }' > /tmp/docker-noconfig/config.json
export DOCKER_CONFIG=/tmp/docker-noconfig

echo "🔄 Deteniendo contenedores..."
docker compose down

echo "🧱 Reconstruyendo imágenes (sin credenciales)..."
docker compose build --no-cache

echo "🚀 Levantando aplicación..."
docker compose up -d

echo "✅ Despliegue completado correctamente."

#!/bin/bash
set -e

# Usa un entorno Docker aislado para evitar credenciales compartidas
export DOCKER_CONFIG=$(mktemp -d)

echo "🔄 Deteniendo contenedores..."
docker compose down

echo "🧱 Reconstruyendo imágenes (config aislada)..."
docker compose build --no-cache

echo "🚀 Levantando aplicación..."
docker compose up -d

echo "✅ Despliegue completado correctamente (sin afectar otros usuarios)."


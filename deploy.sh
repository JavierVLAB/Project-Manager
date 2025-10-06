#!/bin/bash
set -e

echo "Actualizando código..."
git pull origin main

echo "Reconstruyendo contenedores..."
docker-compose down
docker-compose build --no-cache

echo "Levantando aplicación..."
docker-compose up -d

echo "✅ Despliegue completado."

#!/bin/sh

# Ensure public/data directory exists
mkdir -p /app/public/data

# Start Node backend scraper in background
echo "🚀 Iniciando Backend Scraper em segundo plano..."
cd /app && node backend/index.js &

# Start Nginx in foreground
echo "🌐 Iniciando Nginx servidor web..."
exec nginx -g "daemon off;"

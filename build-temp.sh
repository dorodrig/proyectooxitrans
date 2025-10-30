#!/bin/bash

# Script temporal para build sin PWA
echo "🔨 Construyendo proyecto sin PWA (temporal)..."

# Frontend
echo "📦 Build Frontend..."
npm run build

# Backend 
echo "📦 Build Backend..."
npm run build:server

echo "✅ Build completado. Ejecuta ./deploy-ec2.sh para continuar con el despliegue."
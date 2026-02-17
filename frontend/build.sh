#!/bin/bash

# Script de build para frontend

echo "🏗️  Building frontend..."

# Install dependencies
echo "📦 Instalando dependencias..."
npm install

# Build
echo "⚙️  Compilando..."
npm run build

# Optimize
echo "⚡ Optimizando..."
npm run optimize 2>/dev/null || echo "No optimize script found"

echo "✅ Build completado!"
echo "📁 Archivos en: dist/"

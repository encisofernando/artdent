#!/bin/bash

# Script de deployment para producción

echo "🚀 Iniciando deployment..."

# Backup de base de datos
echo "📦 Haciendo backup de base de datos..."
mysqldump -u root -p artdent_lab > backup_$(date +%Y%m%d_%H%M%S).sql

# Git pull
echo "⬇️  Descargando últimos cambios..."
git pull origin main

# Composer
echo "📦 Instalando dependencias de Composer..."
composer install --optimize-autoloader --no-dev

# Migraciones
echo "🗄️  Ejecutando migraciones..."
php artisan migrate --force

# Cachés
echo "⚡ Optimizando cachés..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Permisos
echo "🔒 Configurando permisos..."
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Restart services
echo "🔄 Reiniciando servicios..."
sudo systemctl restart php8.3-fpm
sudo systemctl restart nginx

echo "✅ Deployment completado!"

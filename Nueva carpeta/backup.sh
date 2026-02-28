#!/bin/bash

# Script de backup automático

BACKUP_DIR="/backups/artdent"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
echo "📦 Backup de base de datos..."
mysqldump -u root -p artdent_lab > $BACKUP_DIR/db_$DATE.sql

# Backup files
echo "📦 Backup de archivos..."
tar -czf $BACKUP_DIR/files_$DATE.tar.gz \
  /www/wwwroot/api.artdent.com.ar/storage \
  /var/www/shop.artdent.com.ar

# Delete old backups (> 7 days)
find $BACKUP_DIR -type f -mtime +7 -delete

echo "✅ Backup completado: $BACKUP_DIR"

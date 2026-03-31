#!/bin/bash
# ArtDent Print Service - Script de inicio para Linux
# Equivalente al Iniciar_ArtDent.bat de Windows

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$SCRIPT_DIR"

# Si existe una AppImage en dist/, ejecutarla
APPIMAGE=$(find "$SCRIPT_DIR/dist" -name "*.AppImage" 2>/dev/null | head -n 1)

if [ -n "$APPIMAGE" ]; then
    echo "Iniciando ArtDent Print Service desde AppImage..."
    chmod +x "$APPIMAGE"
    "$APPIMAGE" &
else
    # Modo desarrollo: ejecutar directamente con Electron
    echo "Iniciando ArtDent Print Service en modo desarrollo..."
    if command -v npx &>/dev/null; then
        npx electron . &
    else
        echo "Error: No se encontró electron ni AppImage. Instale las dependencias con: npm install"
        exit 1
    fi
fi

echo "Servicio iniciado. Verifique el ícono en la bandeja del sistema."

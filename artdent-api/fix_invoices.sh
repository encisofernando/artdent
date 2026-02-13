#!/bin/bash
# Script para renombrar el método authorize en InvoicesController

FILE="app/Http/Controllers/InvoicesController.php"

# Hacer backup
cp "$FILE" "${FILE}.backup"

# Renombrar el método authorize a authorizeInvoice
sed -i 's/public function authorize(Request \$r, AfipWsClient \$afip)/public function authorizeInvoice(Request $r, AfipWsClient $afip)/g' "$FILE"

echo "✅ Método renombrado exitosamente"
echo "Backup guardado en: ${FILE}.backup"

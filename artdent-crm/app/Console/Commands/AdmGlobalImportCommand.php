<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdmGlobalImportCommand extends Command
{
    protected $signature = 'admglobal:import
                            {--tenant=santacatalina : ID del tenant destino}
                            {--mdb= : Ruta al archivo AdmGlobal.mdb}
                            {--step=all : Paso a ejecutar (setup|categories|customers|products|stock|cash_sessions|sales|all)}
                            {--limit= : Limite opcional de filas para pruebas}
                            {--chunk=1000 : Tamano del lote para inserciones masivas}';

    protected $description = 'Importa de manera exhaustiva el historico completo de AdmGlobal.mdb al tenant especificado';

    protected string $mdbPath;
    protected string $mdbExportBin;
    protected string $ldLibraryPath;

    public function handle(): int
    {
        $tenantId = (string) $this->option('tenant');
        $step = (string) $this->option('step');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;
        $chunkSize = max(100, (int) $this->option('chunk'));

        $tenant = Tenant::find($tenantId);
        if (! $tenant) {
            $this->error("No se encontro el tenant [{$tenantId}].");
            return self::FAILURE;
        }

        $this->resolveMdbPaths();
        if (! file_exists($this->mdbPath)) {
            $this->error("No se encontro el archivo MDB en: {$this->mdbPath}");
            return self::FAILURE;
        }

        $this->info("=========================================================");
        $this->info(" Migracion de AdmGlobal hacia tenant: [{$tenantId}]");
        $this->info(" Base de datos destino: {$tenant->database()->getName()}");
        $this->info(" Archivo MDB: {$this->mdbPath}");
        $this->info(" Paso solicitado: {$step}");
        $this->info("=========================================================");

        tenancy()->initialize($tenant);
        DB::disableQueryLog();

        // Evitar validaciones de claves foraneas en cascada y habilitar NO_AUTO_VALUE_ON_ZERO
        DB::statement("SET SESSION sql_mode = 'NO_AUTO_VALUE_ON_ZERO'");
        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        $startTime = microtime(true);

        try {
            if ($step === 'all' || $step === 'setup') {
                $this->stepSetup();
            }

            if ($step === 'all' || $step === 'categories') {
                $this->stepCategories();
            }

            if ($step === 'all' || $step === 'customers') {
                $this->stepCustomers();
            }

            if ($step === 'all' || $step === 'products') {
                $this->stepProducts($limit, $chunkSize);
            }

            if ($step === 'all' || $step === 'stock') {
                $this->stepStock($chunkSize);
            }

            if ($step === 'all' || $step === 'cash_sessions') {
                $this->stepCashSessions($limit, $chunkSize);
            }

            if ($step === 'all' || $step === 'sales') {
                $this->stepSales($limit, $chunkSize);
            }

            $elapsed = round(microtime(true) - $startTime, 2);
            $this->info("=========================================================");
            $this->info(" ✅ Migracion completada exitosamente en {$elapsed}s");
            $this->info("=========================================================");
        } catch (\Throwable $e) {
            $this->error("Error durante la migracion: " . $e->getMessage());
            $this->error($e->getTraceAsString());
            return self::FAILURE;
        } finally {
            DB::statement('SET FOREIGN_KEY_CHECKS = 1');
            tenancy()->end();
        }

        return self::SUCCESS;
    }

    protected function resolveMdbPaths(): void
    {
        $explicit = $this->option('mdb');
        if ($explicit && file_exists($explicit)) {
            $this->mdbPath = $explicit;
        } elseif (file_exists('/home/infranet/Documentos/AdmGlobal.MDB')) {
            $this->mdbPath = '/home/infranet/Documentos/AdmGlobal.MDB';
        } elseif (file_exists(base_path('../AdmGlobal.mdb'))) {
            $this->mdbPath = base_path('../AdmGlobal.mdb');
        } else {
            $this->mdbPath = '/home/infranet/Documentos/AdmGlobal.mdb';
        }

        // mdbtools binaries
        $scratchBin = base_path('../scratch/mdbbin/usr/bin/mdb-export');
        $scratchLib = base_path('../scratch/mdbbin/usr/lib/x86_64-linux-gnu');

        if (file_exists($scratchBin)) {
            $this->mdbExportBin = $scratchBin;
            $this->ldLibraryPath = $scratchLib;
        } else {
            $this->mdbExportBin = 'mdb-export';
            $this->ldLibraryPath = '';
        }
    }

    /**
     * Devuelve un generador para leer filas CSV de mdb-export sin cargar todo en RAM.
     */
    protected function streamMdbTable(string $tableName): \Generator
    {
        $cmd = $this->mdbExportBin . ' ' . escapeshellarg($this->mdbPath) . ' ' . escapeshellarg($tableName);
        if ($this->ldLibraryPath) {
            $cmd = "LD_LIBRARY_PATH={$this->ldLibraryPath} " . $cmd;
        }

        $descriptors = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $proc = proc_open($cmd, $descriptors, $pipes);
        if (! is_resource($proc)) {
            throw new \RuntimeException("No se pudo iniciar mdb-export para la tabla {$tableName}");
        }

        fclose($pipes[0]);
        $stream = $pipes[1];
        $headers = fgetcsv($stream);

        if ($headers === false || empty($headers)) {
            fclose($stream);
            fclose($pipes[2]);
            proc_close($proc);
            return;
        }

        $headers = array_map(fn($h) => trim((string)$h), $headers);

        while (($row = fgetcsv($stream)) !== false) {
            if (count($row) === count($headers)) {
                yield array_combine($headers, $row);
            }
        }

        fclose($stream);
        fclose($pipes[2]);
        proc_close($proc);
    }

    protected function parseDate(?string $dateStr): ?string
    {
        if (! $dateStr) return null;
        $dateStr = trim($dateStr);
        if ($dateStr === '' || str_starts_with($dateStr, '01/01/95') || str_starts_with($dateStr, '01/01/1995')) {
            return null;
        }

        try {
            return Carbon::parse($dateStr)->format('Y-m-d H:i:s');
        } catch (\Throwable) {
            return null;
        }
    }

    protected function stepSetup(): void
    {
        $this->info("--- Paso: Setup base (InvoiceTypes, CashDrawer) ---");

        $types = [
            ['id' => 1, 'name' => 'Factura A', 'afip_code' => '001', 'is_active' => 1],
            ['id' => 2, 'name' => 'Nota de Débito A', 'afip_code' => '002', 'is_active' => 1],
            ['id' => 3, 'name' => 'Nota de Crédito A', 'afip_code' => '003', 'is_active' => 1],
            ['id' => 6, 'name' => 'Factura B', 'afip_code' => '006', 'is_active' => 1],
            ['id' => 7, 'name' => 'Nota de Débito B', 'afip_code' => '007', 'is_active' => 1],
            ['id' => 8, 'name' => 'Nota de Crédito B', 'afip_code' => '008', 'is_active' => 1],
            ['id' => 11, 'name' => 'Factura C', 'afip_code' => '011', 'is_active' => 1],
            ['id' => 12, 'name' => 'Nota de Débito C', 'afip_code' => '012', 'is_active' => 1],
            ['id' => 13, 'name' => 'Nota de Crédito C', 'afip_code' => '013', 'is_active' => 1],
            ['id' => 15, 'name' => 'Recibo C', 'afip_code' => '015', 'is_active' => 1],
        ];

        foreach ($types as $t) {
            DB::table('invoice_types')->updateOrInsert(['id' => $t['id']], $t);
        }

        // Cash Drawer
        DB::table('cash_drawers')->updateOrInsert(
            ['id' => 1],
            [
                'company_id' => 1,
                'branch_id' => 1,
                'name' => 'Caja 1',
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $this->info("  InvoiceTypes y CashDrawer asegurados.");
    }

    protected function stepCategories(): void
    {
        $this->info("--- Paso: Categorías ---");
        $count = 0;

        foreach ($this->streamMdbTable('Categorias') as $row) {
            $id = (int) $row['idCategoria'];
            $name = trim($row['Nombre'] ?? '');
            if ($name === '') continue;

            $slug = Str::slug($name) ?: "cat-{$id}";
            $isActive = ($row['Activo'] ?? '1') === '1' ? 1 : 0;

            DB::table('categories')->updateOrInsert(
                ['id' => $id],
                [
                    'parent_id' => null,
                    'name' => $name,
                    'slug' => $slug,
                    'description' => "Categoría migrada desde AdmGlobal",
                    'is_active' => $isActive,
                    'sort_order' => $id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
            $count++;
        }

        $this->info("  {$count} categorías importadas.");
    }

    protected function stepCustomers(): void
    {
        $this->info("--- Paso: Clientes ---");
        $count = 0;

        foreach ($this->streamMdbTable('Clientes') as $row) {
            $id = (int) $row['idCliente'];
            if ($id <= 0) continue;

            $nom1 = trim($row['Nom1'] ?? '');
            $nom2 = trim($row['Nom2'] ?? '');
            $name = trim("{$nom1} {$nom2}") ?: "Cliente #{$id}";

            $cuit = preg_replace('/\D/', '', (string)($row['CUIT'] ?? ''));
            $dni = preg_replace('/\D/', '', (string)($row['NroDoc'] ?? ''));
            $phone = trim(($row['Celular'] ?? '') ?: ($row['Tel1'] ?? ''));
            $email = trim($row['Email1'] ?? '');
            if ($email === '') {
                $email = "cliente_{$id}@santacatalina.local";
            }

            $condIva = 'consumidor_final';
            if ($cuit !== '') {
                $condIva = 'responsable_inscripto';
            }

            DB::table('customers')->updateOrInsert(
                ['id' => $id],
                [
                    'company_id' => 1,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone ?: null,
                    'dni' => $dni ?: null,
                    'cuit' => $cuit ?: null,
                    'iva_condition' => $condIva,
                    'address' => trim($row['Direccion'] ?? '') ?: null,
                    'city' => trim($row['Localidad'] ?? '') ?: 'Buena Vista',
                    'province' => trim($row['Provincia'] ?? '') ?: 'Formosa',
                    'postal_code' => trim($row['CodPostal'] ?? '') ?: null,
                    'is_active' => 1,
                    'created_at' => $this->parseDate($row['FechaAlta'] ?? null) ?: now(),
                    'updated_at' => $this->parseDate($row['FechaModi'] ?? null) ?: now(),
                ]
            );

            // También registrar en crm_clients para el módulo CRM
            DB::table('crm_clients')->updateOrInsert(
                ['id' => $id],
                [
                    'customer_id' => $id,
                    'company_id' => 1,
                    'name' => $name,
                    'email' => $email,
                    'phone' => $phone ?: null,
                    'dni' => $dni ?: ($cuit ?: null),
                    'cuit' => $cuit ?: null,
                    'address' => trim($row['Direccion'] ?? '') ?: null,
                    'city' => trim($row['Localidad'] ?? '') ?: 'Buena Vista',
                    'province' => trim($row['Provincia'] ?? '') ?: 'Formosa',
                    'is_active' => 1,
                    'type' => $cuit !== '' ? 'empresa' : 'persona',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );

            $count++;
        }

        $this->info("  {$count} clientes importados.");
    }

    protected function stepProducts(?int $limit, int $chunkSize): void
    {
        $this->info("--- Paso: Artículos y Códigos de Barras ---");

        $categories = DB::table('categories')->pluck('id')->flip()->all();
        $batch = [];
        $total = 0;
        $barcodesSeen = [];

        foreach ($this->streamMdbTable('Articulos') as $row) {
            $id = (int) $row['idArticulo'];
            $name = trim($row['Nombre'] ?? '');
            if ($name === '') {
                $name = "Artículo #{$id}";
            }

            $catId = (int) ($row['idCategoria'] ?? 0);
            $validCatId = isset($categories[$catId]) ? $catId : null;

            $barcode = trim($row['CodigoBarra'] ?? '');
            $primaryBarcode = null;
            if ($barcode !== '' && ! isset($barcodesSeen[$barcode])) {
                $primaryBarcode = $barcode;
                $barcodesSeen[$barcode] = true;
            }

            $slug = Str::slug($name) . "-{$id}";
            $cost = floatval($row['Costo'] ?? 0);
            $price = floatval($row['PrecioPublico'] ?? 0);
            $stockMin = intval($row['StockMin'] ?? 0);
            $isActive = ($row['Activo'] ?? '1') === '1' ? 1 : 0;
            $sku = trim($row['Codigo'] ?? '') ?: null;

            $batch[] = [
                'id' => $id,
                'company_id' => 1,
                'category_id' => $validCatId,
                'name' => mb_substr($name, 0, 190),
                'slug' => mb_substr($slug, 0, 190),
                'sku' => $sku ? mb_substr($sku, 0, 50) : null,
                'barcode' => $primaryBarcode,
                'cost_price' => $cost,
                'price' => $price,
                'min_stock' => $stockMin,
                'is_active' => $isActive,
                'track_stock' => 1,
                'created_at' => $this->parseDate($row['UltimaActualizacion'] ?? null) ?: now(),
                'updated_at' => $this->parseDate($row['UltimaActualizacion'] ?? null) ?: now(),
            ];

            if (count($batch) >= $chunkSize) {
                DB::table('products')->upsert(
                    $batch,
                    ['id'],
                    ['company_id', 'category_id', 'name', 'slug', 'sku', 'barcode', 'cost_price', 'price', 'min_stock', 'is_active', 'track_stock', 'updated_at']
                );
                $total += count($batch);
                $this->output->write("\r  Artículos importados: {$total}");
                $batch = [];
            }

            if ($limit && $total >= $limit) {
                break;
            }
        }

        if (! empty($batch)) {
            DB::table('products')->upsert(
                $batch,
                ['id'],
                ['company_id', 'category_id', 'name', 'slug', 'sku', 'barcode', 'cost_price', 'price', 'min_stock', 'is_active', 'track_stock', 'updated_at']
            );
            $total += count($batch);
            $this->output->write("\r  Artículos importados: {$total}");
        }
        $this->newLine();

        // Códigos de barra adicionales (ArticulosCodBarras)
        $this->info("  Importando códigos de barra secundarios (ArticulosCodBarras)...");
        $extraBarcodes = 0;
        $bcBatch = [];

        foreach ($this->streamMdbTable('ArticulosCodBarras') as $bcRow) {
            $artId = (int) $bcRow['idArticulo'];
            $code = trim($bcRow['CodigoBarra'] ?? '');
            if ($code === '' || $artId <= 0) continue;

            $bcBatch[] = [
                'product_id' => $artId,
                'variant_id' => null,
                'barcode' => mb_substr($code, 0, 190),
                'label' => 'Código secundario AdmGlobal',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if (count($bcBatch) >= $chunkSize) {
                DB::table('product_barcodes')->insertOrIgnore($bcBatch);
                $extraBarcodes += count($bcBatch);
                $bcBatch = [];
            }
        }

        if (! empty($bcBatch)) {
            DB::table('product_barcodes')->insertOrIgnore($bcBatch);
            $extraBarcodes += count($bcBatch);
        }

        $this->info("  {$extraBarcodes} códigos de barra secundarios importados.");
    }

    protected function stepStock(int $chunkSize): void
    {
        $this->info("--- Paso: Stock inicial de productos ---");

        $stockBatch = [];
        $movementBatch = [];
        $count = 0;

        foreach ($this->streamMdbTable('Articulos') as $row) {
            $id = (int) $row['idArticulo'];
            $stock = floatval($row['Stock'] ?? 0);
            $stockMin = floatval($row['StockMin'] ?? 0);

            if ($stock > 0 && $id > 0) {
                $stockBatch[] = [
                    'product_id' => $id,
                    'variant_id' => null,
                    'warehouse_id' => 1,
                    'quantity' => $stock,
                    'min_quantity' => $stockMin,
                    'updated_at' => now(),
                ];

                $movementBatch[] = [
                    'product_id' => $id,
                    'variant_id' => null,
                    'warehouse_id' => 1,
                    'user_id' => 1,
                    'type' => 'adjustment',
                    'quantity' => $stock,
                    'stock_before' => 0,
                    'stock_after' => $stock,
                    'reference_type' => 'Migration',
                    'reference_id' => $id,
                    'note' => 'Inventario inicial migrado desde AdmGlobal',
                    'created_at' => now(),
                ];

                if (count($stockBatch) >= $chunkSize) {
                    DB::table('stocks')->upsert($stockBatch, ['product_id', 'warehouse_id'], ['quantity', 'min_quantity', 'updated_at']);
                    DB::table('stock_movements')->insert($movementBatch);
                    $count += count($stockBatch);
                    $this->output->write("\r  Existencias registradas: {$count}");
                    $stockBatch = [];
                    $movementBatch = [];
                }
            }
        }

        if (! empty($stockBatch)) {
            DB::table('stocks')->upsert($stockBatch, ['product_id', 'warehouse_id'], ['quantity', 'min_quantity', 'updated_at']);
            DB::table('stock_movements')->insert($movementBatch);
            $count += count($stockBatch);
            $this->output->write("\r  Existencias registradas: {$count}");
        }

        $this->newLine();
        $this->info("  {$count} artículos con stock positivo inicializados en Depósito Principal.");
    }

    protected function stepCashSessions(?int $limit, int $chunkSize): void
    {
        $this->info("--- Paso: Sesiones de Apertura/Cierre de Caja (CajasAperturas) ---");

        $batch = [];
        $total = 0;

        foreach ($this->streamMdbTable('CajasAperturas') as $row) {
            $id = (int) $row['idCajaApertura'];
            if ($id <= 0) continue;

            $openedAt = $this->parseDate($row['FechaApertura'] ?? null) ?: now()->format('Y-m-d H:i:s');
            $closedAt = $this->parseDate($row['FechaCierre'] ?? null);
            $openAmt = floatval($row['ImporteApertura'] ?? 0);
            $closeAmt = floatval($row['ImporteCierre'] ?? 0);
            $status = $closedAt ? 'closed' : 'open';

            $userAdminId = ((int)($row['idUsuarioApertura'] ?? 0)) === 3 ? 2 : 1;

            $batch[] = [
                'id' => $id,
                'cash_drawer_id' => 1,
                'user_id' => $userAdminId,
                'opened_at' => $openedAt,
                'closed_at' => $closedAt,
                'opening_amount' => $openAmt,
                'closing_amount' => $closeAmt,
                'status' => $status,
                'notes' => "Sesión migrada de AdmGlobal #{$id}",
                'created_at' => $openedAt,
                'updated_at' => $closedAt ?: $openedAt,
            ];

            if (count($batch) >= $chunkSize) {
                DB::table('cash_sessions')->upsert(
                    $batch,
                    ['id'],
                    ['cash_drawer_id', 'user_id', 'opened_at', 'closed_at', 'opening_amount', 'closing_amount', 'status', 'notes', 'updated_at']
                );
                $total += count($batch);
                $this->output->write("\r  Sesiones de caja importadas: {$total}");
                $batch = [];
            }

            if ($limit && $total >= $limit) {
                break;
            }
        }

        if (! empty($batch)) {
            DB::table('cash_sessions')->upsert(
                $batch,
                ['id'],
                ['cash_drawer_id', 'user_id', 'opened_at', 'closed_at', 'opening_amount', 'closing_amount', 'status', 'notes', 'updated_at']
            );
            $total += count($batch);
            $this->output->write("\r  Sesiones de caja importadas: {$total}");
        }

        $this->newLine();
        $this->info("  {$total} sesiones de caja migradas.");
    }

    protected function stepSales(?int $limit, int $chunkSize): void
    {
        $this->info("--- Paso: Ventas, Facturas CAE e Ítems ---");

        $validSessions = DB::table('cash_sessions')->pluck('id')->flip()->all();
        $validCustomers = DB::table('customers')->pluck('id')->flip()->all();
        $productsMap = DB::table('products')->pluck('name', 'id')->all();

        $this->info("  1. Importando cabeceras de ventas y facturas electrónicas...");
        $salesBatch = [];
        $paymentsBatch = [];
        $invoicesBatch = [];
        $totalSales = 0;
        $totalInvoices = 0;

        foreach ($this->streamMdbTable('Documentos') as $row) {
            $id = (int) $row['idDocumento'];
            if ($id <= 0) continue;

            $tipoDoc = (int) ($row['TipoDocumento'] ?? 3);
            $prefijo = str_pad(trim($row['PrefijoDocumento'] ?? '0'), 4, '0', STR_PAD_LEFT);
            $numero = str_pad(trim($row['NroDocumento'] ?? (string)$id), 8, '0', STR_PAD_LEFT);
            $saleNumber = "{$prefijo}-{$numero}";

            $receiptType = match ($tipoDoc) {
                16, 17, 18 => 'C',
                22, 23, 24 => 'NC',
                8 => 'R',
                default => 'X',
            };

            $isAnulado = ($row['DocAnulado'] ?? '0') === '1';
            $status = $isAnulado ? 'cancelled' : 'completed';

            $cajaAperturaId = (int) ($row['idCajaApertura'] ?? 0);
            $validSessionId = isset($validSessions[$cajaAperturaId]) ? $cajaAperturaId : null;

            $clienteId = (int) ($row['idCliente'] ?? 0);
            $validCustomerId = isset($validCustomers[$clienteId]) ? $clienteId : null;

            $soldAt = $this->parseDate($row['FechaDocumento'] ?? null) 
                   ?: ($this->parseDate($row['FechaEntrada'] ?? null) ?: now()->format('Y-m-d H:i:s'));

            $total = floatval($row['ValorAPagar'] ?? 0);
            $subtotal = floatval($row['SubTotal'] ?? 0);
            $taxAmount = floatval($row['IVA'] ?? 0);
            $discount = floatval($row['Descuento'] ?? 0);
            $pagoEfectivo = floatval($row['PagoEfectivo'] ?? 0);
            $pagoTarjeta = floatval($row['PagoTarjeta'] ?? 0);
            $pagoVuelto = floatval($row['PagoVuelto'] ?? 0);
            $userId = ((int)($row['idUsuario'] ?? 0)) === 3 ? 2 : 1;

            $salesBatch[] = [
                'id' => $id,
                'company_id' => 1,
                'branch_id' => 1,
                'cash_session_id' => $validSessionId,
                'user_id' => $userId,
                'customer_id' => $validCustomerId,
                'sale_number' => $saleNumber,
                'receipt_type' => $receiptType,
                'status' => $status,
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'tax_amount' => $taxAmount,
                'total' => $total,
                'paid_amount' => $pagoEfectivo + $pagoTarjeta,
                'change_amount' => $pagoVuelto,
                'notes' => trim($row['Comentario'] ?? '') ?: null,
                'sold_at' => $soldAt,
                'created_at' => $soldAt,
                'updated_at' => $soldAt,
            ];

            if ($pagoEfectivo > 0) {
                $paymentsBatch[] = [
                    'sale_id' => $id,
                    'payment_method_id' => 1,
                    'amount' => $pagoEfectivo,
                    'paid_at' => $soldAt,
                    'created_at' => $soldAt,
                ];
            }
            if ($pagoTarjeta > 0) {
                $paymentsBatch[] = [
                    'sale_id' => $id,
                    'payment_method_id' => 3,
                    'amount' => $pagoTarjeta,
                    'paid_at' => $soldAt,
                    'created_at' => $soldAt,
                ];
            }

            $cae = trim($row['CAE'] ?? '');
            if ($cae !== '') {
                $invoicesBatch[] = [
                    'id' => $id,
                    'company_id' => 1,
                    'invoice_type_id' => $receiptType === 'NC' ? 13 : 11,
                    'user_id' => $userId,
                    'reference_type' => 'App\\Models\\Sale',
                    'reference_id' => $id,
                    'recipient_name' => trim($row['NombreClienteEventual'] ?? '') ?: 'Consumidor Final',
                    'recipient_cuit' => trim($row['NroDocCliente'] ?? '') ?: null,
                    'recipient_iva' => 'consumidor_final',
                    'point_sale' => intval($prefijo) ?: 3,
                    'number' => intval($numero),
                    'cae' => $cae,
                    'cae_expiry' => $this->parseDate($row['VenceCAE'] ?? null),
                    'subtotal' => $subtotal,
                    'discount' => $discount,
                    'tax_amount' => $taxAmount,
                    'total' => $total,
                    'status' => 'authorized',
                    'issued_at' => substr($soldAt, 0, 10),
                    'environment' => 'prod',
                    'created_at' => $soldAt,
                    'updated_at' => $soldAt,
                ];
            }

            if (count($salesBatch) >= $chunkSize) {
                DB::table('sales')->upsert(
                    $salesBatch,
                    ['id'],
                    ['company_id', 'branch_id', 'cash_session_id', 'user_id', 'customer_id', 'sale_number', 'receipt_type', 'status', 'subtotal', 'discount_amount', 'tax_amount', 'total', 'paid_amount', 'change_amount', 'sold_at', 'updated_at']
                );
                $totalSales += count($salesBatch);

                if (! empty($paymentsBatch)) {
                    DB::table('sale_payments')->insert($paymentsBatch);
                    $paymentsBatch = [];
                }

                if (! empty($invoicesBatch)) {
                    DB::table('invoices')->upsert(
                        $invoicesBatch,
                        ['id'],
                        ['company_id', 'invoice_type_id', 'user_id', 'reference_type', 'reference_id', 'recipient_name', 'recipient_cuit', 'point_sale', 'number', 'cae', 'cae_expiry', 'subtotal', 'total', 'status', 'issued_at', 'updated_at']
                    );
                    $totalInvoices += count($invoicesBatch);
                    $invoicesBatch = [];
                }

                $this->output->write("\r  Ventas registradas: {$totalSales} | Facturas CAE: {$totalInvoices}");
                $salesBatch = [];
            }

            if ($limit && $totalSales >= $limit) {
                break;
            }
        }

        if (! empty($salesBatch)) {
            DB::table('sales')->upsert(
                $salesBatch,
                ['id'],
                ['company_id', 'branch_id', 'cash_session_id', 'user_id', 'customer_id', 'sale_number', 'receipt_type', 'status', 'subtotal', 'discount_amount', 'tax_amount', 'total', 'paid_amount', 'change_amount', 'sold_at', 'updated_at']
            );
            $totalSales += count($salesBatch);

            if (! empty($paymentsBatch)) {
                DB::table('sale_payments')->insert($paymentsBatch);
            }

            if (! empty($invoicesBatch)) {
                DB::table('invoices')->upsert(
                    $invoicesBatch,
                    ['id'],
                    ['company_id', 'invoice_type_id', 'user_id', 'reference_type', 'reference_id', 'recipient_name', 'recipient_cuit', 'point_sale', 'number', 'cae', 'cae_expiry', 'subtotal', 'total', 'status', 'issued_at', 'updated_at']
                );
                $totalInvoices += count($invoicesBatch);
            }
        }
        $this->newLine();
        $this->info("  Total comprobantes de venta importados: {$totalSales} (con {$totalInvoices} facturas CAE).");

        // 2. Líneas de detalle de ventas (DocumentosDetalles)
        $this->info("  2. Importando detalle de ventas (DocumentosDetalles)...");
        $itemsBatch = [];
        $totalItems = 0;

        foreach ($this->streamMdbTable('DocumentosDetalles') as $row) {
            $docId = (int) $row['idDocumento'];
            if ($docId <= 0) continue;

            $artId = (int) ($row['idArticulo'] ?? 0);
            $validProductId = isset($productsMap[$artId]) ? $artId : null;
            $productName = $productsMap[$artId] ?? (trim($row['strReferencia'] ?? '') ?: "Artículo #{$artId}");

            $qty = floatval($row['Cantidad'] ?? 1);
            $unitPrice = floatval($row['PrecioUnitario'] ?? 0);
            $subtotal = floatval($row['SubTotal'] ?? ($qty * $unitPrice));

            $itemsBatch[] = [
                'sale_id' => $docId,
                'product_id' => $validProductId,
                'variant_id' => null,
                'product_name' => mb_substr($productName, 0, 190),
                'sku' => null,
                'quantity' => $qty,
                'unit_price' => $unitPrice,
                'discount' => 0.00,
                'tax_rate' => 0.00,
                'tax_amount' => 0.00,
                'total' => $subtotal,
            ];

            if (count($itemsBatch) >= $chunkSize) {
                DB::table('sale_items')->insert($itemsBatch);
                $totalItems += count($itemsBatch);
                $this->output->write("\r  Líneas de detalle importadas: {$totalItems}");
                $itemsBatch = [];
            }
        }

        if (! empty($itemsBatch)) {
            DB::table('sale_items')->insert($itemsBatch);
            $totalItems += count($itemsBatch);
            $this->output->write("\r  Líneas de detalle importadas: {$totalItems}");
        }

        $this->newLine();
        $this->info("  {$totalItems} renglones de venta importados en total.");
    }
}

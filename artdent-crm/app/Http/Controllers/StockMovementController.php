<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StockMovementController extends Controller
{
    public function index(Request $request): Response
    {
        $companyId = CompanyContext::id();
        $search = $request->input('search');
        $warehouseId = $request->input('warehouse_id');
        $type = $request->input('type');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $query = StockMovement::query()
            ->with([
                'product:id,name,sku',
                'productVariant:id,sku',
                'warehouse:id,name',
                'user:id,name',
            ])
            ->whereHas('product', fn ($q) => $q->where('company_id', $companyId));

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        if ($type) {
            $query->where('type', $type);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $items = $query->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(50)
            ->withQueryString();

        $warehouses = Warehouse::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $types = [
            'in' => 'Entrada manual',
            'out' => 'Salida manual',
            'adjustment' => 'Ajuste',
            'transfer_in' => 'Transferencia entrada',
            'transfer_out' => 'Transferencia salida',
            'purchase' => 'Compra',
            'purchase_reversal' => 'Reversión compra',
            'lab_withdrawal' => 'Retiro laboratorio',
            'lab_withdrawal_reversal' => 'Reversión retiro lab',
        ];

        return Inertia::render('StockMovement/Index', [
            'items' => $items,
            'warehouses' => $warehouses,
            'types' => $types,
            'filters' => [
                'search' => $search,
                'warehouse_id' => $warehouseId,
                'type' => $type,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    /**
     * Exporta los movimientos de stock filtrados como CSV (UTF-8 BOM, separador ;).
     * Acepta los mismos filtros que index(): search, warehouse_id, type, date_from, date_to.
     */
    public function exportCsv(Request $request): StreamedResponse
    {
        $companyId = CompanyContext::id();
        $search = $request->input('search');
        $warehouseId = $request->input('warehouse_id');
        $type = $request->input('type');
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        // Etiquetas legibles para los tipos de movimiento
        $typeLabels = [
            'in' => 'Entrada manual',
            'out' => 'Salida manual',
            'adjustment' => 'Ajuste',
            'transfer_in' => 'Transferencia entrada',
            'transfer_out' => 'Transferencia salida',
            'purchase' => 'Compra',
            'purchase_reversal' => 'Reversión compra',
            'lab_withdrawal' => 'Retiro laboratorio',
            'lab_withdrawal_reversal' => 'Reversión retiro lab',
        ];

        $query = StockMovement::query()
            ->with([
                'product:id,name,sku',
                'productVariant:id,sku',
                'warehouse:id,name',
                'user:id,name',
            ])
            ->whereHas('product', fn ($q) => $q->where('company_id', $companyId));

        if ($search) {
            $query->whereHas('product', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('sku', 'like', "%{$search}%");
            });
        }

        if ($warehouseId) {
            $query->where('warehouse_id', $warehouseId);
        }

        if ($type) {
            $query->where('type', $type);
        }

        if ($dateFrom) {
            $query->whereDate('created_at', '>=', $dateFrom);
        }

        if ($dateTo) {
            $query->whereDate('created_at', '<=', $dateTo);
        }

        $movements = $query->orderByDesc('created_at')->orderByDesc('id')->get();

        $filename = 'movimientos-stock-'.now()->format('Y-m-d').'.csv';

        return response()->streamDownload(function () use ($movements, $typeLabels) {
            $out = fopen('php://output', 'w');
            // BOM UTF-8 para compatibilidad con Excel
            fwrite($out, "\xEF\xBB\xBF");
            fputcsv($out, [
                'Fecha',
                'Tipo',
                'Producto',
                'SKU',
                'Variante SKU',
                'Depósito',
                'Cantidad',
                'Stock Anterior',
                'Stock Posterior',
                'Usuario',
                'Nota',
            ], ';');

            foreach ($movements as $mov) {
                fputcsv($out, [
                    $mov->created_at?->format('d/m/Y H:i'),
                    $typeLabels[$mov->type] ?? $mov->type,
                    $mov->product?->name ?? '',
                    $mov->product?->sku ?? '',
                    $mov->productVariant?->sku ?? '',
                    $mov->warehouse?->name ?? '',
                    number_format((float) $mov->quantity, 2, ',', '.'),
                    number_format((float) $mov->stock_before, 2, ',', '.'),
                    number_format((float) $mov->stock_after, 2, ',', '.'),
                    $mov->user?->name ?? '',
                    $mov->note ?? '',
                ], ';');
            }

            fclose($out);
        }, $filename, ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    // Los movimientos son registros de auditoría inmutables; no se crean ni editan manualmente.
}

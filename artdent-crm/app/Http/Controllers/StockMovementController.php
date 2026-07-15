<?php

namespace App\Http\Controllers;

use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
                'warehouse:id,name',
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

    // Los movimientos son registros de auditoría inmutables; no se crean ni editan manualmente.
}

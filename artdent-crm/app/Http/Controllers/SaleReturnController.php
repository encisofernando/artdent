<?php

namespace App\Http\Controllers;

use App\Models\CashMovement;
use App\Models\CashSession;
use App\Models\CustomerAccount;
use App\Models\CustomerAccountMove;
use App\Models\PaymentMethod;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\SaleReturn;
use App\Models\SaleReturnItem;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Warehouse;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaleReturnController extends Controller
{
    public function store(Request $request, Sale $sale): RedirectResponse
    {
        $companyId = CompanyContext::id();
        abort_unless($sale->company_id === $companyId, 404);

        if ($sale->status === 'cancelled') {
            return back()->with('error', 'No se puede hacer un cambio/devolución sobre una venta cancelada.');
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:255'],
            'refund_method' => ['required', 'in:cash,store_credit,none'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.sale_item_id' => ['required', 'integer', 'exists:sale_items,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
        ]);

        try {
            $saleReturn = DB::transaction(function () use ($validated, $sale, $companyId, $request) {
                $warehouse = Warehouse::where('company_id', $companyId)->first();
                $totalRefund = 0.0;

                $saleReturn = SaleReturn::create([
                    'company_id' => $companyId,
                    'sale_id' => $sale->id,
                    'user_id' => $request->user()->id,
                    'reason' => $validated['reason'] ?? null,
                    'refund_method' => $validated['refund_method'],
                    'total_refund' => 0,
                ]);

                foreach ($validated['items'] as $line) {
                    // lockForUpdate serializa devoluciones concurrentes sobre
                    // el mismo sale_item — sin esto, dos requests simultáneos
                    // podrían leer el mismo "remaining" y devolver de más.
                    $saleItem = SaleItem::where('sale_id', $sale->id)
                        ->lockForUpdate()
                        ->findOrFail($line['sale_item_id']);

                    $alreadyReturned = (float) SaleReturnItem::where('sale_item_id', $saleItem->id)->sum('quantity');
                    $remaining = (float) $saleItem->quantity - $alreadyReturned;

                    if ($line['quantity'] > $remaining + 0.00001) {
                        throw ValidationException::withMessages([
                            'items' => "Solo quedan {$remaining} unidad(es) disponibles para devolver de \"{$saleItem->product_name}\".",
                        ]);
                    }

                    $lineTotal = round($saleItem->unit_price * $line['quantity'], 2);
                    $totalRefund += $lineTotal;

                    SaleReturnItem::create([
                        'sale_return_id' => $saleReturn->id,
                        'sale_item_id' => $saleItem->id,
                        'quantity' => $line['quantity'],
                        'unit_price' => $saleItem->unit_price,
                        'total' => $lineTotal,
                    ]);

                    $product = $saleItem->product_id ? Product::find($saleItem->product_id) : null;

                    if ($product && $product->track_stock && $warehouse) {
                        $stock = Stock::firstOrCreate(
                            ['product_id' => $saleItem->product_id, 'variant_id' => $saleItem->variant_id, 'warehouse_id' => $warehouse->id],
                            ['quantity' => 0]
                        );
                        $stock = Stock::where('id', $stock->id)->lockForUpdate()->first();

                        $stockBefore = (float) $stock->quantity;
                        $stockAfter = $stockBefore + $line['quantity'];
                        $stock->update(['quantity' => $stockAfter]);

                        StockMovement::create([
                            'product_id' => $saleItem->product_id,
                            'variant_id' => $saleItem->variant_id,
                            'warehouse_id' => $warehouse->id,
                            'user_id' => $request->user()->id,
                            'type' => 'in',
                            'quantity' => $line['quantity'],
                            'stock_before' => $stockBefore,
                            'stock_after' => $stockAfter,
                            'reference_type' => 'sale_return',
                            'reference_id' => $saleReturn->id,
                            'note' => "Devolución venta {$sale->sale_number}",
                        ]);
                    }
                }

                $saleReturn->update(['total_refund' => round($totalRefund, 2)]);

                if ($validated['refund_method'] === 'cash' && $totalRefund > 0) {
                    $this->refundFromCashDrawer($saleReturn, $totalRefund, $companyId);
                } elseif ($validated['refund_method'] === 'store_credit' && $totalRefund > 0) {
                    $this->refundToCustomerAccount($saleReturn, $sale, $totalRefund, $request->user()->id);
                }

                return $saleReturn;
            });
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors());
        }

        return back()->with('success', "Devolución registrada por \${$saleReturn->total_refund}.");
    }

    private function refundFromCashDrawer(SaleReturn $saleReturn, float $amount, int $companyId): void
    {
        $openSessions = CashSession::query()
            ->where('status', 'open')
            ->whereHas('cash_drawer', fn ($query) => $query->where('company_id', $companyId))
            ->get();

        if ($openSessions->count() !== 1) {
            return;
        }

        CashMovement::create([
            'cash_session_id' => $openSessions->first()->id,
            'payment_method_id' => PaymentMethod::where('type', 'cash')->value('id'),
            'type' => 'out',
            'amount' => $amount,
            'concept' => 'Devolución venta '.$saleReturn->sale->sale_number,
            'reference_type' => 'sale_return',
            'reference_id' => $saleReturn->id,
        ]);
    }

    private function refundToCustomerAccount(SaleReturn $saleReturn, Sale $sale, float $amount, int $userId): void
    {
        if (! $sale->customer_id) {
            return;
        }

        $account = CustomerAccount::firstOrCreate(['customer_id' => $sale->customer_id], ['balance' => 0]);
        $account = CustomerAccount::where('id', $account->id)->lockForUpdate()->first();
        $newBalance = $account->balance - $amount;

        $move = CustomerAccountMove::create([
            'customer_account_id' => $account->id,
            'user_id' => $userId,
            'type' => CustomerAccountMove::TYPE_ADJUSTMENT,
            'amount' => -$amount,
            'balance_after' => $newBalance,
            'description' => 'Nota de crédito por devolución venta '.$sale->sale_number,
            'reference_type' => 'sale_return',
            'reference_id' => $saleReturn->id,
            'move_date' => now()->toDateString(),
        ]);

        $account->applyMove($move);
    }
}

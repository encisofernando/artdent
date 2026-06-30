<?php

namespace App\Services;

use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\LabSupplyWithdrawal;
use App\Models\Stock;
use App\Models\StockMovement;

class LabWithdrawalService
{
    /**
     * Confirma un retiro: descuenta stock e inserta el egreso contable.
     * Llamar dentro de una transacción DB.
     */
    public function confirm(LabSupplyWithdrawal $withdrawal): void
    {
        $withdrawal->load('items');

        foreach ($withdrawal->items as $item) {
            $stock = Stock::firstOrCreate(
                [
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'warehouse_id' => $withdrawal->warehouse_id,
                ],
                ['quantity' => 0, 'min_quantity' => 0]
            );

            $before = $stock->quantity;
            $stock->quantity = max(0, $stock->quantity - $item->quantity);
            $stock->save();

            StockMovement::create([
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'warehouse_id' => $withdrawal->warehouse_id,
                'user_id' => $withdrawal->user_id,
                'type' => 'lab_withdrawal',
                'quantity' => $item->quantity,
                'stock_before' => $before,
                'stock_after' => $stock->quantity,
                'reference_type' => 'lab_withdrawal',
                'reference_id' => $withdrawal->id,
                'note' => 'Retiro interno '.$withdrawal->formattedNumber(),
                'created_at' => now(),
            ]);
        }

        $this->createExpense($withdrawal);
    }

    /**
     * Cancela un retiro confirmado: revierte el stock y anula el egreso.
     * Llamar dentro de una transacción DB.
     */
    public function cancel(LabSupplyWithdrawal $withdrawal): void
    {
        $withdrawal->load('items');

        foreach ($withdrawal->items as $item) {
            $stock = Stock::firstOrCreate(
                [
                    'product_id' => $item->product_id,
                    'variant_id' => $item->variant_id,
                    'warehouse_id' => $withdrawal->warehouse_id,
                ],
                ['quantity' => 0, 'min_quantity' => 0]
            );

            $before = $stock->quantity;
            $stock->quantity += $item->quantity;
            $stock->save();

            StockMovement::create([
                'product_id' => $item->product_id,
                'variant_id' => $item->variant_id,
                'warehouse_id' => $withdrawal->warehouse_id,
                'user_id' => $withdrawal->user_id,
                'type' => 'lab_withdrawal_reversal',
                'quantity' => $item->quantity,
                'stock_before' => $before,
                'stock_after' => $stock->quantity,
                'reference_type' => 'lab_withdrawal',
                'reference_id' => $withdrawal->id,
                'note' => 'Reversión retiro '.$withdrawal->formattedNumber(),
                'created_at' => now(),
            ]);
        }

        // Eliminar el gasto asociado
        Expense::where('reference', 'lab_withdrawal:'.$withdrawal->id)->delete();

        $withdrawal->update(['status' => 'cancelled']);
    }

    private function createExpense(LabSupplyWithdrawal $withdrawal): void
    {
        $categoryId = $this->resolveExpenseCategory();

        Expense::create([
            'company_id' => $withdrawal->company_id,
            'scope' => 'lab',
            'expense_category_id' => $categoryId,
            'user_id' => $withdrawal->user_id,
            'description' => 'Retiro insumos '.$withdrawal->formattedNumber()
                .($withdrawal->recipientName() !== '—' ? ' — '.$withdrawal->recipientName() : ''),
            'amount' => $withdrawal->total_cost,
            'expense_date' => $withdrawal->withdrawn_at,
            'reference' => 'lab_withdrawal:'.$withdrawal->id,
            'notes' => $withdrawal->notes,
        ]);
    }

    /** Busca o crea la categoría "Insumos / Consumibles Lab" */
    private function resolveExpenseCategory(): ?int
    {
        $category = ExpenseCategory::firstOrCreate(
            ['name' => 'Insumos / Consumibles Lab']
        );

        return $category->id;
    }
}

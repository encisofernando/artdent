<?php

namespace App\Services;

use App\Models\CrmNotification;
use App\Models\Product;
use App\Models\Stock;

class StockAlertService
{
    /**
     * Check stock level for a product after a change and create a CRM notification
     * if quantity has reached or fallen below the product's minimum stock.
     */
    public static function checkAndNotify(int $productId, ?int $variantId, int $warehouseId): void
    {
        $product = Product::query()
            ->select(['id', 'name', 'min_stock'])
            ->find($productId);

        if (! $product || ! $product->min_stock || $product->min_stock <= 0) {
            return;
        }

        $currentQty = (float) Stock::query()
            ->where('product_id', $productId)
            ->where('warehouse_id', $warehouseId)
            ->when($variantId, fn ($q) => $q->where('variant_id', $variantId), fn ($q) => $q->whereNull('variant_id'))
            ->value('quantity');

        if ($currentQty > $product->min_stock) {
            return;
        }

        // Avoid duplicate unread alerts for the same product
        $alreadyNotified = CrmNotification::query()
            ->where('type', 'low_stock')
            ->where('order_code', "product_{$productId}")
            ->whereNull('read_at')
            ->exists();

        if ($alreadyNotified) {
            return;
        }

        $qty = number_format($currentQty, 0, ',', '.');
        $min = number_format($product->min_stock, 0, ',', '.');

        // La notificación en tiempo real la dispara CrmNotificationObserver al
        // crearse este registro — no hace falta un evento de broadcast aparte.
        CrmNotification::create([
            'type' => 'low_stock',
            'title' => 'Stock bajo',
            'body' => "{$product->name} — {$qty} unidades (mínimo: {$min})",
            'url' => '/products/'.$productId.'/edit',
            'order_code' => "product_{$productId}",
        ]);
    }
}

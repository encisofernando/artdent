<?php

namespace App\Services\Afip;

use App\Models\Customer;
use App\Models\EcommerceOrder;
use App\Models\Invoice;
use App\Models\Sale;
use App\Models\SaleItem;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Genera comprobantes AFIP para órdenes de e-commerce.
 *
 * Crea una Sale auxiliar a partir de la EcommerceOrder, determina el tipo
 * de comprobante adecuado y delega en AfipService para obtener el CAE.
 */
class EcommerceInvoiceService
{
    /**
     * Genera una factura electrónica AFIP para un pedido de e-commerce.
     *
     * @throws RuntimeException Si la empresa no está configurada para AFIP o WSAA falla
     */
    public function generateInvoice(EcommerceOrder $order): Invoice
    {
        $order->loadMissing(['company', 'customer', 'ecommerce_order_items']);

        // Verificar si ya existe factura autorizada para este pedido
        $existing = Invoice::query()
            ->where('reference_type', EcommerceOrder::class)
            ->where('reference_id', $order->id)
            ->where('status', 'authorized')
            ->first();

        if ($existing) {
            Log::info('EcommerceInvoiceService: pedido ya tiene factura autorizada, se omite.', [
                'order_id' => $order->id,
                'invoice_id' => $existing->id,
            ]);

            return $existing;
        }

        // Resolver cliente para la factura
        $customer = $this->resolveCustomer($order);
        $customerId = $customer?->id;

        // Crear venta auxiliar
        $sale = Sale::create([
            'company_id' => $order->company_id,
            'customer_id' => $customerId,
            'sale_type' => 'ecommerce',
            'receipt_type' => 'X',
            'status' => 'completed',
            'subtotal' => $order->subtotal,
            'discount_amount' => $order->discount_amount ?? 0,
            'tax_amount' => $order->tax_amount ?? 0,
            'total' => $order->total,
            'paid_amount' => $order->total,
            'sold_at' => now(),
            'notes' => "Pedido e-commerce #{$order->order_number}",
        ]);

        // Crear ítems de la venta a partir de los ítems del pedido
        foreach ($order->ecommerce_order_items as $orderItem) {
            SaleItem::create([
                'sale_id' => $sale->id,
                'product_id' => $orderItem->product_id,
                'variant_id' => $orderItem->variant_id ?? null,
                'product_name' => $orderItem->product_name,
                'sku' => $orderItem->sku ?? null,
                'quantity' => $orderItem->quantity,
                'unit_price' => $orderItem->unit_price,
                'discount' => $orderItem->discount ?? 0,
                'tax_amount' => 0,
                'total' => $orderItem->total,
            ]);
        }

        // Recargar la venta con sus ítems y la empresa
        $sale->load(['company', 'customer', 'sale_items']);

        // Determinar tipo de comprobante
        $receiptKey = AfipService::suggestReceiptKey($order->company, $customer?->cuit);

        Log::info('EcommerceInvoiceService: generando factura AFIP', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'sale_id' => $sale->id,
            'receipt_key' => $receiptKey,
        ]);

        // Solicitar CAE a AFIP — si falla, eliminar la venta auxiliar para no dejar huérfanas
        $afipService = new AfipService($order->company);
        try {
            $invoice = $afipService->generateFromSale($sale, $receiptKey);
        } catch (\Throwable $e) {
            $sale->sale_items()->delete();
            $sale->delete();
            throw $e;
        }

        // Sincronizar sale_number con el número oficial asignado por AFIP
        $pointSale = str_pad($order->company->afip_point_sale ?? 1, 5, '0', STR_PAD_LEFT);
        $afipNumber = str_pad($invoice->number, 8, '0', STR_PAD_LEFT);

        $sale->update([
            'receipt_type' => $receiptKey,
            'invoice_id' => $invoice->id,
            'sale_number' => "{$pointSale}-{$afipNumber}",
        ]);

        // Actualizar reference en el invoice para que apunte al pedido
        $invoice->update([
            'reference_type' => EcommerceOrder::class,
            'reference_id' => $order->id,
        ]);

        Log::info('EcommerceInvoiceService: factura generada con éxito', [
            'order_id' => $order->id,
            'invoice_id' => $invoice->id,
            'cae' => $invoice->cae,
        ]);

        return $invoice->fresh();
    }

    /**
     * Genera una nota de crédito electrónica para un pedido de e-commerce.
     *
     * @throws RuntimeException Si no existe factura autorizada o el tipo no admite NC
     */
    public function generateCreditNote(EcommerceOrder $order): Invoice
    {
        $order->loadMissing(['company', 'customer', 'ecommerce_order_items']);

        // Buscar la factura original del pedido
        $originalInvoice = Invoice::query()
            ->where('reference_type', EcommerceOrder::class)
            ->where('reference_id', $order->id)
            ->where('status', 'authorized')
            ->first();

        if (! $originalInvoice) {
            throw new RuntimeException(
                "No se encontró factura autorizada para el pedido #{$order->order_number}."
            );
        }

        // Buscar la venta vinculada a la factura original
        // receipt_type en la venta almacena la clave corta ('FA','FB','FC')
        $sale = Sale::query()
            ->where('invoice_id', $originalInvoice->id)
            ->with(['company', 'customer', 'sale_items'])
            ->first();

        if (! $sale) {
            throw new RuntimeException(
                "No se encontró la venta vinculada a la factura #{$originalInvoice->id}."
            );
        }

        $ncKey = match ($sale->receipt_type) {
            'FA' => 'NCA',
            'FB' => 'NCB',
            'FC' => 'NCC',
            default => throw new RuntimeException(
                "No se puede emitir NC para tipo {$sale->receipt_type}"
            ),
        };

        Log::info('EcommerceInvoiceService: generando nota de crédito', [
            'order_id' => $order->id,
            'original_invoice_id' => $originalInvoice->id,
            'nc_key' => $ncKey,
        ]);

        $afipService = new AfipService($order->company);
        $ncInvoice = $afipService->generateFromSale($sale, $ncKey);

        // Actualizar reference para que la NC también apunte al pedido
        $ncInvoice->update([
            'reference_type' => EcommerceOrder::class,
            'reference_id' => $order->id,
        ]);

        Log::info('EcommerceInvoiceService: nota de crédito generada con éxito', [
            'order_id' => $order->id,
            'nc_invoice_id' => $ncInvoice->id,
            'cae' => $ncInvoice->cae,
        ]);

        return $ncInvoice->fresh();
    }

    /**
     * Resuelve o crea el cliente asociado al pedido para la factura.
     */
    private function resolveCustomer(EcommerceOrder $order): ?Customer
    {
        // Pedido de cliente registrado
        if ($order->customer_id) {
            return $order->customer;
        }

        // Invitado con email — buscar o crear
        if ($order->guest_email) {
            return Customer::firstOrCreate(
                ['email' => $order->guest_email],
                [
                    'name' => $order->shipping_name,
                    'phone' => $order->shipping_phone,
                    'dni' => $order->guest_dni ?: null,
                    'cuit' => $order->guest_cuit ?: null,
                    'iva_condition' => 'consumidor_final',
                    'is_active' => true,
                ]
            );
        }

        // Sin datos identificatorios — CF sin documento
        return null;
    }
}

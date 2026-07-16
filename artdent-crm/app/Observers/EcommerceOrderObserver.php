<?php

namespace App\Observers;

use App\Events\EcommerceOrderStatusChangedEvent;
use App\Mail\OrderStatusChanged;
use App\Models\EcommerceOrder;
use App\Support\CrmMode;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class EcommerceOrderObserver
{
    /**
     * Send an email when the order status changes.
     * Skips the initial 'pending' status set on creation.
     */
    public function updated(EcommerceOrder $order): void
    {
        if (! $order->wasChanged('status')) {
            return;
        }

        try {
            EcommerceOrderStatusChangedEvent::dispatch(
                (string) (CrmMode::tenantInfo()['id'] ?? 'owner'),
                $order->company_id,
                $order->id,
                $order->status,
            );
        } catch (\Throwable $e) {
            Log::warning('Reverb broadcast failed (EcommerceOrderStatusChangedEvent): '.$e->getMessage());
        }

        // Don't notify on initial pending (creation handled by OrderConfirmed)
        if ($order->status === 'pending') {
            return;
        }

        $recipientEmail = $order->customer?->email ?? $order->shipping_name;

        // Resolve recipient email: prefer authenticated customer, fall back to shipping info
        $email = $order->customer?->email;
        if (! $email) {
            // Guest order — no email address stored on the order itself, skip
            return;
        }

        Mail::to($email)->queue(new OrderStatusChanged($order));
    }
}

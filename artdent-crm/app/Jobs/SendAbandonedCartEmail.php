<?php

namespace App\Jobs;

use App\Mail\AbandonedCartMail;
use App\Models\AbandonedCart;
use App\Models\EcommerceOrder;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendAbandonedCartEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly int $abandonedCartId) {}

    public function handle(): void
    {
        $cart = AbandonedCart::find($this->abandonedCartId);

        if (! $cart || $cart->recovered_at || $cart->notified_at) {
            return;
        }

        // Si el cliente completó una orden con ese email en la última hora, no enviar
        $orderExists = EcommerceOrder::query()
            ->where('guest_email', $cart->email)
            ->where('created_at', '>=', now()->subHour())
            ->exists();

        if (! $orderExists) {
            // También verificar por customer (usuario registrado)
            $orderExists = EcommerceOrder::query()
                ->whereHas('customer', fn ($q) => $q->where('email', $cart->email))
                ->where('created_at', '>=', now()->subHour())
                ->exists();
        }

        if ($orderExists) {
            $cart->update(['recovered_at' => now()]);

            return;
        }

        Mail::to($cart->email)->send(new AbandonedCartMail($cart));

        $cart->update(['notified_at' => now()]);
    }
}

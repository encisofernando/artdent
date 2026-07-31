<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Disparado cuando cambia el status de un NaveChargeIntent (cobro presencial
 * QR / link de pago). Actualiza en tiempo real el modal de QR en
 * Sale/Create.jsx y Customer/Account.jsx — mismo patrón que
 * EcommerceOrderStatusChangedEvent.
 */
class NaveChargeIntentStatusChangedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $tenantId,
        public int $companyId,
        public int $intentId,
        public string $status,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("tenant.{$this->tenantId}.company.{$this->companyId}.nave-intents.{$this->intentId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'nave-intent-status-changed';
    }

    public function broadcastWith(): array
    {
        return [
            'intent_id' => $this->intentId,
            'status' => $this->status,
        ];
    }
}

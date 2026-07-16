<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Disparado cuando cambia el status de un EcommerceOrder (pago, envío, etc.).
 * Actualiza en tiempo real la vista de detalle del pedido (EcommerceOrder/Show.jsx).
 */
class EcommerceOrderStatusChangedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $tenantId,
        public int $companyId,
        public int $orderId,
        public string $status,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("tenant.{$this->tenantId}.company.{$this->companyId}.orders.{$this->orderId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'order-status-changed';
    }

    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->orderId,
            'status' => $this->status,
        ];
    }
}

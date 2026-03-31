<?php

namespace App\Events;

use App\Models\EcommerceOrder;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewEcommerceOrderEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public EcommerceOrder $order) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("company.{$this->order->company_id}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'new-order';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'total' => (float) $this->order->total,
            'customer' => $this->order->shipping_name ?? 'Cliente',
            'created_at' => $this->order->created_at?->format('d/m/Y H:i'),
        ];
    }
}

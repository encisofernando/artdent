<?php

namespace App\Events;

use App\Models\Stock;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LowStockAlertEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Stock $stock,
        public int $companyId
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel("company.{$this->companyId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'low-stock';
    }

    public function broadcastWith(): array
    {
        return [
            'product_name' => $this->stock->product?->name ?? '—',
            'sku' => $this->stock->product?->sku ?? '',
            'quantity' => (float) $this->stock->quantity,
            'min_quantity' => (float) $this->stock->min_quantity,
        ];
    }
}

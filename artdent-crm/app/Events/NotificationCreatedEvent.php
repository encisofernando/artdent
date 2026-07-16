<?php

namespace App\Events;

use App\Models\CrmNotification;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Disparado por CrmNotificationObserver cada vez que se crea una
 * CrmNotification, sin importar desde cuál de los ~14 puntos del código se
 * haya originado. Alimenta la campanita del Topbar en tiempo real.
 */
class NotificationCreatedEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public string $tenantId,
        public CrmNotification $notification,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("tenant.{$this->tenantId}.notifications"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'notification-created';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->notification->id,
            'type' => $this->notification->type,
            'title' => $this->notification->title,
        ];
    }
}

<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Disparado tanto desde artdent-admin (TicketController) como desde
 * artdent-crm (SupportTicketController) cuando se agrega un mensaje a un
 * ticket — misma forma en ambas apps para que cualquiera de los dos lados
 * reaccione en vivo sin importar quién escribió. Usa ShouldBroadcastNow
 * (síncrono, no pasa por cola) porque no hay un worker de colas garantizado
 * corriendo acá; se dispara envuelto en try/catch para que una caída de
 * Reverb nunca rompa el posteo del mensaje.
 */
class TicketMessageCreatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public int $ticketId,
        public int $messageId,
        public string $authorType,
        public string $authorName,
        public string $body,
        public string $createdAt,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel("ticket.{$this->ticketId}"),
        ];
    }

    public function broadcastAs(): string
    {
        return 'ticket-message-created';
    }

    public function broadcastWith(): array
    {
        return [
            'message_id' => $this->messageId,
            'author_type' => $this->authorType,
            'author_name' => $this->authorName,
        ];
    }
}

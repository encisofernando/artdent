<?php

namespace App\Mail;

use App\Models\EcommerceOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderStatusChanged extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public readonly string $statusLabel;

    public function __construct(public readonly EcommerceOrder $order)
    {
        $labels = [
            'pending' => 'Pendiente',
            'confirmed' => 'Confirmado',
            'processing' => 'En preparación',
            'shipped' => 'Enviado',
            'delivered' => 'Entregado',
            'cancelled' => 'Cancelado',
            'refunded' => 'Reembolsado',
        ];

        $this->statusLabel = $labels[$order->status] ?? ucfirst($order->status ?? '');
    }

    public function envelope(): Envelope
    {
        $companyName = $this->order->company?->fantasy_name ?: $this->order->company?->name ?: 'ArtCode';

        return new Envelope(
            subject: "Tu pedido #{$this->order->order_number} · {$this->statusLabel} · {$companyName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order_status_changed',
            with: ['company' => $this->order->company],
        );
    }
}

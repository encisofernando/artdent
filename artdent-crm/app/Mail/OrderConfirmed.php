<?php

namespace App\Mail;

use App\Models\EcommerceOrder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class OrderConfirmed extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly EcommerceOrder $order,
        public readonly string $recipientEmail,
        public readonly string $recipientName,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Pedido #{$this->order->order_number} recibido · ARTDENT",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.order_confirmed',
        );
    }
}

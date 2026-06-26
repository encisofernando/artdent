<?php

namespace App\Mail;

use App\Models\AbandonedCart;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AbandonedCartMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public readonly AbandonedCart $cart) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¿Olvidaste algo? Tu carrito te espera en ArtDent',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.abandoned-cart',
            with: [
                'items' => $this->cart->cart_json,
                'checkoutUrl' => 'https://shop.artdent.com.ar/carrito',
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

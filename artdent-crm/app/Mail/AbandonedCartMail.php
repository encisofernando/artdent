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
        $companyName = $this->cart->company?->fantasy_name ?: $this->cart->company?->name ?: 'ArtCode';

        return new Envelope(
            subject: "¿Olvidaste algo? Tu carrito te espera en {$companyName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.abandoned-cart',
            with: [
                'items' => $this->cart->cart_json,
                'checkoutUrl' => config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')).'/carrito',
                'company' => $this->cart->company,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

<?php

namespace App\Mail;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CustomerResetPassword extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public readonly string $resetUrl;

    public function __construct(public readonly Customer $customer, string $token)
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173'));
        $this->resetUrl = $frontendUrl.'/resetear-contrasena?token='.urlencode($token).'&email='.urlencode($customer->email);
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Recuperá tu contraseña · ARTDENT',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.customer_reset_password',
        );
    }
}

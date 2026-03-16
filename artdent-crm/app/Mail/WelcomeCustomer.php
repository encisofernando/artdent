<?php

namespace App\Mail;

use App\Models\Customer;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class WelcomeCustomer extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Customer $customer) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Bienvenido/a a ARTDENT!',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome_customer',
        );
    }
}

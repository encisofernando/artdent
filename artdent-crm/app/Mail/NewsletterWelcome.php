<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewsletterWelcome extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $subscriberName,
        public readonly string $subscriberEmail,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '¡Te suscribiste a ARTDENT! 🦷',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter_welcome',
        );
    }
}

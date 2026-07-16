<?php

namespace App\Mail;

use App\Models\Company;
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
        public readonly ?Company $company = null,
    ) {}

    public function envelope(): Envelope
    {
        $companyName = $this->company?->fantasy_name ?: $this->company?->name ?: 'ArtCode';

        return new Envelope(
            subject: "¡Te suscribiste a {$companyName}! 🦷",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.newsletter_welcome',
            with: ['company' => $this->company],
        );
    }
}

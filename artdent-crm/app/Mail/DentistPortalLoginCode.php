<?php

namespace App\Mail;

use App\Models\Dentist;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DentistPortalLoginCode extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public readonly Dentist $dentist, public readonly string $code) {}

    public function envelope(): Envelope
    {
        $companyName = $this->dentist->company?->fantasy_name ?: $this->dentist->company?->name ?: 'ArtCode';

        return new Envelope(
            subject: "Tu código de acceso · {$companyName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.dentist_portal_code',
            with: ['company' => $this->dentist->company],
        );
    }
}

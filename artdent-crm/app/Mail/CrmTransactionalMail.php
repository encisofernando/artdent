<?php

namespace App\Mail;

use App\Models\Company;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CrmTransactionalMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param  string  $resolvedSubject  Already interpolated subject
     * @param  string  $resolvedBody  Already interpolated body (plain text, nl2br applied in view)
     */
    public function __construct(
        public readonly string $resolvedSubject,
        public readonly string $resolvedBody,
        public readonly ?Company $company = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->resolvedSubject);
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.crm_transactional',
            with: ['company' => $this->company],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}

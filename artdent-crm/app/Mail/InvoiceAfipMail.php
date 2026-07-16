<?php

namespace App\Mail;

use App\Models\EcommerceOrder;
use App\Models\Invoice;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceAfipMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly EcommerceOrder $order,
        public readonly Invoice $invoice,
        public readonly string $recipientEmail,
        public readonly string $recipientName,
    ) {}

    public function envelope(): Envelope
    {
        $formattedNumber = str_pad($this->invoice->point_sale, 4, '0', STR_PAD_LEFT)
            .'-'
            .str_pad($this->invoice->number, 8, '0', STR_PAD_LEFT);
        $companyName = $this->invoice->company?->fantasy_name ?: $this->invoice->company?->name ?: 'ArtCode';

        return new Envelope(
            subject: "Comprobante #{$formattedNumber} · {$companyName}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice_afip',
            with: ['company' => $this->invoice->company],
        );
    }

    /**
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        $this->invoice->loadMissing(['company', 'invoice_type', 'invoice_items']);
        $company = $this->invoice->company;
        $invoice = $this->invoice;
        $order = $this->order;

        $pdfContent = Pdf::loadView('pdf.invoice_afip', compact('invoice', 'order', 'company'))
            ->setPaper('a4')
            ->output();

        $filename = "Factura_{$this->invoice->number}.pdf";

        return [
            Attachment::fromData(fn () => $pdfContent, $filename)
                ->withMime('application/pdf'),
        ];
    }
}

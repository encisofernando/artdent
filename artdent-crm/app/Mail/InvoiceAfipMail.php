<?php

namespace App\Mail;

use App\Models\EcommerceOrder;
use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Spatie\Browsershot\Browsershot;

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

        return new Envelope(
            subject: "Comprobante #{$formattedNumber} · ARTDENT",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.invoice_afip',
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

        $html = view('pdf.invoice_afip', compact('invoice', 'order', 'company'))->render();

        $pdfContent = Browsershot::html($html)
            ->setChromePath(config('services.browsershot.chrome_path', '/usr/bin/google-chrome'))
            ->setNodeBinary(config('services.browsershot.node_binary', '/usr/bin/node'))
            ->setNodeModulePath(base_path('node_modules'))
            ->format('A4')
            ->noSandbox()
            ->printBackground()
            ->pdf();

        $filename = "Factura_{$this->invoice->number}.pdf";

        return [
            Attachment::fromData(fn () => $pdfContent, $filename)
                ->withMime('application/pdf'),
        ];
    }
}

<?php

namespace App\Mail;

use App\Models\CashSession;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CashSessionClosedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * @param  array{opening_amount: float, manual_income: float, sales_by_method: array<int, array{key: string, label: string, amount: float}>, sales_cash: float, sales_digital_total: float, expenses: float, expected_cash: float}  $report
     */
    public function __construct(
        public readonly CashSession $cashSession,
        public readonly array $report,
        public readonly float $closingAmount,
        public readonly float $difference,
    ) {}

    public function envelope(): Envelope
    {
        $drawerName = $this->cashSession->cash_drawer?->name ?? 'Caja';

        return new Envelope(
            subject: "Cierre de {$drawerName} — {$this->cashSession->closed_at->format('d/m/Y H:i')}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.cash_session_closed',
            with: [
                'company' => $this->cashSession->cash_drawer?->company,
                'session' => $this->cashSession,
                'report' => $this->report,
                'closingAmount' => $this->closingAmount,
                'difference' => $this->difference,
            ],
        );
    }
}

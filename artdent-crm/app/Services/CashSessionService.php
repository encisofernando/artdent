<?php

namespace App\Services;

use App\Mail\CashSessionClosedMail;
use App\Models\CashRegisterSetting;
use App\Models\CashSession;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Mail;

class CashSessionService
{
    public const PAYMENT_TYPE_LABELS = [
        'cash' => 'Efectivo',
        'debit' => 'Débito',
        'credit' => 'Crédito',
        'card_debit' => 'Tarjeta de débito',
        'card_credit' => 'Tarjeta de crédito',
        'transfer' => 'Transferencia',
        'cuenta_corriente' => 'Cuenta Corriente',
        'nave_qr' => 'QR (Nave)',
        'loyalty_points' => 'Puntos',
        'mp' => 'Mercado Pago / QR',
        'check' => 'Cheque',
        'other' => 'Otro',
    ];

    /**
     * Evalúa si una sesión abierta superó el horario de corte programado.
     * En modalidad manual nunca expira por horario (permanece abierta entre días).
     * En modalidad automática evalúa contra el horario de corte (close_time).
     */
    public function isSessionExpired(CashSession $session, CashRegisterSetting $settings, ?Carbon $now = null): bool
    {
        if ($settings->close_mode === 'manual') {
            return false;
        }

        $closeTime = $settings->close_time ?: '00:00';
        [$hours, $minutes] = array_map('intval', explode(':', $closeTime));

        $now = $now ? $now->copy() : now();
        $cutoffToday = $now->copy()->setTime($hours, $minutes, 0);

        // Si ya pasamos el horario de corte hoy, el último corte fue hoy a esa hora.
        // Si aún no llegamos al horario de corte hoy, el último corte fue ayer a esa hora.
        $mostRecentCutoff = $now->gte($cutoffToday)
            ? $cutoffToday
            : $cutoffToday->copy()->subDay();

        return $session->opened_at->lt($mostRecentCutoff);
    }

    /**
     * Construye el informe de arqueo completo para la sesión.
     */
    public function buildReport(CashSession $cashSession): array
    {
        $cashSession->loadMissing(['cash_movements', 'sales.sale_payments.paymentMethod', 'sales.sale_items']);

        $manualIncome = round((float) $cashSession->cash_movements
            ->where('type', 'in')
            ->filter(fn ($movement) => $movement->reference_type !== 'sale')
            ->sum('amount'), 2);

        $expenses = round((float) $cashSession->cash_movements->where('type', 'out')->sum('amount'), 2);

        $byMethod = [];
        foreach ($cashSession->sales as $sale) {
            foreach ($sale->sale_payments as $payment) {
                $key = strtolower($payment->paymentMethod?->type ?? 'otro');
                $byMethod[$key] = ($byMethod[$key] ?? 0.0) + (float) $payment->amount;
            }
        }

        $salesCash = round($byMethod['cash'] ?? 0.0, 2);
        $salesDigitalTotal = round(array_sum($byMethod) - $salesCash, 2);

        $salesByMethod = collect($byMethod)
            ->map(fn ($amount, $key) => [
                'key' => $key,
                'label' => self::PAYMENT_TYPE_LABELS[$key] ?? ucfirst($key),
                'amount' => round($amount, 2),
            ])
            ->sortByDesc('amount')
            ->values()
            ->all();

        $byProduct = [];
        foreach ($cashSession->sales as $sale) {
            foreach ($sale->sale_items as $item) {
                $key = $item->product_id !== null ? 'id:'.$item->product_id : 'name:'.$item->product_name;

                $byProduct[$key] ??= [
                    'key' => $key,
                    'name' => $item->product_name,
                    'sku' => $item->sku,
                    'quantity' => 0.0,
                    'total' => 0.0,
                ];
                $byProduct[$key]['quantity'] += (float) $item->quantity;
                $byProduct[$key]['total'] += (float) $item->total;
            }
        }

        $itemsSold = collect($byProduct)
            ->map(fn ($line) => [
                ...$line,
                'quantity' => round($line['quantity'], 2),
                'total' => round($line['total'], 2),
            ])
            ->sortByDesc('quantity')
            ->values()
            ->all();

        return [
            'opening_amount' => (float) $cashSession->opening_amount,
            'manual_income' => $manualIncome,
            'sales_by_method' => $salesByMethod,
            'items_sold' => $itemsSold,
            'sales_cash' => $salesCash,
            'sales_digital_total' => $salesDigitalTotal,
            'expenses' => $expenses,
            'expected_cash' => round($cashSession->opening_amount + $manualIncome + $salesCash - $expenses, 2),
        ];
    }

    /**
     * Cierra la sesión de caja, registra notas y envía el correo con el reporte.
     */
    public function closeSession(
        CashSession $cashSession,
        float $closingAmount,
        ?string $customNotes = null,
        bool $isAutomatic = false,
        ?string $scheduledTime = null
    ): array {
        $report = $this->buildReport($cashSession);
        $difference = round($closingAmount - $report['expected_cash'], 2);

        $prefix = $isAutomatic
            ? 'Cierre automático programado'.($scheduledTime ? " ({$scheduledTime} hs)" : '')
            : 'Cierre manual';

        $notes = trim(($cashSession->notes ? $cashSession->notes."\n" : '').
            "{$prefix}: contado ".number_format($closingAmount, 2, ',', '.').
            ' / esperado '.number_format($report['expected_cash'], 2, ',', '.').
            ' / diferencia '.number_format($difference, 2, ',', '.').
            ($customNotes ? ' — '.$customNotes : ''));

        $cashSession->update([
            'closed_at' => now(),
            'closing_amount' => $closingAmount,
            'status' => 'closed',
            'notes' => $notes,
        ]);

        $this->sendClosedReportEmail($cashSession, $report, $closingAmount, $difference);

        return [
            'report' => $report,
            'difference' => $difference,
        ];
    }

    /**
     * Envía por correo el informe de cierre a los usuarios con permiso de ver caja.
     */
    public function sendClosedReportEmail(
        CashSession $cashSession,
        array $report,
        float $closingAmount,
        float $difference
    ): void {
        $cashSession->loadMissing(['cash_drawer', 'user']);

        if (! $cashSession->cash_drawer) {
            return;
        }

        $recipients = User::query()
            ->where('company_id', $cashSession->cash_drawer->company_id)
            ->where('is_active', true)
            ->get()
            ->filter(fn (User $user) => $user->can('cash-register.view'))
            ->pluck('email')
            ->filter()
            ->unique();

        if ($recipients->isEmpty()) {
            return;
        }

        Mail::to($recipients->all())->send(new CashSessionClosedMail($cashSession, $report, $closingAmount, $difference));
    }
}

<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Recordatorio de pago por WhatsApp: cada 4 horas detecta pedidos de entre 22-26 h sin pago
Schedule::command('ecommerce:send-unpaid-reminders')->everyFourHours();

// Ventas que quedaron como ticket X por un corte/timeout con AFIP (ver
// afip_pending_receipt_type en sales) — reintenta cada 15 min sin que el
// operador tenga que acordarse de volver a facturarlas a mano.
Schedule::command('afip:retry-pending-invoices')->everyFifteenMinutes();

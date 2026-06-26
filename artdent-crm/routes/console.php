<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Recordatorio de pago por WhatsApp: cada 4 horas detecta pedidos de entre 22-26 h sin pago
Schedule::command('ecommerce:send-unpaid-reminders')->everyFourHours();

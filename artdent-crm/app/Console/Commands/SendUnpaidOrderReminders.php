<?php

namespace App\Console\Commands;

use App\Jobs\SendWhatsAppNotification;
use App\Models\EcommerceOrder;
use Illuminate\Console\Command;

class SendUnpaidOrderReminders extends Command
{
    protected $signature = 'ecommerce:send-unpaid-reminders';

    protected $description = 'Envía recordatorios WhatsApp a clientes con pedidos sin pago después de 24 h';

    public function handle(): int
    {
        // Órdenes creadas entre 22h y 26h atrás, aún sin pago, con cliente registrado
        $orders = EcommerceOrder::query()
            ->with('customer')
            ->whereNotNull('customer_id')
            ->where('payment_status', 'pending')
            ->whereNotIn('status', ['cancelled', 'refunded'])
            ->whereBetween('created_at', [now()->subHours(26), now()->subHours(22)])
            ->whereNull('admin_notes') // usamos admin_notes como flag de reminder enviado
            ->get();

        $sent = 0;

        foreach ($orders as $order) {
            $customer = $order->customer;

            if (! $customer || (empty($customer->phone) && empty($customer->whatsapp_bsuid))) {
                continue;
            }

            SendWhatsAppNotification::dispatch(
                $customer->id,
                $order->company_id,
                'order_pending_payment',
                [
                    ['type' => 'text', 'text' => $order->order_number],
                ],
            );

            // Marca la orden para no reenviar en la próxima ejecución
            $order->update(['admin_notes' => 'reminder_sent:'.now()->toDateTimeString()]);
            $sent++;
        }

        $this->info("Recordatorios enviados: {$sent}");

        return Command::SUCCESS;
    }
}

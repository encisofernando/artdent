<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerAccount;
use App\Models\EcommerceOrder;
use App\Models\Invoice;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Response;

class CustomerPortalController extends Controller
{
    public function show(string $token): Response|\Illuminate\Contracts\View\View
    {
        $customer = Customer::where('portal_token', $token)->firstOrFail();

        // Sales (last 20)
        $sales = Sale::where('customer_id', $customer->id)
            ->where('status', '!=', 'cancelled')
            ->orderByDesc('sold_at')
            ->limit(20)
            ->get()
            ->map(fn ($s) => [
                'id' => $s->id,
                'number' => $s->sale_number,
                'date' => $s->sold_at ? Carbon::parse($s->sold_at)->format('d/m/Y') : '—',
                'total' => (float) $s->total,
                'paid' => (float) $s->paid_amount,
                'balance' => (float) $s->total - (float) $s->paid_amount,
                'status' => $s->status,
            ]);

        // Quotes (last 10)
        $quotes = Invoice::where('reference_type', 'quote')
            ->where('recipient_name', $customer->name) // best link available without FK
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($q) => [
                'id' => $q->id,
                'number' => $q->quote_number,
                'date' => $q->issued_at ? Carbon::parse($q->issued_at)->format('d/m/Y') : '—',
                'total' => (float) $q->total,
                'status' => $q->status,
                'share_url' => $q->public_token ? route('quotes.public', $q->public_token) : null,
            ]);

        // Ecommerce orders (last 10)
        $orders = EcommerceOrder::where('customer_id', $customer->id)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn ($o) => [
                'id' => $o->id,
                'number' => $o->order_number,
                'date' => Carbon::parse($o->created_at)->format('d/m/Y'),
                'total' => (float) $o->total,
                'status' => $o->status,
                'payment_status' => $o->payment_status,
            ]);

        // Account balance
        $account = CustomerAccount::firstOrCreate(
            ['customer_id' => $customer->id],
            ['balance' => 0]
        );

        $recentMoves = $account->moves()
            ->orderByDesc('move_date')
            ->orderByDesc('id')
            ->limit(15)
            ->get()
            ->map(fn ($m) => [
                'type' => $m->type,
                'amount' => (float) $m->amount,
                'balance_after' => (float) $m->balance_after,
                'description' => $m->description,
                'move_date' => $m->move_date?->format('d/m/Y'),
            ]);

        return view('portal.customer', [
            'customer' => $customer,
            'sales' => $sales,
            'quotes' => $quotes,
            'orders' => $orders,
            'account' => $account,
            'recentMoves' => $recentMoves,
        ]);
    }
}

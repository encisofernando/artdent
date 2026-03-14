<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\CustomerAccount;
use App\Models\CustomerAccountMove;
use App\Models\PaymentMethod;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerAccountController extends Controller
{
    public function show(Customer $customer): Response
    {
        $account = CustomerAccount::firstOrCreate(
            ['customer_id' => $customer->id],
            ['balance' => 0]
        );

        $moves = $account->moves()
            ->with('user:id,name', 'paymentMethod:id,name')
            ->orderByDesc('move_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (CustomerAccountMove $m) => [
                'id' => $m->id,
                'type' => $m->type,
                'amount' => $m->amount,
                'signed_amount' => $m->signed_amount,
                'balance_after' => $m->balance_after,
                'description' => $m->description,
                'reference_type' => $m->reference_type,
                'reference_id' => $m->reference_id,
                'payment_method' => $m->paymentMethod?->name,
                'user' => $m->user?->name,
                'move_date' => $m->move_date?->format('d/m/Y'),
                'created_at' => $m->created_at?->format('d/m/Y H:i'),
            ]);

        $paymentMethods = PaymentMethod::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Customer/Account', [
            'customer' => $customer->only('id', 'name', 'email', 'phone', 'dni'),
            'account' => [
                'id' => $account->id,
                'balance' => $account->balance,
            ],
            'moves' => $moves,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function storePayment(Request $request, Customer $customer): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method_id' => ['nullable', 'integer', 'exists:payment_methods,id'],
            'description' => ['nullable', 'string', 'max:255'],
            'move_date' => ['nullable', 'date'],
        ]);

        $account = CustomerAccount::firstOrCreate(
            ['customer_id' => $customer->id],
            ['balance' => 0]
        );

        $newBalance = $account->balance - (float) $validated['amount'];

        $move = CustomerAccountMove::create([
            'customer_account_id' => $account->id,
            'user_id' => auth()->id(),
            'type' => CustomerAccountMove::TYPE_PAYMENT,
            'amount' => $validated['amount'],
            'balance_after' => $newBalance,
            'description' => $validated['description'] ?? 'Pago a cuenta',
            'payment_method_id' => $validated['payment_method_id'] ?? null,
            'move_date' => $validated['move_date'] ?? now()->toDateString(),
        ]);

        $account->applyMove($move);

        if ($request->wantsJson()) {
            return response()->json([
                'balance' => $account->fresh()->balance,
                'move' => [
                    'id' => $move->id,
                    'type' => $move->type,
                    'amount' => $move->amount,
                    'signed_amount' => $move->signed_amount,
                    'balance_after' => $move->balance_after,
                    'description' => $move->description,
                    'move_date' => $move->move_date->format('d/m/Y'),
                    'created_at' => $move->created_at?->format('d/m/Y H:i'),
                ],
            ]);
        }

        return redirect()->route('customers.account', $customer)
            ->with('success', 'Pago registrado correctamente.');
    }
}

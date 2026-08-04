<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\LoyaltyAccount;
use App\Models\LoyaltyMove;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerLoyaltyController extends Controller
{
    public function show(Customer $customer): Response
    {
        $account = LoyaltyAccount::firstOrCreate(
            ['customer_id' => $customer->id],
            ['company_id' => $customer->company_id, 'balance' => 0]
        );

        $moves = $account->moves()
            ->with('user:id,name')
            ->orderByDesc('move_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (LoyaltyMove $m) => [
                'id' => $m->id,
                'type' => $m->type,
                'amount' => $m->amount,
                'balance_after' => $m->balance_after,
                'description' => $m->description,
                'reference_type' => $m->reference_type,
                'reference_id' => $m->reference_id,
                'user' => $m->user?->name,
                'move_date' => $m->move_date?->format('d/m/Y'),
                'created_at' => $m->created_at?->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Customer/Loyalty', [
            'customer' => $customer->only('id', 'name', 'email', 'phone', 'dni'),
            'account' => [
                'id' => $account->id,
                'balance' => $account->balance,
            ],
            'moves' => $moves,
        ]);
    }

    public function storeAdjustment(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer'],
            'description' => ['required', 'string', 'max:255'],
            'move_date' => ['nullable', 'date'],
        ]);

        $account = LoyaltyAccount::firstOrCreate(
            ['customer_id' => $customer->id],
            ['company_id' => $customer->company_id, 'balance' => 0]
        );

        $amount = (int) $validated['amount'];
        $newBalance = $account->balance + $amount;

        $move = LoyaltyMove::create([
            'loyalty_account_id' => $account->id,
            'company_id' => $customer->company_id,
            'user_id' => auth()->id(),
            'type' => LoyaltyMove::TYPE_ADJUSTMENT,
            'amount' => $amount,
            'balance_after' => $newBalance,
            'description' => $validated['description'],
            'move_date' => $validated['move_date'] ?? now()->toDateString(),
        ]);
        $account->applyMove($move);

        return response()->json([
            'balance' => $account->fresh()->balance,
            'move' => [
                'id' => $move->id,
                'type' => $move->type,
                'amount' => $move->amount,
                'balance_after' => $move->balance_after,
                'description' => $move->description,
                'move_date' => $move->move_date->format('d/m/Y'),
                'created_at' => $move->created_at?->format('d/m/Y H:i'),
            ],
        ]);
    }
}

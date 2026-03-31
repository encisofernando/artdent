<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Customer;
use App\Models\CustomerAccount;
use App\Models\CustomerAccountMove;
use App\Models\PaymentMethod;
use App\Services\EmailTemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustomerAccountController extends Controller
{
    /** GET /customers-accounts — Overview de todas las cuentas corrientes */
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $filter = $request->input('filter', 'all'); // all | debt | credit | zero

        $query = Customer::query()
            ->where('is_active', true)
            ->with(['customer_account'])
            ->orderBy('name');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('dni', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        $customers = $query->get()->map(function (Customer $c) {
            $balance = (float) ($c->customer_account?->balance ?? 0);

            return [
                'id' => $c->id,
                'name' => $c->name,
                'dni' => $c->dni,
                'phone' => $c->phone,
                'email' => $c->email,
                'balance' => $balance,
                'has_account' => $c->customer_account !== null,
                'account_id' => $c->customer_account?->id,
            ];
        });

        // Aplicar filtro de saldo
        $filtered = match ($filter) {
            'debt' => $customers->filter(fn ($c) => $c['balance'] > 0),
            'credit' => $customers->filter(fn ($c) => $c['balance'] < 0),
            'zero' => $customers->filter(fn ($c) => $c['balance'] == 0),
            default => $customers,
        };

        // KPIs globales
        $totalDebt = $customers->filter(fn ($c) => $c['balance'] > 0)->sum('balance');
        $totalCredit = $customers->filter(fn ($c) => $c['balance'] < 0)->sum(fn ($c) => abs($c['balance']));
        $countDebt = $customers->filter(fn ($c) => $c['balance'] > 0)->count();
        $countCredit = $customers->filter(fn ($c) => $c['balance'] < 0)->count();
        $countZero = $customers->filter(fn ($c) => $c['balance'] == 0)->count();

        return Inertia::render('Customer/AccountsIndex', [
            'customers' => $filtered->values(),
            'filters' => ['search' => $search, 'filter' => $filter],
            'paymentMethods' => PaymentMethod::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'kpis' => [
                'total_debt' => $totalDebt,
                'total_credit' => $totalCredit,
                'count_debt' => $countDebt,
                'count_credit' => $countCredit,
                'count_zero' => $countZero,
                'count_total' => $customers->count(),
            ],
        ]);
    }

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
            'send_email' => ['nullable', 'boolean'],
        ]);

        $account = CustomerAccount::firstOrCreate(
            ['customer_id' => $customer->id],
            ['balance' => 0]
        );

        $newBalance = $account->balance - (float) $validated['amount'];

        $pm = $validated['payment_method_id']
            ? PaymentMethod::find($validated['payment_method_id'])
            : null;

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

        // Enviar email de confirmación si el cliente tiene email y se solicitó
        if (! empty($validated['send_email']) && $customer->email) {
            $company = Company::findOrFail(auth()->user()->company_id ?? 1);

            $vars = [
                'empresa' => $company->fantasy_name ?: $company->name,
                'cliente' => $customer->name,
                'monto' => '$'.number_format((float) $validated['amount'], 2, ',', '.'),
                'fecha' => now()->format('d/m/Y'),
                'metodo' => $pm?->name ?? 'Efectivo',
            ];

            app(EmailTemplateService::class)->send('payment', $customer->email, $company, $vars);
        }

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

    /** POST /customers/{customer}/account/adjustments — Ajuste manual de saldo */
    public function storeAdjustment(Request $request, Customer $customer): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric'],
            'description' => ['required', 'string', 'max:255'],
            'move_date' => ['nullable', 'date'],
        ]);

        $account = CustomerAccount::firstOrCreate(
            ['customer_id' => $customer->id],
            ['balance' => 0]
        );

        $amount = (float) $validated['amount']; // puede ser negativo (acreditar) o positivo (debitar)
        $newBalance = $account->balance + $amount;

        $move = CustomerAccountMove::create([
            'customer_account_id' => $account->id,
            'user_id' => auth()->id(),
            'type' => CustomerAccountMove::TYPE_ADJUSTMENT,
            'amount' => abs($amount),
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
                'signed_amount' => $amount, // positivo = cargo, negativo = crédito
                'balance_after' => $move->balance_after,
                'description' => $move->description,
                'move_date' => $move->move_date->format('d/m/Y'),
                'created_at' => $move->created_at?->format('d/m/Y H:i'),
            ],
        ]);
    }

    public function sendStatement(Request $request, Customer $customer): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $account = CustomerAccount::firstOrCreate(
            ['customer_id' => $customer->id],
            ['balance' => 0]
        );

        $company = Company::findOrFail(auth()->user()->company_id ?? 1);

        $saldo = (float) $account->balance;
        $saldoLabel = ($saldo > 0 ? 'Saldo a favor: $' : ($saldo < 0 ? 'Deuda: $' : 'Sin saldo: $'))
            .number_format(abs($saldo), 2, ',', '.');

        $vars = [
            'empresa' => $company->fantasy_name ?: $company->name,
            'cliente' => $customer->name,
            'saldo' => $saldoLabel,
            'fecha' => now()->format('d/m/Y'),
        ];

        app(EmailTemplateService::class)->send('account_statement', $request->email, $company, $vars);

        return response()->json(['ok' => true]);
    }
}

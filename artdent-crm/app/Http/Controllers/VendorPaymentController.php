<?php

namespace App\Http\Controllers;

use App\Models\PaymentMethod;
use App\Models\Vendor;
use App\Models\VendorAccount;
use App\Models\VendorAccountMove;
use App\Models\VendorPayment;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VendorPaymentController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $search = $request->input('search');
        $vendorId = $request->input('vendor_id');
        $companyId = CompanyContext::id();

        $query = VendorPayment::query()
            ->with(['vendor', 'user', 'paymentMethod'])
            ->where('company_id', $companyId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('reference_no', 'like', "%{$search}%")
                    ->orWhereHas('vendor', fn ($v) => $v->where('name', 'like', "%{$search}%"));
            });
        }

        if ($vendorId) {
            $query->where('vendor_id', $vendorId);
        }

        $items = $query->orderBy('payment_date', 'desc')
            ->orderBy('id', 'desc')
            ->paginate(20)
            ->withQueryString();

        $vendors = Vendor::where('company_id', $companyId)
            ->where('is_active', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('VendorPayment/Index', [
            'items' => $items,
            'vendors' => $vendors,
            'filters' => [
                'search' => $search,
                'vendor_id' => $vendorId,
            ],
        ]);
    }

    public function create(): \Inertia\Response
    {
        $companyId = CompanyContext::id();

        $vendors = Vendor::where('company_id', $companyId)
            ->where('is_active', 1)
            ->orderBy('name')
            ->get(['id', 'name']);

        $paymentMethods = PaymentMethod::orderBy('name')->get(['id', 'name']);

        return Inertia::render('VendorPayment/Create', [
            'vendors' => $vendors,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'vendor_id' => 'required|exists:vendors,id',
            'payment_method_id' => 'nullable|exists:payment_methods,id',
            'amount' => 'required|numeric|min:0.01',
            'payment_date' => 'required|date',
            'reference_no' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
        ]);

        $companyId = CompanyContext::id();

        DB::transaction(function () use ($validated, $companyId) {
            $payment = VendorPayment::create([
                'company_id' => $companyId,
                'vendor_id' => $validated['vendor_id'],
                'user_id' => auth()->id(),
                'payment_method_id' => $validated['payment_method_id'] ?? null,
                'amount' => $validated['amount'],
                'payment_date' => $validated['payment_date'],
                'reference_no' => $validated['reference_no'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            $account = VendorAccount::firstOrCreate(
                ['vendor_id' => $validated['vendor_id']],
                ['company_id' => $companyId, 'balance' => 0]
            );

            $newBalance = $account->balance - $validated['amount'];
            $account->balance = $newBalance;
            $account->save();

            VendorAccountMove::create([
                'vendor_account_id' => $account->id,
                'user_id' => auth()->id(),
                'type' => 'payment',
                'amount' => $validated['amount'],
                'balance_after' => $newBalance,
                'description' => 'Pago'.($validated['reference_no'] ? ' ref. '.$validated['reference_no'] : ''),
                'reference_type' => VendorPayment::class,
                'reference_id' => $payment->id,
                'move_date' => $validated['payment_date'],
            ]);
        });

        return redirect()->route('proveedores.pagos.index')
            ->with('success', 'Pago registrado exitosamente.');
    }

    public function destroy(VendorPayment $vendorPayment): \Illuminate\Http\RedirectResponse
    {
        DB::transaction(function () use ($vendorPayment) {
            $account = VendorAccount::where('vendor_id', $vendorPayment->vendor_id)->first();
            if ($account) {
                $move = $account->moves()
                    ->where('reference_type', VendorPayment::class)
                    ->where('reference_id', $vendorPayment->id)
                    ->first();

                if ($move) {
                    $account->balance += $move->amount;
                    $account->save();
                    $move->delete();
                }
            }

            $vendorPayment->delete();
        });

        return redirect()->route('proveedores.pagos.index')
            ->with('success', 'Pago eliminado exitosamente.');
    }
}

<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesCurrentDentist;
use App\Models\CrmNotification;
use App\Models\LabAccount;
use App\Models\LabAccountPaymentReport;
use App\Models\PaymentMethod;
use App\Support\TenantStorageUrl;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DentistPortalPaymentReportController extends Controller
{
    use ResolvesCurrentDentist;

    public function create(Request $request): Response
    {
        $dentist = $this->currentDentist($request);
        $account = LabAccount::firstOrCreate(['dentist_id' => $dentist->id], ['balance' => 0]);

        return Inertia::render('DentistPortal/ReportPayment', [
            'balance' => (float) $account->balance,
            'paymentMethods' => PaymentMethod::where('is_active', true)
                ->where('applies_to', 'like', '%lab%')
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $dentist = $this->currentDentist($request);
        $account = LabAccount::firstOrCreate(['dentist_id' => $dentist->id], ['balance' => 0]);

        abort_unless($account->balance > 0, 422, 'No tenés saldo pendiente para informar un pago.');

        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01'],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'image' => ['required', 'file', 'mimes:jpg,jpeg,png,webp,pdf', 'max:8192'],
        ]);

        $imagePath = $request->file('image')->store('lab_payment_reports', 'public');

        LabAccountPaymentReport::create([
            'lab_account_id' => $account->id,
            'dentist_id' => $dentist->id,
            'amount' => $data['amount'],
            'payment_method_id' => $data['payment_method_id'],
            'image_url' => TenantStorageUrl::publicUrl($imagePath),
            'notes' => $data['notes'] ?? null,
            'status' => LabAccountPaymentReport::STATUS_PENDING,
        ]);

        CrmNotification::create([
            'type' => 'portal_payment_reported',
            'title' => 'Pago informado',
            'body' => "{$dentist->name} informó un pago de \$".number_format($data['amount'], 2, ',', '.').'.',
            'url' => '/lab-account-moves',
            'order_code' => 'lab_payment_report_'.$dentist->id.'_'.now()->timestamp,
        ]);

        return redirect()->route('dentist-portal.show')->with('success', 'Recibimos tu comprobante. Lo vamos a revisar y acreditar en tu cuenta.');
    }
}

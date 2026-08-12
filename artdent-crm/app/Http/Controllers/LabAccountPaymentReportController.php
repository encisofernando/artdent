<?php

namespace App\Http\Controllers;

use App\Models\LabAccountPaymentReport;
use App\Services\LabAccountPaymentService;
use App\Support\CompanyContext;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LabAccountPaymentReportController extends Controller
{
    public function index(): Response
    {
        $companyId = CompanyContext::id();

        $reports = LabAccountPaymentReport::whereHas('dentist', fn ($q) => $q->where('company_id', $companyId))
            ->where('status', LabAccountPaymentReport::STATUS_PENDING)
            ->with(['dentist:id,name', 'paymentMethod:id,name'])
            ->orderBy('created_at')
            ->get()
            ->map(fn (LabAccountPaymentReport $r) => [
                'id' => $r->id,
                'dentist' => $r->dentist?->name,
                'amount' => (float) $r->amount,
                'payment_method' => $r->paymentMethod?->name,
                'notes' => $r->notes,
                'image_url' => $r->image_url,
                'created_at' => $r->created_at->format('d/m/Y H:i'),
            ]);

        return Inertia::render('LabAccountPaymentReport/Index', [
            'reports' => $reports,
        ]);
    }

    public function approve(LabAccountPaymentReport $labAccountPaymentReport, LabAccountPaymentService $service): RedirectResponse
    {
        $this->authorizeCompany($labAccountPaymentReport);

        $move = $service->registerPayment(
            dentist: $labAccountPaymentReport->dentist,
            amount: $labAccountPaymentReport->amount,
            paymentMethodId: $labAccountPaymentReport->payment_method_id,
            description: 'Pago informado por el odontólogo desde el portal'.($labAccountPaymentReport->notes ? " — {$labAccountPaymentReport->notes}" : ''),
        );

        $labAccountPaymentReport->update([
            'status' => LabAccountPaymentReport::STATUS_APPROVED,
            'lab_account_move_id' => $move->id,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Pago aprobado y acreditado en la cuenta corriente.');
    }

    public function reject(Request $request, LabAccountPaymentReport $labAccountPaymentReport): RedirectResponse
    {
        $this->authorizeCompany($labAccountPaymentReport);

        $labAccountPaymentReport->update([
            'status' => LabAccountPaymentReport::STATUS_REJECTED,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        return back()->with('success', 'Comprobante rechazado.');
    }

    private function authorizeCompany(LabAccountPaymentReport $report): void
    {
        abort_unless($report->dentist->company_id === CompanyContext::id(), 404);
    }
}

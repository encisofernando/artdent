<?php

namespace App\Http\Controllers;

use App\Models\PayrollBookSubmission;
use App\Models\PayrollRun;
use App\Services\Payroll\LibroSueldosDigitalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Placeholder de arquitectura — ver `LibroSueldosDigitalService`. No envía nada a ningún
 * organismo real todavía.
 */
class PayrollBookSubmissionController extends Controller
{
    public function __construct(private readonly LibroSueldosDigitalService $service) {}

    public function index(Request $request): Response
    {
        $companyId = $request->user()->company_id ?? 1;

        $submissions = PayrollBookSubmission::query()
            ->where('company_id', $companyId)
            ->with('payrollRun')
            ->orderByDesc('created_at')
            ->paginate(15);

        $payrollRuns = PayrollRun::query()
            ->where('company_id', $companyId)
            ->orderByDesc('period_from')
            ->limit(24)
            ->get(['id', 'period_from', 'period_to', 'type', 'status']);

        return Inertia::render('Rrhh/LibroSueldosDigital/Index', [
            'submissions' => $submissions,
            'payrollRuns' => $payrollRuns,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $companyId = $request->user()->company_id ?? 1;

        $validated = $request->validate([
            'payroll_run_id' => ['required', 'integer', 'exists:payroll_runs,id'],
        ]);

        $payrollRun = PayrollRun::query()->where('company_id', $companyId)->findOrFail($validated['payroll_run_id']);

        $this->service->submit($payrollRun);

        return back()->with('success', 'Payload de referencia generado (no se envió nada — función no habilitada todavía).');
    }
}

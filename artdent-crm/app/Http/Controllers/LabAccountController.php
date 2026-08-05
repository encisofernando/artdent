<?php

namespace App\Http\Controllers;

use App\Models\Job;
use App\Models\JobPhaseProgress;
use App\Models\LabAccount;
use App\Models\LabAccountMove;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class LabAccountController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(LabAccount $labAccount)
    {
        $companyId = CompanyContext::id();
        $dentistsHaveLastName = Schema::hasColumn('dentists', 'last_name');

        $labAccount->loadMissing(['dentist.company']);

        $dentist = $labAccount->dentist;

        if (! $dentist || (int) $dentist->company_id !== (int) $companyId) {
            abort(403);
        }

        $chronologicalMoves = $labAccount->moves()
            ->with(['paymentMethod:id,name', 'user:id,name'])
            ->orderBy('move_date')
            ->orderBy('id')
            ->get();

        $displayMoves = $chronologicalMoves
            ->sortByDesc(fn (LabAccountMove $move) => sprintf('%s-%010d', $move->move_date?->format('Y-m-d') ?? '', $move->id))
            ->values()
            ->map(fn (LabAccountMove $move) => $this->formatMove($move));

        $payments = $displayMoves
            ->filter(fn (array $move) => $move['signed_amount'] < 0)
            ->values();

        $totalCharges = $chronologicalMoves
            ->sum(fn (LabAccountMove $move) => max(0, (float) $move->signed_amount));

        $totalPayments = $chronologicalMoves
            ->sum(fn (LabAccountMove $move) => max(0, (float) -$move->signed_amount));

        $owedJobs = $this->buildOwedJobs($chronologicalMoves, $companyId);

        return Inertia::render('LabAccount/Show', [
            'account' => [
                'id' => $labAccount->id,
                'balance' => (float) $labAccount->balance,
            ],
            'dentist' => [
                'id' => $dentist->id,
                'name' => $dentist->name,
                'last_name' => $dentistsHaveLastName ? $dentist->last_name : null,
                'contact_name' => $dentist->contact_name,
                'email' => $dentist->email,
                'phone' => $dentist->phone,
                'phone_alt' => $dentist->phone_alt,
                'whatsapp' => $dentist->whatsapp,
                'address' => $dentist->address,
                'city' => $dentist->city,
                'province' => $dentist->province,
                'cuit' => $dentist->cuit,
                'iva_condition' => $dentist->iva_condition,
                'license_number' => $dentist->license_number,
            ],
            'company' => $dentist->company,
            'moves' => $displayMoves,
            'payments' => $payments,
            'owedJobs' => $owedJobs,
            'summary' => [
                'total_charges' => (float) $totalCharges,
                'total_payments' => (float) $totalPayments,
                'owed_jobs_total' => (float) $owedJobs->sum('outstanding_amount'),
                'owed_jobs_count' => $owedJobs->count(),
                'moves_count' => $displayMoves->count(),
            ],
        ]);
    }

    private function buildOwedJobs($chronologicalMoves, int $companyId)
    {
        $remainingCredit = $chronologicalMoves
            ->sum(fn (LabAccountMove $move) => max(0, (float) -$move->signed_amount));

        $chargeMoves = $chronologicalMoves
            ->filter(fn (LabAccountMove $move) => (float) $move->signed_amount > 0)
            ->values();

        // Los cargos por fase (JobPhaseService::billPhaseIfNeeded) referencian
        // un JobPhaseProgress, no el Job directamente — hay que pasar por esa
        // tabla para llegar al job_id real. Sin este mapeo, cualquier cargo
        // por fase se mostraba con la descripción cruda ("Orden X — Fase")
        // sin estado ni paciente, ya que isJobReference() no lo reconocía.
        $phaseMoveIds = $chargeMoves
            ->filter(fn (LabAccountMove $move) => $move->reference_type === JobPhaseProgress::class)
            ->pluck('reference_id')
            ->filter()
            ->unique();

        $jobIdByPhaseId = $phaseMoveIds->isEmpty()
            ? collect()
            : JobPhaseProgress::whereIn('id', $phaseMoveIds)->pluck('job_id', 'id');

        $jobIds = $chargeMoves
            ->map(function (LabAccountMove $move) use ($jobIdByPhaseId) {
                if ($this->isJobReference($move)) {
                    return $move->reference_id;
                }

                if ($move->reference_type === JobPhaseProgress::class) {
                    return $jobIdByPhaseId->get($move->reference_id);
                }

                return null;
            })
            ->filter()
            ->unique()
            ->values();

        $jobRelations = ['patient:id,name'];

        if (Schema::hasTable('job_types')) {
            $jobRelations[] = 'job_type:id,name';
        }

        $jobsById = $jobIds->isEmpty()
            ? collect()
            : Job::with($jobRelations)
                ->where('company_id', $companyId)
                ->whereIn('id', $jobIds)
                ->get()
                ->keyBy('id');

        return $chargeMoves
            ->map(function (LabAccountMove $move) use (&$remainingCredit, $jobsById, $jobIdByPhaseId) {
                $amount = (float) $move->amount;
                $paidAmount = min($remainingCredit, $amount);
                $remainingCredit = max(0, $remainingCredit - $paidAmount);
                $outstanding = max(0, round($amount - $paidAmount, 2));

                if ($outstanding <= 0) {
                    return null;
                }

                $job = match (true) {
                    $this->isJobReference($move) => $jobsById->get($move->reference_id),
                    $move->reference_type === JobPhaseProgress::class => $jobsById->get($jobIdByPhaseId->get($move->reference_id)),
                    default => null,
                };

                return [
                    'move_id' => $move->id,
                    'description' => $move->description,
                    'move_date' => $this->formatDate($move->move_date),
                    'amount' => $amount,
                    'paid_amount' => (float) $paidAmount,
                    'outstanding_amount' => (float) $outstanding,
                    'job' => $job ? [
                        'id' => $job->id,
                        'job_number' => $job->job_number,
                        'status' => $job->status,
                        'priority' => $job->priority,
                        'received_at' => $this->formatDate($job->received_at),
                        'due_date' => $this->formatDate($job->due_date),
                        'patient' => $job->patient?->name,
                        'job_type' => $job->relationLoaded('job_type') ? $job->job_type?->name : null,
                        'url' => route('jobs.show', $job->id),
                    ] : null,
                ];
            })
            ->filter()
            ->values();
    }

    private function formatMove(LabAccountMove $move): array
    {
        return [
            'id' => $move->id,
            'type' => $move->type,
            'amount' => (float) $move->amount,
            'signed_amount' => (float) $move->signed_amount,
            'balance_after' => (float) $move->balance_after,
            'description' => $move->description,
            'reference_type' => $move->reference_type,
            'reference_id' => $move->reference_id,
            'payment_method' => $move->paymentMethod?->name,
            'user' => $move->user?->name,
            'move_date' => $this->formatDate($move->move_date),
            'created_at' => $this->formatDate($move->created_at, true),
            'receipt_url' => route('lab-account-moves.show', $move->id),
        ];
    }

    private function isJobReference(LabAccountMove $move): bool
    {
        return $move->reference_id
            && in_array($move->reference_type, [Job::class, 'job', 'jobs'], true);
    }

    private function formatDate($value, bool $withTime = false): ?string
    {
        if (! $value) {
            return null;
        }

        return Carbon::parse($value)->format($withTime ? 'd/m/Y H:i' : 'Y-m-d');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(LabAccount $labAccount)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LabAccount $labAccount)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LabAccount $labAccount)
    {
        //
    }
}

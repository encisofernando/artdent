<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ResolvesCurrentDentist;
use App\Models\CrmInteraction;
use App\Models\CrmNotification;
use App\Models\Job;
use App\Models\JobPhaseProgress;
use App\Models\LabAccount;
use App\Models\LabAccountMove;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DentistPortalController extends Controller
{
    use ResolvesCurrentDentist;

    private const STATUS_LABELS = [
        'received' => 'Recibido',
        'in_progress' => 'En proceso',
        'quality_check' => 'Control de calidad',
        'ready' => 'Listo para retirar',
        'delivered' => 'Entregado',
        'cancelled' => 'Cancelado',
    ];

    private const MOVE_LABELS = [
        'charge' => 'Cargo',
        'payment' => 'Pago',
        'adjustment' => 'Ajuste',
        'note_credit' => 'Nota de Crédito',
        'note_debit' => 'Nota de Débito',
    ];

    public function show(Request $request): Response
    {
        $dentist = $this->currentDentist($request);

        $jobs = $dentist->jobs()
            ->with(['patient:id,name', 'job_items:id,job_id,description'])
            ->orderByDesc('created_at')
            ->paginate(15)
            ->through(fn ($job) => [
                'id' => $job->id,
                'number' => $job->job_number,
                'patient' => $job->patient?->name,
                'job_type' => $job->job_items->pluck('description')->filter()->join(', ') ?: null,
                'status' => $job->status,
                'status_label' => self::STATUS_LABELS[$job->status] ?? $job->status,
                'due_date' => $job->due_date ? Carbon::parse($job->due_date)->format('d/m/Y') : null,
                'delivered_at' => $job->delivered_at ? Carbon::parse($job->delivered_at)->format('d/m/Y') : null,
            ]);

        $readyCount = $dentist->jobs()->where('status', 'ready')->count();

        $account = LabAccount::firstOrCreate(['dentist_id' => $dentist->id], ['balance' => 0]);

        $recentMoves = $account->moves()
            ->orderByDesc('move_date')
            ->orderByDesc('id')
            ->paginate(15, ['*'], 'moves_page')
            ->through(fn ($m) => [
                'id' => $m->id,
                'type' => $m->type,
                'type_label' => self::MOVE_LABELS[$m->type] ?? ucfirst($m->type),
                'is_payment' => $m->type === 'payment',
                'amount' => (float) $m->amount,
                'balance_after' => (float) $m->balance_after,
                'description' => $m->description,
                'move_date' => $m->move_date?->format('d/m/Y'),
                'downloadable' => in_array($m->type, ['charge', 'note_credit', 'note_debit']),
            ]);

        return Inertia::render('DentistPortal/Dashboard', [
            'dentist' => $dentist->only(['id', 'name', 'email', 'dni']),
            'jobs' => $jobs,
            'readyCount' => $readyCount,
            'account' => ['balance' => (float) $account->balance],
            'recentMoves' => $recentMoves,
        ]);
    }

    public function showJob(Request $request, Job $job): Response
    {
        $dentist = $this->currentDentist($request);

        abort_unless($job->dentist_id === $dentist->id, 404);

        $job->load(['job_items.tariff', 'phaseProgress.tariffPhase', 'job_attachments']);

        $phases = $job->phaseProgress
            ->sortBy(fn ($p) => $p->tariffPhase?->sort_order ?? 0)
            ->values()
            ->map(fn ($p) => [
                'label' => $p->tariffPhase?->name ?? 'Fase',
                'status' => $p->status,
                'time' => $this->phaseTime($p),
            ]);

        return Inertia::render('DentistPortal/JobShow', [
            'job' => [
                'id' => $job->id,
                'number' => $job->job_number,
                'patient' => $job->patient?->name,
                'job_type' => $job->job_items->pluck('description')->filter()->join(', ') ?: null,
                'shade' => $job->shade,
                'status' => $job->status,
                'status_label' => self::STATUS_LABELS[$job->status] ?? $job->status,
                'due_date' => $job->due_date ? Carbon::parse($job->due_date)->format('d/m/Y') : null,
            ],
            'phases' => $phases,
            'attachments' => $job->job_attachments->map(fn ($a) => [
                'id' => $a->id,
                'filename' => $a->filename,
                'url' => $a->url,
                'mime_type' => $a->mime_type,
                'size_label' => $this->fileSizeLabel($a->size_bytes),
            ]),
        ]);
    }

    private function phaseTime(JobPhaseProgress $phase): ?string
    {
        $timestamp = match ($phase->status) {
            JobPhaseProgress::STATUS_COMPLETED => $phase->completed_at,
            JobPhaseProgress::STATUS_IN_PROGRESS, JobPhaseProgress::STATUS_PRUEBA => $phase->started_at,
            default => null,
        };

        return $timestamp?->format('d/m · H:i');
    }

    private function fileSizeLabel(?int $bytes): ?string
    {
        if (! $bytes) {
            return null;
        }

        return $bytes >= 1_000_000
            ? number_format($bytes / 1_000_000, 1).' MB'
            : number_format($bytes / 1000, 0).' KB';
    }

    public function showCheckout(Request $request): Response
    {
        $dentist = $this->currentDentist($request);
        $account = LabAccount::firstOrCreate(['dentist_id' => $dentist->id], ['balance' => 0]);

        return Inertia::render('DentistPortal/Checkout', [
            'balance' => (float) $account->balance,
        ]);
    }

    public function requestPickup(Request $request): RedirectResponse
    {
        $dentist = $this->currentDentist($request);

        CrmNotification::create([
            'type' => 'pickup_request',
            'title' => 'Solicitud de retiro',
            'body' => "{$dentist->name} solicitó el retiro de sus trabajos listos.",
            'url' => '/dentists/'.$dentist->id.'/edit',
            'order_code' => 'dentist_pickup_'.$dentist->id.'_'.now()->timestamp,
        ]);

        CrmInteraction::create([
            'company_id' => $dentist->company_id,
            'dentist_id' => $dentist->id,
            'type' => 'otro',
            'direction' => 'inbound',
            'subject' => 'Solicitud de retiro desde el portal',
            'notes' => 'El odontólogo solicitó el retiro de sus trabajos desde su portal de autogestión.',
            'interaction_at' => now(),
        ]);

        return back()->with('success', 'Se avisó al laboratorio que querés retirar tus trabajos.');
    }

    /**
     * Comprobante interno de un movimiento de cuenta corriente (no es una factura
     * fiscal AFIP: el laboratorio hoy no emite un comprobante fiscal por trabajo de
     * lab facturado al odontólogo, así que este es el documento más honesto que se
     * puede ofrecer con los datos que existen).
     */
    public function movePdf(Request $request, LabAccountMove $move)
    {
        $dentist = $this->currentDentist($request);
        $account = LabAccount::where('dentist_id', $dentist->id)->firstOrFail();

        abort_unless($move->lab_account_id === $account->id, 404);

        $pdf = Pdf::loadView('pdf.lab_account_move', [
            'company' => $dentist->company,
            'dentist' => $dentist,
            'move' => $move,
            'moveLabel' => self::MOVE_LABELS[$move->type] ?? ucfirst($move->type),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('comprobante-'.$move->id.'.pdf');
    }
}

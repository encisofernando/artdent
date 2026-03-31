<?php

namespace App\Services;

use App\Models\Collaborator;
use App\Models\CollaboratorAttendance;
use App\Models\CollaboratorDiscount;
use App\Models\CollaboratorExtra;
use App\Models\CollaboratorReceipt;
use Carbon\Carbon;

class CollaboratorReceiptSyncService
{
    public function calculateTotals(int $companyId, int $collaboratorId, string $periodFrom, string $periodTo): array
    {
        $collaborator = Collaborator::query()
            ->where('company_id', $companyId)
            ->findOrFail($collaboratorId);

        $attendances = CollaboratorAttendance::query()
            ->where('company_id', $companyId)
            ->where('collaborator_id', $collaboratorId)
            ->whereBetween('work_date', [$periodFrom, $periodTo])
            ->whereNotNull('time_out')
            ->get();

        $hours = round((float) $attendances->sum(function (CollaboratorAttendance $attendance) use ($collaborator) {
            [$hours, $amount] = $this->normalizeAttendance($attendance, (float) $collaborator->hourly_rate);

            return $hours ?? 0;
        }), 2);
        $daysWorked = $attendances->count();
        $gross = round($hours * (float) $collaborator->hourly_rate, 2);

        $extrasTotal = round((float) CollaboratorExtra::query()
            ->where('company_id', $companyId)
            ->where('collaborator_id', $collaboratorId)
            ->whereBetween('date', [$periodFrom, $periodTo])
            ->sum('amount'), 2);

        $discountsTotal = round((float) CollaboratorDiscount::query()
            ->where('company_id', $companyId)
            ->where('collaborator_id', $collaboratorId)
            ->whereBetween('date', [$periodFrom, $periodTo])
            ->sum('amount'), 2);

        return [
            'days_worked' => $daysWorked,
            'hours' => $hours,
            'gross' => $gross,
            'extras_total' => $extrasTotal,
            'discounts_total' => $discountsTotal,
            'net' => round($gross + $extrasTotal - $discountsTotal, 2),
        ];
    }

    public function syncReceipt(CollaboratorReceipt $receipt): CollaboratorReceipt
    {
        if ($receipt->status !== 'draft') {
            return $receipt;
        }

        $receipt->fill($this->calculateTotals(
            (int) $receipt->company_id,
            (int) $receipt->collaborator_id,
            $receipt->period_from->toDateString(),
            $receipt->period_to->toDateString(),
        ));

        if ($receipt->isDirty(['days_worked', 'hours', 'gross', 'extras_total', 'discounts_total', 'net'])) {
            $receipt->save();
            $receipt->refresh();
        }

        return $receipt;
    }

    public function syncDraftReceipts(int $companyId, ?int $collaboratorId = null): void
    {
        CollaboratorReceipt::query()
            ->where('company_id', $companyId)
            ->where('status', 'draft')
            ->when($collaboratorId, fn ($query) => $query->where('collaborator_id', $collaboratorId))
            ->get()
            ->each(fn (CollaboratorReceipt $receipt) => $this->syncReceipt($receipt));
    }

    public function syncDraftReceiptsForDate(int $companyId, int $collaboratorId, string $date): void
    {
        CollaboratorReceipt::query()
            ->where('company_id', $companyId)
            ->where('collaborator_id', $collaboratorId)
            ->where('status', 'draft')
            ->whereDate('period_from', '<=', $date)
            ->whereDate('period_to', '>=', $date)
            ->get()
            ->each(fn (CollaboratorReceipt $receipt) => $this->syncReceipt($receipt));
    }

    private function normalizeAttendance(CollaboratorAttendance $attendance, float $hourlyRate): array
    {
        $workDate = $attendance->work_date?->toDateString() ?? $attendance->getRawOriginal('work_date');
        $timeIn = substr((string) $attendance->getRawOriginal('time_in'), 0, 8);
        $timeOut = substr((string) $attendance->getRawOriginal('time_out'), 0, 8);

        if (empty($workDate) || empty($timeIn) || empty($timeOut)) {
            return [$attendance->hours, $attendance->amount];
        }

        $timeInAt = Carbon::parse("{$workDate} {$timeIn}");
        $timeOutAt = Carbon::parse("{$workDate} {$timeOut}");

        // Normalize legacy rows that were persisted with an inverted sign.
        $hours = round(abs($timeOutAt->timestamp - $timeInAt->timestamp) / 3600, 2);
        $amount = round($hours * $hourlyRate, 2);

        if (
            round((float) ($attendance->hours ?? 0), 2) !== $hours ||
            round((float) ($attendance->amount ?? 0), 2) !== $amount
        ) {
            $attendance->update([
                'hours' => $hours,
                'amount' => $amount,
                'hourly_rate_snap' => $hourlyRate,
            ]);
        }

        return [$hours, $amount];
    }
}

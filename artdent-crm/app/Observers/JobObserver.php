<?php

namespace App\Observers;

use App\Events\JobStatusChangedEvent;
use App\Models\Job;
use App\Models\JobStatusHistory;
use App\Support\CrmMode;
use Illuminate\Support\Facades\Log;

class JobObserver
{
    /**
     * Handle the Job "created" event.
     */
    public function created(Job $job): void
    {
        $this->recordStatusHistory($job, 'Trabajo registrado exitosamente en el sistema.');
    }

    /**
     * Handle the Job "updated" event.
     */
    public function updated(Job $job): void
    {
        if ($job->isDirty('status')) {
            $note = "Estado actualizado a: {$job->status}";
            $this->recordStatusHistory($job, $note);

            try {
                JobStatusChangedEvent::dispatch(
                    (string) (CrmMode::tenantInfo()['id'] ?? 'owner'),
                    $job->company_id,
                    $job->id,
                    $job->status,
                );
            } catch (\Throwable $e) {
                Log::warning('Reverb broadcast failed (JobStatusChangedEvent): '.$e->getMessage());
            }
        }
    }

    /**
     * Common method to record the history.
     */
    protected function recordStatusHistory(Job $job, ?string $note = null): void
    {
        try {
            JobStatusHistory::create([
                'job_id' => $job->id,
                'user_id' => auth()->id(),
                'status' => $job->status,
                'note' => $note,
            ]);
        } catch (\Exception $e) {
            Log::error('Error recording JobStatusHistory: '.$e->getMessage(), [
                'job_id' => $job->id,
                'status' => $job->status,
            ]);
        }
    }
}

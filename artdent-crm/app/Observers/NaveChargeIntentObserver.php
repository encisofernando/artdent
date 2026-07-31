<?php

namespace App\Observers;

use App\Events\NaveChargeIntentStatusChangedEvent;
use App\Models\NaveChargeIntent;
use App\Support\CrmMode;
use Illuminate\Support\Facades\Log;

class NaveChargeIntentObserver
{
    public function updated(NaveChargeIntent $intent): void
    {
        if (! $intent->wasChanged('status')) {
            return;
        }

        try {
            NaveChargeIntentStatusChangedEvent::dispatch(
                (string) (CrmMode::tenantInfo()['id'] ?? 'owner'),
                $intent->company_id,
                $intent->id,
                $intent->status,
            );
        } catch (\Throwable $e) {
            Log::warning('Reverb broadcast failed (NaveChargeIntentStatusChangedEvent): '.$e->getMessage());
        }
    }
}

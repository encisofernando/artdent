<?php

namespace App\Observers;

use App\Events\NotificationCreatedEvent;
use App\Models\CrmNotification;
use App\Support\CrmMode;
use Illuminate\Support\Facades\Log;

class CrmNotificationObserver
{
    /**
     * Handle the CrmNotification "created" event.
     *
     * Punto único de disparo en tiempo real para TODAS las notificaciones,
     * sin importar cuál de los ~14 lugares del código las haya creado.
     * CrmNotification no tiene company_id (es tenant-wide, ver
     * CrmNotificationController::index() que lista sin filtrar por company),
     * así que el canal tampoco lo lleva.
     */
    public function created(CrmNotification $notification): void
    {
        try {
            NotificationCreatedEvent::dispatch(
                (string) (CrmMode::tenantInfo()['id'] ?? 'owner'),
                $notification,
            );
        } catch (\Throwable $e) {
            Log::warning('Reverb broadcast failed (NotificationCreatedEvent): '.$e->getMessage());
        }
    }
}

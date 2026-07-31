<?php

use App\Models\EcommerceOrder;
use App\Models\NaveChargeIntent;
use App\Models\Ticket;
use App\Support\CompanyContext;
use App\Support\CrmMode;
use Illuminate\Support\Facades\Broadcast;

/**
 * Los closures de abajo NUNCA confían en los segmentos {tenantId}/{companyId}
 * que llegan en el nombre del canal — los vuelven a resolver del lado del
 * servidor (tenancy ya está inicializada por el middleware 'tenant.session'
 * de la ruta /broadcasting/auth) y comparan. Esto evita que un cliente pueda
 * falsear el nombre del canal para suscribirse a datos de otro tenant.
 */
// CrmNotification no tiene company_id (tenant-wide, ver
// CrmNotificationController::index()) — el canal sólo scopea por tenant.
Broadcast::channel('tenant.{tenantId}.notifications', function ($user, string $tenantId) {
    return (string) (CrmMode::tenantInfo()['id'] ?? '') === $tenantId;
});

Broadcast::channel('tenant.{tenantId}.company.{companyId}.orders.{orderId}', function ($user, string $tenantId, string $companyId, string $orderId) {
    if ((string) (CrmMode::tenantInfo()['id'] ?? '') !== $tenantId) {
        return false;
    }

    return (string) CompanyContext::id() === $companyId
        && EcommerceOrder::where('id', $orderId)->where('company_id', $companyId)->exists();
});

Broadcast::channel('tenant.{tenantId}.company.{companyId}.nave-intents.{intentId}', function ($user, string $tenantId, string $companyId, string $intentId) {
    if ((string) (CrmMode::tenantInfo()['id'] ?? '') !== $tenantId) {
        return false;
    }

    return (string) CompanyContext::id() === $companyId
        && NaveChargeIntent::where('id', $intentId)->where('company_id', $companyId)->exists();
});

// Cross-app: también se define en artdent-admin/routes/channels.php. El
// ticket vive en la BD central compartida — ticket_id ya es único global,
// no hace falta prefijo de tenant, pero sí verificar que el ticket
// pertenezca al tenant actual antes de autorizar.
Broadcast::channel('ticket.{ticketId}', function ($user, string $ticketId) {
    $tenantId = CrmMode::tenantInfo()['id'] ?? null;

    if (! $tenantId) {
        return false;
    }

    $ticket = Ticket::find($ticketId);

    return $ticket && (string) $ticket->tenant_id === (string) $tenantId;
});

<?php

use App\Models\Ticket;
use Illuminate\Support\Facades\Broadcast;

// admin no tiene límite de tenant propio (backoffice central, staff-only) —
// cualquier staff autenticado puede suscribirse a cualquier ticket. También
// se define en artdent-crm/routes/channels.php (con verificación de tenant
// del lado del CRM).
Broadcast::channel('ticket.{ticketId}', function ($user, string $ticketId) {
    return Ticket::whereKey($ticketId)->exists();
});

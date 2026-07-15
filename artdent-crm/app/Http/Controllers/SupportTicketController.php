<?php

namespace App\Http\Controllers;

use App\Mail\NewTicketMail;
use App\Models\Ticket;
use App\Support\CrmMode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class SupportTicketController extends Controller
{
    public function index(Request $request): Response
    {
        $tenantId = $this->currentTenantId();

        return Inertia::render('Support/Index', [
            'tickets' => Ticket::where('tenant_id', $tenantId)
                ->orderByDesc('last_message_at')
                ->orderByDesc('id')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:150'],
            'category' => ['required', 'in:pregunta,tecnico,facturacion,otro'],
            'priority' => ['required', 'in:baja,media,alta'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $user = $request->user();
        $tenantInfo = CrmMode::tenantInfo();

        $ticket = Ticket::create([
            'tenant_id' => $this->currentTenantId(),
            'tenant_name' => $tenantInfo['name'] ?? null,
            'subject' => $data['subject'],
            'category' => $data['category'],
            'priority' => $data['priority'],
            'status' => 'abierto',
            'created_by_name' => $user->name,
            'created_by_email' => $user->email,
            'last_message_at' => now(),
        ]);

        $ticket->messages()->create([
            'author_type' => 'tenant',
            'author_name' => $user->name,
            'author_email' => $user->email,
            'body' => $data['body'],
        ]);

        try {
            Mail::to(config('services.support.notify_email', 'soporte@artcode.com.ar'))->send(new NewTicketMail($ticket));
        } catch (\Throwable) {
            // El ticket ya quedó guardado — el mail es best-effort.
        }

        return redirect()->route('support.show', $ticket->id)->with('success', 'Ticket creado. Te vamos a responder a la brevedad.');
    }

    public function show(Ticket $ticket): Response
    {
        abort_unless($ticket->tenant_id === $this->currentTenantId(), 404);

        $ticket->load('messages');

        return Inertia::render('Support/Show', [
            'ticket' => $ticket,
        ]);
    }

    public function storeMessage(Request $request, Ticket $ticket): RedirectResponse
    {
        abort_unless($ticket->tenant_id === $this->currentTenantId(), 404);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $user = $request->user();

        $message = $ticket->messages()->create([
            'author_type' => 'tenant',
            'author_name' => $user->name,
            'author_email' => $user->email,
            'body' => $data['body'],
        ]);

        $ticket->update([
            'last_message_at' => $message->created_at,
            'status' => in_array($ticket->status, ['resuelto', 'cerrado'], true) ? 'abierto' : $ticket->status,
        ]);

        return back()->with('success', 'Mensaje enviado.');
    }

    private function currentTenantId(): string
    {
        return (string) (CrmMode::tenantInfo()['id'] ?? 'desconocido');
    }
}

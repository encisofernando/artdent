<?php

namespace App\Http\Controllers;

use App\Events\TicketMessageCreatedEvent;
use App\Mail\TicketReplyMail;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TicketController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Ticket::with('assignedTo:id,name')->orderByDesc('last_message_at')->orderByDesc('id');

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('tenant_name', 'like', "%{$search}%")
                    ->orWhere('created_by_email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($priority = $request->string('priority')->toString()) {
            $query->where('priority', $priority);
        }

        return Inertia::render('Tickets/Index', [
            'tickets' => $query->paginate(25)->withQueryString(),
            'filters' => $request->only('search', 'status', 'priority'),
        ]);
    }

    public function show(Ticket $ticket): Response
    {
        $ticket->load(['messages', 'assignedTo:id,name']);

        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket,
            'staff' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Ticket $ticket): RedirectResponse
    {
        $data = $request->validate([
            'status' => ['sometimes', Rule::in(['abierto', 'en_progreso', 'resuelto', 'cerrado'])],
            'priority' => ['sometimes', Rule::in(['baja', 'media', 'alta'])],
            'assigned_to' => ['sometimes', 'nullable', 'exists:users,id'],
        ]);

        $ticket->update($data);

        return back()->with('success', 'Ticket actualizado.');
    }

    public function storeMessage(Request $request, Ticket $ticket): RedirectResponse
    {
        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $staff = $request->user();

        $message = $ticket->messages()->create([
            'author_type' => 'staff',
            'author_name' => $staff->name,
            'author_email' => $staff->email,
            'body' => $data['body'],
        ]);

        $ticket->update([
            'last_message_at' => $message->created_at,
            'status' => $ticket->status === 'abierto' ? 'en_progreso' : $ticket->status,
        ]);

        try {
            Mail::to($ticket->created_by_email)->send(new TicketReplyMail($ticket, $message));
        } catch (\Throwable) {
            // El mensaje ya quedó guardado — el mail es best-effort.
        }

        try {
            TicketMessageCreatedEvent::dispatch(
                $ticket->id,
                $message->id,
                $message->author_type,
                $message->author_name,
                $message->body,
                $message->created_at->toISOString(),
            );
        } catch (\Throwable $e) {
            Log::warning('Reverb broadcast failed (TicketMessageCreatedEvent): '.$e->getMessage());
        }

        return back()->with('success', 'Respuesta enviada.');
    }
}

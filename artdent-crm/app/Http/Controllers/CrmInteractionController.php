<?php

namespace App\Http\Controllers;

use App\Models\CrmClient;
use App\Models\CrmInteraction;
use App\Models\Dentist;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CrmInteractionController extends Controller
{
    public function index(Request $request): \Inertia\Response
    {
        $companyId = auth()->user()->company_id;

        $query = CrmInteraction::where('company_id', $companyId)
            ->with(['user:id,name', 'dentist:id,name', 'crm_client:id,name']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('notes', 'like', "%{$search}%")
                    ->orWhere('outcome', 'like', "%{$search}%");
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('dentist_id')) {
            $query->where('dentist_id', $request->dentist_id);
        }

        $items = $query->latest('interaction_at')->paginate(20)->withQueryString();

        $dentists = Dentist::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('CrmInteraction/Index', [
            'items' => $items,
            'dentists' => $dentists,
            'filters' => $request->only(['search', 'type', 'dentist_id']),
        ]);
    }

    public function create(): \Inertia\Response
    {
        $companyId = auth()->user()->company_id;

        $dentists = Dentist::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $crmClients = CrmClient::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('CrmInteraction/Create', [
            'dentists' => $dentists,
            'crmClients' => $crmClients,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'dentist_id' => 'nullable|exists:dentists,id',
            'crm_client_id' => 'nullable|exists:crm_clients,id',
            'type' => 'required|in:llamada,email,whatsapp,visita,reunion,otro',
            'direction' => 'required|in:inbound,outbound',
            'subject' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'outcome' => 'nullable|string|max:191',
            'followup_date' => 'nullable|date',
            'interaction_at' => 'required|date',
        ]);

        CrmInteraction::create(array_merge($validated, [
            'company_id' => auth()->user()->company_id,
            'user_id' => auth()->id(),
        ]));

        return redirect()->route('crm-interactions.index')
            ->with('success', 'Interacción registrada exitosamente.');
    }

    public function edit(CrmInteraction $crmInteraction): \Inertia\Response
    {
        if ($crmInteraction->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $companyId = auth()->user()->company_id;

        $dentists = Dentist::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        $crmClients = CrmClient::where('company_id', $companyId)
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('CrmInteraction/Edit', [
            'item' => $crmInteraction,
            'dentists' => $dentists,
            'crmClients' => $crmClients,
        ]);
    }

    public function update(Request $request, CrmInteraction $crmInteraction): \Illuminate\Http\RedirectResponse
    {
        if ($crmInteraction->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $validated = $request->validate([
            'dentist_id' => 'nullable|exists:dentists,id',
            'crm_client_id' => 'nullable|exists:crm_clients,id',
            'type' => 'required|in:llamada,email,whatsapp,visita,reunion,otro',
            'direction' => 'required|in:inbound,outbound',
            'subject' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'outcome' => 'nullable|string|max:191',
            'followup_date' => 'nullable|date',
            'interaction_at' => 'required|date',
        ]);

        $crmInteraction->update($validated);

        return redirect()->route('crm-interactions.index')
            ->with('success', 'Interacción actualizada exitosamente.');
    }

    public function destroy(CrmInteraction $crmInteraction): \Illuminate\Http\RedirectResponse
    {
        if ($crmInteraction->company_id !== auth()->user()->company_id) {
            abort(403);
        }

        $crmInteraction->delete();

        return redirect()->route('crm-interactions.index')
            ->with('success', 'Interacción eliminada.');
    }
}

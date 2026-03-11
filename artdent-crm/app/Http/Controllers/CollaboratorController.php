<?php

namespace App\Http\Controllers;

use App\Models\Collaborator;
use App\Models\CollaboratorWebAuthnCredential;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CollaboratorController extends Controller
{
    public function index(Request $request)
    {
        $companyId = $request->user()->company_id ?? 1;
        $search = $request->input('search');
        $status = $request->input('status', 'all');

        $query = Collaborator::query()->where('company_id', $companyId);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('document', 'like', "%{$search}%")
                    ->orWhere('specialty', 'like', "%{$search}%");
            });
        }

        if ($status === 'active') {
            $query->where('is_active', 1);
        } elseif ($status === 'inactive') {
            $query->where('is_active', 0);
        }

        $items = $query->orderBy('id', 'desc')->paginate(15)->withQueryString();

        return Inertia::render('Collaborator/Index', [
            'items' => $items,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Collaborator/Create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'specialty' => 'nullable|string|max:255',
            'hourly_rate' => 'nullable|numeric|min:0',
            'faceio_fid' => 'nullable|string|max:255|unique:collaborators,faceio_fid',
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $validated['company_id'] = auth()->user()->company_id ?? 1;

        Collaborator::create($validated);

        return redirect()->route('collaborators.index')->with('success', 'Colaborador creado exitosamente.');
    }

    public function show(Collaborator $collaborator)
    {
        //
    }

    public function edit(Collaborator $collaborator)
    {
        $credentials = CollaboratorWebAuthnCredential::where('collaborator_id', $collaborator->id)
            ->select(['id', 'credential_id', 'device_label', 'created_at'])
            ->latest()
            ->get();

        return Inertia::render('Collaborator/Edit', [
            'item' => array_merge($collaborator->toArray(), [
                'webauthn_credentials' => $credentials,
            ]),
        ]);
    }

    public function update(Request $request, Collaborator $collaborator)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'document' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'specialty' => 'nullable|string|max:255',
            'hourly_rate' => 'nullable|numeric|min:0',
            'faceio_fid' => 'nullable|string|max:255|unique:collaborators,faceio_fid,'.$collaborator->id,
            'is_active' => 'boolean',
            'notes' => 'nullable|string',
        ]);

        $collaborator->update($validated);

        return redirect()->route('collaborators.index')->with('success', 'Colaborador actualizado exitosamente.');
    }

    public function destroy(Collaborator $collaborator)
    {
        $collaborator->delete();

        return redirect()->route('collaborators.index')->with('success', 'Colaborador eliminado exitosamente.');
    }
}

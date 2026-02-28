<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // ajustá si tenés policies
    }

    public function rules(): array
    {
        return [
            'company_id'     => 'required|exists:companies,id',
            'clinic_id'      => 'nullable|exists:clinics,id',
            'dentist_id'     => 'nullable|exists:dentists,id',
            'patient_id'     => 'nullable|exists:patients,id',

            // legacy (opcional)
            'job_type_id'    => 'nullable|exists:job_types,id',

            // NO lo hacemos required para no pelear con el frontend
            'entry_date'     => 'nullable|date',
            'promised_date'  => 'nullable|date',
            'delivery_date'  => 'nullable|date',

            'work_type'      => 'nullable|in:ticket,budget',
            'status'         => 'nullable|in:pending,in_progress,completed,delivered,cancelled',
            'priority'       => 'nullable|in:low,normal,high,urgent',

            'subtotal'       => 'nullable|numeric|min:0',
            'discount'       => 'nullable|numeric|min:0',
            'tax'            => 'nullable|numeric|min:0',
            'total'          => 'nullable|numeric|min:0',

            'specifications' => 'nullable|string',
            'notes'          => 'nullable|string',
            'internal_notes' => 'nullable|string',

            // ── NUEVO: items ────────────────────────────────────────────────
            'items'               => 'required|array|min:1',
            'items.*.tariff_id'   => 'required|exists:tariffs,id',
            'items.*.qty'         => 'required|integer|min:1',
            'items.*.price'       => 'nullable|numeric|min:0',
            'items.*.pieces'      => 'nullable|string|max:255',
            'items.*.notes'       => 'nullable|string',
            'items.*.meta'        => 'nullable|array',
        ];
    }
}

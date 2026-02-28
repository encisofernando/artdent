<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'clinic_id'      => 'nullable|exists:clinics,id',
            'dentist_id'     => 'nullable|exists:dentists,id',
            'patient_id'     => 'nullable|exists:patients,id',
            'job_type_id'    => 'nullable|exists:job_types,id',

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

            // Si mandás items, reemplazamos items completos
            'items'               => 'sometimes|array|min:1',
            'items.*.tariff_id'   => 'required_with:items|exists:tariffs,id',
            'items.*.qty'         => 'required_with:items|integer|min:1',
            'items.*.price'       => 'nullable|numeric|min:0',
            'items.*.pieces'      => 'nullable|string|max:255',
            'items.*.notes'       => 'nullable|string',
            'items.*.meta'        => 'nullable|array',
        ];
    }
}

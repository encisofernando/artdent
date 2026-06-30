<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLabWithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'collaborator_id' => ['nullable', 'integer', 'exists:collaborators,id'],
            'external_person' => ['nullable', 'string', 'max:191'],
            'withdrawn_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'exists:products,id'],
            'items.*.variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_cost' => ['required', 'numeric', 'min:0'],
            'items.*.total' => ['required', 'numeric', 'min:0'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'warehouse_id.required' => 'El depósito es obligatorio.',
            'warehouse_id.exists' => 'El depósito seleccionado no existe.',
            'withdrawn_at.required' => 'La fecha de retiro es obligatoria.',
            'items.required' => 'Debe agregar al menos un artículo.',
            'items.min' => 'Debe agregar al menos un artículo.',
            'items.*.product_id.required' => 'Seleccione un producto.',
            'items.*.product_id.exists' => 'Uno de los productos no existe.',
            'items.*.quantity.required' => 'La cantidad es obligatoria.',
            'items.*.quantity.min' => 'La cantidad debe ser mayor a cero.',
            'items.*.unit_cost.required' => 'El costo unitario es obligatorio.',
        ];
    }
}

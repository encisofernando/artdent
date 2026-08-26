<?php

namespace App\Http\Requests;

use App\Support\UserTenantMapGuard;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:191'],
            'email' => ['required', 'email', 'max:191', 'unique:users,email', function (string $attribute, mixed $value, Closure $fail): void {
                // 'unique:users,email' sólo mira la BD del tenant actual —
                // dos tenants distintos pueden tener cada uno su propio
                // usuario con el mismo email. Sin este chequeo, crear acá un
                // usuario con un email que otro tenant ya reclamó en
                // user_tenant_map le secuestra el login (ver UserObserver).
                if (UserTenantMapGuard::claimedByOtherTenant((string) $value)) {
                    $fail('Ya existe un usuario con ese correo electrónico.');
                }
            }],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'phone' => ['nullable', 'string', 'max:64', Rule::unique('users', 'phone')->whereNotNull('phone')],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'is_active' => ['boolean'],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['integer', 'exists:roles,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'El nombre es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no tiene un formato válido.',
            'email.unique' => 'Ya existe un usuario con ese correo electrónico.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'phone.unique' => 'Ya existe un usuario con ese número de teléfono.',
            'roles.*.exists' => 'Uno de los roles seleccionados no es válido.',
        ];
    }
}

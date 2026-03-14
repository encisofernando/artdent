<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:191'],
            'email'     => ['required', 'email', 'max:191', 'unique:users,email'],
            'password'  => ['required', 'string', 'min:8', 'confirmed'],
            'phone'     => ['nullable', 'string', 'max:64'],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'is_active' => ['boolean'],
            'roles'     => ['nullable', 'array'],
            'roles.*'   => ['integer', 'exists:roles,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'      => 'El nombre es obligatorio.',
            'email.required'     => 'El correo electrónico es obligatorio.',
            'email.email'        => 'El correo electrónico no tiene un formato válido.',
            'email.unique'       => 'Ya existe un usuario con ese correo electrónico.',
            'password.required'  => 'La contraseña es obligatoria.',
            'password.min'       => 'La contraseña debe tener al menos 8 caracteres.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'roles.*.exists'     => 'Uno de los roles seleccionados no es válido.',
        ];
    }
}

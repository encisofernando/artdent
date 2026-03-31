<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreHeroSlideRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'image' => ['nullable', 'image', 'max:102400'],
            'click_url' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:255'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'image.image' => 'El archivo debe ser una imagen valida (jpg, png, gif o webp).',
            'image.max' => 'La imagen no puede superar los 100 MB.',
            'click_url.max' => 'La URL no puede superar los 255 caracteres.',
            'sort_order.integer' => 'El orden debe ser un numero entero.',
            'sort_order.min' => 'El orden no puede ser menor que 0.',
            'sort_order.max' => 'El orden no puede ser mayor que 255.',
        ];
    }
}

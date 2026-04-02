<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'slide_type' => ['required', Rule::in(['image', 'editorial'])],
            'eyebrow' => ['nullable', 'string', 'max:120'],
            'title' => ['nullable', 'string', 'max:180'],
            'subtitle' => ['nullable', 'string', 'max:220'],
            'description' => ['nullable', 'string', 'max:210'],
            'button_label' => ['nullable', 'string', 'max:80'],
            'button_url' => ['nullable', 'string', 'max:255'],
            'content_align' => ['required', Rule::in(['left', 'center', 'right'])],
            'content_width' => ['required', Rule::in(['sm', 'md', 'lg'])],
            'height_mode' => ['required', Rule::in(['compact', 'regular', 'immersive'])],
            'font_style' => ['required', Rule::in(['brand', 'editorial', 'impact'])],
            'title_size' => ['required', Rule::in(['sm', 'md', 'lg', 'xl'])],
            'body_size' => ['required', Rule::in(['sm', 'md', 'lg'])],
            'overlay_strength' => ['required', Rule::in(['none', 'soft', 'medium', 'strong'])],
            'surface_style' => ['required', Rule::in(['none', 'glass', 'solid'])],
            'eyebrow_color' => ['nullable', 'regex:/^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/'],
            'title_color' => ['nullable', 'regex:/^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/'],
            'subtitle_color' => ['nullable', 'regex:/^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/'],
            'description_color' => ['nullable', 'regex:/^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/'],
            'button_bg_color' => ['nullable', 'regex:/^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/'],
            'button_text_color' => ['nullable', 'regex:/^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/'],
            'button_border_color' => ['nullable', 'regex:/^#(?:[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/'],
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
            'description.max' => 'La descripción breve no puede superar los 210 caracteres.',
            'slide_type.required' => 'Seleccioná el tipo de slide.',
            'content_align.required' => 'Seleccioná la alineación del contenido.',
            'content_width.required' => 'Seleccioná el ancho del bloque de contenido.',
            'height_mode.required' => 'Seleccioná la altura del slide.',
            'font_style.required' => 'Seleccioná el estilo tipográfico.',
            'title_size.required' => 'Seleccioná el tamaño del título.',
            'body_size.required' => 'Seleccioná el tamaño del texto.',
            'overlay_strength.required' => 'Seleccioná la intensidad del overlay.',
            'surface_style.required' => 'Seleccioná el estilo de superficie.',
            'eyebrow_color.regex' => 'El color del subtítulo breve debe ser un hexadecimal válido.',
            'title_color.regex' => 'El color del título debe ser un hexadecimal válido.',
            'subtitle_color.regex' => 'El color del subtítulo debe ser un hexadecimal válido.',
            'description_color.regex' => 'El color de la descripción debe ser un hexadecimal válido.',
            'button_bg_color.regex' => 'El color de fondo del botón debe ser un hexadecimal válido.',
            'button_text_color.regex' => 'El color del texto del botón debe ser un hexadecimal válido.',
            'button_border_color.regex' => 'El color del borde del botón debe ser un hexadecimal válido.',
            'sort_order.integer' => 'El orden debe ser un numero entero.',
            'sort_order.min' => 'El orden no puede ser menor que 0.',
            'sort_order.max' => 'El orden no puede ser mayor que 255.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $colorFields = [
            'eyebrow_color',
            'title_color',
            'subtitle_color',
            'description_color',
            'button_bg_color',
            'button_text_color',
            'button_border_color',
        ];

        $normalized = [
            'slide_type' => $this->input('slide_type') ?: 'image',
            'content_align' => $this->input('content_align') ?: 'left',
            'content_width' => $this->input('content_width') ?: 'md',
            'height_mode' => $this->input('height_mode') ?: 'regular',
            'font_style' => $this->input('font_style') ?: 'brand',
            'title_size' => $this->input('title_size') ?: 'lg',
            'body_size' => $this->input('body_size') ?: 'md',
            'overlay_strength' => $this->input('overlay_strength') ?: 'medium',
            'surface_style' => $this->input('surface_style') ?: 'glass',
            'is_active' => filter_var($this->input('is_active', true), FILTER_VALIDATE_BOOLEAN),
        ];

        foreach ($colorFields as $field) {
            $value = trim((string) $this->input($field, ''));
            $normalized[$field] = $value === '' ? null : strtoupper($value);
        }

        $this->merge($normalized);
    }
}

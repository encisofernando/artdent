<?php

namespace App\Exceptions;

use Illuminate\Http\RedirectResponse;
use RuntimeException;

/**
 * Se lanza al intentar superar un límite numérico del plan activo
 * (max_users, max_products, max_sales_per_month). A diferencia de
 * ModuleNotEnabledException (bloqueo de acceso a una página completa),
 * esto ocurre en medio de un submit de formulario, así que renderiza
 * como una vuelta atrás con mensaje flash en vez de una página de error.
 */
class PlanLimitExceededException extends RuntimeException
{
    public function __construct(public readonly string $resource, public readonly int $max)
    {
        parent::__construct("Alcanzaste el límite de {$resource} de tu plan actual ({$max}). Mejorá tu plan para agregar más.");
    }

    public function render(): RedirectResponse
    {
        return back()->with('error', $this->getMessage());
    }
}

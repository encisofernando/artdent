<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

/**
 * Gestión de Tokens de API (Laravel Sanctum) para el usuario autenticado.
 */
class ApiTokenController extends Controller
{
    /**
     * GET /admin/api-tokens
     * Renderiza la página de gestión de tokens.
     */
    public function index(Request $request)
    {
        $tokens = $request->user()
            ->tokens()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($t) => [
                'id'           => $t->id,
                'name'         => $t->name,
                'abilities'    => $t->abilities,
                'last_used_at' => $t->last_used_at?->diffForHumans(),
                'created_at'   => $t->created_at->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Admin/ApiTokens', [
            'tokens' => $tokens,
        ]);
    }

    /**
     * POST /admin/api-tokens
     * Crea un nuevo token y lo devuelve UNA SOLA VEZ al cliente.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $token = $request->user()->createToken(
            $request->name,
            ['*'] // acceso total; afinar si se necesita
        );

        return back()->with('new_token', $token->plainTextToken);
    }

    /**
     * DELETE /admin/api-tokens/{tokenId}
     * Revoca un token.
     */
    public function destroy(Request $request, int $tokenId)
    {
        $request->user()
            ->tokens()
            ->where('id', $tokenId)
            ->delete();

        return back()->with('success', 'Token revocado correctamente.');
    }
}

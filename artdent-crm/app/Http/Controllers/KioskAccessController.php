<?php

namespace App\Http\Controllers;

use App\Models\KioskNetwork;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class KioskAccessController extends Controller
{
    /**
     * ID de tenant a usar para las KioskNetwork de este request. En modo
     * multi-tenant es el tenant real; en modo owner no hay tenancy()
     * inicializada, así que se usa el mismo tenant "impostor" que
     * RestrictToLabNetwork resuelve por defecto (KIOSK_DEFAULT_TENANT_ID),
     * para que las IPs cargadas acá matcheen con lo que el middleware busca.
     */
    private function currentTenantId(): ?string
    {
        return tenant('id') ?? config('app.kiosk_default_tenant_id');
    }

    /**
     * GET /admin/kiosk-access
     */
    public function index(Request $request): InertiaResponse
    {
        $ips = KioskNetwork::where('tenant_id', $this->currentTenantId())
            ->whereNotNull('ip_address')
            ->orderByDesc('created_at')
            ->get();

        $tokens = $request->user()
            ->tokens()
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'name' => $t->name,
                'abilities' => $t->abilities,
                'last_used_at' => $t->last_used_at?->diffForHumans(),
                'created_at' => $t->created_at->format('d/m/Y H:i'),
            ]);

        return Inertia::render('Admin/KioskAccess', [
            'allowedIps' => $ips,
            'tokens' => $tokens,
            'currentIp' => $request->ip(),
        ]);
    }

    /**
     * POST /admin/kiosk-access/ips
     */
    public function storeIp(Request $request): RedirectResponse
    {
        $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'ip_address' => ['required', 'string', 'max:50'],
        ]);

        KioskNetwork::create([
            'tenant_id' => $this->currentTenantId(),
            'label' => $request->label,
            'ip_address' => $request->ip_address,
        ]);

        return back()->with('success', 'IP agregada correctamente.');
    }

    /**
     * PATCH /admin/kiosk-access/ips/{ip}/toggle
     */
    public function toggleIp(KioskNetwork $ip): RedirectResponse
    {
        abort_unless($ip->tenant_id === $this->currentTenantId(), 404);

        $ip->update(['is_active' => ! $ip->is_active]);

        return back()->with('success', $ip->is_active ? 'IP habilitada.' : 'IP deshabilitada.');
    }

    /**
     * DELETE /admin/kiosk-access/ips/{ip}
     */
    public function destroyIp(KioskNetwork $ip): RedirectResponse
    {
        abort_unless($ip->tenant_id === $this->currentTenantId(), 404);

        $ip->delete();

        return back()->with('success', 'IP eliminada.');
    }

    /**
     * POST /admin/kiosk-access/tokens
     */
    public function storeToken(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $token = $request->user()->createToken($request->name, ['*']);

        return back()->with('new_token', $token->plainTextToken);
    }

    /**
     * DELETE /admin/kiosk-access/tokens/{tokenId}
     */
    public function destroyToken(Request $request, int $tokenId): RedirectResponse
    {
        $request->user()->tokens()->where('id', $tokenId)->delete();

        return back()->with('success', 'Token revocado correctamente.');
    }
}

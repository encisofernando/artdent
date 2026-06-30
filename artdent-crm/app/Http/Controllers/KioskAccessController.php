<?php

namespace App\Http\Controllers;

use App\Models\KioskAllowedIp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class KioskAccessController extends Controller
{
    /**
     * GET /admin/kiosk-access
     */
    public function index(Request $request): InertiaResponse
    {
        $ips = KioskAllowedIp::orderByDesc('created_at')->get();

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

        KioskAllowedIp::create($request->only('label', 'ip_address'));

        Cache::forget('kiosk_allowed_ips');

        return back()->with('success', 'IP agregada correctamente.');
    }

    /**
     * PATCH /admin/kiosk-access/ips/{ip}/toggle
     */
    public function toggleIp(KioskAllowedIp $ip): RedirectResponse
    {
        $ip->update(['is_active' => ! $ip->is_active]);

        Cache::forget('kiosk_allowed_ips');

        return back()->with('success', $ip->is_active ? 'IP habilitada.' : 'IP deshabilitada.');
    }

    /**
     * DELETE /admin/kiosk-access/ips/{ip}
     */
    public function destroyIp(KioskAllowedIp $ip): RedirectResponse
    {
        $ip->delete();

        Cache::forget('kiosk_allowed_ips');

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

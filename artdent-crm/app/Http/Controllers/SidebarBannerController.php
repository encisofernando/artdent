<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSidebarBannerRequest;
use App\Models\SidebarBanner;
use App\Support\TenantStorageUrl;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SidebarBannerController extends Controller
{
    public function index(): \Inertia\Response
    {
        $banners = SidebarBanner::orderBy('sort_order')->orderBy('id')->get();

        return Inertia::render('SidebarBanner/Index', [
            'banners' => $banners,
        ]);
    }

    public function store(StoreSidebarBannerRequest $request): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_url'] = TenantStorageUrl::publicUrl($request->file('image')->store('sidebar-banners', 'public'));
        }

        SidebarBanner::create($data);

        return back()->with('success', 'Banner creado correctamente.');
    }

    public function update(StoreSidebarBannerRequest $request, SidebarBanner $sidebarBanner): \Illuminate\Http\RedirectResponse
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            // Borrar imagen anterior
            if ($sidebarBanner->image_url) {
                $relative = TenantStorageUrl::relativePath($sidebarBanner->image_url);
                if (Storage::disk('public')->exists($relative)) {
                    Storage::disk('public')->delete($relative);
                }
            }
            $data['image_url'] = TenantStorageUrl::publicUrl($request->file('image')->store('sidebar-banners', 'public'));
        }

        $sidebarBanner->update($data);

        return back()->with('success', 'Banner actualizado correctamente.');
    }

    public function destroy(SidebarBanner $sidebarBanner): \Illuminate\Http\RedirectResponse
    {
        if ($sidebarBanner->image_url) {
            $relative = TenantStorageUrl::relativePath($sidebarBanner->image_url);
            if (Storage::disk('public')->exists($relative)) {
                Storage::disk('public')->delete($relative);
            }
        }

        $sidebarBanner->delete();

        return back()->with('success', 'Banner eliminado.');
    }

    /**
     * API pública para el e-commerce: retorna banners activos ordenados.
     */
    public function apiIndex(): \Illuminate\Http\JsonResponse
    {
        $banners = SidebarBanner::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get(['id', 'title', 'subtitle', 'cta_label', 'cta_url', 'image_url']);

        return response()->json($banners);
    }
}

<?php

namespace App\Http\Middleware;

use App\Models\Company;
use App\Services\ChatbotService;
use App\Support\CompanyContext;
use App\Support\CrmMode;
use App\Support\TenantModuleResolver;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    ...$request->user()->toArray(),
                    'is_super_admin' => $request->user()->hasRole('Super Admin'),
                    'permissions' => $request->user()->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'app_context' => [
                'crm_mode' => config('crm.mode'),
                'billing_enabled' => CrmMode::billingEnabled(),
            ],
            'tenant_info' => fn () => CrmMode::tenantInfo(),
            'company' => fn () => $request->user() ? [
                'active' => Company::find(CompanyContext::id(), ['id', 'name', 'fantasy_name', 'logo_url', 'lab_logo_url']),
                'available' => CompanyContext::availableFor($request->user()),
            ] : null,
            'enabled_modules' => fn () => $request->user()
                ? app(TenantModuleResolver::class)->enabledSlugs()
                : [],
            // Flash data para todos los componentes Inertia
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'new_token' => $request->session()->get('new_token'),
            ],
            'chatbot' => fn () => $request->user()
                ? app(ChatbotService::class)->getFrontendConfig()
                : null,
        ];
    }
}

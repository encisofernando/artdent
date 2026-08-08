<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(
        __DIR__.'/../routes/channels.php',
        ['middleware' => ['web', 'tenant.session', 'auth']],
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // El terminal HikVision hace POST directo al webhook sin sesión de
        // navegador (no hay forma de que envíe un token CSRF).
        $middleware->validateCsrfTokens(except: [
            'hikvision/webhook',
            'internal/isup/*',
        ]);

        $middleware->alias([
            'auth' => \App\Http\Middleware\Authenticate::class,
            'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
            'tenant.session' => \App\Http\Middleware\InitializeTenancyBySession::class,
            'module' => \App\Http\Middleware\EnsureModuleEnabled::class,
            'cash.session.current' => \App\Http\Middleware\EnsureCashSessionIsCurrent::class,
            'lab.network' => \App\Http\Middleware\RestrictToLabNetwork::class,
            'isup.internal' => \App\Http\Middleware\EnsureIsupInternalToken::class,
            'isup.tenant' => \App\Http\Middleware\InitializeTenancyByIsupAccount::class,
            'colaborador.auth' => \App\Http\Middleware\ColaboradorAuth::class,
            'dentist.portal.auth' => \App\Http\Middleware\DentistPortalAuth::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->respond(function (\Symfony\Component\HttpFoundation\Response $response, \Throwable $e, \Illuminate\Http\Request $request) {
            if ($e instanceof \App\Exceptions\ModuleNotEnabledException) {
                // Los endpoints de acción de los kioscos (job-kiosk.*, webauthn)
                // no son páginas Inertia — son llamadas axios puras desde un
                // terminal físico sin sesión. Devolverles la página de error
                // Inertia (HTML completo) rompería su parseo JSON. Se detecta
                // por nombre de ruta explícito (no por heurística de headers,
                // que puede dar falsos positivos con requests Inertia reales).
                if ($request->routeIs('job-kiosk.*') || $request->routeIs('attendance-kiosk.webauthn.*')) {
                    return response()->json(['error' => 'Este módulo no está incluido en el plan actual.'], 403);
                }

                return \Inertia\Inertia::render('Error', [
                    'status' => 403,
                    'reason' => 'module_not_included',
                    'module' => $e->module,
                ])
                    ->toResponse($request)
                    ->setStatusCode(403);
            }

            if (! app()->environment('local') && in_array($response->getStatusCode(), [403, 404, 500, 503, 419])) {
                return \Inertia\Inertia::render('Error', ['status' => $response->getStatusCode()])
                    ->toResponse($request)
                    ->setStatusCode($response->getStatusCode());
            }

            return $response;
        });
    })->create();

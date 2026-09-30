<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="ArtCode CRM">
        <meta name="theme-color" content="#0f172a">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="portal-only" content="{{ config('crm.portal_only') ? '1' : '0' }}">
        <link rel="manifest" href="{{ asset('manifest.webmanifest') }}">
        <link rel="icon" type="image/svg+xml" href="{{ asset('assets/artcode-icon-color.svg') }}">
        <link rel="shortcut icon" href="{{ asset('assets/artcode-icon-color.svg') }}">
        <link rel="apple-touch-icon" href="{{ asset('pwa/icon-192.png') }}">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx', "resources/js/Pages/{$page['component']}.jsx"])
        @inertiaHead

        @unless (config('crm.portal_only'))
        <style>
            /* Splash de arranque (sólo carga completa; las navegaciones Inertia
               no recargan el documento). Se quita apenas React monta, ver
               window.hideAppSplash en resources/js/app.jsx. */
            #app-splash{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;background:#f8fafc;transition:opacity .3s ease,visibility .3s ease}
            #app-splash.is-dark{background:#020617}
            #app-splash.is-hidden{opacity:0;visibility:hidden}
            #app-splash img{width:220px;height:auto;animation:app-splash-in .6s ease-out both,app-splash-pulse 1.8s ease-in-out .6s infinite}
            #app-splash .app-splash-logo-white,#app-splash.is-dark .app-splash-logo-color{display:none}
            #app-splash.is-dark .app-splash-logo-white{display:block}
            #app-splash .app-splash-bar{width:120px;height:3px;border-radius:3px;background:rgba(57,123,156,.18);overflow:hidden}
            #app-splash .app-splash-bar span{display:block;width:40%;height:100%;border-radius:3px;background:linear-gradient(90deg,#397B9C,#17B3A3);animation:app-splash-bar 1.1s ease-in-out infinite}
            @keyframes app-splash-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
            @keyframes app-splash-pulse{0%,100%{opacity:1}50%{opacity:.8}}
            @keyframes app-splash-bar{from{transform:translateX(-100%)}to{transform:translateX(300%)}}
            @media (prefers-reduced-motion:reduce){#app-splash img,#app-splash .app-splash-bar span{animation:none}}
        </style>
        @endunless
    </head>
    <body class="font-sans antialiased">
        @unless (config('crm.portal_only'))
        <div id="app-splash" role="status" aria-label="Cargando ArtCode">
            <img class="app-splash-logo-color" src="{{ asset('assets/artcode-splash-color.webp') }}" alt="" width="220" height="50">
            <img class="app-splash-logo-white" src="{{ asset('assets/artcode-splash-white.webp') }}" alt="" width="220" height="50">
            <div class="app-splash-bar"><span></span></div>
        </div>
        <script>
            (function () {
                var el = document.getElementById('app-splash');
                var start = Date.now();
                var MIN_VISIBLE_MS = 400;
                try {
                    var saved = localStorage.getItem('theme');
                    var dark = saved === 'dark' || (saved !== 'light' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                    if (dark) el.classList.add('is-dark');
                } catch (e) {}
                function remove() {
                    if (!el || !el.parentNode) return;
                    el.classList.add('is-hidden');
                    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 320);
                }
                window.hideAppSplash = function () {
                    setTimeout(remove, Math.max(0, MIN_VISIBLE_MS - (Date.now() - start)));
                };
                // Red de seguridad: si la app no llega a montar, no dejar la pantalla tapada.
                setTimeout(remove, 10000);
            })();
        </script>
        @endunless
        @inertia
    </body>
</html>

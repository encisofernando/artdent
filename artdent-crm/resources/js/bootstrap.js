import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// panel.artdent.com.ar (portal_only) usa cookie/header CSRF con nombre
// propio ("PORTAL-XSRF-TOKEN") en vez del estándar "XSRF-TOKEN" — ver
// App\Http\Middleware\PortalVerifyCsrfToken para el porqué (colisión con
// la cookie wildcard de pos.artdent.com.ar, que también le llega a este
// subdominio). Inertia usa esta misma instancia global de axios para
// todos sus requests, así que esto alcanza para cubrir login/verify/
// acciones autenticadas del portal sin tocar nada del resto del CRM.
const isPortalOnly = document.querySelector('meta[name="portal-only"]')?.content === '1';
if (isPortalOnly) {
    window.axios.defaults.xsrfCookieName = 'PORTAL-XSRF-TOKEN';
    window.axios.defaults.xsrfHeaderName = 'X-PORTAL-XSRF-TOKEN';
}

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
const reverbHost = import.meta.env.VITE_REVERB_HOST;
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';
const reverbPort = import.meta.env.VITE_REVERB_PORT ?? (reverbScheme === 'https' ? 443 : 8080);
const localHosts = new Set(['localhost', '127.0.0.1', '::1']);
const normalizedReverbHost = String(reverbHost ?? '').trim().replace(/^['"]|['"]$/g, '');
const forceLocalEcho = String(import.meta.env.VITE_REVERB_FORCE_LOCAL ?? '').toLowerCase() === 'true';

window.Echo = null;

const shouldBootEcho = Boolean(reverbKey && normalizedReverbHost)
    && (forceLocalEcho || !localHosts.has(normalizedReverbHost));

if (shouldBootEcho) {
    window.Pusher = Pusher;

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: normalizedReverbHost,
        wsPort: reverbPort,
        wssPort: reverbPort,
        forceTLS: reverbScheme === 'https',
        enabledTransports: ['ws', 'wss'],
    });
}

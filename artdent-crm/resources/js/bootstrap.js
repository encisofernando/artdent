import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;
const reverbHost = import.meta.env.VITE_REVERB_HOST;
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';
const reverbPort = import.meta.env.VITE_REVERB_PORT ?? (reverbScheme === 'https' ? 443 : 8080);
const localHosts = new Set(['localhost', '127.0.0.1', '::1']);

window.Echo = null;

const shouldBootEcho = Boolean(reverbKey && reverbHost) && (import.meta.env.DEV || !localHosts.has(reverbHost));

if (shouldBootEcho) {
    window.Pusher = Pusher;

    window.Echo = new Echo({
        broadcaster: 'reverb',
        key: reverbKey,
        wsHost: reverbHost,
        wsPort: reverbPort,
        wssPort: reverbPort,
        forceTLS: reverbScheme === 'https',
        enabledTransports: ['ws', 'wss'],
    });
}

import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.jsx',
            ],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    server: {
        // Puerto explícito: sin esto, tanto artdent-admin como artdent-crm
        // caen al 5173 por default. Como "localhost" resuelve a ::1 en este
        // host y cada app.vite bindea una familia de IP distinta (crm usa
        // 0.0.0.0, admin el default), el navegador podía terminar cargando
        // el bundle JS de una app sobre el HTML servido por la otra.
        port: 5174,
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});

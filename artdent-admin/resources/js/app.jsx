import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './Contexts/ThemeContext';
import { ConfirmProvider } from './Contexts/ConfirmContext';

const appName = import.meta.env.VITE_APP_NAME || 'ArtCode Admin';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx')
        ).then((module) => {
            const page = module.default;
            page.layout = page.layout || ((page) => page);
            return page;
        }),

    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <ConfirmProvider>
                    <App {...props} />
                </ConfirmProvider>
            </ThemeProvider>
        );
    },

    progress: {
        color: '#17B3A3',
        showSpinner: false,
    },
});

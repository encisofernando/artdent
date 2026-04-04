import "./bootstrap";
import "../css/app.css";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./Contexts/ThemeContext";
import { registerPwa } from "./lib/registerPwa";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

registerPwa();

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob("./Pages/**/*.jsx")
        ).then((module) => {
            const page = module.default;

            // Layout persistente opcional
            page.layout = page.layout || ((page) => page);

            return page;
        }),

    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <App {...props} />
            </ThemeProvider>
        );
    },

    // Barra de progreso entre navegaciones (Inertia v2)
    progress: {
        color: "#4B5563",
        showSpinner: false,
    },
});

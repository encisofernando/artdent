import "./bootstrap";
import "../css/app.css";

import { createInertiaApp, router } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./Contexts/ThemeContext";
import { ConfirmProvider } from "./Contexts/ConfirmContext";
import { ToastProvider } from "./Contexts/ToastContext";
import { registerPwa } from "./lib/registerPwa";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

registerPwa();

// Recuperación automática de sesión/CSRF vencidos (419): en vez de dejar al
// usuario varado en la página de "Sesión Expirada" (nuestro exception
// handler ya la renderiza como respuesta Inertia válida, ver bootstrap/app.php),
// se hace un reload completo una sola vez — eso re-sincroniza cookie de
// sesión y token CSRF desde cero. Si el 419 persiste tras el reload (server
// realmente roto, no solo un token vencido), no se reintenta de nuevo para
// no entrar en loop.
router.on("success", (event) => {
    const page = event.detail.page;
    if (page.component !== "Error" || page.props?.status !== 419) {
        return;
    }

    const guardKey = "artdent:419-recovered-at";
    const lastRecovery = Number(sessionStorage.getItem(guardKey) || 0);
    const now = Date.now();

    if (now - lastRecovery > 10000) {
        sessionStorage.setItem(guardKey, String(now));
        window.location.reload();
    }
});

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
                <ConfirmProvider>
                    <ToastProvider>
                        <App {...props} />
                    </ToastProvider>
                </ConfirmProvider>
            </ThemeProvider>
        );
    },

    // Barra de progreso entre navegaciones (Inertia v2)
    progress: {
        color: "#4B5563",
        showSpinner: false,
    },
});

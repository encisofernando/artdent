import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/css/app.css",
                "resources/js/app.jsx"
            ],
            refresh: true,
        }),
        react(),
    ],

    resolve: {
        alias: {
            "@": "/resources/js",
        },
        dedupe: ["react", "react-dom"],
    },

    build: {
        manifest: true,
        outDir: "public/build",

        sourcemap: false,
        minify: "esbuild",

        chunkSizeWarningLimit: 1500,

        rollupOptions: {
            output: {
                entryFileNames: "assets/[name]-[hash].js",
                chunkFileNames: "assets/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash][extname]",
                // react/react-dom/@inertiajs casi no cambian entre deploys —
                // separarlos del bundle de la app (antes todo entraba junto
                // en app-{hash}.js) para que el navegador no tenga que
                // volver a bajarlos cada vez que cambia una sola página.
                manualChunks: {
                    vendor: ["react", "react-dom", "@inertiajs/react"],
                },
            },
        },
    },

    optimizeDeps: {
        include: [
            "react",
            "react-dom",
            "@inertiajs/react"
        ],
    },

    server: {
        host: "0.0.0.0",
        hmr: {
            host: "localhost",
        },
    },
});

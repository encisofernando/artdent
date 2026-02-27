// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // ── FIX 1: "process is not defined" ────────────────────────────────────────
  // Algunos servicios legacy usan process.env.XXX (estilo Node/CRA).
  // Vite no inyecta `process` — este define lo shimea globalmente.
  // Para tus propias variables de entorno seguí usando import.meta.env.VITE_*
  define: {
    "process.env": "{}",
    "process.env.NODE_ENV": JSON.stringify("development"),
  },

  // ── FIX 2: Silenciar warning de chunks grandes (>500 kB) ───────────────────
  build: {
    chunkSizeWarningLimit: 5000, // 5 MB — ajusta si querés más estricto después de optimizar
  },

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",

      // Activa la SW en desarrollo para poder probar la PWA en local
      devOptions: { enabled: false },

      // Archivos precargados en caché — rutas relativas a /public
      includeAssets: [
        "favicon.ico",
        "icons/apple-touch-icon.png",
        "icons/*.png",
      ],

      // ── Web App Manifest ────────────────────────────────────────────────────
      manifest: {
        name: "ArtDent – Back Office",
        short_name: "ArtDent",
        description: "Sistema de gestión ArtDent Lab",
        theme_color: "#397B9C",
        background_color: "#0F1F2A",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: "/",
        scope: "/",
        lang: "es-AR",

        icons: [
          { src: "/icons/icon-192.png",         sizes: "192x192", type: "image/png"             },
          { src: "/icons/icon-512.png",          sizes: "512x512", type: "image/png"             },
          { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],

        shortcuts: [
          {
            name: "Nueva Venta",
            short_name: "Venta",
            description: "Ir directo al POS",
            url: "/facturacion",
            icons: [{ src: "/icons/shortcut-pos.png", sizes: "96x96" }],
          },
          {
            name: "Artículos",
            short_name: "Artículos",
            url: "/articulos",
            icons: [{ src: "/icons/shortcut-products.png", sizes: "96x96" }],
          },
        ],
      },

      // ── Workbox (Service Worker) ────────────────────────────────────────────
      workbox: {
        // ── FIX 3: Aumentar límite para precachear chunks grandes ─────────────
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB (antes era 2 MB por default)

        runtimeCaching: [
          {
            // API Laravel: NetworkFirst (siempre intenta la red, cae a caché si offline)
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "artdent-api-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 5 },
              networkTimeoutSeconds: 10,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Assets estáticos (imágenes, fuentes): CacheFirst
            urlPattern: ({ request }) =>
              request.destination === "image" ||
              request.destination === "font",
            handler: "CacheFirst",
            options: {
              cacheName: "artdent-assets-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],

        navigateFallback: "/index.html",
        navigateFallbackDenylist: [
          /^\/api\//,
          /^\/sanctum\//,
          /^\/storage\//,
        ],
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
  ],

  server: {
    // Proxy hacia Laravel — evita CORS y permite Sanctum same-site cookies
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/sanctum": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
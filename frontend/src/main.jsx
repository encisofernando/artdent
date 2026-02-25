// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { registerSW } from "virtual:pwa-register";

registerSW({
  onNeedRefresh() { console.log("[PWA] Nueva versión disponible"); },
  onOfflineReady() { console.log("[PWA] App lista para usar offline"); },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        // ── Silencia los dos warnings de React Router v6 → v7 ──────────────
        // Cuando migrés a v7 podés eliminar estas flags (ya estarán por defecto)
        v7_startTransition:    true,  // state updates dentro de startTransition
        v7_relativeSplatPath:  true,  // resolución de rutas relativas en splats
      }}
    >
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  define: { "process.env": {} },
  server: {
    port: 5173,
    proxy: {
      // Todo lo que empiece con /api va a 127.0.0.1:8000 tal cual
      "/api": {
        target: "https://api.artdent.com.ar",
        changeOrigin: true,
      },
    },
  },
});

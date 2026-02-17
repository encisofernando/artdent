"use client";

import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background:   "hsl(var(--card))",
          color:        "hsl(var(--card-foreground))",
          border:       "1px solid hsl(var(--border))",
          borderRadius: "var(--radius)",
          fontSize:     "0.875rem",
          fontFamily:   "Montserrat, sans-serif",
        },
        success: {
          iconTheme: { primary: "#5AAD9C", secondary: "#fff" },
        },
        error: {
          iconTheme: { primary: "#E63946", secondary: "#fff" },
        },
      }}
    />
  );
}

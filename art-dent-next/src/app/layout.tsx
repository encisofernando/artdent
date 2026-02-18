import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToasterProvider } from "@/components/providers/ToasterProvider";

export const metadata: Metadata = {
  title: "ARTDENT CRM",
  description: "Sistema de gestión clínica ARTDENT",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          {children}
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}

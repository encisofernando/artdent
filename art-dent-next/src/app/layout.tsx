import type { Metadata } from "next";
import { ThemeProvider }    from "@/components/providers/ThemeProvider";
import { ToasterProvider }  from "@/components/providers/ToasterProvider";
import "./globals.css";

export const metadata: Metadata = {
  title:       "ARTDENT CRM",
  description: "Sistema de gestión clínica ARTDENT",
  icons:       { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          {children}
          <ToasterProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}

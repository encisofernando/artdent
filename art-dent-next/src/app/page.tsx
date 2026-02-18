"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token =
      localStorage.getItem("artdent_token") || localStorage.getItem("token");

    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando...</p>
      </div>
    </div>
  );
}

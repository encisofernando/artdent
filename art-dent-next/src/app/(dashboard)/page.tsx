// app/(dashboard)/page.tsx
// 👉 Este archivo es un placeholder. En el próximo módulo se migra el Dashboard completo.

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Bienvenido al CRM ARTDENT — Next.js + shadcn/ui + Tailwind
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Ventas del mes", "Clientes activos", "Trabajos pendientes", "Stock bajo"].map((label, i) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-5 space-y-2 hover:shadow-md transition-shadow"
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
            <div className="h-7 w-24 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        ⚡ Módulo 1/N completado — Auth + Layout Shell migrado correctamente.
      </p>
    </div>
  );
}

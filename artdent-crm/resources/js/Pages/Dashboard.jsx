import { Head, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/Components/ui/button";
import { Download, RefreshCw } from "lucide-react";

// Charts (los que tenés en resources/js/Components/Charts)
import LineChart from "@/Components/Charts/LineChart";
import BarChart from "@/Components/Charts/BarChart";
import PieChart from "@/Components/Charts/PieChart";

const B = {
  blue: "#397B9C",
  green: "#5AAD9C",
  mint: "#ACD6CE",
  teal: "#49949C",
  blueSoft: "#7CA5C3",
};

const PERIODS = [
  { value: "today", label: "Hoy" },
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
];

function StatCard({ title, value, subtitle, accent = B.green, progress = 0.65 }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
      <div className="text-[11px] font-bold tracking-[0.12em] uppercase text-slate-500/70">
        {title}
      </div>
      <div className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-500/70">{subtitle}</div>
      <div className="mt-4 h-1 w-full rounded bg-black/5">
        <div className="h-1 rounded" style={{ width: `${Math.round(progress * 100)}%`, background: accent }} />
      </div>
    </div>
  );
}

export default function DashboardIndex() {
  const { props } = usePage();
  const stats = props?.stats || null;

  // Si tu controller luego manda también data de charts, los levantás así:
  const revenueData = props?.revenueData || null;
  const salesData = props?.salesData || null;
  const pieData = props?.pieData || null;

  const [period, setPeriod] = useState("month");

  const fmt = (n) => Number(n || 0).toLocaleString("es-AR");
  const fmtC = (n) => `$${fmt(n)}`;

  const onRefresh = () => {
    router.reload({ only: ["stats", "revenueData", "salesData", "pieData"], data: { period } });
  };

  const onExportPDF = () => {
    window.location.href = `/reportes/export-pdf?period=${encodeURIComponent(period)}`;
  };

  const cards = useMemo(
    () => [
      {
        title: "Total ventas",
        value: fmt(stats?.current?.total_sales),
        subtitle: "Operaciones del período",
        accent: B.blue,
        progress: 0.75,
      },
      {
        title: "Ingresos",
        value: fmtC(stats?.current?.revenue),
        subtitle: "Total del período",
        accent: B.green,
        progress: 0.65,
      },
      {
        title: "Nuevos clientes",
        value: fmt(stats?.current?.new_customers),
        subtitle: "Altas del período",
        accent: B.teal,
        progress: 0.45,
      },
      {
        title: "Ticket promedio",
        value: fmtC(stats?.current?.avg_ticket),
        subtitle: "Por operación",
        accent: B.blueSoft,
        progress: 0.55,
      },
    ],
    [stats]
  );

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Panel de Control</h1>
            <p className="text-sm text-slate-500/70">Análisis en tiempo real · ArtDent</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Period */}
            <div className="inline-flex rounded-xl border border-black/5 bg-white p-1">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPeriod(p.value)}
                  className={[
                    "px-3 py-1.5 rounded-lg text-sm font-semibold transition",
                    period === p.value ? "text-white" : "text-slate-600/80 hover:bg-black/[0.04]",
                  ].join(" ")}
                  style={
                    period === p.value
                      ? { background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }
                      : undefined
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>

            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="mr-2" size={16} />
              Actualizar
            </Button>

            <Button onClick={onExportPDF}>
              <Download className="mr-2" size={16} />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <StatCard key={c.title} {...c} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="text-sm font-bold text-slate-800">Ingresos generados</div>
            <div className="mt-1 text-sm text-slate-500/70">Evolución por período</div>

            <div className="mt-4 h-[340px]">
              <LineChart isDashboard data={revenueData} />
            </div>
          </div>

          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <div className="text-sm font-bold text-slate-800">Por categoría</div>
            <div className="mt-1 text-sm text-slate-500/70">Distribución</div>

            <div className="mt-4 h-[340px]">
              <PieChart isDashboard data={pieData} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <div className="text-sm font-bold text-slate-800">Top productos</div>
          <div className="mt-1 text-sm text-slate-500/70">Cantidad vendida</div>

          <div className="mt-4 h-[320px]">
            <BarChart isDashboard data={salesData} />
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

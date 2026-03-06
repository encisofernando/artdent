import { Head, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/Components/ui/button";
import { Download, RefreshCw, Banknote, DollarSign, UserPlus, TrendingUp } from "lucide-react";
import { useTheme } from "@/Contexts/ThemeContext";

// Si tenés los charts (ej. Nivo), descomentalos luego e integralos o pasales el prop isDark
// import LineChart from "@/Components/Charts/LineChart";
// import BarChart from "@/Components/Charts/BarChart";
// import PieChart from "@/Components/Charts/PieChart";

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

function StatCard({ title, value, subtitle, icon: Icon, accent = B.green, progress = 0.65, isDark }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-sm transition-colors relative overflow-hidden
        ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}
    `}>
      {/* Top accent border */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80)` }}
      />

      <div className="flex justify-between items-start">
        <div className={`text-[11px] font-bold tracking-[0.12em] uppercase mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500/70'}`}>
          {title}
        </div>
        {Icon && (
          <div
            className="p-2 rounded-xl"
            style={{ backgroundColor: isDark ? `${accent}25` : `${accent}15`, color: accent }}
          >
            <Icon size={20} strokeWidth={2.5} />
          </div>
        )}
      </div>

      <div className={`mt-2 text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {value}
      </div>
      <div className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500/70'}`}>{subtitle}</div>
      <div className={`mt-4 h-1 w-full rounded ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
        <div className="h-1 rounded" style={{ width: `${Math.round(progress * 100)}%`, background: accent }} />
      </div>
    </div>
  );
}

export default function DashboardIndex() {
  const { props } = usePage();
  const { isDark } = useTheme();

  const stats = props?.stats || null;
  const recentTransactions = props?.recentTransactions || [];

  const [period, setPeriod] = useState(props.period || "month");

  const fmt = (n) => Number(n || 0).toLocaleString("es-AR");
  const fmtC = (n) => `$${fmt(n)}`;

  const loadDataForPeriod = (newPeriod) => {
    router.visit(route('dashboard'), {
      data: { period: newPeriod },
      preserveState: true,
      preserveScroll: true,
      only: ["stats", "recentTransactions"],
    });
  };

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    loadDataForPeriod(newPeriod);
  };

  const onRefresh = () => {
    loadDataForPeriod(period);
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
        icon: Banknote,
        accent: B.blue,
        progress: 0.75,
      },
      {
        title: "Ingresos",
        value: fmtC(stats?.current?.revenue),
        subtitle: "Total del período",
        icon: DollarSign,
        accent: B.green,
        progress: 0.65,
      },
      {
        title: "Nuevos clientes",
        value: fmt(stats?.current?.new_customers),
        subtitle: "Altas del período",
        icon: UserPlus,
        accent: B.teal,
        progress: 0.45,
      },
      {
        title: "Ticket promedio",
        value: fmtC(stats?.current?.avg_ticket),
        subtitle: "Por operación",
        icon: TrendingUp,
        accent: B.blueSoft,
        progress: 0.55,
      },
    ],
    [stats]
  );

  return (
    <AuthenticatedLayout>
      <Head title="Dashboard" />

      <div className="flex flex-col gap-6 font-sans">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Panel de Control
            </h1>
            <p className="text-sm text-slate-500">Análisis en tiempo real · ArtDent</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Period selector */}
            <div className={`inline-flex rounded-xl p-1 border transition-colors
                ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}    
            `}>
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePeriodChange(p.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
                    ${period === p.value
                      ? "text-white shadow-sm"
                      : isDark ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }
                  `}
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

            <Button
              variant="outline"
              onClick={onRefresh}
              className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white" : ""}
            >
              <RefreshCw className="mr-2" size={16} />
              Actualizar
            </Button>

            <Button
              onClick={onExportPDF}
              className="text-white border-none shadow-md hover:shadow-lg transition-all"
              style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
            >
              <Download className="mr-2" size={16} />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <StatCard key={c.title} {...c} isDark={isDark} />
          ))}
        </div>

        {/* Charts and Transactions row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`rounded-2xl border p-5 shadow-sm lg:col-span-2 transition-colors
              ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}  
          `}>
            <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
              Ingresos generados
            </div>
            <div className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Evolución por período</div>

            <div className={`mt-4 h-[340px] flex items-center justify-center rounded-xl border border-dashed
                ${isDark ? 'border-slate-700 text-slate-400 bg-slate-800/80 shadow-inner' : 'border-slate-300 text-slate-400 bg-slate-50'}    
            `}>
              <p>El componente del gráfico de líneas va aquí</p>
            </div>
          </div>

          <div className={`rounded-2xl border p-5 shadow-sm transition-colors flex flex-col h-[450px]
              ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
          `}>
            <div className="flex justify-between items-center shrink-0 mb-4">
              <div>
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Transacciones</div>
                <div className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Recientes</div>
              </div>
              <div className="px-2 py-1 text-xs font-bold rounded-md" style={{ color: isDark ? B.mint : B.blue, backgroundColor: isDark ? `${B.blue}30` : `${B.blue}20` }}>
                {recentTransactions.length}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin">
              {recentTransactions.length === 0 ? (
                <div className={`flex h-full items-center justify-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Sin transacciones
                </div>
              ) : (
                recentTransactions.map((tx, idx) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border transition-colors
                            ${isDark ? 'border-slate-700/60 bg-slate-800/80 hover:bg-slate-800/60 hover:border-slate-600' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}
                        `}>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.green})` }}
                      >
                        {tx.user?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{tx.txId}</p>
                        <p className="text-xs text-slate-500 truncate">{tx.user}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold" style={{ color: B.green }}>{fmtC(tx.cost)}</p>
                      <p className="text-xs text-slate-500">{tx.date.split(' ')[0]}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

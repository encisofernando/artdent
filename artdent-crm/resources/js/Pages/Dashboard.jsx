import { Head, router, usePage } from "@inertiajs/react";
import { useMemo, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Button } from "@/Components/ui/button";
import {
    Download,
    RefreshCw,
    Banknote,
    DollarSign,
    UserPlus,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Store,
} from "lucide-react";
import { useTheme } from "@/Contexts/ThemeContext";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

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

function TrendBadge({ value }) {
    if (value === null || value === undefined) return null;
    const positive = value >= 0;
    const Icon = positive ? TrendingUp : TrendingDown;
    return (
        <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                positive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            }`}
        >
            <Icon size={10} />
            {positive ? "+" : ""}{value}%
        </span>
    );
}

function StatCard({ title, value, subtitle, icon: Icon, accent = B.green, trend, isDark }) {
    return (
        <div className={`rounded-2xl border p-5 shadow-sm transition-colors relative overflow-hidden
            ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}
        `}>
            <div className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80)` }}
            />
            <div className="flex justify-between items-start">
                <div className={`text-[11px] font-bold tracking-[0.12em] uppercase mt-1 ${isDark ? "text-slate-400" : "text-slate-500/70"}`}>
                    {title}
                </div>
                {Icon && (
                    <div className="p-2 rounded-xl"
                        style={{ backgroundColor: isDark ? `${accent}25` : `${accent}15`, color: accent }}
                    >
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                )}
            </div>
            <div className={`mt-2 text-3xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {value}
            </div>
            <div className={`mt-1.5 flex items-center gap-2 text-sm ${isDark ? "text-slate-400" : "text-slate-500/70"}`}>
                <span>{subtitle}</span>
                {trend !== undefined && <TrendBadge value={trend} />}
            </div>
        </div>
    );
}

function CustomTooltip({ active, payload, label, isDark }) {
    if (!active || !payload?.length) return null;
    return (
        <div className={`rounded-xl border px-3 py-2 shadow-lg text-sm ${isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}>
            <p className="font-semibold mb-0.5">{label}</p>
            <p style={{ color: B.green }}>
                ${Number(payload[0].value).toLocaleString("es-AR")}
            </p>
        </div>
    );
}

export default function DashboardIndex() {
    const { props } = usePage();
    const { isDark } = useTheme();

    const stats = props?.stats || null;
    const recentTransactions = props?.recentTransactions || [];
    const chartData = props?.chartData || [];

    const [period, setPeriod] = useState(props.period || "month");

    const fmt = (n) => Number(n || 0).toLocaleString("es-AR");
    const fmtC = (n) => `$${fmt(n)}`;

    const loadDataForPeriod = (newPeriod) => {
        router.visit(route("dashboard"), {
            data: { period: newPeriod },
            preserveState: true,
            preserveScroll: true,
            only: ["stats", "recentTransactions", "chartData", "period"],
        });
    };

    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        loadDataForPeriod(newPeriod);
    };

    const onRefresh = () => loadDataForPeriod(period);

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
                trend: stats?.trends?.sales,
            },
            {
                title: "Ingresos",
                value: fmtC(stats?.current?.revenue),
                subtitle: "Total del período",
                icon: DollarSign,
                accent: B.green,
                trend: stats?.trends?.revenue,
            },
            {
                title: "Nuevos clientes",
                value: fmt(stats?.current?.new_customers),
                subtitle: "Altas del período",
                icon: UserPlus,
                accent: B.teal,
                trend: stats?.trends?.customers,
            },
            {
                title: "Ticket promedio",
                value: fmtC(stats?.current?.avg_ticket),
                subtitle: "Por operación",
                icon: TrendingUp,
                accent: B.blueSoft,
                trend: stats?.trends?.avg_ticket,
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
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                            Panel de Control
                        </h1>
                        <p className="text-sm text-slate-500">Análisis en tiempo real · ArtDent</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <div className={`inline-flex rounded-xl p-1 border transition-colors
                            ${isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}
                        `}>
                            {PERIODS.map((p) => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => handlePeriodChange(p.value)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
                                        ${period === p.value
                                            ? "text-white shadow-sm"
                                            : isDark
                                                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        }
                                    `}
                                    style={period === p.value
                                        ? { background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }
                                        : undefined}
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

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((c) => (
                        <StatCard key={c.title} {...c} isDark={isDark} />
                    ))}
                </div>

                {/* Chart + Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Line Chart */}
                    <div className={`rounded-2xl border p-5 shadow-sm lg:col-span-2 transition-colors
                        ${isDark ? "bg-slate-900 border-slate-700/60" : "bg-white border-slate-100"}
                    `}>
                        <div className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                            Ingresos generados
                        </div>
                        <div className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            Evolución por período
                        </div>

                        <div className="mt-4 h-[340px]">
                            {chartData.length === 0 ? (
                                <div className={`h-full flex items-center justify-center rounded-xl border border-dashed
                                    ${isDark ? "border-slate-700 text-slate-500 bg-slate-800/50" : "border-slate-200 text-slate-400 bg-slate-50"}
                                `}>
                                    Sin datos para este período
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke={isDark ? "#1e293b" : "#f1f5f9"}
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval="preserveStartEnd"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => `$${Number(v).toLocaleString("es-AR")}`}
                                            width={70}
                                        />
                                        <Tooltip content={<CustomTooltip isDark={isDark} />} />
                                        <Line
                                            type="monotone"
                                            dataKey="revenue"
                                            stroke={B.green}
                                            strokeWidth={2.5}
                                            dot={false}
                                            activeDot={{ r: 5, fill: B.green, strokeWidth: 0 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </div>

                    {/* Recent Transactions */}
                    <div className={`rounded-2xl border p-5 shadow-sm transition-colors flex flex-col h-[450px]
                        ${isDark ? "bg-slate-900 border-slate-700/60" : "bg-white border-slate-100"}
                    `}>
                        <div className="flex justify-between items-center shrink-0 mb-4">
                            <div>
                                <div className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                                    Transacciones
                                </div>
                                <div className={`mt-1 text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    Recientes
                                </div>
                            </div>
                            <div
                                className="px-2 py-1 text-xs font-bold rounded-md"
                                style={{
                                    color: isDark ? B.mint : B.blue,
                                    backgroundColor: isDark ? `${B.blue}30` : `${B.blue}20`,
                                }}
                            >
                                {recentTransactions.length}
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-2 styled-scrollbar">
                            {recentTransactions.length === 0 ? (
                                <div className={`flex h-full items-center justify-center text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                    Sin transacciones
                                </div>
                            ) : (
                                recentTransactions.map((tx, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between p-3 rounded-xl border transition-colors
                                            ${isDark
                                                ? "border-slate-700/60 bg-slate-800/80 hover:bg-slate-800 hover:border-slate-600"
                                                : "border-slate-100 bg-slate-50 hover:bg-slate-100"
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div
                                                className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm shrink-0"
                                                style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.green})` }}
                                            >
                                                {tx.user?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                            <div className="min-w-0">
                                                <p className={`text-xs font-bold truncate ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                                                    {tx.txId}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">{tx.user}</p>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0 ml-2">
                                            <p className="text-sm font-bold" style={{ color: B.green }}>
                                                {fmtC(tx.cost)}
                                            </p>
                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                {tx.source === "ecommerce" ? (
                                                    <ShoppingCart size={10} className="text-slate-400" />
                                                ) : (
                                                    <Store size={10} className="text-slate-400" />
                                                )}
                                                <p className="text-[10px] text-slate-400">
                                                    {tx.date.split(" ")[0]}
                                                </p>
                                            </div>
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

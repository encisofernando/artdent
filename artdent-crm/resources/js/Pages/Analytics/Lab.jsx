import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, router } from "@inertiajs/react";
import { useTheme } from "@/Contexts/ThemeContext";
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Wallet,
    Users,
    DollarSign,
    Loader,
    Download,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { useState, useRef } from "react";
import { shiftReferenceDate, isCurrentPeriod, formatPeriodRangeLabel } from "@/lib/periodNav";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ARS = (v) =>
    new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(v ?? 0);

const N = (v, d = 0) =>
    new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
    }).format(v ?? 0);

const statusLabel = {
    pending: "Pendiente",
    in_progress: "En progreso",
    ready: "Listo",
    delivered: "Entregado",
    cancelled: "Cancelado",
    sin_estado: "Sin estado",
};

const statusColor = {
    pending: "#F59E0B",
    in_progress: "#3B82F6",
    ready: "#8B5CF6",
    delivered: "#10B981",
    cancelled: "#EF4444",
    sin_estado: "#6B7280",
};

const PERIODS = [
    { key: "today", label: "Hoy" },
    { key: "week", label: "Semana" },
    { key: "month", label: "Mes" },
    { key: "year", label: "Año" },
];

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({ title, value, trend, icon: Icon, color, isDark, suffix = "" }) {
    const positive = trend >= 0;
    const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100";
    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const text = isDark ? "text-white" : "text-slate-900";

    return (
        <div className={`rounded-2xl border p-5 shadow-sm relative overflow-hidden ${card}`}>
            <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, ${color}, ${color}66)` }}
            />
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${muted}`}>{title}</p>
                    <p className={`text-2xl font-extrabold ${text}`}>
                        {value}
                        {suffix && <span className="text-sm font-medium ml-1 opacity-60">{suffix}</span>}
                    </p>
                </div>
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `${color}18`, color }}
                >
                    <Icon size={20} />
                </div>
            </div>
            {trend !== undefined && (
                <div className={`flex items-center gap-1 mt-3 text-xs font-semibold ${positive ? "text-emerald-500" : "text-red-400"}`}>
                    {positive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {Math.abs(trend)}% vs período anterior
                </div>
            )}
        </div>
    );
}

// ─── Bar Chart (SVG) ─────────────────────────────────────────────────────────
function BarChartRevenue({ data, isDark }) {
    const containerRef = useRef(null);
    const [hover, setHover] = useState(null); // { index, x, y }

    if (!data || data.length === 0) {
        return (
            <div className="h-52 flex items-center justify-center text-slate-500 text-sm">
                Sin datos para el período
            </div>
        );
    }
    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
    const chartH = 160;
    const barW = Math.max(8, Math.min(32, Math.floor(700 / data.length) - 4));
    const gap = Math.max(2, Math.floor(700 / data.length) - barW);
    const totalW = data.length * (barW + gap);
    const muted = isDark ? "#64748b" : "#94a3b8";
    const gridColor = isDark ? "#1e293b" : "#f1f5f9";

    const showTooltip = (e, i) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        setHover({ index: i, x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const hovered = hover !== null ? data[hover.index] : null;

    return (
        <div className="relative overflow-x-auto" ref={containerRef}>
            {hovered && (
                <div
                    className={`pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg px-3 py-2 text-xs shadow-lg whitespace-nowrap ${
                        isDark ? "bg-slate-800 text-slate-100 border border-slate-700" : "bg-white text-slate-800 border border-slate-200"
                    }`}
                    style={{ left: hover.x, top: hover.y - 10 }}
                >
                    <p className="font-bold">{hovered.label}</p>
                    <p className={isDark ? "text-emerald-400" : "text-emerald-600"}>{ARS(hovered.revenue)}</p>
                    <p style={{ color: muted }}>
                        {N(hovered.jobs)} {hovered.jobs === 1 ? "trabajo" : "trabajos"}
                    </p>
                </div>
            )}
            <svg
                viewBox={`0 0 ${Math.max(totalW, 300)} ${chartH + 28}`}
                className="w-full"
                style={{ minWidth: Math.max(totalW, 300) }}
            >
                {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                    <line
                        key={t}
                        x1={0}
                        x2={Math.max(totalW, 300)}
                        y1={chartH - chartH * t}
                        y2={chartH - chartH * t}
                        stroke={gridColor}
                        strokeWidth={1}
                    />
                ))}
                {data.map((d, i) => {
                    const h = Math.max(2, (d.revenue / maxRevenue) * chartH);
                    const x = i * (barW + gap);
                    const y = chartH - h;
                    const isHovered = hover?.index === i;
                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={0}
                                width={barW + gap}
                                height={chartH}
                                fill="transparent"
                                onMouseEnter={(e) => showTooltip(e, i)}
                                onMouseMove={(e) => showTooltip(e, i)}
                                onMouseLeave={() => setHover(null)}
                                style={{ cursor: "pointer" }}
                            />
                            <rect
                                x={x}
                                y={y}
                                width={barW}
                                height={h}
                                rx={3}
                                fill="url(#barGrad)"
                                opacity={isHovered ? 1 : 0.9}
                                stroke={isHovered ? "#10b981" : "none"}
                                strokeWidth={isHovered ? 1.5 : 0}
                                pointerEvents="none"
                            />
                            {data.length <= 14 && (
                                <text
                                    x={x + barW / 2}
                                    y={chartH + 16}
                                    textAnchor="middle"
                                    fontSize={9}
                                    fill={isHovered ? "#10b981" : muted}
                                    fontWeight={isHovered ? "bold" : "normal"}
                                    pointerEvents="none"
                                >
                                    {d.label}
                                </text>
                            )}
                        </g>
                    );
                })}
                <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#065f46" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

// ─── Status Distribution ──────────────────────────────────────────────────────
function StatusDistribution({ data, isDark }) {
    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const text = isDark ? "text-white" : "text-slate-900";
    const total = data.reduce((s, d) => s + d.count, 0);
    if (total === 0) {
        return <p className={`text-sm ${muted}`}>Sin datos</p>;
    }
    const sorted = [...data].sort((a, b) => b.count - a.count);
    return (
        <div className="space-y-3">
            {sorted.map((d) => {
                const pct = total > 0 ? (d.count / total) * 100 : 0;
                const color = statusColor[d.status] ?? "#6B7280";
                return (
                    <div key={d.status}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-medium ${text}`}>
                                {statusLabel[d.status] ?? d.status}
                            </span>
                            <span className={`text-xs ${muted}`}>
                                {d.count} ({pct.toFixed(1)}%)
                            </span>
                        </div>
                        <div className={`h-2 rounded-full ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                            <div
                                className="h-2 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%`, background: color }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Ranked Table ─────────────────────────────────────────────────────────────
function RankedTable({ rows, columns, isDark }) {
    const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100";
    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const text = isDark ? "text-slate-200" : "text-slate-700";
    const rowBorder = isDark ? "border-slate-800" : "border-slate-100";

    if (!rows || rows.length === 0) {
        return <p className={`text-sm py-4 text-center ${muted}`}>Sin datos para el período</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr>
                        <th className={`text-left pb-2 pr-3 text-xs font-bold uppercase tracking-wider ${muted}`}>
                            #
                        </th>
                        {columns.map((c) => (
                            <th
                                key={c.key}
                                className={`text-left pb-2 pr-3 text-xs font-bold uppercase tracking-wider ${muted} ${c.right ? "text-right" : ""}`}
                            >
                                {c.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i} className={`border-t ${rowBorder}`}>
                            <td className={`py-2 pr-3 font-bold text-slate-500 text-xs`}>{i + 1}</td>
                            {columns.map((c) => (
                                <td
                                    key={c.key}
                                    className={`py-2 pr-3 ${text} ${c.right ? "text-right tabular-nums" : ""} ${c.bold ? "font-semibold" : ""}`}
                                >
                                    {c.format ? c.format(row[c.key]) : row[c.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ─── Panel Card ───────────────────────────────────────────────────────────────
function Panel({ title, children, isDark, action }) {
    const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100";
    const text = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-slate-400" : "text-slate-500";
    return (
        <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-sm font-extrabold uppercase tracking-wider ${muted}`}>{title}</h2>
                {action}
            </div>
            {children}
        </div>
    );
}

// ─── Export Button ────────────────────────────────────────────────────────────
function ExportBtn({ href, label, color = "#10b981" }) {
    return (
        <a
            href={href}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-90 w-fit"
            style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
        >
            <Download size={13} />
            {label}
        </a>
    );
}

// ─── Tab Toggle ───────────────────────────────────────────────────────────────
function TabToggle({ tabs, active, onChange, isDark }) {
    return (
        <div className={`inline-flex rounded-xl p-0.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
            {tabs.map((t) => (
                <button
                    key={t.key}
                    onClick={() => onChange(t.key)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                        active === t.key
                            ? "bg-emerald-500 text-white shadow"
                            : isDark
                            ? "text-slate-400 hover:text-slate-200"
                            : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                    {t.label}
                </button>
            ))}
        </div>
    );
}

// ─── Job Type Chart (horizontal bars) ────────────────────────────────────────
function JobTypeChart({ data, isDark }) {
    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const text = isDark ? "text-slate-200" : "text-slate-700";
    if (!data || data.length === 0) {
        return <p className={`text-sm py-4 text-center ${muted}`}>Sin datos para el período</p>;
    }
    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899", "#84cc16"];
    return (
        <div className="space-y-2.5">
            {data.map((d, i) => {
                const pct = (d.count / maxCount) * 100;
                const color = colors[i % colors.length];
                return (
                    <div key={i}>
                        <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-medium truncate max-w-[60%] ${text}`}>{d.name}</span>
                            <span className={`text-xs tabular-nums ${muted}`}>{d.count} trabajos</span>
                        </div>
                        <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                            <div
                                className="h-2.5 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%`, background: color }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Weekday Activity Chart ────────────────────────────────────────────────────
function WeekdayChart({ data, isDark }) {
    const labelColor = isDark ? "#94a3b8" : "#64748b";
    if (!data || data.length === 0) {
        return <p className={`text-sm py-4 text-center ${isDark ? "text-slate-400" : "text-slate-500"}`}>Sin datos</p>;
    }
    const maxCount = Math.max(...data.map((d) => d.count), 1);
    const chartH = 100;
    const barW = 72;
    const gap = 28;
    const totalW = data.length * (barW + gap);

    return (
        <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${totalW} ${chartH + 30}`} className="w-full" style={{ maxWidth: totalW }}>
                {data.map((d, i) => {
                    const h = Math.max(d.count > 0 ? 6 : 2, (d.count / maxCount) * chartH);
                    const x = i * (barW + gap);
                    const y = chartH - h;
                    const isWeekend = d.day === "Dom" || d.day === "Sáb";
                    return (
                        <g key={i}>
                            <rect
                                x={x}
                                y={y}
                                width={barW}
                                height={h}
                                rx={5}
                                fill={d.count === 0 ? (isDark ? "#1e293b" : "#f1f5f9") : "#10b981"}
                                opacity={d.count === 0 ? 0.4 : isWeekend ? 0.5 : 0.9}
                            />
                            {d.count > 0 && (
                                <text x={x + barW / 2} y={y - 6} textAnchor="middle" fontSize={9} fill="#10b981" fontWeight="bold">
                                    {d.count}
                                </text>
                            )}
                            <text x={x + barW / 2} y={chartH + 16} textAnchor="middle" fontSize={10} fill={labelColor} fontWeight={isWeekend ? "normal" : "600"}>
                                {d.day}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

export default function AnalyticsLab({
    auth,
    kpis,
    statusDistribution,
    topDentistsByRevenue,
    topDentistsByJobs,
    topCollaborators,
    topTariffs,
    topRemakeReasons,
    jobsByType,
    jobsByWeekday,
    timeSeriesRevenue,
    filters,
}) {
    const { isDark } = useTheme();
    const text = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const [dentistTab, setDentistTab] = useState("revenue");
    const [period, setPeriod] = useState(filters?.period ?? "month");

    const today = new Date().toISOString().slice(0, 10);
    const [referenceDate, setReferenceDate] = useState(filters?.reference_date ?? today);

    const handlePeriod = (p) => {
        setPeriod(p);
        setReferenceDate(today);
        router.get(route("analytics.lab"), { period: p }, { preserveScroll: true });
    };

    const navigatePeriod = (direction) => {
        const next = shiftReferenceDate(period, referenceDate, direction);
        setReferenceDate(next);
        router.get(route("analytics.lab"), { period, reference_date: next }, { preserveScroll: true });
    };

    const atCurrentPeriod = isCurrentPeriod(period, referenceDate);

    const c = kpis?.current ?? {};
    const t = kpis?.trends ?? {};

    const jobsUrl = route("export.jobs") + `?period=${period}`;
    const dentistsUrl = route("export.dentists") + `?period=${period}`;
    const tariffssUrl = route("export.tariffs") + `?period=${period}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Analítica · Laboratorio" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
                            Analítica · Laboratorio
                        </h1>
                        <p className={`text-sm mt-0.5 ${muted}`}>
                            Métricas, rankings y reportes del laboratorio dental
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Period selector */}
                        <div className={`inline-flex rounded-xl p-0.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                            {PERIODS.map((p) => (
                                <button
                                    key={p.key}
                                    onClick={() => handlePeriod(p.key)}
                                    className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                                        period === p.key
                                            ? "bg-emerald-500 text-white shadow"
                                            : isDark
                                            ? "text-slate-400 hover:text-slate-200"
                                            : "text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        {/* Prev/next navigation */}
                        <div className={`inline-flex items-center gap-1 rounded-xl p-0.5 ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                            <button
                                onClick={() => navigatePeriod(-1)}
                                className={`p-1.5 rounded-lg transition-all ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <ChevronLeft size={15} />
                            </button>
                            <span className={`text-xs font-semibold px-1 whitespace-nowrap ${text}`}>
                                {formatPeriodRangeLabel(period, filters?.period_start, filters?.period_end)}
                            </span>
                            <button
                                onClick={() => navigatePeriod(1)}
                                disabled={atCurrentPeriod}
                                className={`p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    <KpiCard
                        title="Trabajos"
                        value={N(c.total_jobs)}
                        trend={t.total_jobs}
                        icon={BarChart3}
                        color="#10b981"
                        isDark={isDark}
                    />
                    <KpiCard
                        title="Pendientes"
                        value={N(c.pending_jobs)}
                        icon={Loader}
                        color="#f59e0b"
                        isDark={isDark}
                    />
                    <KpiCard
                        title="Ingresos"
                        value={ARS(c.cash_income)}
                        trend={t.cash_income}
                        icon={DollarSign}
                        color="#3b82f6"
                        isDark={isDark}
                    />
                    <KpiCard
                        title="Egresos"
                        value={ARS(c.expenses)}
                        trend={t.expenses ? -t.expenses : undefined}
                        icon={TrendingDown}
                        color="#ef4444"
                        isDark={isDark}
                    />
                    <KpiCard
                        title="Neto"
                        value={ARS(c.net)}
                        trend={t.net}
                        icon={Wallet}
                        color="#8b5cf6"
                        isDark={isDark}
                    />
                    <KpiCard
                        title="Ticket promedio"
                        value={ARS(c.avg_job_value)}
                        trend={t.avg_job_value}
                        icon={TrendingUp}
                        color="#06b6d4"
                        isDark={isDark}
                    />
                </div>

                {/* Revenue + Status Distribution + Top Colaboradores */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="lg:col-span-2">
                        <Panel title="Facturación por período" isDark={isDark}>
                            <p className={`text-xs mb-4 -mt-2 ${muted}`}>
                                Valor de los trabajos recibidos por día (no es efectivo cobrado)
                            </p>
                            <BarChartRevenue data={timeSeriesRevenue} isDark={isDark} />
                        </Panel>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Panel title="Trabajos por estado" isDark={isDark}>
                            <StatusDistribution data={statusDistribution ?? []} isDark={isDark} />
                        </Panel>
                        <Panel title="Top Colaboradores" isDark={isDark}>
                            {!topCollaborators || topCollaborators.length === 0 ? (
                                <p className={`text-sm py-2 text-center ${muted}`}>Sin datos para el período</p>
                            ) : (
                                <div className="space-y-2.5">
                                    {topCollaborators.map((c, i) => {
                                        const maxJobs = topCollaborators[0]?.job_count ?? 1;
                                        const pct = (c.job_count / maxJobs) * 100;
                                        const colors = ["#10b981","#3b82f6","#8b5cf6","#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16"];
                                        const color = colors[i % colors.length];
                                        return (
                                            <div key={i}>
                                                <div className="flex justify-between items-center mb-1">
                                                    <div>
                                                        <span className={`text-xs font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>{c.name}</span>
                                                        {c.role && <span className={`ml-1.5 text-xs ${muted}`}>· {c.role}</span>}
                                                    </div>
                                                    <span className={`text-xs tabular-nums font-bold ${isDark ? "text-slate-300" : "text-slate-600"}`}>{c.job_count}</span>
                                                </div>
                                                <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-slate-800" : "bg-slate-100"}`}>
                                                    <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Panel>
                    </div>
                </div>

                {/* Top Dentistas */}
                <Panel
                    title="Top Odontólogos"
                    isDark={isDark}
                    action={
                        <div className="flex items-center gap-3">
                            <TabToggle
                                tabs={[
                                    { key: "revenue", label: "Por ingresos" },
                                    { key: "jobs", label: "Por trabajos" },
                                ]}
                                active={dentistTab}
                                onChange={setDentistTab}
                                isDark={isDark}
                            />
                            <ExportBtn href={dentistsUrl} label="CSV" color="#3b82f6" />
                        </div>
                    }
                >
                    <RankedTable
                        rows={dentistTab === "revenue" ? topDentistsByRevenue : topDentistsByJobs}
                        isDark={isDark}
                        columns={[
                            { key: "name", label: "Odontólogo", bold: true },
                            { key: "city", label: "Ciudad" },
                            {
                                key: "job_count",
                                label: "Trabajos",
                                right: true,
                                format: (v) => N(v),
                            },
                            {
                                key: "revenue",
                                label: "Ingresos",
                                right: true,
                                bold: true,
                                format: (v) => ARS(v),
                            },
                        ]}
                    />
                </Panel>

                {/* Tipo de Trabajo + Actividad por Día */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Panel title="Trabajos por Tipo" isDark={isDark}>
                        <JobTypeChart data={jobsByType} isDark={isDark} />
                    </Panel>
                    <Panel title="Actividad por Día de Semana" isDark={isDark}>
                        <p className={`text-xs mb-4 ${muted}`}>
                            Distribución de trabajos recibidos según el día — fin de semana con menor intensidad
                        </p>
                        <WeekdayChart data={jobsByWeekday} isDark={isDark} />
                    </Panel>
                </div>

                {/* Top Aranceles + Remakes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Panel
                        title="Top Aranceles utilizados"
                        isDark={isDark}
                        action={<ExportBtn href={tariffssUrl} label="CSV" color="#8b5cf6" />}
                    >
                        <RankedTable
                            rows={topTariffs}
                            isDark={isDark}
                            columns={[
                                { key: "name", label: "Arancel", bold: true },
                                { key: "category", label: "Categoría" },
                                {
                                    key: "qty_used",
                                    label: "Cant.",
                                    right: true,
                                    format: (v) => N(v, 1),
                                },
                                {
                                    key: "revenue",
                                    label: "Ingresos",
                                    right: true,
                                    bold: true,
                                    format: (v) => ARS(v),
                                },
                            ]}
                        />
                    </Panel>

                    <Panel title="Razones de Remakes" isDark={isDark}>
                        <RankedTable
                            rows={topRemakeReasons}
                            isDark={isDark}
                            columns={[
                                { key: "reason", label: "Razón", bold: true },
                                {
                                    key: "count",
                                    label: "Cantidad",
                                    right: true,
                                    bold: true,
                                    format: (v) => N(v),
                                },
                            ]}
                        />
                    </Panel>
                </div>

                {/* Exports */}
                <Panel title="Exportaciones CSV" isDark={isDark}>
                    <p className={`text-xs mb-4 ${muted}`}>
                        Exportá los datos del período seleccionado en formato CSV compatible con Excel.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <ExportBtn href={jobsUrl} label="Trabajos CSV" color="#10b981" />
                        <ExportBtn href={dentistsUrl} label="Odontólogos CSV" color="#3b82f6" />
                        <ExportBtn href={tariffssUrl} label="Aranceles CSV" color="#8b5cf6" />
                    </div>
                </Panel>
            </div>
        </AuthenticatedLayout>
    );
}

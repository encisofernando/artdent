import { Head, router } from "@inertiajs/react";
import { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Banknote, DollarSign, UserPlus, TrendingUp, TrendingDown,
    ShoppingCart, Store, CreditCard, AlertTriangle, ReceiptText, Package,
    ChevronLeft, ChevronRight,
} from "lucide-react";
import { useTheme } from "@/Contexts/ThemeContext";
import {
    ResponsiveContainer, ComposedChart, Bar, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { shiftReferenceDate, isCurrentPeriod, formatPeriodRangeLabel } from "@/lib/periodNav";

const B = {
    blue: "#397B9C", green: "#5AAD9C", mint: "#ACD6CE",
    teal: "#49949C", blueSoft: "#7CA5C3", red: "#E63946", orange: "#F4A261",
};

const PERIODS = [
    { value: "today", label: "Hoy" },
    { value: "week", label: "Semana" },
    { value: "month", label: "Mes" },
    { value: "year", label: "Año" },
];

const fmt    = (v) => Number(v || 0).toLocaleString("es-AR", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const fmtDec = (v) => Number(v || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function TrendBadge({ value }) {
    if (value === null || value === undefined) { return null; }
    const positive = value >= 0;
    const Icon = positive ? TrendingUp : TrendingDown;
    return (
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
            positive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        }`}>
            <Icon size={10} />
            {positive ? "+" : ""}{value}%
        </span>
    );
}

function StatCard({ title, value, subtitle, icon: Icon, accent = B.green, trend, isDark, noPrefix = false }) {
    return (
        <div className={`rounded-2xl border p-5 shadow-sm transition-colors relative overflow-hidden
            ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
            <div className="absolute top-0 left-0 right-0 h-1"
                style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80)` }} />
            <div className="flex justify-between items-start">
                <div className={`text-[11px] font-bold tracking-[0.12em] uppercase mt-1 ${isDark ? "text-slate-400" : "text-slate-500/70"}`}>
                    {title}
                </div>
                {Icon && (
                    <div className="p-2 rounded-xl"
                        style={{ backgroundColor: isDark ? `${accent}25` : `${accent}15`, color: accent }}>
                        <Icon size={20} strokeWidth={2.5} />
                    </div>
                )}
            </div>
            <div className={`mt-2 text-xl sm:text-3xl font-extrabold tracking-tight leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                {noPrefix ? fmt(value) : `$ ${fmtDec(value)}`}
            </div>
            <div className="mt-1.5 flex items-center gap-2">
                {trend !== undefined && <TrendBadge value={trend} />}
                {subtitle && (
                    <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>{subtitle}</span>
                )}
            </div>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label, isDark }) => {
    if (!active || !payload?.length) { return null; }
    return (
        <div className={`rounded-xl border px-3 py-2 shadow-lg text-xs ${isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-white border-slate-200 text-slate-700"}`}>
            <p className="font-bold mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: $ {fmtDec(p.value)}
                </p>
            ))}
        </div>
    );
};

function PlanUsageCard({ planUsage, isDark, card, muted, text }) {
    if (!planUsage) { return null; }

    return (
        <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xs font-bold uppercase tracking-widest ${muted}`}>Uso del plan</h2>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"}`}>
                    {planUsage.plan}
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {planUsage.items.map((item, i) => {
                    const unlimited = item.max === null || item.max === undefined;
                    const pct = unlimited ? 0 : Math.min(100, Math.round((item.current / Math.max(item.max, 1)) * 100));
                    const color = pct >= 90 ? B.red : pct >= 70 ? B.orange : B.teal;
                    return (
                        <div key={i}>
                            <div className="flex justify-between items-center mb-1">
                                <span className={`text-[12px] font-semibold ${text}`}>{item.label}</span>
                                <span className={`text-[11px] ${muted}`}>
                                    {fmt(item.current)} {unlimited ? "" : `/ ${fmt(item.max)}`}
                                </span>
                            </div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "#1e293b" : "#f1f5f9" }}>
                                {unlimited ? (
                                    <div className="h-full rounded-full w-full opacity-30" style={{ background: B.teal }} />
                                ) : (
                                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                                )}
                            </div>
                            {unlimited && <p className={`text-[10px] mt-1 ${muted}`}>Ilimitado</p>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function DashboardIndex({ auth, stats, chartData = [], recentTransactions = [], topProducts = [], topCustomers = [], lowStock = [], planUsage = null, period, referenceDate, periodStart, periodEnd }) {
    const { isDark } = useTheme();
    const [loadingPeriod, setLoadingPeriod] = useState(false);

    const c = stats.current;
    const t = stats.trends;

    const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100";
    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const text  = isDark ? "text-white" : "text-slate-900";

    const changePeriod = (p) => {
        setLoadingPeriod(true);
        router.get(route("dashboard"), { period: p }, {
            preserveState: true,
            onFinish: () => setLoadingPeriod(false),
        });
    };

    const navigatePeriod = (direction) => {
        setLoadingPeriod(true);
        const nextReferenceDate = shiftReferenceDate(period, referenceDate, direction);
        router.get(route("dashboard"), { period, reference_date: nextReferenceDate }, {
            preserveState: true,
            onFinish: () => setLoadingPeriod(false),
        });
    };

    const atCurrentPeriod = isCurrentPeriod(period, referenceDate);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Dashboard" />

            <div className="space-y-6">
                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>Dashboard</h1>
                        <p className={`text-sm mt-0.5 ${muted}`}>Métricas del negocio en tiempo real</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 p-1 rounded-xl border"
                            style={{ borderColor: isDark ? "#334155" : "#e2e8f0", background: isDark ? "#0f172a" : "#f8fafc" }}>
                            {PERIODS.map((p) => (
                                <button key={p.value} onClick={() => changePeriod(p.value)}
                                    disabled={loadingPeriod}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                        period === p.value
                                            ? "text-white shadow-sm"
                                            : (isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700")
                                    }`}
                                    style={period === p.value ? { background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` } : {}}>
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-1 p-1 rounded-xl border"
                            style={{ borderColor: isDark ? "#334155" : "#e2e8f0", background: isDark ? "#0f172a" : "#f8fafc" }}>
                            <button onClick={() => navigatePeriod(-1)} disabled={loadingPeriod}
                                className={`p-1.5 rounded-lg transition-all ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                                <ChevronLeft size={15} />
                            </button>
                            <span className={`text-xs font-semibold px-1 whitespace-nowrap ${text}`}>
                                {formatPeriodRangeLabel(period, periodStart, periodEnd)}
                            </span>
                            <button onClick={() => navigatePeriod(1)} disabled={loadingPeriod || atCurrentPeriod}
                                className={`p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-700"}`}>
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Uso del plan ── */}
                <PlanUsageCard planUsage={planUsage} isDark={isDark} card={card} muted={muted} text={text} />

                {/* ── Stat cards row 1 ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Ingresos" value={c.revenue} trend={t.revenue} icon={DollarSign} accent={B.green} isDark={isDark} />
                    <StatCard title="Ventas" value={c.total_sales} noPrefix={true} trend={t.sales} icon={ShoppingCart} accent={B.blue} isDark={isDark} />
                    <StatCard title="Gastos" value={c.expenses} trend={t.expenses} icon={ReceiptText} accent={B.red} isDark={isDark} />
                    <StatCard title="Flujo de Caja" value={c.cashflow} trend={t.cashflow} icon={Banknote}
                        accent={c.cashflow >= 0 ? B.teal : B.red} isDark={isDark} />
                </div>

                {/* ── Stat cards row 2 ── */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Cobros Pendientes" value={c.pending_collections} icon={CreditCard}
                        accent={B.orange} isDark={isDark} subtitle="Ctas. corrientes" />
                    <StatCard title="Ticket Promedio" value={c.avg_ticket} trend={t.avg_ticket} icon={Store}
                        accent={B.blueSoft} isDark={isDark} />
                    <StatCard title="Nuevos Clientes" value={c.new_customers} noPrefix={true} trend={t.customers}
                        icon={UserPlus} accent={B.mint} isDark={isDark} />
                </div>

                {/* ── Chart + Low Stock ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className={`lg:col-span-2 rounded-2xl border p-5 shadow-sm ${card}`}>
                        <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 ${muted}`}>
                            Ingresos vs Gastos
                        </h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#1e293b" : "#f1f5f9"} />
                                <XAxis dataKey="label" tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }} axisLine={false} tickLine={false}
                                    tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="revenue" name="Ingresos" fill={B.green} radius={[4, 4, 0, 0]} maxBarSize={32} />
                                <Bar dataKey="expenses" name="Gastos" fill={B.red} radius={[4, 4, 0, 0]} maxBarSize={32} opacity={0.75} />
                                <Line type="monotone" dataKey="revenue" stroke={B.teal} strokeWidth={2} dot={false} legendType="none" name="Tendencia" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Low stock */}
                    <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                        <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${muted}`}>
                            <AlertTriangle size={13} style={{ color: B.orange }} />
                            Stock Bajo
                        </h2>
                        {lowStock.length === 0 ? (
                            <p className={`text-xs ${muted} mt-6 text-center`}>Sin alertas de stock</p>
                        ) : (
                            <div className="space-y-3">
                                {lowStock.map((item, i) => (
                                    <div key={i} className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                                        <div>
                                            <p className={`text-[12px] font-semibold truncate max-w-[140px] ${text}`}>{item.name}</p>
                                            <p className={`text-[11px] ${muted}`}>{item.sku || "—"}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[13px] font-bold" style={{ color: item.quantity === 0 ? B.red : B.orange }}>
                                                {item.quantity}
                                            </p>
                                            <p className={`text-[10px] ${muted}`}>mín {item.min}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Top Products + Top Customers ── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                        <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${muted}`}>
                            <Package size={13} style={{ color: B.teal }} />
                            Top Productos
                        </h2>
                        {topProducts.length === 0 ? (
                            <p className={`text-xs ${muted} text-center py-6`}>Sin datos para el período</p>
                        ) : (
                            <div className="space-y-3">
                                {topProducts.map((p, i) => {
                                    const maxRev = topProducts[0].revenue || 1;
                                    const pct = Math.round((p.revenue / maxRev) * 100);
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-[12px] font-semibold truncate max-w-[180px] ${text}`}>{p.name}</span>
                                                <div className="text-right flex-shrink-0 ml-2">
                                                    <span className={`text-[12px] font-bold ${text}`}>$ {fmt(p.revenue)}</span>
                                                    <span className={`text-[10px] ml-1 ${muted}`}>{fmt(p.qty)} u.</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "#1e293b" : "#f1f5f9" }}>
                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${B.teal}, ${B.green})` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
                        <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${muted}`}>
                            <UserPlus size={13} style={{ color: B.blue }} />
                            Top Clientes
                        </h2>
                        {topCustomers.length === 0 ? (
                            <p className={`text-xs ${muted} text-center py-6`}>Sin datos para el período</p>
                        ) : (
                            <div className="space-y-3">
                                {topCustomers.map((cl, i) => {
                                    const maxRev = topCustomers[0].revenue || 1;
                                    const pct = Math.round((cl.revenue / maxRev) * 100);
                                    return (
                                        <div key={i}>
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                                                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                                                        {i + 1}
                                                    </div>
                                                    <span className={`text-[12px] font-semibold truncate max-w-[150px] ${text}`}>{cl.name}</span>
                                                </div>
                                                <div className="text-right flex-shrink-0 ml-2">
                                                    <span className={`text-[12px] font-bold ${text}`}>$ {fmt(cl.revenue)}</span>
                                                    <span className={`text-[10px] ml-1 ${muted}`}>{cl.orders} vta{cl.orders !== 1 ? "s" : ""}</span>
                                                </div>
                                            </div>
                                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? "#1e293b" : "#f1f5f9" }}>
                                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Recent Transactions ── */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
                    <div className={`px-5 py-4 border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                        <h2 className={`text-xs font-bold uppercase tracking-widest ${muted}`}>Últimas Transacciones</h2>
                    </div>
                    {recentTransactions.length === 0 ? (
                        <p className={`text-sm ${muted} text-center py-10`}>Sin transacciones para el período seleccionado.</p>
                    ) : (<>
                        {/* Mobile list */}
                        <div className={`sm:hidden divide-y ${isDark ? "divide-slate-800" : "divide-slate-100"}`}>
                            {recentTransactions.map((tx, i) => (
                                <div key={i} className={`flex items-center justify-between px-4 py-3 gap-3 ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}>
                                    <div className="min-w-0">
                                        <p className={`font-mono text-[12px] font-bold truncate ${text}`}>{tx.txId}</p>
                                        <p className={`text-[11px] truncate mt-0.5 ${muted}`}>
                                            {tx.user}
                                            <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                                tx.source === "pos"
                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            }`}>
                                                {tx.source === "pos" ? "POS" : "Shop"}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`font-bold text-[13px] ${text}`}>$ {fmtDec(tx.cost)}</p>
                                        <p className={`text-[10px] ${muted}`}>{tx.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Desktop table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className={`text-[11px] uppercase font-bold tracking-wider ${isDark ? "bg-slate-800/80 text-slate-400" : "bg-slate-50 text-slate-500"}`}>
                                    <tr>
                                        <th className="px-5 py-3 text-left">Comprobante</th>
                                        <th className="px-5 py-3 text-left">Cliente</th>
                                        <th className="px-5 py-3 text-left">Canal</th>
                                        <th className="px-5 py-3 text-right">Total</th>
                                        <th className="px-5 py-3 text-right">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? "divide-slate-800" : "divide-slate-100"}`}>
                                    {recentTransactions.map((tx, i) => (
                                        <tr key={i} className={`transition-colors ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}>
                                            <td className={`px-5 py-3 font-mono text-[12px] font-semibold ${text}`}>{tx.txId}</td>
                                            <td className={`px-5 py-3 text-[12px] ${text}`}>{tx.user}</td>
                                            <td className="px-5 py-3">
                                                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                                    tx.source === "pos"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                }`}>
                                                    {tx.source === "pos" ? "POS" : "E-commerce"}
                                                </span>
                                            </td>
                                            <td className={`px-5 py-3 text-right font-bold text-[13px] ${text}`}>
                                                $ {fmtDec(tx.cost)}
                                            </td>
                                            <td className={`px-5 py-3 text-right text-[11px] ${muted}`}>{tx.date}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>)}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

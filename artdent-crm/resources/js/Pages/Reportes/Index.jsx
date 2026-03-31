import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useTheme } from "@/Contexts/ThemeContext";
import { Download, FileText, BarChart2, ShoppingCart, Users, TrendingUp, BookOpen, ArrowRight, BarChart3 } from "lucide-react";
import { useState } from "react";
import { DatePicker } from "@/Components/_appkit";

const today = new Date().toISOString().slice(0, 10);
const firstOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);

function ReportCard({ title, description, icon: Icon, color, href, children, isDark }) {
    const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100";
    const muted = isDark ? "text-slate-400" : "text-slate-500";
    const text  = isDark ? "text-white" : "text-slate-900";

    return (
        <div className={`rounded-2xl border p-5 shadow-sm relative overflow-hidden ${card}`}>
            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}80)` }} />
            <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}18`, color }}>
                    <Icon size={18} />
                </div>
                <div>
                    <h3 className={`text-sm font-bold ${text}`}>{title}</h3>
                    <p className={`text-xs mt-0.5 ${muted}`}>{description}</p>
                </div>
            </div>
            {children}
            {href && (
                <a href={href}
                    className="mt-3 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-90"
                    style={{ background: `linear-gradient(90deg, ${color}, ${color}cc)` }}>
                    <Download size={13} />
                    Descargar CSV
                </a>
            )}
        </div>
    );
}

function DateRangePicker({ from, to, onFromChange, onToChange, isDark }) {
    const inputCls = `text-sm px-3 py-1.5 rounded-xl border outline-none ${isDark ? "bg-slate-800 border-slate-700 text-slate-200" : "bg-slate-50 border-slate-200 text-slate-800"}`;
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <DatePicker value={from} onChange={onFromChange} className={inputCls} />
            <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>al</span>
            <DatePicker value={to} onChange={onToChange} className={inputCls} />
        </div>
    );
}

export default function ReportesIndex({ auth }) {
    const { isDark } = useTheme();
    const text  = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-slate-400" : "text-slate-500";

    const [ivaFrom, setIvaFrom]   = useState(firstOfMonth);
    const [ivaTo, setIvaTo]       = useState(today);
    const [resFrom, setResFrom]   = useState(firstOfMonth);
    const [resTo, setResTo]       = useState(today);
    const [salesFrom, setSalesFrom] = useState(firstOfMonth);
    const [salesTo, setSalesTo]   = useState(today);

    const ivaUrl    = route("export.iva-ventas")  + `?from=${ivaFrom}&to=${ivaTo}`;
    const resUrl    = route("export.income-statement") + `?from=${resFrom}&to=${resTo}`;
    const salesUrl  = route("export.sales")       + `?from=${salesFrom}&to=${salesTo}`;
    const custUrl   = route("export.customers");
    const quotesUrl = route("export.quotes");
    const expUrl    = route("export.expenses")    + `?from=${salesFrom}&to=${salesTo}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reportes" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>Reportes</h1>
                    <p className={`text-sm mt-0.5 ${muted}`}>Exportá tus datos en formato CSV compatible con Excel</p>
                </div>

                {/* Fiscal */}
                <div>
                    <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${muted}`}>Fiscal</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ReportCard title="Libro IVA Ventas" description="Obligatorio AFIP · Comprobantes emitidos con CAE, CUIT, importes"
                            icon={BookOpen} color="#397B9C" isDark={isDark}>
                            <div className="mb-2">
                                <DateRangePicker from={ivaFrom} to={ivaTo} onFromChange={setIvaFrom} onToChange={setIvaTo} isDark={isDark} />
                            </div>
                            <a href={ivaUrl}
                                className="mt-2 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-90 w-fit"
                                style={{ background: "linear-gradient(90deg, #397B9C, #49949C)" }}>
                                <Download size={13} />
                                Descargar CSV
                            </a>
                        </ReportCard>

                        <ReportCard title="Estado de Resultados" description="Ingresos vs Gastos por categoría · Ganancia o pérdida del período"
                            icon={TrendingUp} color="#5AAD9C" isDark={isDark}>
                            <div className="mb-2">
                                <DateRangePicker from={resFrom} to={resTo} onFromChange={setResFrom} onToChange={setResTo} isDark={isDark} />
                            </div>
                            <a href={resUrl}
                                className="mt-2 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-90 w-fit"
                                style={{ background: "linear-gradient(90deg, #5AAD9C, #49949C)" }}>
                                <Download size={13} />
                                Descargar CSV
                            </a>
                        </ReportCard>
                    </div>
                </div>

                {/* Operaciones */}
                <div>
                    <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${muted}`}>Operaciones</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ReportCard title="Ventas" description="Todas las ventas POS con estado, totales, pagos y saldo pendiente"
                            icon={ShoppingCart} color="#397B9C" isDark={isDark}>
                            <div className="mb-2">
                                <DateRangePicker from={salesFrom} to={salesTo} onFromChange={setSalesFrom} onToChange={setSalesTo} isDark={isDark} />
                            </div>
                            <a href={salesUrl}
                                className="mt-2 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-90 w-fit"
                                style={{ background: "linear-gradient(90deg, #397B9C, #49949C)" }}>
                                <Download size={13} />
                                Descargar CSV
                            </a>
                        </ReportCard>

                        <ReportCard title="Gastos" description="Gastos por categoría, proveedor y fecha"
                            icon={FileText} color="#F4A261" isDark={isDark}>
                            <div className="mb-2">
                                <DateRangePicker from={salesFrom} to={salesTo} onFromChange={setSalesFrom} onToChange={setSalesTo} isDark={isDark} />
                            </div>
                            <a href={expUrl}
                                className="mt-2 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-90 w-fit"
                                style={{ background: "linear-gradient(90deg, #F4A261, #f97316)" }}>
                                <Download size={13} />
                                Descargar CSV
                            </a>
                        </ReportCard>

                        <ReportCard title="Presupuestos" description="Todos los presupuestos emitidos con estado y totales"
                            icon={BarChart2} color="#49949C" href={quotesUrl} isDark={isDark} />

                        <ReportCard title="Clientes" description="Base de clientes con saldo de cuenta corriente"
                            icon={Users} color="#ACD6CE" href={custUrl} isDark={isDark} />
                    </div>
                </div>

                {/* Quick access */}
                <div className={`rounded-2xl border p-5 shadow-sm ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                    <h2 className={`text-xs font-bold uppercase tracking-widest mb-4 ${muted}`}>Acceso rápido — Dashboard PDF</h2>
                    <a href={route("reportes.export-pdf")}
                        className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl text-white"
                        style={{ background: "linear-gradient(90deg, #397B9C, #5AAD9C)" }}>
                        <FileText size={15} />
                        Exportar Dashboard como PDF
                        <ArrowRight size={13} />
                    </a>
                </div>

                {/* Laboratorio */}
                <div>
                    <h2 className={`text-xs font-bold uppercase tracking-widest mb-3 ${muted}`}>Laboratorio</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Analítica completa */}
                        <div className={`rounded-2xl border p-5 shadow-sm relative overflow-hidden ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100"}`}>
                            <div className="absolute top-0 left-0 right-0 h-1" style={{ background: "linear-gradient(90deg, #10b981, #10b98166)" }} />
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#10b98118", color: "#10b981" }}>
                                    <BarChart3 size={18} />
                                </div>
                                <div>
                                    <h3 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Analítica de Laboratorio</h3>
                                    <p className={`text-xs mt-0.5 ${muted}`}>KPIs, top odontólogos, aranceles, remakes y tendencias</p>
                                </div>
                            </div>
                            <a href={route("analytics.lab")}
                                className="mt-2 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-90 w-fit"
                                style={{ background: "linear-gradient(90deg, #10b981, #059669)" }}>
                                <ArrowRight size={13} />
                                Ver Analítica
                            </a>
                        </div>

                        <ReportCard title="Trabajos" description="Todos los trabajos con odontólogo, estado, totales y fechas"
                            icon={FileText} color="#10b981" isDark={isDark} href={route("export.jobs")}>
                        </ReportCard>

                        <ReportCard title="Odontólogos" description="Ranking de odontólogos por volumen y revenue generado"
                            icon={Users} color="#3b82f6" isDark={isDark} href={route("export.dentists")}>
                        </ReportCard>

                        <ReportCard title="Aranceles" description="Uso de aranceles: cantidad utilizada y revenue por trabajo"
                            icon={BarChart2} color="#8b5cf6" isDark={isDark} href={route("export.tariffs")}>
                        </ReportCard>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}


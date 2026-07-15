import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useTheme } from "@/Contexts/ThemeContext";
import { LifeBuoy, Send } from "lucide-react";

const STATUS_LABELS = { abierto: "Abierto", en_progreso: "En progreso", resuelto: "Resuelto", cerrado: "Cerrado" };
const STATUS_COLORS = {
    abierto: "#EF4444",
    en_progreso: "#F59E0B",
    resuelto: "#10B981",
    cerrado: "#6B7280",
};

const CATEGORY_LABELS = { pregunta: "Pregunta general", tecnico: "Problema técnico", facturacion: "Facturación", otro: "Otro" };
const PRIORITY_LABELS = { baja: "Baja", media: "Media", alta: "Alta" };

export default function Index({ tickets }) {
    const { isDark } = useTheme();
    const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100";
    const text = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-slate-400" : "text-slate-500";

    const cls = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-emerald-500/30 ${
        isDark ? "bg-slate-800 border-slate-700 focus:border-emerald-500 text-white" : "bg-white border-slate-200 focus:border-emerald-500"
    }`;

    const { data, setData, post, processing, errors, reset } = useForm({
        subject: "",
        category: "pregunta",
        priority: "media",
        body: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("support.store"), { preserveScroll: true, onSuccess: () => reset("subject", "body") });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Soporte" />

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-500/15 text-emerald-500">
                        <LifeBuoy size={20} />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>Soporte</h1>
                        <p className={`text-sm mt-0.5 ${muted}`}>Escribile al equipo de ArtCode y seguí tus tickets acá.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className={`rounded-2xl border p-5 shadow-sm lg:col-span-1 h-fit ${card}`}>
                        <h2 className={`text-sm font-extrabold uppercase tracking-wider mb-4 ${muted}`}>Nuevo ticket</h2>
                        <form onSubmit={submit} className="space-y-3">
                            <div>
                                <label className={`block text-xs font-bold mb-1 ${muted}`}>Asunto</label>
                                <input className={cls} value={data.subject} onChange={(e) => setData("subject", e.target.value)} placeholder="Resumí el problema en pocas palabras" />
                                {errors.subject && <p className="text-rose-500 text-xs mt-1">{errors.subject}</p>}
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-1 ${muted}`}>Categoría</label>
                                <select className={cls} value={data.category} onChange={(e) => setData("category", e.target.value)}>
                                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-1 ${muted}`}>Prioridad</label>
                                <select className={cls} value={data.priority} onChange={(e) => setData("priority", e.target.value)}>
                                    {Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={`block text-xs font-bold mb-1 ${muted}`}>Contanos qué pasó</label>
                                <textarea rows={5} className={cls} value={data.body} onChange={(e) => setData("body", e.target.value)} placeholder="Cuanto más detalle, más rápido te podemos ayudar." />
                                {errors.body && <p className="text-rose-500 text-xs mt-1">{errors.body}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={processing || !data.subject.trim() || !data.body.trim()}
                                className="w-full inline-flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50 bg-emerald-500"
                            >
                                <Send size={15} /> {processing ? "Enviando…" : "Crear ticket"}
                            </button>
                        </form>
                    </div>

                    <div className={`rounded-2xl border shadow-sm lg:col-span-2 overflow-hidden ${card}`}>
                        <h2 className={`text-sm font-extrabold uppercase tracking-wider px-5 pt-5 mb-2 ${muted}`}>Mis tickets</h2>
                        <div className="divide-y divide-slate-800/10">
                            {tickets.map((t) => (
                                <Link
                                    key={t.id}
                                    href={route("support.show", t.id)}
                                    className={`flex items-center justify-between gap-3 px-5 py-4 transition-colors ${isDark ? "hover:bg-slate-800/40" : "hover:bg-slate-50"}`}
                                >
                                    <div>
                                        <p className={`font-semibold text-sm ${text}`}>#{t.id} · {t.subject}</p>
                                        <p className={`text-xs mt-0.5 ${muted}`}>
                                            {CATEGORY_LABELS[t.category]} · última actividad {t.last_message_at ? new Date(t.last_message_at).toLocaleString("es-AR") : "—"}
                                        </p>
                                    </div>
                                    <span
                                        className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                                        style={{ background: `${STATUS_COLORS[t.status]}18`, color: STATUS_COLORS[t.status] }}
                                    >
                                        {STATUS_LABELS[t.status]}
                                    </span>
                                </Link>
                            ))}
                            {tickets.length === 0 && (
                                <p className={`px-5 py-10 text-center text-sm ${muted}`}>Todavía no abriste ningún ticket.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

import { useEffect, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useTheme } from "@/Contexts/ThemeContext";
import { ArrowLeft, Send } from "lucide-react";

const STATUS_LABELS = { abierto: "Abierto", en_progreso: "En progreso", resuelto: "Resuelto", cerrado: "Cerrado" };
const STATUS_COLORS = { abierto: "#EF4444", en_progreso: "#F59E0B", resuelto: "#10B981", cerrado: "#6B7280" };

export default function Show({ ticket }) {
    const { isDark } = useTheme();
    const card = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-100";
    const text = isDark ? "text-white" : "text-slate-900";
    const muted = isDark ? "text-slate-400" : "text-slate-500";

    const { data, setData, post, processing, reset } = useForm({ body: "" });
    const bottomRef = useRef(null);

    // Refresca el ticket cada ~8s para mostrar respuestas nuevas del staff
    // sin recargar manualmente (mensajería casi-en-vivo, sin WebSockets).
    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({ only: ["ticket"], preserveScroll: true });
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [ticket.messages.length]);

    const submit = (e) => {
        e.preventDefault();
        post(route("support.messages.store", ticket.id), { preserveScroll: true, onSuccess: () => reset("body") });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Ticket #${ticket.id} · ${ticket.subject}`} />

            <div className="space-y-4 max-w-3xl mx-auto">
                <Link href={route("support.index")} className={`inline-flex items-center gap-1.5 text-sm font-semibold ${muted} hover:${text}`}>
                    <ArrowLeft size={16} /> Volver a Soporte
                </Link>

                <div className={`rounded-2xl border shadow-sm p-5 ${card}`}>
                    <div className="flex items-center justify-between gap-3 mb-4">
                        <h1 className={`font-extrabold ${text}`}>#{ticket.id} · {ticket.subject}</h1>
                        <span
                            className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                            style={{ background: `${STATUS_COLORS[ticket.status]}18`, color: STATUS_COLORS[ticket.status] }}
                        >
                            {STATUS_LABELS[ticket.status]}
                        </span>
                    </div>

                    <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-1">
                        {ticket.messages.map((m) => (
                            <div key={m.id} className={`flex ${m.author_type === "tenant" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                                        m.author_type === "tenant"
                                            ? "bg-emerald-500 text-white"
                                            : isDark ? "bg-slate-800 border border-slate-700" : "bg-slate-100"
                                    }`}
                                >
                                    <p className={`text-xs font-bold mb-1 ${m.author_type === "tenant" ? "text-white/80" : muted}`}>
                                        {m.author_type === "staff" ? `${m.author_name || "Soporte ArtCode"} · ArtCode` : m.author_name}
                                    </p>
                                    <p className="whitespace-pre-wrap">{m.body}</p>
                                    <p className={`text-[11px] mt-1 ${m.author_type === "tenant" ? "text-white/70" : isDark ? "text-slate-500" : "text-slate-400"}`}>
                                        {new Date(m.created_at).toLocaleString("es-AR")}
                                    </p>
                                </div>
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>
                </div>

                <div className={`rounded-2xl border shadow-sm p-5 ${card}`}>
                    <form onSubmit={submit} className="space-y-3">
                        <textarea
                            rows={3}
                            className={`w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-emerald-500/30 ${
                                isDark ? "bg-slate-800 border-slate-700 focus:border-emerald-500 text-white" : "bg-white border-slate-200 focus:border-emerald-500"
                            }`}
                            placeholder="Escribí tu respuesta…"
                            value={data.body}
                            onChange={(e) => setData("body", e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={processing || !data.body.trim()}
                            className="inline-flex items-center justify-center gap-1.5 text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50 bg-emerald-500"
                        >
                            <Send size={15} /> {processing ? "Enviando…" : "Responder"}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

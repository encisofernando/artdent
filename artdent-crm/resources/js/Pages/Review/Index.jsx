import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Star, CheckCircle2, XCircle, Clock, Trash2, MessageSquare } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

function Stars({ rating }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    size={13}
                    className={s <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 fill-gray-200'}
                />
            ))}
        </div>
    );
}

function StatusBadge({ status, isDark }) {
    const map = {
        pending:  { label: 'Pendiente', icon: Clock,         cls: isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600' },
        approved: { label: 'Aprobada',  icon: CheckCircle2,  cls: isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700' },
        rejected: { label: 'Rechazada', icon: XCircle,       cls: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600' },
    };
    const s = map[status] ?? map.pending;
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>
            <Icon size={10} /> {s.label}
        </span>
    );
}

const STATUS_TABS = [
    { key: 'all',      label: 'Todas' },
    { key: 'pending',  label: 'Pendientes' },
    { key: 'approved', label: 'Aprobadas' },
    { key: 'rejected', label: 'Rechazadas' },
];

export default function Index({ auth, reviews, counts, status }) {
    const { isDark } = useTheme();
    const data = reviews?.data || [];

    const handleStatus = (review, newStatus) => {
        router.patch(route('reviews.update', review.id), { status: newStatus }, { preserveScroll: true });
    };

    const handleDelete = (review) => {
        if (confirm(`¿Eliminar la reseña de ${review.customer?.name ?? 'Anónimo'}? Esta acción no se puede deshacer.`)) {
            router.delete(route('reviews.destroy', review.id), { preserveScroll: true });
        }
    };

    const filterTab = (key) => {
        router.get(route('reviews.index'), key === 'all' ? {} : { status: key }, { preserveScroll: true });
    };

    const card = `rounded-2xl border shadow-sm p-5 transition-all ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}`;

    /* ─── stat cards ─── */
    const statItems = [
        { label: 'Total',      value: counts?.total    ?? 0, color: isDark ? 'text-slate-200' : 'text-slate-800' },
        { label: 'Pendientes', value: counts?.pending   ?? 0, color: 'text-amber-500' },
        { label: 'Aprobadas',  value: counts?.approved  ?? 0, color: 'text-emerald-500' },
        { label: 'Rechazadas', value: counts?.rejected  ?? 0, color: 'text-red-500' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reseñas" />

            <div className="flex flex-col gap-6 font-sans">

                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Reseñas
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Moderá las valoraciones de clientes del e-commerce
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {statItems.map(({ label, value, color }) => (
                        <div key={label} className={`rounded-2xl border p-4 text-center ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}`}>
                            <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
                            <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className={`flex gap-1 p-1 rounded-xl border w-fit ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                    {STATUS_TABS.map(({ key, label }) => {
                        const active = status === key || (key === 'all' && (status === 'all' || !status));
                        return (
                            <button
                                key={key}
                                onClick={() => filterTab(key)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                                    active
                                        ? (isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                                        : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
                                }`}
                            >
                                {label}
                            </button>
                        );
                    })}
                </div>

                {/* Lista */}
                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}`}>
                            <MessageSquare size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            No hay reseñas
                        </h3>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {status === 'pending' ? 'No hay reseñas pendientes de moderación.' : 'Todavía no se recibieron reseñas.'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {data.map((review) => (
                            <div key={review.id} className={card}>
                                <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                                    {/* Izquierda: estrellas + contenido */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <Stars rating={review.rating} />
                                            <StatusBadge status={review.status} isDark={isDark} />
                                            {review.order_id && (
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                                                    ✓ Compra verificada
                                                </span>
                                            )}
                                        </div>

                                        {review.title && (
                                            <p className={`font-bold text-sm mb-0.5 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                {review.title}
                                            </p>
                                        )}
                                        {review.body && (
                                            <p className={`text-sm line-clamp-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {review.body}
                                            </p>
                                        )}

                                        <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            <span>
                                                👤 <span className="font-semibold">{review.customer?.name ?? 'Anónimo'}</span>
                                            </span>
                                            <span>
                                                📦 <span className="font-semibold">{review.product?.name ?? '—'}</span>
                                            </span>
                                            <span>
                                                🗓 {new Date(review.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Derecha: acciones */}
                                    <div className="flex sm:flex-col gap-2 flex-shrink-0">
                                        {review.status !== 'approved' && (
                                            <button
                                                onClick={() => handleStatus(review, 'approved')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-80"
                                                style={{ background: B.green }}
                                            >
                                                <CheckCircle2 size={13} /> Aprobar
                                            </button>
                                        )}
                                        {review.status !== 'rejected' && (
                                            <button
                                                onClick={() => handleStatus(review, 'rejected')}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${isDark ? 'bg-amber-900/30 text-amber-400 hover:bg-amber-900/50' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                                            >
                                                <XCircle size={13} /> Rechazar
                                            </button>
                                        )}
                                        {review.status !== 'pending' && (
                                            <button
                                                onClick={() => handleStatus(review, 'pending')}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                            >
                                                <Clock size={13} /> Pendiente
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(review)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                        >
                                            <Trash2 size={13} /> Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {reviews?.links && reviews.links.length > 3 && (
                    <div className="flex justify-center mt-2">
                        <div className={`flex gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                            {reviews.links.map((link, i) => {
                                if (!link.url && !link.active) {
                                    return (
                                        <span
                                            key={i}
                                            className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                }
                                return (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveScroll
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${link.active
                                            ? (isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                                            : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

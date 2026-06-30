import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Tag, CheckCircle2, XCircle, Clock, Package } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

const TYPE_LABELS = {
    discount_percent: '% Descuento',
    discount_fixed: '$ Descuento fijo',
    two_for_one: '2x1',
    combo: 'Combo',
    installments: 'Cuotas',
};

const BADGE_COLORS = {
    red: { bg: 'bg-red-500', text: 'text-white' },
    orange: { bg: 'bg-orange-500', text: 'text-white' },
    green: { bg: 'bg-emerald-500', text: 'text-white' },
    blue: { bg: 'bg-blue-500', text: 'text-white' },
    purple: { bg: 'bg-purple-500', text: 'text-white' },
};

function StatusBadge({ offer, isDark }) {
    const now = new Date();
    const from = offer.starts_at ? new Date(offer.starts_at) : null;
    const until = offer.ends_at ? new Date(offer.ends_at) : null;

    if (!offer.is_active) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
                <XCircle size={10} /> Inactivo
            </span>
        );
    }
    if (until && until < now) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-50 text-amber-600'}`}>
                <Clock size={10} /> Vencido
            </span>
        );
    }
    if (from && from > now) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <Clock size={10} /> Programado
            </span>
        );
    }
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
            <CheckCircle2 size={10} /> Activo
        </span>
    );
}

export default function Index({ auth, items }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];

    const handleDelete = (id) => {
        confirmDialog('¿Eliminar esta oferta? Esta acción no se puede deshacer.', () => {
            router.delete(route('offers.destroy', id), { preserveScroll: true });
        });
    };

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

    const card = `relative flex flex-col rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md p-5 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Ofertas" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Ofertas
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Administrá las ofertas y promociones del e-commerce
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={route('offers.create')}>
                            <Button
                                className="w-full text-white border-none shadow-md rounded-xl"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            >
                                <Plus className="mr-2" size={16} /> Nueva Oferta
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Contador */}
                {items?.total > 0 && (
                    <div className="flex">
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold border inline-block ${isDark ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                            {items.to} de {items.total} ofertas
                        </div>
                    </div>
                )}

                {/* Lista */}
                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}`}>
                            <Tag size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            No hay ofertas
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Creá tu primera oferta o promoción
                        </p>
                        <Link href={route('offers.create')}>
                            <Button
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                className="text-white border-none rounded-xl"
                            >
                                <Plus className="mr-2" size={16} /> Crear Oferta
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {data.map((item) => {
                            const badgeColors = BADGE_COLORS[item.badge_color] || BADGE_COLORS.red;
                            return (
                                <div key={item.id} className={card}>
                                    {/* Acciones */}
                                    <div className="absolute top-4 right-4 flex gap-1.5 z-20">
                                        <Link href={route('offers.edit', item.id)}>
                                            <button className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                                <Edit size={13} />
                                            </button>
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>

                                    {/* Badge */}
                                    {item.badge_text && (
                                        <div className="mb-3 pr-20">
                                            <span className={`inline-block px-3 py-1 rounded-xl text-xs font-extrabold tracking-wide ${badgeColors.bg} ${badgeColors.text}`}>
                                                {item.badge_text}
                                            </span>
                                        </div>
                                    )}

                                    {/* Nombre */}
                                    <div className={`font-extrabold text-base mb-1 pr-20 ${item.badge_text ? '' : 'pt-0'} ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                        {item.name}
                                    </div>

                                    {/* Tipo */}
                                    <div className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {TYPE_LABELS[item.type] || item.type}
                                        {item.value != null && item.value > 0 && (
                                            <span className="ml-1 font-semibold">
                                                ({item.type === 'discount_percent' ? `${item.value}%` : item.type === 'installments' ? `${item.value} cuotas` : `$${Number(item.value).toLocaleString('es-AR')}`})
                                            </span>
                                        )}
                                    </div>

                                    {/* Productos y fechas */}
                                    <div className={`space-y-1 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        <div className="flex items-center gap-1">
                                            <Package size={11} />
                                            <span>{item.products_count ?? 0} producto{item.products_count !== 1 ? 's' : ''}</span>
                                        </div>
                                        {item.starts_at && <div>Desde: <span className="font-semibold">{fmtDate(item.starts_at)}</span></div>}
                                        {item.ends_at && <div>Hasta: <span className="font-semibold">{fmtDate(item.ends_at)}</span></div>}
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: isDark ? '#334155' : '#f1f5f9' }}>
                                        <StatusBadge offer={item} isDark={isDark} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                <Pagination data={items} />
            </div>
        </AuthenticatedLayout>
    );
}

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Power, Tag, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

function StatusBadge({ coupon, isDark }) {
    const now = new Date();
    const from = coupon.valid_from ? new Date(coupon.valid_from) : null;
    const until = coupon.valid_until ? new Date(coupon.valid_until) : null;

    if (!coupon.is_active) {
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

export default function Index({ auth, items, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [type, setType] = useState(filters?.type || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        const changed =
            debouncedSearch !== (filters?.search || '') ||
            status !== (filters?.status || 'all') ||
            type !== (filters?.type || 'all');
        if (changed) {
            router.get(route('coupons.index'), { search: debouncedSearch, status, type }, {
                preserveState: true, preserveScroll: true, replace: true,
            });
        }
    }, [debouncedSearch, status, type]);

    const toggleStatus = (item) => {
        router.put(route('coupons.update', item.id), { ...item, is_active: item.is_active ? 0 : 1 }, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        confirmDialog('¿Eliminar este cupón? Esta acción no se puede deshacer.', () =>
            router.delete(route('coupons.destroy', id), { preserveScroll: true })
        );
    };

    const fmt = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;
    const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

    const card = `relative flex flex-col rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md p-5 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}`;
    const inputBase = `w-full rounded-xl border px-4 py-2 text-sm bg-transparent outline-none ${isDark ? 'border-slate-700 text-white placeholder-slate-500' : 'border-slate-200 text-slate-800 placeholder-slate-400'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cupones de Descuento" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Cupones de Descuento
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Administrá códigos de descuento para el e-commerce
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        {/* Buscador */}
                        <div className={`flex items-center px-3 py-2 rounded-xl border w-full sm:w-56 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                            <Search size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar código..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full"
                            />
                        </div>

                        {/* Filtro estado */}
                        <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                            {[{ id: 'all', label: 'Todos' }, { id: 'active', label: 'Activos' }, { id: 'inactive', label: 'Inactivos' }].map(tab => (
                                <button key={tab.id} onClick={() => setStatus(tab.id)}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${status === tab.id
                                        ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm')
                                        : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Filtro tipo */}
                        <div className={`flex items-center p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                            {[{ id: 'all', label: 'Tipo' }, { id: 'fixed', label: '$' }, { id: 'percent', label: '%' }].map(tab => (
                                <button key={tab.id} onClick={() => setType(tab.id)}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${type === tab.id
                                        ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm')
                                        : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <Link href={route('coupons.create')}>
                            <Button className="w-full text-white border-none shadow-md rounded-xl"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus className="mr-2" size={16} /> Nuevo Cupón
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Contador */}
                {items?.total > 0 && (
                    <div className="flex">
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold border inline-block ${isDark ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                            {items.to} de {items.total} cupones
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
                            {search ? 'Sin resultados' : 'No hay cupones'}
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {search ? 'Probá con otro código' : 'Creá tu primer cupón de descuento'}
                        </p>
                        {!search && (
                            <Link href={route('coupons.create')}>
                                <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none rounded-xl">
                                    <Plus className="mr-2" size={16} /> Crear Cupón
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {data.map((item) => (
                            <div key={item.id} className={card}>
                                {/* Acciones */}
                                <div className="absolute top-4 right-4 flex gap-1.5 z-20">
                                    <Link href={route('coupons.edit', item.id)}>
                                        <button className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                            <Edit size={13} />
                                        </button>
                                    </Link>
                                    <button onClick={() => handleDelete(item.id)}
                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>

                                {/* Código */}
                                <div className="mb-3 pr-20">
                                    <div className={`inline-block font-mono font-extrabold text-lg tracking-widest px-3 py-1 rounded-xl ${isDark ? 'bg-slate-800 text-teal-300' : 'bg-slate-100 text-teal-700'}`}>
                                        {item.code}
                                    </div>
                                </div>

                                {/* Valor */}
                                <div className={`text-2xl font-black mb-1 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                    {item.type === 'percentage' ? `${item.value}%` : fmt(item.value)}
                                    <span className={`ml-2 text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {item.type === 'percentage' ? 'descuento' : 'descuento fijo'}
                                    </span>
                                </div>

                                {/* Detalles */}
                                <div className={`space-y-1 text-xs mt-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {item.min_order_amount > 0 && (
                                        <div>Pedido mínimo: <span className="font-semibold">{fmt(item.min_order_amount)}</span></div>
                                    )}
                                    <div>
                                        Usos: <span className="font-semibold">{item.used_count ?? 0}</span>
                                        {item.max_uses && <span> / {item.max_uses}</span>}
                                    </div>
                                    {item.valid_from && <div>Desde: <span className="font-semibold">{fmtDate(item.valid_from)}</span></div>}
                                    {item.valid_until && <div>Hasta: <span className="font-semibold">{fmtDate(item.valid_until)}</span></div>}
                                </div>

                                {/* Footer */}
                                <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: isDark ? '#334155' : '#f1f5f9' }}>
                                    <StatusBadge coupon={item} isDark={isDark} />
                                    <button onClick={() => toggleStatus(item)}
                                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg transition-colors ${item.is_active
                                            ? (isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-500 hover:bg-red-100')
                                            : (isDark ? 'bg-emerald-900/20 text-emerald-400 hover:bg-emerald-900/40' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100')}`}>
                                        <Power size={10} />
                                        {item.is_active ? 'Desactivar' : 'Activar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination data={items} />
            </div>
        </AuthenticatedLayout>
    );
}

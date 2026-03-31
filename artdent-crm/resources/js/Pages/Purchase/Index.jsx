import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Eye, Trash2, FileText, CheckCircle, Clock, AlertCircle, XCircle, ChevronRight } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import SearchableSelect from '@/Components/SearchableSelect';

const STATUS_MAP = {
    pending:   { label: 'Pendiente', icon: Clock,        color: 'yellow' },
    received:  { label: 'Recibido',  icon: CheckCircle,  color: 'green'  },
    partial:   { label: 'Parcial',   icon: AlertCircle,  color: 'blue'   },
    cancelled: { label: 'Cancelado', icon: XCircle,      color: 'red'    },
};

const COLORS = (isDark) => ({
    yellow: isDark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
    green:  isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue:   isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200',
    red:    isDark ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-red-50 text-red-700 border-red-200',
});

function StatusBadge({ status, isDark }) {
    const cfg  = STATUS_MAP[status] ?? STATUS_MAP.pending;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${COLORS(isDark)[cfg.color]}`}>
            <Icon size={11} />
            {cfg.label}
        </span>
    );
}

export default function Index({ auth, items, vendors, filters }) {
    const { isDark } = useTheme();
    const data = items?.data || [];
    const B    = { blue: '#397B9C', teal: '#49949C' };

    const [search,   setSearch]   = useState(filters?.search    || '');
    const [vendorId, setVendorId] = useState(filters?.vendor_id || '');
    const [status,   setStatus]   = useState(filters?.status    || 'all');
    const [debounced, setDebounced] = useState(search);

    useEffect(() => { const t = setTimeout(() => setDebounced(search), 400); return () => clearTimeout(t); }, [search]);
    useEffect(() => {
        router.get(route('proveedores.comprobantes.index'), { search: debounced, vendor_id: vendorId, status }, { preserveState: true, preserveScroll: true, replace: true });
    }, [debounced, vendorId, status]);

    const handleDelete = (id) => {
        if (confirm('¿Eliminar este comprobante? Se revertirá el stock y la cuenta corriente.'))
            router.delete(route('proveedores.comprobantes.destroy', id), { preserveScroll: true });
    };

    const fmt     = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);
    const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

    const cardBg  = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200';
    const inputBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';
    const textMain = isDark ? 'text-slate-100' : 'text-slate-900';
    const textSub  = isDark ? 'text-slate-400' : 'text-slate-500';

    const TABS = [
        { id: 'all',       label: 'Todos'     },
        { id: 'pending',   label: 'Pendiente' },
        { id: 'received',  label: 'Recibido'  },
        { id: 'partial',   label: 'Parcial'   },
        { id: 'cancelled', label: 'Cancelado' },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Comprobantes de Compra" />

            <div className="flex flex-col gap-4 font-sans">

                {/* ── Header ─────────────────────────────────── */}
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${textMain}`}>
                            Comprobantes de Compra
                        </h1>
                        <p className={`text-xs sm:text-sm ${textSub}`}>
                            Facturas, remitos y órdenes de compra a proveedores
                        </p>
                    </div>
                    <Link href={route('proveedores.comprobantes.create')}>
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all active:scale-[0.97]"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Plus size={17} />
                            <span className="hidden sm:inline">Nuevo Comprobante</span>
                            <span className="sm:hidden">Nuevo</span>
                        </button>
                    </Link>
                </div>

                {/* ── Filters ────────────────────────────────── */}
                <div className={`flex flex-col gap-2 p-3 sm:p-4 rounded-2xl border ${cardBg}`}>
                    {/* Search */}
                    <div className={`flex items-center px-3 py-2.5 rounded-xl border ${inputBg}`}>
                        <Search size={15} className="text-slate-400 shrink-0" />
                        <input type="text" placeholder="Buscar por número, proveedor..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
                        />
                    </div>

                    {/* Vendor select */}
                    <SearchableSelect
                        value={vendorId}
                        onChange={v => setVendorId(v)}
                        options={vendors.map(v => ({ value: String(v.id), label: v.name }))}
                        placeholder="Todos los proveedores"
                    />

                    {/* Status tabs — scrollable */}
                    <div className="overflow-x-auto -mx-1 px-1">
                        <div className={`flex items-center p-1 rounded-xl border w-max min-w-full ${inputBg}`}>
                            {TABS.map(tab => (
                                <button key={tab.id} onClick={() => setStatus(tab.id)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${status === tab.id
                                        ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm')
                                        : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                                    }`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Count */}
                {items?.total > 0 && (
                    <p className={`text-xs font-semibold ${textSub}`}>
                        {items.to} de {items.total} comprobantes
                    </p>
                )}

                {/* ── Empty state ────────────────────────────── */}
                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <FileText size={40} className={`mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <h3 className={`text-lg font-bold mb-1 ${textMain}`}>Sin comprobantes</h3>
                        <p className={`text-sm mb-6 ${textSub}`}>Registrá el primer comprobante de compra</p>
                        <Link href={route('proveedores.comprobantes.create')}>
                            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-bold"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                <Plus size={16} /> Nuevo Comprobante
                            </button>
                        </Link>
                    </div>

                ) : (
                    <>
                        {/* ── Mobile cards ───────────────────── */}
                        <div className="sm:hidden flex flex-col gap-2">
                            {data.map(item => {
                                const num = item.invoice_type && item.invoice_number
                                    ? `${item.invoice_type} ${item.invoice_number}`
                                    : item.reference_no || `#${item.id}`;
                                return (
                                    <div key={item.id} className={`rounded-2xl border p-4 ${cardBg}`}>
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="min-w-0 flex-1">
                                                <p className={`font-bold text-[15px] truncate ${textMain}`}>
                                                    {item.vendor?.name ?? '—'}
                                                </p>
                                                <p className={`text-xs font-mono mt-0.5 ${textSub}`}>{num}</p>
                                            </div>
                                            <StatusBadge status={item.status} isDark={isDark} />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className={`text-[11px] ${textSub}`}>{fmtDate(item.purchased_at)}</p>
                                                <p className="text-[18px] font-extrabold mt-0.5" style={{ color: B.blue }}>
                                                    {fmt(item.total)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Link href={route('proveedores.comprobantes.show', item.id)}>
                                                    <button className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                                                        <Eye size={14} /> Ver
                                                    </button>
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)}
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-400'}`}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ── Desktop table ───────────────────── */}
                        <div className={`hidden sm:block rounded-2xl border overflow-hidden ${cardBg}`}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                            <th className="px-4 py-3 text-left">Fecha</th>
                                            <th className="px-4 py-3 text-left">Proveedor</th>
                                            <th className="px-4 py-3 text-left">Comprobante</th>
                                            <th className="px-4 py-3 text-left">Estado</th>
                                            <th className="px-4 py-3 text-right">Total</th>
                                            <th className="px-4 py-3 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                        {data.map(item => (
                                            <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                                <td className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {fmtDate(item.purchased_at)}
                                                </td>
                                                <td className={`px-4 py-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {item.vendor?.name ?? '—'}
                                                </td>
                                                <td className={`px-4 py-3 font-mono ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {item.invoice_type && item.invoice_number
                                                        ? `${item.invoice_type} ${item.invoice_number}`
                                                        : item.reference_no || `#${item.id}`}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <StatusBadge status={item.status} isDark={isDark} />
                                                </td>
                                                <td className={`px-4 py-3 text-right font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                    {fmt(item.total)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={route('proveedores.comprobantes.show', item.id)}>
                                                            <button className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-800'}`}>
                                                                <Eye size={13} />
                                                            </button>
                                                        </Link>
                                                        <button onClick={() => handleDelete(item.id)}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}>
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Pagination ─────────────────────────────── */}
                {items?.links && items.links.length > 3 && (
                    <div className="flex justify-center mt-2">
                        <div className={`flex gap-1 p-1 rounded-xl border ${cardBg}`}>
                            {items.links.map((link, i) => (
                                link.url
                                    ? <Link key={i} href={link.url} preserveScroll
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${link.active ? (isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600') : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                    : <span key={i} className={`px-3 py-1.5 text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Search, ArrowUpCircle, ArrowDownCircle, RefreshCw, ArrowLeftRight, ShoppingCart, PackageMinus, History } from 'lucide-react';
import { DatePicker, useD } from '@/Components/_appkit';
import SearchableSelect from '@/Components/SearchableSelect';

const TYPE_CFG = {
    in:                        { label: 'Entrada',            icon: ArrowUpCircle,   color: 'green'  },
    out:                       { label: 'Salida',             icon: ArrowDownCircle, color: 'red'    },
    adjustment:                { label: 'Ajuste',             icon: RefreshCw,       color: 'blue'   },
    transfer_in:               { label: 'Transferencia +',    icon: ArrowLeftRight,  color: 'teal'   },
    transfer_out:              { label: 'Transferencia −',    icon: ArrowLeftRight,  color: 'orange' },
    purchase:                  { label: 'Compra',             icon: ShoppingCart,    color: 'green'  },
    purchase_reversal:         { label: 'Rev. Compra',        icon: ShoppingCart,    color: 'red'    },
    lab_withdrawal:            { label: 'Retiro Lab',         icon: PackageMinus,    color: 'purple' },
    lab_withdrawal_reversal:   { label: 'Rev. Retiro Lab',    icon: PackageMinus,    color: 'orange' },
};

const COLORS = (isDark) => ({
    green:  isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red:    isDark ? 'bg-red-900/30 text-red-400 border-red-800/50'             : 'bg-red-50 text-red-700 border-red-200',
    blue:   isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50'          : 'bg-blue-50 text-blue-700 border-blue-200',
    teal:   isDark ? 'bg-teal-900/30 text-teal-400 border-teal-800/50'          : 'bg-teal-50 text-teal-700 border-teal-200',
    orange: isDark ? 'bg-orange-900/30 text-orange-400 border-orange-800/50'    : 'bg-orange-50 text-orange-700 border-orange-200',
    purple: isDark ? 'bg-purple-900/30 text-purple-400 border-purple-800/50'    : 'bg-purple-50 text-purple-700 border-purple-200',
});

function TypeBadge({ type, isDark }) {
    const cfg = TYPE_CFG[type] ?? { label: type, color: 'blue' };
    const Icon = cfg.icon ?? History;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${COLORS(isDark)[cfg.color]}`}>
            <Icon size={10} />
            {cfg.label}
        </span>
    );
}

const fmt = (n) => n == null ? '—' : new Intl.NumberFormat('es-AR').format(parseFloat(n));

export default function Index({ auth, items, warehouses, types, filters }) {
    const { isDark } = useTheme();
    const D = useD(isDark);
    const B = { blue: '#397B9C', teal: '#49949C' };

    const [search, setSearch] = useState(filters.search ?? '');
    const [warehouseId, setWarehouseId] = useState(filters.warehouse_id ?? '');
    const [type, setType] = useState(filters.type ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');

    const applyFilters = () => router.get(route('stock-movements.index'), {
        search: search || undefined,
        warehouse_id: warehouseId || undefined,
        type: type || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
    }, { preserveState: true, replace: true });

    const clearFilters = () => {
        setSearch(''); setWarehouseId(''); setType(''); setDateFrom(''); setDateTo('');
        router.get(route('stock-movements.index'));
    };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    const typeOptions = [
        { value: '', label: 'Todos los tipos' },
        ...Object.entries(types).map(([k, v]) => ({ value: k, label: v })),
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Movimientos de Stock" />

            <div className="flex flex-col gap-6 font-sans max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <History size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Movimientos de Stock</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Historial de auditoría — todas las entradas y salidas registradas</p>
                    </div>
                </div>

                {/* Filtros */}
                <div className={`${card} p-4`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="relative lg:col-span-2">
                            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input type="text" placeholder="Producto o SKU..."
                                value={search} onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                className={`${inputCls} pl-9`} />
                        </div>
                        <SearchableSelect
                            options={[{ value: '', label: 'Todos los depósitos' }, ...warehouses.map(w => ({ value: String(w.id), label: w.name }))]}
                            value={String(warehouseId)}
                            onChange={setWarehouseId}
                            placeholder="Depósito..."
                        />
                        <SearchableSelect
                            options={typeOptions}
                            value={type}
                            onChange={setType}
                            placeholder="Tipo..."
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <DatePicker value={dateFrom} onChange={setDateFrom} className={inputCls} D={D} placeholder="Desde" />
                            <DatePicker value={dateTo} onChange={setDateTo} className={inputCls} D={D} placeholder="Hasta" />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button onClick={applyFilters} className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>Filtrar</button>
                        <button onClick={clearFilters} className={`px-4 py-2 rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>Limpiar</button>
                        <span className={`ml-auto text-xs self-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {items.total} movimientos totales
                        </span>
                    </div>
                </div>

                {/* Tabla */}
                <div className={`${card} overflow-hidden`}>
                    {items.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <History size={40} className={`mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No hay movimientos en el período seleccionado</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                        {['Fecha', 'Tipo', 'Producto', 'Variante', 'Depósito', 'Cantidad', 'Stock Ant.', 'Stock Post.', 'Usuario', 'Nota'].map(h => (
                                            <th key={h} className={`px-3 py-3 text-left text-xs font-bold uppercase tracking-wider whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {items.data.map(item => {
                                        const isOut = ['out', 'transfer_out', 'lab_withdrawal', 'purchase_reversal'].includes(item.type);
                                        return (
                                            <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                                <td className={`px-3 py-2.5 text-xs whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {new Date(item.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <TypeBadge type={item.type} isDark={isDark} />
                                                </td>
                                                <td className={`px-3 py-2.5 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    <div>{item.product?.name ?? '—'}</div>
                                                    {item.product?.sku && <div className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.product.sku}</div>}
                                                </td>
                                                <td className={`px-3 py-2.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.product_variant ? (item.product_variant.sku || item.product_variant.barcode || `#${item.product_variant.id}`) : '—'}
                                                </td>
                                                <td className={`px-3 py-2.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {item.warehouse?.name ?? '—'}
                                                </td>
                                                <td className={`px-3 py-2.5 font-bold ${isOut ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-emerald-400' : 'text-emerald-700')}`}>
                                                    {isOut ? '−' : '+'}{fmt(item.quantity)}
                                                </td>
                                                <td className={`px-3 py-2.5 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {fmt(item.stock_before)}
                                                </td>
                                                <td className={`px-3 py-2.5 text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {fmt(item.stock_after)}
                                                </td>
                                                <td className={`px-3 py-2.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.user?.name ?? '—'}
                                                </td>
                                                <td className={`px-3 py-2.5 text-xs max-w-40 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                                                    title={item.note ?? ''}>
                                                    {item.note ?? '—'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Paginación */}
                    {items.last_page > 1 && (
                        <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                            <span className="text-xs">Mostrando {items.from}–{items.to} de {items.total}</span>
                            <div className="flex gap-1">
                                {items.links.map((link, i) => (
                                    <button key={i} disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${link.active ? 'text-white' : ''} ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        style={link.active ? { background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` } : {}}
                                        dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

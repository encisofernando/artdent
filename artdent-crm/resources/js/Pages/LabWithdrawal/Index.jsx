import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Eye, Trash2, CheckCircle, XCircle, PackageMinus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { DatePicker, useD } from '@/Components/_appkit';
import SearchableSelect from '@/Components/SearchableSelect';

const STATUS_MAP = {
    confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'green' },
    cancelled:  { label: 'Cancelado',  icon: XCircle,     color: 'red'   },
};

const COLORS = (isDark) => ({
    green: isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red:   isDark ? 'bg-red-900/30 text-red-400 border-red-800/50'             : 'bg-red-50 text-red-700 border-red-200',
});

function StatusBadge({ status, isDark }) {
    const cfg = STATUS_MAP[status] ?? STATUS_MAP.confirmed;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${COLORS(isDark)[cfg.color]}`}>
            <Icon size={11} />
            {cfg.label}
        </span>
    );
}

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

export default function Index({ auth, items, collaborators, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const D = useD(isDark);
    const B = { blue: '#397B9C', teal: '#49949C' };

    const [search, setSearch] = useState(filters.search ?? '');
    const [collaboratorId, setCollaboratorId] = useState(filters.collaborator_id ?? '');
    const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters.date_to ?? '');
    const [status, setStatus] = useState(filters.status ?? 'all');

    const applyFilters = () => {
        router.get(route('lab-withdrawals.index'), {
            search: search || undefined,
            collaborator_id: collaboratorId || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            status: status !== 'all' ? status : undefined,
        }, { preserveState: true, replace: true });
    };

    const clearFilters = () => {
        setSearch(''); setCollaboratorId(''); setDateFrom(''); setDateTo(''); setStatus('all');
        router.get(route('lab-withdrawals.index'));
    };

    const handleDelete = (id) => {
        confirmDialog('¿Cancelar este retiro? Se revertirá el stock descontado.', () =>
            router.delete(route('lab-withdrawals.destroy', id), { preserveScroll: true })
        );
    };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Retiros de Insumos" />

            <div className="flex flex-col gap-6 font-sans max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <PackageMinus size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Retiros de Insumos
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Retiros internos del laboratorio a precio de costo
                            </p>
                        </div>
                    </div>
                    <Link href={route('lab-withdrawals.create')}>
                        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Plus size={16} /> Nuevo Retiro
                        </button>
                    </Link>
                </div>

                {/* Filtros */}
                <div className={`${card} p-4`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="relative lg:col-span-2">
                            <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                            <input
                                type="text"
                                placeholder="Buscar por colaborador o nota..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && applyFilters()}
                                className={`${inputCls} pl-9`}
                            />
                        </div>
                        <SearchableSelect
                            options={[{ value: '', label: 'Todos los colaboradores' }, ...collaborators.map(c => ({ value: String(c.id), label: c.name }))]}
                            value={String(collaboratorId)}
                            onChange={setCollaboratorId}
                            placeholder="Colaborador..."
                        />
                        <DatePicker value={dateFrom} onChange={setDateFrom} className={inputCls} D={D} placeholder="Desde..." />
                        <DatePicker value={dateTo} onChange={setDateTo} className={inputCls} D={D} placeholder="Hasta..." />
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                        <SearchableSelect
                            options={[
                                { value: 'all',       label: 'Todos los estados' },
                                { value: 'confirmed', label: 'Confirmados' },
                                { value: 'cancelled', label: 'Cancelados' },
                            ]}
                            value={status}
                            onChange={setStatus}
                            placeholder="Estado..."
                        />
                        <button onClick={applyFilters}
                            className="px-4 py-2 rounded-xl text-sm font-bold text-white"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            Filtrar
                        </button>
                        <button onClick={clearFilters}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border ${isDark ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Tabla */}
                <div className={`${card} overflow-hidden`}>
                    {items.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <PackageMinus size={40} className={`mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                            <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No hay retiros registrados</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-800/40' : 'border-slate-100 bg-slate-50'}`}>
                                        {['#', 'Fecha', 'Destinatario', 'Depósito', 'Total Costo', 'Estado', ''].map(h => (
                                            <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                    {items.data.map(item => (
                                        <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 font-mono font-bold text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                #{String(item.id).padStart(4, '0')}
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                {new Date(item.withdrawn_at).toLocaleDateString('es-AR')}
                                            </td>
                                            <td className={`px-4 py-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {item.collaborator?.name ?? item.external_person ?? '—'}
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {item.warehouse?.name ?? '—'}
                                            </td>
                                            <td className={`px-4 py-3 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {fmt(item.total_cost)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge status={item.status} isDark={isDark} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Link href={route('lab-withdrawals.show', item.id)}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                                                        <Eye size={13} />
                                                    </Link>
                                                    {item.status === 'confirmed' && (
                                                        <button onClick={() => handleDelete(item.id)}
                                                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}>
                                                            <Trash2 size={13} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Paginación */}
                    {items.last_page > 1 && (
                        <div className={`flex items-center justify-between px-4 py-3 border-t ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                            <span className="text-xs">
                                Mostrando {items.from}–{items.to} de {items.total}
                            </span>
                            <div className="flex gap-1">
                                {items.links.map((link, i) => (
                                    <button key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors
                                            ${link.active ? 'text-white' : ''}
                                            ${!link.url ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                                            ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                                        style={link.active ? { background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` } : {}}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

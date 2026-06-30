import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Search, Plus, Eye, FileText,
    TrendingUp, TrendingDown, Clock, CheckCircle2, ListFilter, Download,
} from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { Button } from '@/Components/ui/button';

const B = {
    blue:  '#397B9C',
    green: '#5AAD9C',
    teal:  '#49949C',
    mint:  '#ACD6CE',
    red:   '#E63946',
};

const fmt    = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

const STATUS_CONFIG = {
    draft:     { label: 'Borrador',   css: 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400' },
    sent:      { label: 'Enviado',    css: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    accepted:  { label: 'Aceptado',   css: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    expired:   { label: 'Vencido',    css: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
    cancelled: { label: 'Cancelado',  css: 'bg-red-500/10 text-red-600 border-red-500/20' },
};

function StatusBadge({ status }) {
    const c = STATUS_CONFIG[status] || STATUS_CONFIG.draft;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-bold tracking-wide ${c.css}`}>
            {c.label}
        </span>
    );
}

function KpiCard({ title, value, subtitle, icon: Icon, color }) {
    const { isDark } = useTheme();
    return (
        <div className={`relative overflow-hidden rounded-2xl border p-5 transition-transform hover:-translate-y-1
            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100 shadow-sm'}
        `}>
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: color }} />
            <div className="absolute -top-2 -right-2 flex items-center justify-center w-10 h-10 opacity-20">
                <Icon size={28} color={color} />
            </div>
            <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{title}</h3>
            <div className="text-2xl font-extrabold mb-1" style={{ color }}>{value}</div>
            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subtitle}</p>
        </div>
    );
}

export default function Index({ auth, items, filters }) {
    const { isDark, sidebarCollapsed } = useTheme();
    const data = items?.data || [];

    const [search, setSearch]               = useState(filters?.search || '');
    const [status, setStatus]               = useState(filters?.status || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch !== (filters?.search || '') || status !== (filters?.status || 'all')) {
            router.get(route('quotes.index'), { search: debouncedSearch, status }, {
                preserveState: true, preserveScroll: true, replace: true,
            });
        }
    }, [debouncedSearch, status]);

    const total      = data.reduce((s, i) => s + Number(i.total || 0), 0);
    const accepted   = data.filter(i => i.status === 'accepted').length;
    const pending    = data.filter(i => i.status === 'sent').length;
    const expired    = data.filter(i => i.status === 'expired').length;

    const TABS = [
        { id: 'all',      label: 'Todos'     },
        { id: 'draft',    label: 'Borrador'  },
        { id: 'sent',     label: 'Enviados'  },
        { id: 'accepted', label: 'Aceptados' },
        { id: 'expired',  label: 'Vencidos'  },
        { id: 'cancelled',label: 'Cancelados'},
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Presupuestos" />

            <div className={`fixed top-16 right-0 left-0 bottom-14 lg:bottom-0 z-[5] overflow-hidden transition-all duration-300
                ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}
            `}>
                <div className={`h-full overflow-y-auto ${isDark ? 'bg-[#0b1520]' : 'bg-slate-50'}`}
                    style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(73,148,156,0.2) transparent' }}>

                    <div className="flex flex-col gap-6 p-4 sm:p-6 pb-24 sm:pb-8">

                        {/* ── Header ── */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
                                    style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                                    <FileText size={24} className="text-white" />
                                </div>
                                <div>
                                    <h1 className={`text-2xl font-extrabold tracking-tight leading-none ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                        Presupuestos
                                    </h1>
                                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Generá y compartí presupuestos con tus clientes
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                {/* Search */}
                                <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors w-full sm:w-auto
                                    ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                                `}>
                                    <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                    <input
                                        type="text"
                                        placeholder="Buscar cliente o número..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full sm:w-52
                                            ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                        `}
                                    />
                                </div>

                                {/* Status tabs — desktop */}
                                <div className={`hidden md:flex items-center p-1 rounded-xl border
                                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}
                                `}>
                                    {TABS.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setStatus(tab.id)}
                                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all
                                                ${status === tab.id
                                                    ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800 shadow-sm')
                                                    : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100')
                                                }
                                            `}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <a href={route('export.quotes')} className="hidden sm:block">
                                    <Button variant="outline" className="rounded-xl gap-2">
                                        <Download size={15} />
                                        CSV
                                    </Button>
                                </a>

                                <Link href={route('quotes.create')} className="hidden sm:block w-full sm:w-auto">
                                    <Button className="w-full text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                                        <Plus className="mr-2" size={18} />
                                        Nuevo Presupuesto
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* ── KPI Strip ── */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <KpiCard title="Total presupuestado" value={`$${Number(total).toLocaleString('es-AR')}`}
                                subtitle="en esta página" color={B.blue} icon={FileText} />
                            <KpiCard title="Aceptados" value={accepted}
                                subtitle="en esta página" color={B.green} icon={CheckCircle2} />
                            <KpiCard title="Enviados / Pendientes" value={pending}
                                subtitle="esperando respuesta" color={B.teal} icon={Clock} />
                            <KpiCard title="Vencidos" value={expired}
                                subtitle="sin respuesta" color={expired > 0 ? B.red : B.mint} icon={expired > 0 ? TrendingDown : TrendingUp} />
                        </div>

                        {/* ── Mobile cards ── */}
                        <div className="sm:hidden flex flex-col gap-3">
                            {data.length === 0 ? (
                                <div className={`rounded-2xl border p-10 text-center ${isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-400'}`}>
                                    No se encontraron presupuestos.
                                </div>
                            ) : data.map((item) => (
                                <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                    <div style={{ height: 3, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-sm truncate" style={{ color: B.teal }}>
                                                    {item.quote_number || `PRES-${String(item.id).padStart(5, '0')}`}
                                                </p>
                                                <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.recipient_name}
                                                </p>
                                                <div className="mt-1.5"><StatusBadge status={item.status} /></div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`font-extrabold text-base ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                    ${fmt(item.total)}
                                                </p>
                                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    {fmtDate(item.issued_at || item.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            {item.due_date && (
                                                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                    Vence: {fmtDate(item.due_date)}
                                                </span>
                                            )}
                                            <Link href={route('quotes.show', item.id)} className="ml-auto">
                                                <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                                    ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}
                                                `}>
                                                    <Eye size={13} /> Ver
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Desktop Table ── */}
                        <div className={`hidden sm:block rounded-2xl border shadow-sm overflow-hidden
                            ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
                        `}>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className={`text-xs uppercase font-bold tracking-wider
                                        ${isDark ? 'bg-slate-800/50 text-slate-400 border-b border-slate-700/50' : 'bg-slate-50 text-slate-500 border-b border-slate-200'}
                                    `}>
                                        <tr>
                                            <th className="px-6 py-4">Número</th>
                                            <th className="px-6 py-4">Fecha</th>
                                            <th className="px-6 py-4">Cliente</th>
                                            <th className="px-6 py-4">Validez</th>
                                            <th className="px-6 py-4">Total</th>
                                            <th className="px-6 py-4">Estado</th>
                                            <th className="px-6 py-4 text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                        {data.length > 0 ? data.map((item) => (
                                            <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50'}`}>
                                                <td className={`px-6 py-4 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {item.quote_number || `PRES-${String(item.id).padStart(5, '0')}`}
                                                </td>
                                                <td className={`px-6 py-4 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                    {fmtDate(item.issued_at || item.created_at)}
                                                </td>
                                                <td className={`px-6 py-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                                            style={{ background: `linear-gradient(135deg, ${B.blue}20, ${B.teal}20)`, color: B.teal }}>
                                                            {(item.recipient_name || 'C')[0].toUpperCase()}
                                                        </div>
                                                        <span>{item.recipient_name}</span>
                                                    </div>
                                                </td>
                                                <td className={`px-6 py-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.due_date ? fmtDate(item.due_date) : '—'}
                                                </td>
                                                <td className="px-6 py-4 font-bold" style={{ color: B.blue }}>
                                                    ${fmt(item.total)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={route('quotes.show', item.id)}>
                                                            <button className={`w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors
                                                                ${isDark ? 'bg-slate-800 text-slate-300 hover:text-blue-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:text-blue-600 hover:bg-slate-200'}
                                                            `} title="Ver presupuesto">
                                                                <Eye size={15} />
                                                            </button>
                                                        </Link>
                                                        {item.public_token && (
                                                            <a
                                                                href={`https://wa.me/?text=${encodeURIComponent(`Hola! Te comparto el presupuesto ${item.quote_number} de ArtDent. Podés verlo aquí: ${window?.location?.origin || ''}/q/${item.public_token}`)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <button
                                                                    className="w-8 h-8 rounded-lg inline-flex items-center justify-center transition-colors bg-green-500/10 text-green-600 hover:bg-green-500/20"
                                                                    title="Compartir por WhatsApp"
                                                                >
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                                                    </svg>
                                                                </button>
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="7" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                    No se encontraron presupuestos.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <Pagination data={items} />

                    </div>
                </div>

                {/* FAB — mobile */}
                <Link href={route('quotes.create')} className="sm:hidden">
                    <button style={{
                        position: 'fixed', bottom: 76, right: 20, zIndex: 56,
                        width: 56, height: 56, borderRadius: '50%', border: 'none',
                        background: `linear-gradient(135deg, ${B.blue}, ${B.teal})`,
                        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 28px rgba(57,123,156,0.45)',
                        cursor: 'pointer',
                    }}>
                        <Plus size={26} />
                    </button>
                </Link>
            </div>
        </AuthenticatedLayout>
    );
}

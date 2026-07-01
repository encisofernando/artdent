import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Power, Users, DollarSign, HardHat } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';

const fmtMoney = (value) => Number(value || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export default function Index({ auth, items, filters, summary }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const hasPermission = (permission) => auth.user?.is_super_admin || auth.user?.permissions?.includes(permission);
    const canCreate = hasPermission('staff.create');
    const canEdit = hasPermission('staff.edit');
    const canDelete = hasPermission('staff.delete');
    const canSeeAttendances = hasPermission('staff.view');
    const canSeeReceipts = hasPermission('staff.edit');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch !== (filters?.search || '') || status !== (filters?.status || 'all')) {
            router.get(
                route('collaborators.index'),
                { search: debouncedSearch, status },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    }, [debouncedSearch, status, filters?.search, filters?.status]);

    const toggleStatus = (item) => {
        router.put(route('collaborators.update', item.id), {
            ...item,
            is_active: item.is_active ? 0 : 1,
        }, { preserveScroll: true });
    };

    const handleDelete = (id) => {
        confirmDialog('¿Estás seguro de que deseas eliminar este colaborador?', () =>
            router.delete(route('collaborators.destroy', id), { preserveScroll: true })
        );
    };

    const B = {
        blue: "#397B9C",
        green: "#5AAD9C",
        teal: "#49949C"
    };
    const summaryCards = [
        { label: 'Colaboradores', value: summary?.total ?? 0, accent: B.blue, icon: Users },
        { label: 'Activos', value: summary?.active ?? 0, accent: B.green, icon: Power },
        { label: 'Inactivos', value: summary?.inactive ?? 0, accent: '#ef4444', icon: Power },
        { label: 'Promedio por hora', value: `$${fmtMoney(summary?.average_hourly_rate)}`, accent: B.teal, icon: DollarSign },
    ];

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Colaboradores" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <HardHat size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Colaboradores
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Alta, edición y configuración del equipo
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors w-full sm:w-auto
                            ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                        `}>
                            <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar colaborador..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full sm:w-56
                                    ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                `}
                            />
                        </div>

                        <div className={`flex items-center p-1 rounded-xl border
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}
                        `}>
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'active', label: 'Activos' },
                                { id: 'inactive', label: 'Inactivos' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatus(tab.id)}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all
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

                        {canCreate && (
                            <Link href={route('collaborators.create')} className="w-full sm:w-auto">
                                <Button
                                    className="w-full text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                                    style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                >
                                    <Plus className="mr-2" size={18} />
                                    Nuevo Colaborador
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {summaryCards.map(({ label, value, accent, icon: Icon }) => (
                        <div
                            key={label}
                            className={`rounded-2xl border p-4 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                        {label}
                                    </p>
                                    <p className={`mt-2 text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                        {value}
                                    </p>
                                </div>
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                    <Icon size={20} style={{ color: accent }} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {items?.total > 0 && (
                    <div className="flex">
                        <div className={`px-3 py-1 rounded-lg text-xs font-bold border inline-block
                            ${isDark ? 'bg-blue-900/20 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-600 border-blue-200'}
                        `}>
                            {items.to} de {items.total} colaboradores
                        </div>
                    </div>
                )}

                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl
                        ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}
                    `}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}
                        `}>
                            <Users size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {search ? 'Sin resultados' : 'No hay colaboradores'}
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {search ? 'Probá con otros términos de búsqueda' : 'Comenzá agregando el primer colaborador al equipo'}
                        </p>
                        {!search && canCreate && (
                            <Link href={route('collaborators.create')}>
                                <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none rounded-xl">
                                    <Plus className="mr-2" size={16} />
                                    Crear Colaborador
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.map((item) => (
                            <div
                                key={item.id}
                                className={`relative flex flex-col rounded-2xl border shadow-sm overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md p-5
                                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60'}
                                `}
                            >
                                {!item.is_active && (
                                    <div className="absolute inset-0 z-10 bg-slate-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 p-4">
                                        <div className="px-2 py-0.5 rounded border border-red-500/40 bg-red-500/20 text-red-500 font-bold text-[10px] tracking-wider">
                                            INACTIVO
                                        </div>
                                        {canEdit && (
                                            <Button
                                                size="sm"
                                                onClick={() => toggleStatus(item)}
                                                style={{ background: `linear-gradient(90deg, ${B.green}, ${B.teal})` }}
                                                className="text-white border-none rounded-lg shadow-lg font-bold text-xs"
                                            >
                                                <Power className="mr-1.5" size={14} />
                                                Activar
                                            </Button>
                                        )}
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg
                                            ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-blue-50 text-blue-600'}
                                        `}>
                                            {item.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <h3 className={`font-bold text-lg leading-tight mb-1
                                                ${isDark ? 'text-slate-200' : 'text-slate-800'}
                                            `}>
                                                {item.name}
                                            </h3>
                                            {item.specialty && (
                                                <div className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.specialty}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {(canEdit || canDelete) && (
                                        <div className="flex gap-2 relative z-20">
                                            {canEdit && (
                                                <Link href={route('collaborators.edit', item.id)}>
                                                    <button className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                        ${isDark ? 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200'}
                                                    `}>
                                                        <Edit size={14} />
                                                    </button>
                                                </Link>
                                            )}
                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                                                    ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-500 hover:bg-red-100'}
                                                `}>
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-2">
                                    {item.document && (
                                        <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            <strong>Doc:</strong> {item.document}
                                        </p>
                                    )}
                                    {item.email && (
                                        <p className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                            <strong>Email:</strong> {item.email}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-auto pt-4 flex items-center justify-between">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>$/Hora:</span>
                                        <span className="text-lg font-extrabold" style={{ color: B.blue }}>
                                            ${Number(item.hourly_rate || 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {(canSeeAttendances || canSeeReceipts) && (
                                    <div className={`mt-4 pt-4 border-t flex flex-wrap gap-2 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                        {canSeeAttendances && (
                                            <Link
                                                href={route('collaborator-attendances.index', { collaborator_id: item.id })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDark ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-600 hover:text-slate-900'}`}
                                            >
                                                Ver asistencias
                                            </Link>
                                        )}
                                        {canSeeReceipts && (
                                            <Link
                                                href={route('collaborator-receipts.index', { collaborator_id: item.id })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${isDark ? 'bg-blue-950/30 text-blue-300 hover:text-white' : 'bg-blue-50 text-blue-600 hover:text-blue-700'}`}
                                            >
                                                Ver recibos
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <Pagination data={items} />
            </div>
        </AuthenticatedLayout>
    );
}

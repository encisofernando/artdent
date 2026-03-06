import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Briefcase, Eye } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import dayjs from "dayjs";

export default function Index({ auth, items, filters }) {
    const { isDark } = useTheme();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [status, setStatus] = useState(filters?.status || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch !== (filters?.search || '') || status !== (filters?.status || 'all')) {
            router.get(
                route('jobs.index'),
                { search: debouncedSearch, status },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    }, [debouncedSearch, status, filters?.search, filters?.status]);

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de que deseas eliminar este trabajo?')) {
            router.delete(route('jobs.destroy', id), { preserveScroll: true });
        }
    };

    const B = { blue: "#397B9C", teal: "#49949C" };

    const StatusBadge = ({ status }) => {
        const colors = {
            'pending': 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            'in_progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            'completed': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'delivered': 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
            'cancelled': 'bg-red-500/10 text-red-500 border-red-500/20',
        };

        const labels = {
            'pending': 'Pendiente',
            'in_progress': 'En Proceso',
            'completed': 'Terminado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado',
        };

        const css = colors[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20';
        const label = labels[status] || status;

        return (
            <span className={`px-2 py-0.5 rounded-md text-xs font-bold border ${css}`}>
                {label.toUpperCase()}
            </span>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Trabajos de Laboratorio" />

            <div className="flex flex-col gap-6 font-sans">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Trabajos
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Gestión de órdenes de laboratorio
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors w-full sm:w-auto
                            ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                        `}>
                            <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar trabajo, odontólogo..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full sm:w-56
                                    ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                `}
                            />
                        </div>

                        <div className={`flex items-center p-1 rounded-xl border overflow-x-auto
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-slate-50 border-slate-200'}
                        `}>
                            {[
                                { id: 'all', label: 'Todos' },
                                { id: 'pending', label: 'Pendientes' },
                                { id: 'in_progress', label: 'En Proceso' },
                                { id: 'completed', label: 'Terminados' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setStatus(tab.id)}
                                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap
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

                        <Link href={route('jobs.create')} className="w-full sm:w-auto">
                            <Button
                                className="w-full text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            >
                                <Plus className="mr-2" size={18} />
                                Nuevo Trabajo
                            </Button>
                        </Link>
                    </div>
                </div>

                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl
                        ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}
                    `}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}
                        `}>
                            <Briefcase size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {search ? 'Sin resultados' : 'No hay trabajos'}
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {search ? 'Probá con otros términos de búsqueda' : 'Registrá órdenes de trabajo para gestionar la producción'}
                        </p>
                        {!search && (
                            <Link href={route('jobs.create')}>
                                <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none rounded-xl">
                                    <Plus className="mr-2" size={16} />
                                    Crear Trabajo
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className={`rounded-2xl border overflow-hidden shadow-sm
                        ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}
                    `}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className={`text-xs uppercase font-bold
                                    ${isDark ? 'bg-slate-800/50 text-slate-400 border-b border-slate-700/60' : 'bg-slate-50 text-slate-500 border-b border-slate-200'}
                                `}>
                                    <tr>
                                        <th className="px-5 py-4">N° Orden</th>
                                        <th className="px-5 py-4">Recepción</th>
                                        <th className="px-5 py-4">Odontólogo</th>
                                        <th className="px-5 py-4">Paciente</th>
                                        <th className="px-5 py-4">Estado</th>
                                        <th className="px-5 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item.id} className={`border-b transition-colors
                                            ${isDark ? 'border-slate-800 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50/50'}
                                        `}>
                                            <td className="px-5 py-4">
                                                <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {item.job_number}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-medium">
                                                {item.received_at ? dayjs(item.received_at).format('DD/MM/YYYY') : '-'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                        {item.dentist?.name} {item.dentist?.last_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {item.patient ? (
                                                    <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                        {item.patient.name} {item.patient.last_name}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={item.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={route('jobs.show', item.id)}>
                                                        <button className={`p-2 rounded-lg transition-colors
                                                            ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
                                                        `}>
                                                            <Eye size={16} />
                                                        </button>
                                                    </Link>
                                                    <Link href={route('jobs.edit', item.id)}>
                                                        <button className={`p-2 rounded-lg transition-colors
                                                            ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}
                                                        `}>
                                                            <Edit size={16} />
                                                        </button>
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(item.id)}
                                                        className={`p-2 rounded-lg transition-colors
                                                        ${isDark ? 'text-red-400 hover:bg-red-900/40' : 'text-red-500 hover:bg-red-50'}
                                                    `}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {items?.links && items.links.length > 3 && (
                    <div className="flex justify-center mt-4">
                        <div className={`flex gap-1 p-1 rounded-xl border
                            ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}
                        `}>
                            {items.links.map((link, i) => {
                                if (!link.url && !link.active) {
                                    return (
                                        <span key={i} className={`px-3 py-1.5 rounded-lg text-sm
                                            ${isDark ? 'text-slate-600' : 'text-slate-400'}
                                        `} dangerouslySetInnerHTML={{ __html: link.label }} />
                                    );
                                }
                                return (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        preserveScroll
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                                            ${link.active
                                                ? (isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                                                : (isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100')
                                            }
                                        `}
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

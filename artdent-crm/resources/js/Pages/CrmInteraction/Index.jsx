import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';

const B = { blue: "#397B9C", teal: "#49949C" };

const TYPE_LABELS = {
    llamada: 'Llamada',
    email: 'Email',
    whatsapp: 'WhatsApp',
    visita: 'Visita',
    reunion: 'Reunión',
    otro: 'Otro',
};

const TYPE_COLORS = {
    llamada: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    email: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    whatsapp: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    visita: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    reunion: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    otro: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function Index({ auth, items, dentists, filters }) {
    const { isDark } = useTheme();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [type, setType] = useState(filters?.type || 'all');
    const [dentistId, setDentistId] = useState(filters?.dentist_id || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        router.get(
            route('crm-interactions.index'),
            { search: debouncedSearch, type: type !== 'all' ? type : '', dentist_id: dentistId !== 'all' ? dentistId : '' },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }, [debouncedSearch, type, dentistId]);

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta interacción?')) {
            router.delete(route('crm-interactions.destroy', id), { preserveScroll: true });
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Interacciones CRM" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Interacciones CRM
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registro de llamadas, visitas, emails y reuniones
                        </p>
                    </div>

                    <Link href={route('crm-interactions.create')} className="w-full sm:w-auto">
                        <Button
                            className="w-full text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            <Plus className="mr-2" size={18} />
                            Nueva Interacción
                        </Button>
                    </Link>
                </div>

                {/* Filter Bar */}
                <div className={`flex flex-col sm:flex-row gap-3 p-4 rounded-2xl border
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors flex-1
                        ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                    `}>
                        <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        <input
                            type="text"
                            placeholder="Buscar por asunto, resultado..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full
                                ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                            `}
                        />
                    </div>

                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm transition-colors outline-none
                            ${isDark ? 'bg-slate-900 border-slate-700/60 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}
                        `}
                    >
                        <option value="all">Todos los tipos</option>
                        <option value="llamada">Llamada</option>
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="visita">Visita</option>
                        <option value="reunion">Reunión</option>
                        <option value="otro">Otro</option>
                    </select>

                    <select
                        value={dentistId}
                        onChange={(e) => setDentistId(e.target.value)}
                        className={`px-3 py-2 rounded-xl border text-sm transition-colors outline-none
                            ${isDark ? 'bg-slate-900 border-slate-700/60 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}
                        `}
                    >
                        <option value="all">Todos los odontólogos</option>
                        {dentists?.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl
                        ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}
                    `}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}
                        `}>
                            <MessageSquare size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            No hay interacciones
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registrá llamadas, visitas y reuniones con tus odontólogos
                        </p>
                        <Link href={route('crm-interactions.create')}>
                            <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none rounded-xl">
                                <Plus className="mr-2" size={16} />
                                Nueva Interacción
                            </Button>
                        </Link>
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
                                        <th className="px-5 py-4">Fecha</th>
                                        <th className="px-5 py-4">Tipo</th>
                                        <th className="px-5 py-4">Dirección</th>
                                        <th className="px-5 py-4">Odontólogo / Cliente</th>
                                        <th className="px-5 py-4">Asunto</th>
                                        <th className="px-5 py-4">Resultado</th>
                                        <th className="px-5 py-4">Responsable</th>
                                        <th className="px-5 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        <tr key={item.id} className={`border-b transition-colors
                                            ${isDark ? 'border-slate-800 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50/50'}
                                        `}>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {item.interaction_at ? new Date(item.interaction_at).toLocaleDateString('es-AR') : '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${TYPE_COLORS[item.type] || TYPE_COLORS.otro}`}>
                                                    {TYPE_LABELS[item.type] || item.type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {item.direction === 'inbound' ? (
                                                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                                        Entrante
                                                    </span>
                                                ) : (
                                                    <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                                        Saliente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {item.dentist?.name || item.crm_client?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    {item.subject || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.outcome || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.user?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={route('crm-interactions.edit', item.id)}>
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

                {/* Pagination */}
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

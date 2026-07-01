import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Truck } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: "#397B9C", teal: "#49949C" };

const DAY_LABELS = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
};

export default function Index({ auth, items, dentists, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();

    const [dentistId, setDentistId] = useState(filters?.dentist_id || 'all');
    const [deliveryDay, setDeliveryDay] = useState(filters?.delivery_day || 'all');
    const [activeOnly, setActiveOnly] = useState(filters?.active_only === '1' || filters?.active_only === true || false);

    useEffect(() => {
        router.get(
            route('dentist-delivery-routes.index'),
            {
                dentist_id: dentistId !== 'all' ? dentistId : '',
                delivery_day: deliveryDay !== 'all' ? deliveryDay : '',
                active_only: activeOnly ? '1' : ''
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }, [dentistId, deliveryDay, activeOnly]);

    const handleDelete = (id) => {
        confirmDialog('¿Estás seguro de que deseas eliminar esta ruta?', () =>
            router.delete(route('dentist-delivery-routes.destroy', id), { preserveScroll: true })
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Rutas de Entrega" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Truck size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Rutas de Entrega
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Organización de rutas y días de entrega por odontólogo
                            </p>
                        </div>
                    </div>

                    <Link href={route('dentist-delivery-routes.create')} className="w-full sm:w-auto">
                        <Button
                            className="w-full text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            <Plus className="mr-2" size={18} />
                            Nueva Ruta
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className={`flex flex-col sm:flex-row gap-3 p-4 rounded-2xl border
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <SearchableSelect
                        value={dentistId}
                        onChange={v => setDentistId(v)}
                        options={[
                            { value: 'all', label: 'Todos los odontólogos' },
                            ...(dentists || []).map(d => ({ value: String(d.id), label: d.name })),
                        ]}
                    />

                    <SearchableSelect
                        value={deliveryDay}
                        onChange={v => setDeliveryDay(v)}
                        options={[
                            { value: 'all', label: 'Todos los días' },
                            ...Object.entries(DAY_LABELS).map(([val, label]) => ({ value: val, label })),
                        ]}
                    />

                    <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors
                        ${isDark ? 'bg-slate-900 border-slate-700/60 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}
                    `}>
                        <input
                            type="checkbox"
                            checked={activeOnly}
                            onChange={e => setActiveOnly(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm font-medium">Solo activas</span>
                    </label>
                </div>

                {/* Content */}
                {items?.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl
                        ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}
                    `}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}
                        `}>
                            <Truck size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            No hay rutas de entrega
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Configurá las rutas de entrega para tus odontólogos
                        </p>
                        <Link href={route('dentist-delivery-routes.create')}>
                            <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none rounded-xl">
                                <Plus className="mr-2" size={16} />
                                Nueva Ruta
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {Object.entries(
                            (items || []).reduce((acc, item) => {
                                const day = item.delivery_day || 0;
                                if (!acc[day]) acc[day] = [];
                                acc[day].push(item);
                                return acc;
                            }, {})
                        ).sort(([a], [b]) => Number(a) - Number(b)).map(([day, routes]) => (
                            <div key={day}>
                                <h3 className={`text-sm font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {DAY_LABELS[day] || 'Sin día asignado'}
                                </h3>
                                {/* Mobile cards */}
                                <div className="sm:hidden flex flex-col gap-2">
                                    {routes.sort((a, b) => (a.delivery_order || 0) - (b.delivery_order || 0)).map((item) => (
                                        <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                            <div style={{ height: 3, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                                            <div className="p-4">
                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div className="min-w-0 flex-1">
                                                        <p className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                                            <span className={`mr-2 text-xs font-extrabold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>#{item.delivery_order || '?'}</span>
                                                            {item.dentist?.name || '-'}
                                                        </p>
                                                        <p className={`text-xs mt-0.5 truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.route_name || item.address || '—'}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        {item.is_active ? (
                                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Activa</span>
                                                        ) : (
                                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Inactiva</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.contact_name || item.contact_phone || item.address || '—'}</span>
                                                    <div className="flex gap-1">
                                                        <Link href={route('dentist-delivery-routes.edit', item.id)}>
                                                            <button className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`}><Edit size={14} /></button>
                                                        </Link>
                                                        <button onClick={() => handleDelete(item.id)} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/40' : 'text-red-500 hover:bg-red-50'}`}><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop table */}
                                <div className={`hidden sm:block rounded-2xl border overflow-hidden shadow-sm
                                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}
                                `}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className={`text-xs uppercase font-bold
                                                ${isDark ? 'bg-slate-800/50 text-slate-400 border-b border-slate-700/60' : 'bg-slate-50 text-slate-500 border-b border-slate-200'}
                                            `}>
                                                <tr>
                                                    <th className="px-5 py-3">Orden</th>
                                                    <th className="px-5 py-3">Odontólogo</th>
                                                    <th className="px-5 py-3">Nombre Ruta</th>
                                                    <th className="px-5 py-3">Dirección</th>
                                                    <th className="px-5 py-3">Contacto</th>
                                                    <th className="px-5 py-3">Teléfono</th>
                                                    <th className="px-5 py-3">Estado</th>
                                                    <th className="px-5 py-3 text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {routes.sort((a, b) => (a.delivery_order || 0) - (b.delivery_order || 0)).map((item) => (
                                                    <tr key={item.id} className={`border-b transition-colors ${isDark ? 'border-slate-800 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50/50'}`}>
                                                        <td className="px-5 py-4"><span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{item.delivery_order || '-'}</span></td>
                                                        <td className="px-5 py-4"><span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.dentist?.name || '-'}</span></td>
                                                        <td className="px-5 py-4"><span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{item.route_name || '-'}</span></td>
                                                        <td className="px-5 py-4"><span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.address || '-'}</span></td>
                                                        <td className="px-5 py-4"><span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.contact_name || '-'}</span></td>
                                                        <td className="px-5 py-4"><span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.contact_phone || '-'}</span></td>
                                                        <td className="px-5 py-4">
                                                            {item.is_active ? (
                                                                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">Activa</span>
                                                            ) : (
                                                                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">Inactiva</span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex gap-2 justify-end">
                                                                <Link href={route('dentist-delivery-routes.edit', item.id)}>
                                                                    <button className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}><Edit size={16} /></button>
                                                                </Link>
                                                                <button onClick={() => handleDelete(item.id)} className={`p-2 rounded-lg transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/40' : 'text-red-500 hover:bg-red-50'}`}><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

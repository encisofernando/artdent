import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, RefreshCcw } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const B = { blue: "#397B9C", teal: "#49949C" };

const RESPONSIBILITY_LABELS = {
    lab: 'Laboratorio',
    dentist: 'Odontólogo',
    patient: 'Paciente',
    material: 'Material',
    unknown: 'Desconocido',
};

const RESPONSIBILITY_COLORS = {
    lab: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    dentist: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    patient: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    material: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    unknown: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export default function Index({ auth, items, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [responsibility, setResponsibility] = useState(filters?.responsibility || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        router.get(
            route('job-remakes.index'),
            { search: debouncedSearch, responsibility: responsibility !== 'all' ? responsibility : '' },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }, [debouncedSearch, responsibility]);

    const handleDelete = (id) => {
        confirmDialog('¿Estás seguro de que deseas eliminar este rehacimiento?', () =>
            router.delete(route('job-remakes.destroy', id), { preserveScroll: true })
        );
    };

    const formatCurrency = (amount) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Rehacimientos" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Rehacimientos
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registro de trabajos que requirieron rehacer
                        </p>
                    </div>

                    <Link href={route('job-remakes.create')} className="w-full sm:w-auto">
                        <Button
                            className="w-full text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            <Plus className="mr-2" size={18} />
                            Nuevo Rehacimiento
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className={`flex flex-col sm:flex-row gap-3 p-4 rounded-2xl border
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors flex-1
                        ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                    `}>
                        <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        <input
                            type="text"
                            placeholder="Buscar por trabajo, motivo..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full
                                ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                            `}
                        />
                    </div>

                    <SearchableSelect
                        value={responsibility}
                        onChange={v => setResponsibility(v)}
                        options={[
                            { value: 'all', label: 'Todos los responsables' },
                            { value: 'lab', label: 'Laboratorio' },
                            { value: 'dentist', label: 'Odontólogo' },
                            { value: 'patient', label: 'Paciente' },
                            { value: 'material', label: 'Material' },
                            { value: 'unknown', label: 'Desconocido' },
                        ]}
                    />
                </div>

                {/* Table */}
                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl
                        ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}
                    `}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}
                        `}>
                            <RefreshCcw size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            No hay rehacimientos
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {search || responsibility !== 'all' ? 'Probá con otros filtros' : 'Registrá los trabajos que necesitaron rehacerse'}
                        </p>
                        {(!search && responsibility === 'all') && (
                            <Link href={route('job-remakes.create')}>
                                <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none rounded-xl">
                                    <Plus className="mr-2" size={16} />
                                    Nuevo Rehacimiento
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
                                        <th className="px-5 py-4">Fecha</th>
                                        <th className="px-5 py-4">Trabajo</th>
                                        <th className="px-5 py-4">Trabajo Original</th>
                                        <th className="px-5 py-4">Odontólogo</th>
                                        <th className="px-5 py-4">Responsabilidad</th>
                                        <th className="px-5 py-4">Motivo</th>
                                        <th className="px-5 py-4">Costo Mat.</th>
                                        <th className="px-5 py-4">Costo Lab.</th>
                                        <th className="px-5 py-4">Cargado a</th>
                                        <th className="px-5 py-4">Registrado por</th>
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
                                                    {item.created_at ? new Date(item.created_at).toLocaleDateString('es-AR') : '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {item.job?.job_number || item.job_id}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                    {item.original_job?.job_number || item.original_job_id || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {item.job?.dentist?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${RESPONSIBILITY_COLORS[item.responsibility] || RESPONSIBILITY_COLORS.unknown}`}>
                                                    {RESPONSIBILITY_LABELS[item.responsibility] || item.responsibility}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.reason_category || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {formatCurrency(item.material_cost)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                                    {formatCurrency(item.labor_cost)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.charged_to || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {item.user?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex gap-2 justify-end">
                                                    <Link href={route('job-remakes.edit', item.id)}>
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

                <Pagination data={items} />
            </div>
        </AuthenticatedLayout>
    );
}

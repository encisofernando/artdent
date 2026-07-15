import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Edit, Trash2, Banknote, List, CircleDollarSign, FileDown, NotebookText, X, Save } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const TOKEN_PATTERN = /\{\{\s*arancel:\s*([^}]+?)\s*\}\}/gi;

function resolveNotesPreview(text, priceMap) {
    if (!text) return '';
    return text.replace(TOKEN_PATTERN, (match, name) => {
        const key = name.trim().toLowerCase();
        const price = priceMap?.[key];
        if (price === undefined) return match;
        return price > 0
            ? '$' + Number(price).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : 'Consultar precio';
    });
}

function NotesModal({ open, onClose, initialNotes, priceMap, isDark }) {
    const [text, setText] = useState(initialNotes || '');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) setText(initialNotes || '');
    }, [open, initialNotes]);

    if (!open) return null;

    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm font-mono transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;

    const handleSave = () => {
        setProcessing(true);
        router.put(route('tariffs.notes.update'), { tariff_notes: text }, {
            preserveScroll: true,
            onSuccess: () => { setProcessing(false); onClose(); },
            onError: () => setProcessing(false),
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-slate-100'}`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-extrabold text-lg ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Importante Leer (PDF del Arancel)</h3>
                    <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-400 hover:bg-slate-100'}`}>
                        <X size={15} />
                    </button>
                </div>
                <p className={`text-xs mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Este texto aparece en la última página del PDF del arancel. Para insertar un precio que se actualice
                    solo cuando cambies el arancel, escribí <code className={`px-1 rounded ${isDark ? 'bg-slate-800 text-teal-400' : 'bg-slate-100 text-teal-700'}`}>{'{{arancel:Nombre exacto del arancel}}'}</code>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Texto (editable)</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows={16}
                            className={inputCls}
                        />
                    </div>
                    <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Vista previa (como sale en el PDF)</label>
                        <div className={`h-full rounded-xl border px-3 py-2 text-sm whitespace-pre-line ${isDark ? 'bg-slate-800/30 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`} style={{ minHeight: '24rem' }}>
                            {resolveNotesPreview(text, priceMap) || <span className="opacity-50">Sin contenido todavía.</span>}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-5">
                    <button type="button" onClick={onClose}
                        className={`px-4 py-2 rounded-xl text-sm font-bold ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        Cancelar
                    </button>
                    <button type="button" onClick={handleSave} disabled={processing}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white flex items-center gap-2 disabled:opacity-50"
                        style={{ background: 'linear-gradient(90deg, #397B9C, #49949C)' }}>
                        <Save size={15} />
                        {processing ? 'Guardando...' : 'Guardar'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Index({ auth, items, categories, filters, tariffNotes, tariffPriceMap }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];

    const [search, setSearch] = useState(filters?.search || '');
    const [category, setCategory] = useState(filters?.category || 'all');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (debouncedSearch !== (filters?.search || '') || category !== (filters?.category || 'all')) {
            router.get(
                route('tariffs.index'),
                { search: debouncedSearch, category: category },
                { preserveState: true, preserveScroll: true, replace: true }
            );
        }
    }, [debouncedSearch, category, filters]);

    const handleDelete = (id) => {
        confirmDialog('¿Estás seguro de que deseas eliminar este arancel?', () => {
            router.delete(route('tariffs.destroy', id), { preserveScroll: true });
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const lowerPriceMap = Object.fromEntries(
        Object.entries(tariffPriceMap || {}).map(([name, price]) => [name.toLowerCase(), price])
    );

    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Aranceles (Lista de Precios)" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <CircleDollarSign size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Aranceles Base
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Catálogo de trabajos de laboratorio y sus precios predeterminados
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
                        <SearchableSelect
                            value={category}
                            onChange={v => setCategory(v)}
                            options={[
                                { value: 'all', label: 'Todas las Categorías' },
                                ...(categories || []).map(cat => ({ value: cat, label: cat })),
                            ]}
                        />

                        <div className={`flex items-center px-3 py-2 rounded-xl border transition-colors w-full sm:w-auto
                            ${isDark ? 'bg-slate-900 border-slate-700/60 focus-within:border-slate-500' : 'bg-white border-slate-200 focus-within:border-slate-400'}
                        `}>
                            <Search size={18} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input
                                type="text"
                                placeholder="Buscar arancel..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full sm:w-64
                                    ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}
                                `}
                            />
                        </div>

                        <div className="w-full sm:w-auto sm:shrink-0">
                            <Button
                                type="button"
                                onClick={() => setNotesModalOpen(true)}
                                variant="outline"
                                className={`w-full whitespace-nowrap rounded-xl ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}`}
                            >
                                <NotebookText className="mr-2 shrink-0" size={16} />
                                Importante Leer
                            </Button>
                        </div>

                        <a href={route('tariffs.pdf')} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto sm:shrink-0">
                            <Button variant="outline" className={`w-full whitespace-nowrap rounded-xl ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}`}>
                                <FileDown className="mr-2 shrink-0" size={16} />
                                Descargar Arancel PDF
                            </Button>
                        </a>

                        <Link href={route('tariffs.create')} className="w-full sm:w-auto sm:shrink-0">
                            <Button
                                className="w-full whitespace-nowrap text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            >
                                <Plus className="mr-2 shrink-0" size={18} />
                                Nuevo Arancel
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Table Section */}
                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl
                        ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}
                    `}>
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            ${isDark ? 'bg-slate-800' : 'bg-white shadow-sm border border-slate-100'}
                        `}>
                            <Banknote size={32} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        </div>
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {search || category !== 'all' ? 'Sin resultados' : 'Lista vacía'}
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {search || category !== 'all' ? 'Probá con otros filtros de búsqueda' : 'Registrá los trabajos de laboratorio para usarlos en las órdenes de trabajo.'}
                        </p>
                        {(!search && category === 'all') && (
                            <Link href={route('tariffs.create')}>
                                <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none rounded-xl">
                                    <Plus className="mr-2" size={16} />
                                    Crear Arancel
                                </Button>
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Mobile cards */}
                        <div className="sm:hidden flex flex-col gap-3">
                            {data.map((item) => (
                                <div key={item.id} className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200 shadow-sm'}`}>
                                    <div style={{ height: 3, background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} />
                                    <div className="p-4">
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div className="min-w-0">
                                                <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</p>
                                                {item.code && (
                                                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cod: {item.code}</p>
                                                )}
                                            </div>
                                            <span className={`text-lg font-extrabold shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                                {formatCurrency(item.price)}
                                            </span>
                                        </div>
                                        <div className={`flex items-center justify-between pt-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <div className="flex items-center gap-2">
                                                {item.category ? (
                                                    <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-lg
                                                        ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}
                                                    `}>
                                                        <List size={12} />
                                                        {item.category}
                                                    </span>
                                                ) : (
                                                    <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin categoría</span>
                                                )}
                                                <span className={`px-2 py-1 text-[11px] font-bold rounded-lg
                                                    ${item.is_active
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
                                                `}>
                                                    {item.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Link href={route('tariffs.edit', item.id)}>
                                                    <button className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}>
                                                        <Edit size={15} />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className={`p-2 rounded-lg transition-colors ${isDark ? 'text-red-400 hover:bg-red-900/40' : 'text-red-500 hover:bg-red-50'}`}
                                                >
                                                    <Trash2 size={15} />
                                                </button>
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
                                            <th className="px-5 py-4">Descripción / Trabajo</th>
                                            <th className="px-5 py-4">Categoría</th>
                                            <th className="px-5 py-4 text-right">Precio Base</th>
                                            <th className="px-5 py-4 text-center">Estado</th>
                                            <th className="px-5 py-4 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item) => (
                                            <tr key={item.id} className={`border-b transition-colors
                                                ${isDark ? 'border-slate-800 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50/50'}
                                            `}>
                                                <td className="px-5 py-4">
                                                    <div className="flex flex-col">
                                                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                            {item.name}
                                                        </span>
                                                        {item.code && (
                                                            <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                                Cod: {item.code}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {item.category ? (
                                                        <span className={`flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-lg w-fit
                                                            ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}
                                                        `}>
                                                            <List size={14} />
                                                            {item.category}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-500">-</span>
                                                    )}
                                                </td>
                                                <td className={`px-5 py-4 text-right font-bold
                                                    ${isDark ? 'text-emerald-400' : 'text-emerald-700'}
                                                `}>
                                                    {formatCurrency(item.price)}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className={`px-2 py-1 text-[11px] font-bold rounded-lg
                                                        ${item.is_active
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}
                                                    `}>
                                                        {item.is_active ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex gap-2 justify-end">
                                                        <Link href={route('tariffs.edit', item.id)}>
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
                    </>
                )}

                <Pagination data={items} />
            </div>

            <NotesModal
                open={notesModalOpen}
                onClose={() => setNotesModalOpen(false)}
                initialNotes={tariffNotes}
                priceMap={lowerPriceMap}
                isDark={isDark}
            />
        </AuthenticatedLayout>
    );
}

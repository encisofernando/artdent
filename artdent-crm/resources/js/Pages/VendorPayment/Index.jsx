import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Plus, Trash2, CreditCard } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

export default function Index({ auth, items, vendors, filters }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const data = items?.data || [];
    const B = { blue: '#397B9C', teal: '#49949C' };

    const [search, setSearch] = useState(filters?.search || '');
    const [vendorId, setVendorId] = useState(filters?.vendor_id || '');
    const [debouncedSearch, setDebouncedSearch] = useState(search);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        router.get(
            route('proveedores.pagos.index'),
            { search: debouncedSearch, vendor_id: vendorId },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    }, [debouncedSearch, vendorId]);

    const handleDelete = (id) => {
        confirmDialog('¿Eliminar este pago? Se revertirá el movimiento en la cuenta corriente.', () => {
            router.delete(route('proveedores.pagos.destroy', id), { preserveScroll: true });
        });
    };

    const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);
    const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

    const totalPagado = data.reduce((s, i) => s + parseFloat(i.amount || 0), 0);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pagos a Proveedores" />

            <div className="flex flex-col gap-6 font-sans">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Pagos a Proveedores
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registro de pagos y cancelaciones de deuda
                        </p>
                    </div>
                    <Link href={route('proveedores.pagos.create')}>
                        <Button
                            className="text-white border-none shadow-md hover:shadow-lg transition-all rounded-xl"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                        >
                            <Plus className="mr-2" size={18} />
                            Registrar Pago
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <div className={`flex flex-wrap gap-3 p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                    <div className={`flex items-center px-3 py-2 rounded-xl border flex-1 min-w-48 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <Search size={16} className="text-slate-400 shrink-0" />
                        <input
                            type="text"
                            placeholder="Buscar pago..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className={`ml-2 bg-transparent border-none focus:ring-0 p-0 text-sm outline-none w-full ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
                        />
                    </div>
                    <SearchableSelect
                        value={vendorId}
                        onChange={v => setVendorId(v)}
                        options={vendors.map(v => ({ value: String(v.id), label: v.name }))}
                        placeholder="Todos los proveedores"
                    />
                </div>

                {/* Summary */}
                {data.length > 0 && (
                    <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                        <CreditCard size={20} style={{ color: B.teal }} />
                        <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Total en esta página:
                        </span>
                        <span className={`text-lg font-extrabold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {fmt(totalPagado)}
                        </span>
                    </div>
                )}

                {/* Table */}
                {data.length === 0 ? (
                    <div className={`flex flex-col items-center justify-center p-12 text-center border rounded-2xl ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <CreditCard size={40} className={`mb-4 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Sin pagos registrados</h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Registrá el primer pago a un proveedor
                        </p>
                        <Link href={route('proveedores.pagos.create')}>
                            <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none rounded-xl">
                                <Plus className="mr-2" size={16} /> Registrar Pago
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                        <th className="px-4 py-3 text-left">Fecha</th>
                                        <th className="px-4 py-3 text-left">Proveedor</th>
                                        <th className="px-4 py-3 text-left">Método</th>
                                        <th className="px-4 py-3 text-left">Referencia</th>
                                        <th className="px-4 py-3 text-left">Usuario</th>
                                        <th className="px-4 py-3 text-right">Monto</th>
                                        <th className="px-4 py-3 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {data.map(item => (
                                        <tr key={item.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                {fmtDate(item.payment_date)}
                                            </td>
                                            <td className={`px-4 py-3 font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {item.vendor?.name ?? '—'}
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {item.payment_method?.name ?? '—'}
                                            </td>
                                            <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {item.reference_no || '—'}
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                {item.user?.name ?? '—'}
                                            </td>
                                            <td className={`px-4 py-3 text-right font-bold text-emerald-500`}>
                                                {fmt(item.amount)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}
                                                    >
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
                )}

                {/* Pagination */}
                {items?.links && items.links.length > 3 && (
                    <div className="flex justify-center mt-2">
                        <div className={`flex gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`}>
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

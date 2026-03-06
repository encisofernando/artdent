import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Edit, Printer, FileText } from 'lucide-react';
import dayjs from "dayjs";

export default function Show({ auth, item }) {
    const { isDark } = useTheme();

    const B = { blue: "#397B9C", teal: "#49949C" };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount || 0);
    };

    const StatusBadge = ({ status }) => {
        const colors = {
            'draft': 'bg-slate-500/10 text-slate-500 border-slate-500/20',
            'issued': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
            'paid': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
            'cancelled': 'bg-red-500/10 text-red-500 border-red-500/20',
        };

        const labels = {
            'draft': 'Borrador',
            'issued': 'Emitida',
            'paid': 'Pagada',
            'cancelled': 'Anulada',
        };

        const css = colors[status] || colors['draft'];
        const label = labels[status] || status;

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-bold border ${css}`}>
                {label.toUpperCase()}
            </span>
        );
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Factura ${item.number || ''}`} />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight flex items-center gap-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Factura {item.invoice_type?.code} {String(item.point_sale || 0).padStart(4, '0')}-{String(item.number || 0).padStart(8, '0')}
                            <StatusBadge status={item.status} />
                        </h1>
                        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Emitida el {item.issued_at ? dayjs(item.issued_at).format('DD/MM/YYYY') : '-'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('invoices.index')}>
                            <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" : ""}>
                                <ArrowLeft className="mr-2" size={16} /> Volver
                            </Button>
                        </Link>
                        <Button variant="outline" className={isDark ? "bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" : ""}>
                            <Printer className="mr-2" size={16} /> Imprimir
                        </Button>
                        <Link href={route('invoices.edit', item.id)}>
                            <Button style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none shadow-md">
                                <Edit className="mr-2" size={16} /> Editar
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className={`rounded-2xl border overflow-hidden shadow-sm
                    ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}
                `}>
                    <div className="grid grid-cols-1 md:grid-cols-2 p-8 gap-8">
                        <div>
                            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Datos del Receptor
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <div className={`font-bold text-lg ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                        {item.recipient_name}
                                    </div>
                                </div>
                                <div>
                                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>CUIT / DNI</div>
                                    <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {item.recipient_cuit || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Condición IVA</div>
                                    <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {item.recipient_iva || '-'}
                                    </div>
                                </div>
                                <div>
                                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Dirección</div>
                                    <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        {item.recipient_address || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Detalles del Comprobante
                            </h3>
                            <div className={`rounded-xl p-5 border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Subtotal</div>
                                        <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {formatCurrency(item.subtotal)}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Impuestos</div>
                                        <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {formatCurrency(item.tax_amount)}
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Descuentos</div>
                                        <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            -{formatCurrency(item.discount)}
                                        </div>
                                    </div>
                                    <div className={`pt-3 mt-3 border-t flex justify-between items-center
                                        ${isDark ? 'border-slate-700' : 'border-slate-200'}
                                    `}>
                                        <div className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>TOTAL</div>
                                        <div className="text-2xl font-extrabold" style={{ color: B.teal }}>
                                            {formatCurrency(item.total)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {(item.cae || item.notes) && (
                        <div className={`p-8 border-t ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            {item.cae && (
                                <div className="mb-4">
                                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        AFIP
                                    </h3>
                                    <div className={`flex gap-6 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                        <div><strong>CAE:</strong> {item.cae}</div>
                                        <div><strong>Vto. CAE:</strong> {item.cae_expiry ? dayjs(item.cae_expiry).format('DD/MM/YYYY') : '-'}</div>
                                    </div>
                                </div>
                            )}

                            {item.notes && (
                                <div>
                                    <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Notas Adicionales
                                    </h3>
                                    <p className={`text-sm whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {item.notes}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

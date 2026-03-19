import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, FileText, Package, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

const STATUS_MAP = {
    pending: { label: 'Pendiente', icon: Clock, color: 'yellow' },
    received: { label: 'Recibido', icon: CheckCircle, color: 'green' },
    partial: { label: 'Parcial', icon: AlertCircle, color: 'blue' },
    cancelled: { label: 'Cancelado', icon: XCircle, color: 'red' },
};

function StatusBadge({ status, isDark }) {
    const cfg = STATUS_MAP[status] ?? STATUS_MAP.pending;
    const Icon = cfg.icon;
    const colors = {
        yellow: isDark ? 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
        green: isDark ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        blue: isDark ? 'bg-blue-900/30 text-blue-400 border-blue-800/50' : 'bg-blue-50 text-blue-700 border-blue-200',
        red: isDark ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-red-50 text-red-700 border-red-200',
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold border ${colors[cfg.color]}`}>
            <Icon size={14} />
            {cfg.label}
        </span>
    );
}

export default function Show({ auth, purchase }) {
    const { isDark } = useTheme();
    const B = { blue: '#397B9C', teal: '#49949C' };

    const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);
    const fmtDate = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('es-AR') : '—';

    const card = `rounded-2xl border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const labelCls = `text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`;
    const valueCls = `text-sm font-medium mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Comprobante #${purchase.id}`} />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            {purchase.invoice_type && purchase.invoice_number
                                ? `${purchase.invoice_type} ${purchase.invoice_number}`
                                : `Comprobante #${purchase.id}`}
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {purchase.vendor?.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={purchase.status} isDark={isDark} />
                        <Link href={route('proveedores.comprobantes.index')}>
                            <Button variant="outline" className={isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                                <ArrowLeft className="mr-2" size={16} /> Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Info general */}
                <div className={card}>
                    <div className={`flex items-center gap-2 mb-5 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <FileText size={18} style={{ color: B.teal }} />
                        <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            Información del Comprobante
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        <div>
                            <p className={labelCls}>Proveedor</p>
                            <p className={valueCls}>{purchase.vendor?.name ?? '—'}</p>
                        </div>
                        <div>
                            <p className={labelCls}>Fecha</p>
                            <p className={valueCls}>{fmtDate(purchase.purchased_at)}</p>
                        </div>
                        <div>
                            <p className={labelCls}>Vencimiento</p>
                            <p className={valueCls}>{fmtDate(purchase.due_date)}</p>
                        </div>
                        <div>
                            <p className={labelCls}>Depósito</p>
                            <p className={valueCls}>{purchase.warehouse?.name ?? '—'}</p>
                        </div>
                        {purchase.reference_no && (
                            <div>
                                <p className={labelCls}>Referencia</p>
                                <p className={valueCls}>{purchase.reference_no}</p>
                            </div>
                        )}
                        <div>
                            <p className={labelCls}>Registrado por</p>
                            <p className={valueCls}>{purchase.user?.name ?? '—'}</p>
                        </div>
                        {purchase.notes && (
                            <div className="col-span-2 md:col-span-4">
                                <p className={labelCls}>Notas</p>
                                <p className={valueCls}>{purchase.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ítems */}
                <div className={card}>
                    <div className={`flex items-center gap-2 mb-5 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <Package size={18} style={{ color: B.teal }} />
                        <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            Artículos ({purchase.purchase_items?.length ?? 0})
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                                    <th className="pb-3 text-left">Producto</th>
                                    <th className="pb-3 text-right">Cantidad</th>
                                    <th className="pb-3 text-right">Costo Unit.</th>
                                    <th className="pb-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-50'}`}>
                                {purchase.purchase_items?.map(item => (
                                    <tr key={item.id}>
                                        <td className={`py-3 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                            <p className="font-medium">{item.product?.name ?? '—'}</p>
                                            {item.product?.sku && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{item.product.sku}</p>}
                                        </td>
                                        <td className={`py-3 text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {parseFloat(item.quantity)}
                                        </td>
                                        <td className={`py-3 text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                            {fmt(item.unit_cost)}
                                        </td>
                                        <td className={`py-3 text-right font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                            {fmt(item.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totales */}
                    <div className={`mt-4 flex flex-col items-end gap-2 pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div className={`flex gap-8 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            <span>Subtotal: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{fmt(purchase.subtotal)}</strong></span>
                            <span>IVA/Impuestos: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{fmt(purchase.tax_amount)}</strong></span>
                        </div>
                        <div className={`text-2xl font-extrabold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Total: {fmt(purchase.total)}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

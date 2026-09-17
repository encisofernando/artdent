import { useState } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    CircleDollarSign,
    Plus,
    ArrowLeftRight,
    QrCode,
    Banknote,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Filter,
    FileCheck,
    Receipt,
} from 'lucide-react';
import ManualPaymentModal from '@/Components/Payments/ManualPaymentModal';
import InvoiceVoucherModal from '@/Components/Invoices/InvoiceVoucherModal';
import ManualInvoiceModal from '@/Components/Invoices/ManualInvoiceModal';

const METHOD_BADGES = {
    transfer: { label: 'Transferencia', color: 'primary', icon: ArrowLeftRight },
    qr: { label: 'Pago QR', color: 'secondary', icon: QrCode },
    cash: { label: 'Efectivo', color: 'success', icon: Banknote },
    mercadopago: { label: 'MercadoPago', color: 'info', icon: CircleDollarSign },
    other: { label: 'Otro', color: 'gray', icon: Receipt },
};

export default function Index({ payments, filters, metrics, methods, tenants, plans, issuerConfigured, issuer }) {
    const { isDark } = useTheme();

    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
    const [isVoucherOpen, setIsVoucherOpen] = useState(false);
    const [paymentToInvoice, setPaymentToInvoice] = useState(null);
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

    const [search, setSearch] = useState(filters.search || '');
    const [method, setMethod] = useState(filters.payment_method || '');
    const [invoiced, setInvoiced] = useState(filters.invoiced || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const cls = `rounded-lg border px-3.5 py-2 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 text-white focus:border-brand-cyan' : 'bg-white border-brand-aqua text-slate-900 focus:border-brand-cyan'
    }`;

    const applyFilters = (newFilters = {}) => {
        const query = {
            search: search || undefined,
            payment_method: method || undefined,
            invoiced: invoiced || undefined,
            date_from: dateFrom || undefined,
            date_to: dateTo || undefined,
            ...newFilters,
        };
        router.get('/payments', query, { preserveState: true, replace: true });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        applyFilters();
    };

    const openVoucher = (invoiceId) => {
        setSelectedInvoiceId(invoiceId);
        setIsVoucherOpen(true);
    };

    const openInvoiceModal = (payment) => {
        setPaymentToInvoice(payment);
        setIsInvoiceModalOpen(true);
    };

    return (
        <AdminLayout title="Pagos y Cobranzas">
            <Head title="Pagos" />

            {/* Cabecera y Botón Principal */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">Gestión de Cobranzas</h2>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Registro de pagos por transferencia, QR y efectivo con facturación electrónica AFIP / ARCA.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setIsPaymentModalOpen(true)} className="gap-2">
                        <Plus size={16} /> Registrar Pago Manual
                    </Button>
                </div>
            </div>

            {/* Tarjetas de Métricas */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <Card className="p-4!">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1 font-semibold">
                        <CircleDollarSign size={16} className="text-brand-cyan" />
                        <span>Total del mes</span>
                    </div>
                    <p className="text-lg font-black tracking-tight">${Number(metrics.total_month || 0).toLocaleString('es-AR')}</p>
                </Card>

                <Card className="p-4!">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1 font-semibold">
                        <ArrowLeftRight size={16} className="text-blue-500" />
                        <span>Transferencias</span>
                    </div>
                    <p className="text-lg font-black tracking-tight">${Number(metrics.transfer_month || 0).toLocaleString('es-AR')}</p>
                </Card>

                <Card className="p-4!">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1 font-semibold">
                        <QrCode size={16} className="text-purple-500" />
                        <span>Pagos QR</span>
                    </div>
                    <p className="text-lg font-black tracking-tight">${Number(metrics.qr_month || 0).toLocaleString('es-AR')}</p>
                </Card>

                <Card className="p-4!">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1 font-semibold">
                        <Banknote size={16} className="text-emerald-500" />
                        <span>Efectivo</span>
                    </div>
                    <p className="text-lg font-black tracking-tight">${Number(metrics.cash_month || 0).toLocaleString('es-AR')}</p>
                </Card>

                <Card className="p-4! col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2.5 text-xs text-slate-500 mb-1 font-semibold">
                        <Clock size={16} className="text-amber-500" />
                        <span>Sin Facturar</span>
                    </div>
                    <p className={`text-lg font-black tracking-tight ${metrics.pending_invoices_count > 0 ? 'text-amber-500' : ''}`}>
                        {metrics.pending_invoices_count} pagos
                    </p>
                </Card>
            </div>

            {/* Filtros */}
            <Card className="mb-6">
                <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por empresa, referencia o nota…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${cls} pl-9 w-full`}
                        />
                    </div>

                    <select
                        value={method}
                        onChange={(e) => {
                            setMethod(e.target.value);
                            applyFilters({ payment_method: e.target.value || undefined });
                        }}
                        className={`${cls} w-auto`}
                    >
                        <option value="">Todos los métodos</option>
                        {Object.entries(methods).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                        ))}
                    </select>

                    <select
                        value={invoiced}
                        onChange={(e) => {
                            setInvoiced(e.target.value);
                            applyFilters({ invoiced: e.target.value || undefined });
                        }}
                        className={`${cls} w-auto`}
                    >
                        <option value="">Estado AFIP: Todos</option>
                        <option value="yes">Factura Autorizada (CAE)</option>
                        <option value="no">Sin Factura</option>
                        <option value="failed">Factura Fallida</option>
                    </select>

                    <Button type="submit" size="sm" variant="outline">
                        <Filter size={14} /> Filtrar
                    </Button>
                </form>
            </Card>

            {/* Tabla de Pagos */}
            <Card>
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`text-left text-xs uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <th className="px-6 py-2.5">Fecha</th>
                                <th className="px-6 py-2.5">Empresa</th>
                                <th className="px-6 py-2.5">Plan</th>
                                <th className="px-6 py-2.5">Método</th>
                                <th className="px-6 py-2.5">Referencia</th>
                                <th className="px-6 py-2.5">Monto</th>
                                <th className="px-6 py-2.5">Factura AFIP</th>
                                <th className="px-6 py-2.5 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.map((p) => {
                                const m = METHOD_BADGES[p.payment_method] || METHOD_BADGES.other;
                                const MethodIcon = m.icon;
                                const hasAuthorizedInvoice = p.invoice && p.invoice.status === 'authorized';
                                const hasFailedInvoice = p.invoice && p.invoice.status === 'failed';

                                return (
                                    <tr key={p.id} className={`border-t ${isDark ? 'border-white/10' : 'border-brand-aqua/30'}`}>
                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <span className="font-semibold text-xs">
                                                {p.paid_at ? new Date(p.paid_at).toLocaleDateString('es-AR') : new Date(p.created_at).toLocaleDateString('es-AR')}
                                            </span>
                                            <span className={`block text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                {p.paid_at ? new Date(p.paid_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </td>

                                        <td className="px-6 py-3.5">
                                            {p.tenant ? (
                                                <Link href={`/tenants/${p.tenant.id}/edit`} className="font-bold hover:text-brand-cyan transition-colors">
                                                    {p.tenant.name}
                                                </Link>
                                            ) : (
                                                <span className="font-mono text-xs">{p.tenant_id}</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-3.5 whitespace-nowrap text-xs">
                                            {p.plan?.name || (p.tenant ? `Plan ${p.tenant.plan}` : '—')}
                                        </td>

                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            <Badge color={m.color} className="inline-flex items-center gap-1.5 py-0.5">
                                                <MethodIcon size={12} />
                                                <span>{m.label}</span>
                                            </Badge>
                                        </td>

                                        <td className="px-6 py-3.5 text-xs">
                                            {p.reference ? (
                                                <span className="font-mono text-[11px] bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
                                                    {p.reference}
                                                </span>
                                            ) : (
                                                <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>—</span>
                                            )}
                                            {p.notes && (
                                                <span className="block text-[10px] text-slate-500 truncate max-w-xs mt-0.5" title={p.notes}>
                                                    {p.notes}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-3.5 whitespace-nowrap font-mono font-bold text-xs">
                                            ${Number(p.amount).toLocaleString('es-AR')} {p.currency}
                                        </td>

                                        <td className="px-6 py-3.5 whitespace-nowrap">
                                            {hasAuthorizedInvoice ? (
                                                <div className="flex items-center gap-1.5">
                                                    <Badge color="success" className="inline-flex items-center gap-1">
                                                        <CheckCircle2 size={11} />
                                                        <span>{p.invoice.receipt_type} {String(p.invoice.point_sale).padStart(5, '0')}-{String(p.invoice.number).padStart(8, '0')}</span>
                                                    </Badge>
                                                </div>
                                            ) : hasFailedInvoice ? (
                                                <Badge color="danger" className="inline-flex items-center gap-1">
                                                    <XCircle size={11} /> Falló emisión
                                                </Badge>
                                            ) : (
                                                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin facturar</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-3.5 text-right whitespace-nowrap">
                                            {hasAuthorizedInvoice ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openVoucher(p.invoice.id)}
                                                    className="gap-1 text-xs py-1"
                                                >
                                                    <FileCheck size={14} className="text-emerald-500" /> Ver Factura
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => openInvoiceModal(p)}
                                                    disabled={!issuerConfigured}
                                                    title={!issuerConfigured ? 'Configurá primero el emisor AFIP en Facturación AFIP' : 'Emitir Factura AFIP para este pago'}
                                                    className="gap-1 text-xs py-1"
                                                >
                                                    <FileText size={14} className="text-brand-cyan" />
                                                    {hasFailedInvoice ? 'Reintentar' : 'Facturar AFIP'}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}

                            {payments.data.length === 0 && (
                                <tr>
                                    <td colSpan={8} className={`px-6 py-12 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                                        No se encontraron pagos registrados con los filtros seleccionados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {payments.links && payments.links.length > 3 && (
                    <div className="flex items-center justify-center gap-1 mt-5">
                        {payments.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                                    link.active
                                        ? 'bg-brand-cyan text-white'
                                        : isDark
                                            ? 'text-slate-400 hover:bg-white/5'
                                            : 'text-slate-600 hover:bg-brand-mint'
                                } ${!link.url ? 'opacity-30 cursor-not-allowed' : ''}`}
                            />
                        ))}
                    </div>
                )}
            </Card>

            {/* Modal para Registrar Pago Manual */}
            <ManualPaymentModal
                open={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                tenants={tenants}
                plans={plans}
                issuerConfigured={issuerConfigured}
                issuer={issuer}
            />

            {/* Modal para Ver / Imprimir Comprobante Fiscal con QR oficial */}
            <InvoiceVoucherModal
                invoiceId={selectedInvoiceId}
                open={isVoucherOpen}
                onClose={() => {
                    setIsVoucherOpen(false);
                    setSelectedInvoiceId(null);
                }}
            />

            {/* Modal para Emitir Factura de un Pago ya registrado */}
            <ManualInvoiceModal
                open={isInvoiceModalOpen}
                onClose={() => {
                    setIsInvoiceModalOpen(false);
                    setPaymentToInvoice(null);
                }}
                payment={paymentToInvoice}
            />
        </AdminLayout>
    );
}

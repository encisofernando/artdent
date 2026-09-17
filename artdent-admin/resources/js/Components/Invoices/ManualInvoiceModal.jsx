import { useState, useEffect } from 'react';
import Modal from '@/Components/ui/Modal';
import Button from '@/Components/ui/Button';
import { useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ShieldCheck, AlertCircle } from 'lucide-react';

export default function ManualInvoiceModal({ open, onClose, payment, tenant, tenants }) {
    const { isDark } = useTheme();

    const cls = `w-full rounded-lg border px-3.5 py-2.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 ${
        isDark ? 'bg-brand-navy border-white/15 text-white focus:border-brand-cyan' : 'bg-white border-brand-aqua text-slate-900 focus:border-brand-cyan'
    }`;

    const isForPayment = !!payment;

    const { data, setData, post, processing, errors, reset } = useForm({
        tenant_id: tenant?.id || payment?.tenant_id || '',
        amount: payment?.amount || '',
        description: payment ? `Suscripción ${payment.plan?.name || ''} — Período ${new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}` : '',
        receipt_type: 'auto',
        recipient_name: tenant?.name || payment?.tenant?.name || '',
        recipient_cuit: '',
        recipient_iva: 'consumidor_final',
    });

    useEffect(() => {
        if (payment) {
            setData({
                tenant_id: payment.tenant_id,
                amount: payment.amount,
                description: `Suscripción ${payment.plan?.name || ''} — Período ${new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}`,
                receipt_type: 'auto',
                recipient_name: payment.tenant?.name || '',
                recipient_cuit: '',
                recipient_iva: 'consumidor_final',
            });
        } else if (tenant) {
            setData((prev) => ({
                ...prev,
                tenant_id: tenant.id,
                recipient_name: tenant.name,
            }));
        }
    }, [payment, tenant, open]);

    const submit = (e) => {
        e.preventDefault();
        if (isForPayment) {
            post(route('payments.invoice.generate', payment.id), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post(route('afip-issuer.invoices.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal open={open} onClose={onClose} title={isForPayment ? `Emitir Factura AFIP para Pago #${payment?.id}` : 'Emitir Factura AFIP Manual'}>
            <form onSubmit={submit} className="space-y-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs">
                    <ShieldCheck size={18} className="shrink-0" />
                    <span>Se solicitará la autorización en línea (CAE) directamente a los servidores de AFIP / ARCA (WSFEv1).</span>
                </div>

                {!isForPayment && tenants && (
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Empresa / Tenant *</label>
                        <select
                            required
                            className={cls}
                            value={data.tenant_id}
                            onChange={(e) => {
                                const selected = tenants.find((t) => t.id === e.target.value);
                                setData((prev) => ({
                                    ...prev,
                                    tenant_id: e.target.value,
                                    recipient_name: selected?.name || prev.recipient_name,
                                }));
                            }}
                        >
                            <option value="">Seleccionar empresa…</option>
                            {tenants.map((t) => (
                                <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
                            ))}
                        </select>
                        {errors.tenant_id && <p className="text-rose-500 text-xs mt-1">{errors.tenant_id}</p>}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Monto ($ ARS) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            className={cls}
                            value={data.amount}
                            onChange={(e) => setData('amount', e.target.value)}
                            disabled={isForPayment}
                        />
                        {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Tipo de comprobante</label>
                        <select
                            className={cls}
                            value={data.receipt_type}
                            onChange={(e) => setData('receipt_type', e.target.value)}
                        >
                            <option value="auto">Automático (recomendado)</option>
                            <option value="FC">Factura C (Monotributo)</option>
                            <option value="FB">Factura B (Consumidor Final / Monotributo)</option>
                            <option value="FA">Factura A (Responsable Inscripto con CUIT)</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Razón Social receptor *</label>
                        <input
                            type="text"
                            required
                            className={cls}
                            value={data.recipient_name}
                            onChange={(e) => setData('recipient_name', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">CUIT / DNI receptor</label>
                        <input
                            type="text"
                            placeholder="20-xxxxxxxx-x (obligatorio para Factura A)"
                            className={cls}
                            value={data.recipient_cuit}
                            onChange={(e) => setData('recipient_cuit', e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Condición IVA Receptor</label>
                    <select
                        className={cls}
                        value={data.recipient_iva}
                        onChange={(e) => setData('recipient_iva', e.target.value)}
                    >
                        <option value="consumidor_final">Consumidor Final</option>
                        <option value="responsable_inscripto">IVA Responsable Inscripto</option>
                        <option value="monotributista">Responsable Monotributo</option>
                        <option value="exento">IVA Sujeto Exento</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5">Concepto en el comprobante *</label>
                    <input
                        type="text"
                        required
                        className={cls}
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                    <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={processing || !data.amount || !data.tenant_id}>
                        {processing ? 'Solicitando CAE a AFIP…' : 'Emitir Comprobante AFIP'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

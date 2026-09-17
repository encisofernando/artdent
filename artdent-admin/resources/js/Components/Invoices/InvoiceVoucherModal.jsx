import { useState, useEffect } from 'react';
import Modal from '@/Components/ui/Modal';
import Button from '@/Components/ui/Button';
import Badge from '@/Components/ui/Badge';
import { useTheme } from '@/Contexts/ThemeContext';
import { Printer, Download, ExternalLink, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';

export default function InvoiceVoucherModal({ invoiceId, open, onClose }) {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [qrSrc, setQrSrc] = useState('');

    useEffect(() => {
        if (!open || !invoiceId) {
            setData(null);
            setQrSrc('');
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        fetch(`/invoices/${invoiceId}`, {
            headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        })
            .then((res) => {
                if (!res.ok) throw new Error('No se pudo cargar el comprobante.');
                return res.json();
            })
            .then((payload) => {
                setData(payload);
                if (payload.qr_url) {
                    QRCode.toDataURL(payload.qr_url, { width: 140, margin: 1, errorCorrectionLevel: 'M' })
                        .then(setQrSrc)
                        .catch(() => {});
                }
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [open, invoiceId]);

    const handlePrint = () => {
        window.print();
    };

    const inv = data?.invoice;
    const issuer = data?.issuer;

    const receiptLetter = (inv?.receipt_type || 'FC').slice(-1); // A, B, C
    const receiptCode = inv?.receipt_type === 'FA' ? '01' : (inv?.receipt_type === 'FB' ? '06' : '11');

    return (
        <Modal open={open} onClose={onClose} title="Comprobante Fiscal Electrónico (AFIP / ARCA)">
            {loading && (
                <div className="py-12 text-center text-slate-500">
                    <div className="inline-block w-8 h-8 border-4 border-brand-cyan border-t-transparent rounded-full animate-spin mb-3"></div>
                    <p className="text-sm font-semibold">Cargando datos del comprobante fiscal…</p>
                </div>
            )}

            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {inv && !loading && (
                <div className="space-y-4">
                    {/* Botones de acción superiores (se ocultan en impresión) */}
                    <div className="flex items-center justify-between print:hidden pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                            <Badge color={inv.status === 'authorized' ? 'success' : 'danger'}>
                                {inv.status === 'authorized' ? 'Autorizada por AFIP' : 'Pendiente / Falló'}
                            </Badge>
                            <span className="text-xs text-slate-500 font-mono">ID #{inv.id}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5">
                                <Printer size={15} /> Imprimir / Guardar PDF
                            </Button>
                        </div>
                    </div>

                    {/* Contenedor del comprobante formal (A4 simulado para pantalla e impresión) */}
                    <div id="invoice-printable" className="bg-white text-slate-900 p-6 rounded-xl border border-slate-200 shadow-sm text-xs font-sans print:p-0 print:border-0 print:shadow-none">
                        {/* Cabecera con letra de comprobante */}
                        <div className="border border-slate-400 rounded-lg p-4 relative mb-4">
                            {/* Letra A/B/C en el centro */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-white border border-slate-400 rounded-b-md px-3.5 py-1 text-center shadow-xs">
                                <span className="text-2xl font-black block leading-none">{receiptLetter}</span>
                                <span className="text-[9px] uppercase font-bold text-slate-600">CÓD. {receiptCode}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                {/* Lado Izquierdo: Emisor */}
                                <div>
                                    <h3 className="text-lg font-black text-brand-blue tracking-tight">{issuer?.name || 'ArtCode SAS'}</h3>
                                    <p className="text-[11px] text-slate-600 mt-1 font-semibold">Plataforma SaaS para Odontología y Laboratorios</p>
                                    <div className="mt-3 space-y-0.5 text-[11px] text-slate-700">
                                        <p><span className="font-bold">CUIT:</span> {issuer?.cuit || '30-71944407-1'}</p>
                                        <p><span className="font-bold">Condición IVA:</span> {issuer?.iva_condition === 'monotributista' ? 'Responsable Monotributo' : 'IVA Responsable Inscripto'}</p>
                                        <p><span className="font-bold">Punto de Venta:</span> {String(inv.point_sale).padStart(5, '0')}</p>
                                        <p><span className="font-bold">Sitio web:</span> app.artcode.com.ar</p>
                                    </div>
                                </div>

                                {/* Lado Derecho: Datos Comprobante */}
                                <div className="text-right pl-6 border-l border-slate-300">
                                    <h4 className="text-base font-black tracking-wide uppercase">
                                        {inv.receipt_type === 'FA' ? 'Factura A' : (inv.receipt_type === 'FB' ? 'Factura B' : 'Factura C')}
                                    </h4>
                                    <p className="text-sm font-mono font-bold mt-1">
                                        Nº {String(inv.point_sale).padStart(5, '0')}-{String(inv.number || 0).padStart(8, '0')}
                                    </p>
                                    <div className="mt-3 space-y-0.5 text-[11px] text-slate-700">
                                        <p><span className="font-bold">Fecha de Emisión:</span> {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString('es-AR') : new Date(inv.created_at).toLocaleDateString('es-AR')}</p>
                                        <p><span className="font-bold">Concepto:</span> Servicios</p>
                                        <p><span className="font-bold">Entorno:</span> {inv.environment === 'prod' ? 'Producción' : 'Homologación (Pruebas)'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Datos del Receptor */}
                        <div className="border border-slate-400 rounded-lg p-3 mb-4 bg-slate-50/50">
                            <div className="grid grid-cols-2 gap-4 text-[11px]">
                                <div>
                                    <p><span className="font-bold text-slate-700">Razón Social / Nombre:</span> <span className="font-semibold text-slate-900">{inv.recipient_name}</span></p>
                                    <p className="mt-1"><span className="font-bold text-slate-700">Identificador Tenant:</span> <span className="font-mono">{inv.tenant_id}</span></p>
                                </div>
                                <div className="text-right">
                                    <p><span className="font-bold text-slate-700">CUIT / Documento:</span> <span className="font-mono font-semibold">{inv.recipient_cuit || 'Consumidor Final (Sin doc)'}</span></p>
                                    <p className="mt-1"><span className="font-bold text-slate-700">Condición de Venta:</span> Contado / Transferencia / QR</p>
                                </div>
                            </div>
                        </div>

                        {/* Tabla de Conceptos */}
                        <div className="border border-slate-400 rounded-lg overflow-hidden mb-4">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[10px] text-slate-700">
                                    <tr>
                                        <th className="p-2.5">Descripción</th>
                                        <th className="p-2.5 text-center w-20">Cantidad</th>
                                        <th className="p-2.5 text-right w-28">Subtotal</th>
                                        {inv.receipt_type === 'FA' && <th className="p-2.5 text-right w-24">IVA 21%</th>}
                                        <th className="p-2.5 text-right w-28">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-slate-200">
                                        <td className="p-2.5">
                                            <p className="font-semibold">{inv.description || 'Suscripción SaaS ArtDent'}</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">Acceso a plataforma en la nube y módulos contratados</p>
                                        </td>
                                        <td className="p-2.5 text-center font-mono">1</td>
                                        <td className="p-2.5 text-right font-mono">${Number(inv.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                        {inv.receipt_type === 'FA' && (
                                            <td className="p-2.5 text-right font-mono">${Number(inv.tax_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                        )}
                                        <td className="p-2.5 text-right font-mono font-bold">${Number(inv.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Totales y Liquidación */}
                        <div className="flex justify-end mb-6">
                            <div className="w-64 space-y-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg p-3">
                                {inv.tax_amount > 0 && inv.receipt_type === 'FA' && (
                                    <>
                                        <div className="flex justify-between text-slate-600">
                                            <span>Importe Neto Gravado:</span>
                                            <span className="font-mono font-semibold">${Number(inv.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-slate-600">
                                            <span>IVA 21%:</span>
                                            <span className="font-mono font-semibold">${Number(inv.tax_amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </>
                                )}
                                <div className="flex justify-between text-base font-black text-slate-900 pt-1 border-t border-slate-300">
                                    <span>Total:</span>
                                    <span className="font-mono">${Number(inv.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })} ARS</span>
                                </div>
                            </div>
                        </div>

                        {/* Pie Fiscal AFIP / ARCA */}
                        <div className="border border-slate-400 rounded-lg p-3 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/70">
                            <div className="flex items-center gap-3">
                                {qrSrc ? (
                                    <img src={qrSrc} alt="Código QR AFIP" className="w-24 h-24 shrink-0 rounded border border-slate-300 bg-white p-1" />
                                ) : (
                                    <div className="w-24 h-24 bg-slate-200 rounded flex items-center justify-center text-[10px] text-slate-400 text-center p-1">
                                        Generando QR…
                                    </div>
                                )}
                                <div className="text-[11px] text-slate-700 space-y-0.5">
                                    <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                                        <ShieldCheck size={16} className="text-emerald-600" />
                                        <span>Comprobante Electrónico AFIP / ARCA</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500">Escaneá el código QR para validar este comprobante en arca.gob.ar</p>
                                    {data?.qr_url && (
                                        <a href={data.qr_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-brand-cyan hover:underline font-semibold print:hidden">
                                            Ver en portal de ARCA <ExternalLink size={10} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="text-right space-y-1 text-xs">
                                <p><span className="font-bold text-slate-700">CAE Nº:</span> <span className="font-mono font-black text-slate-900 text-sm tracking-wider">{inv.cae || '—'}</span></p>
                                <p><span className="font-bold text-slate-700">Fecha de Vto. de CAE:</span> <span className="font-mono font-bold text-slate-800">{inv.cae_expiry ? new Date(inv.cae_expiry).toLocaleDateString('es-AR') : '—'}</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}

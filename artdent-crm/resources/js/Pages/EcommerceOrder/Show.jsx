import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Package, Truck, CreditCard, User, FileText, Save, CheckCircle2, Tag, MapPin, Banknote, QrCode, Printer, FileCheck2, Check, AlertTriangle, Loader2, PackagePlus, FileDown, RefreshCw } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';
import { CompanyLogo, getCompanyDisplayName } from '@/lib/companyBranding';
import { toLocalDateIso } from '@/lib/localDate';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

const SHIPPING_METHOD_LABELS = {
    home_delivery:    'Envío a domicilio',
    pickup_point:     'Retiro en punto de entrega',
    moto:             'Moto Mandados',
    andreani_branch:  'Retiro en sucursal de Andreani',
};

const PAYMENT_METHOD_LABELS = {
    mercadopago:   'MercadoPago',
    bank_transfer: 'Transferencia bancaria',
    qr:            'Pago QR',
    cash:          'Efectivo',
};

const TRACKING_STATUS_LABELS = {
    preparing:   'En preparación',
    shipped:     'Despachado',
    in_transit:  'En tránsito',
    delivered:   'Entregado',
    returned:    'Devuelto',
};

const STATUS_CONFIG = {
    pending:    { label: 'Pendiente',   cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20'       },
    confirmed:  { label: 'Confirmado',  cls: 'bg-blue-500/10 text-blue-600 border-blue-500/20'          },
    processing: { label: 'En proceso',  cls: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'    },
    shipped:    { label: 'Enviado',     cls: 'bg-purple-500/10 text-purple-600 border-purple-500/20'    },
    delivered:  { label: 'Entregado',   cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    cancelled:  { label: 'Cancelado',   cls: 'bg-red-500/10 text-red-600 border-red-500/20'             },
    refunded:   { label: 'Reembolsado', cls: 'bg-orange-500/10 text-orange-600 border-orange-500/20'    },
};

const PAYMENT_CONFIG = {
    pending:  { label: 'Pago pendiente',  cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20'       },
    paid:     { label: 'Pagado',          cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    failed:   { label: 'Pago fallido',    cls: 'bg-red-500/10 text-red-600 border-red-500/20'             },
    refunded: { label: 'Reembolsado',     cls: 'bg-orange-500/10 text-orange-600 border-orange-500/20'    },
};

function Badge({ value, config }) {
    const c = config[value] || { label: value, cls: 'bg-slate-500/10 text-slate-600 border-slate-500/20' };
    return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold ${c.cls}`}>{c.label}</span>;
}

function Section({ title, icon: Icon, children, isDark }) {
    return (
        <div className={`rounded-2xl border p-6 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className={`flex items-center gap-2 mb-5 pb-3 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <Icon size={16} style={{ color: B.teal }} />
                <h3 className={`font-bold uppercase tracking-wider text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{title}</h3>
            </div>
            {children}
        </div>
    );
}

// ─── Paleta ArtDent ───────────────────────────────────────────────────────────
const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', light: '#DAE6F0' };

const fmtAR = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDateShort = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

const PAYMENT_LABEL = {
    mercadopago:   'MercadoPago',
    bank_transfer: 'Transferencia bancaria',
    qr:            'Pago QR',
    cash:          'Efectivo',
};

// ─── REMITO E-COMMERCE ────────────────────────────────────────────────────────
function RemitoEcommerce({ order }) {
    const company = order.company || {};
    const companyDisplayName = getCompanyDisplayName(company);
    const items   = order.ecommerce_order_items || [];
    const shipment = order.shipments?.[0] ?? null;

    const subtotal = Number(order.subtotal  || 0);
    const shipping = Number(order.shipping_cost || 0);
    const discount = Number(order.discount_amount || 0);
    const total    = Number(order.total || 0);

    const paymentLabel = PAYMENT_LABEL[order.selected_payment_method] ?? order.selected_payment_method ?? '—';

    // Dirección destino
    const destLines = [
        order.shipping_name,
        order.shipping_address,
        [order.shipping_city, order.shipping_province, order.shipping_postal].filter(Boolean).join(', '),
        'Argentina',
    ].filter(Boolean);

    // Remitente (empresa)
    const remLines = [
        company.fantasy_name || company.name || 'ArtCode',
        company.address,
        [company.city, company.province, company.postal_code].filter(Boolean).join(', '),
        company.country || 'Argentina',
    ].filter(Boolean);

    const orderDate = fmtDateShort(order.created_at);

    return (
        <div id="remito-print-zone" style={{
            width: '210mm', minHeight: '297mm',
            fontFamily: "'Arial', sans-serif", fontSize: '9pt',
            color: '#111', background: '#fff',
            display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box',
            padding: '12mm 14mm 10mm',
        }}>
            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #111', paddingBottom: 10, marginBottom: 10 }}>
                <div>
                    <div style={{ fontSize: 8.5, color: '#555' }}>
                        Orden #{order.order_number} — Paquete #1
                    </div>
                    <div style={{ fontSize: 8, color: '#777', marginTop: 2 }}>
                        Realizada el {orderDate}
                    </div>
                </div>

                {/* Logo ArtDent */}
                <div style={{ textAlign: 'right' }}>
                    <CompanyLogo
                        company={company}
                        scope="general"
                        height="22mm"
                        maxWidth="78mm"
                        alt={companyDisplayName}
                        style={{ marginLeft: 'auto' }}
                    />
                    {(company.city || company.province) && (
                        <div style={{ fontSize: 8, color: '#777', marginTop: 3, fontWeight: 600 }}>
                            {[company.city, company.province].filter(Boolean).join(', ')}
                        </div>
                    )}
                </div>
            </div>

            {/* Título REMITO */}
            <div style={{ textAlign: 'center', fontSize: 22, fontWeight: 900, letterSpacing: 3, color: AD.blue, marginBottom: 12 }}>
                REMITO
            </div>

            {/* ── TABLA DE PRODUCTOS ─────────────────────────────────────── */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
                <thead>
                    <tr style={{ background: AD.blue, color: '#fff' }}>
                        <th style={{ padding: '5px 8px', textAlign: 'left',   fontSize: 8, fontWeight: 700, width: '44%' }}>Producto</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 8, fontWeight: 700, width: '10%' }}>Cant.</th>
                        <th style={{ padding: '5px 8px', textAlign: 'center', fontSize: 8, fontWeight: 700, width: '16%' }}>SKU</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right',  fontSize: 8, fontWeight: 700, width: '14%' }}>Precio unit.</th>
                        <th style={{ padding: '5px 8px', textAlign: 'right',  fontSize: 8, fontWeight: 700, width: '16%' }}>Precio total</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? '#fff' : '#f5f9fc', borderBottom: '1px solid #dde' }}>
                            <td style={{ padding: '6px 8px', fontWeight: 600, fontSize: 9 }}>
                                {item.product_name}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9 }}>
                                {item.quantity} x
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: 8, color: '#666', fontFamily: 'monospace' }}>
                                {item.sku || '—'}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9 }}>
                                $ {fmtAR(item.unit_price)}
                            </td>
                            <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, fontSize: 9, color: AD.blue }}>
                                $ {fmtAR(item.total)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ── TOTALES ────────────────────────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                <table style={{ borderCollapse: 'collapse', minWidth: 200, border: '1px solid #dde' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '5px 10px', fontSize: 8.5, borderBottom: '1px solid #dde' }}>
                                Subtotal ({items.reduce((a, i) => a + i.quantity, 0)} {items.reduce((a, i) => a + i.quantity, 0) === 1 ? 'unidad' : 'unidades'})
                            </td>
                            <td style={{ padding: '5px 10px', textAlign: 'right', fontSize: 8.5, borderBottom: '1px solid #dde' }}>
                                $ {fmtAR(subtotal)}
                            </td>
                        </tr>
                        {shipping > 0 && (
                            <tr>
                                <td style={{ padding: '5px 10px', fontSize: 8.5, borderBottom: '1px solid #dde' }}>Costo de envío</td>
                                <td style={{ padding: '5px 10px', textAlign: 'right', fontSize: 8.5, borderBottom: '1px solid #dde' }}>
                                    $ {fmtAR(shipping)}
                                </td>
                            </tr>
                        )}
                        {discount > 0 && (
                            <tr>
                                <td style={{ padding: '5px 10px', fontSize: 8.5, color: '#c00', borderBottom: '1px solid #dde' }}>Descuento</td>
                                <td style={{ padding: '5px 10px', textAlign: 'right', fontSize: 8.5, color: '#c00', borderBottom: '1px solid #dde' }}>
                                    -$ {fmtAR(discount)}
                                </td>
                            </tr>
                        )}
                        <tr style={{ background: AD.blue }}>
                            <td style={{ padding: '6px 10px', fontSize: 10, fontWeight: 900, color: '#fff' }}>Total:</td>
                            <td style={{ padding: '6px 10px', textAlign: 'right', fontSize: 11, fontWeight: 900, color: '#fff' }}>
                                $ {fmtAR(total)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* ── MEDIO DE PAGO ──────────────────────────────────────────── */}
            <div style={{ marginBottom: 14, fontSize: 8.5 }}>
                <strong>Medio de pago:</strong> {paymentLabel}
            </div>

            {/* ── BLOQUES: DIRECCIÓN + REMITENTE ─────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {/* Dirección de envío / retiro */}
                <div style={{ border: '1px solid #ccc', padding: '10px 12px', borderRadius: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: AD.teal, marginBottom: 6, borderBottom: '1px solid #dde', paddingBottom: 4 }}>
                        Dirección de envío
                    </div>
                    {destLines.map((l, i) => (
                        <div key={i} style={{ fontSize: 8.5, lineHeight: 1.75 }}>{l}</div>
                    ))}
                    {order.shipping_phone && (
                        <div style={{ fontSize: 8.5, marginTop: 4 }}>
                            <strong>Teléfono:</strong> {order.shipping_phone}
                        </div>
                    )}
                    {(order.customer?.dni || order.guest_dni) && (
                        <div style={{ fontSize: 8.5, marginTop: 2 }}>
                            <strong>DNI/CUIT:</strong> {order.customer?.dni || order.guest_dni}
                        </div>
                    )}
                </div>

                {/* Remitente */}
                <div style={{ border: '1px solid #ccc', padding: '10px 12px', borderRadius: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: 0.5, color: AD.teal, marginBottom: 6, borderBottom: '1px solid #dde', paddingBottom: 4 }}>
                        Remitente
                    </div>
                    {remLines.map((l, i) => (
                        <div key={i} style={{ fontSize: 8.5, lineHeight: 1.75, fontWeight: i === 0 ? 700 : 400 }}>{l}</div>
                    ))}
                    {company.cuit && (
                        <div style={{ fontSize: 8, color: '#555', marginTop: 4 }}>
                            CUIT: {company.cuit}
                        </div>
                    )}
                    {company.phone && (
                        <div style={{ fontSize: 8, color: '#555' }}>Tel: {company.phone}</div>
                    )}
                </div>
            </div>

            {/* Número de orden al pie */}
            <div style={{ textAlign: 'center', fontSize: 8, color: '#888', marginBottom: 14 }}>
                Orden #{order.order_number} — Paquete #1
            </div>

            {/* ── DATOS DE QUIEN RETIRA ──────────────────────────────────── */}
            <div style={{ border: '1px solid #aaa', borderRadius: 4, padding: '10px 14px' }}>
                <div style={{ fontWeight: 800, fontSize: 9.5, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, borderBottom: '1px solid #ccc', paddingBottom: 5, color: AD.blue }}>
                    Datos de quien retira
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px' }}>
                    <div>
                        <div style={{ fontSize: 8, color: '#555', marginBottom: 3 }}>Nombre completo:</div>
                        <div style={{ borderBottom: '1px solid #888', height: 20 }} />
                    </div>
                    <div>
                        <div style={{ fontSize: 8, color: '#555', marginBottom: 3 }}>DNI:</div>
                        <div style={{ display: 'flex', gap: 20 }}>
                            <div style={{ borderBottom: '1px solid #888', flex: 1, height: 20 }} />
                            <div style={{ fontSize: 8, color: '#555', alignSelf: 'flex-end', whiteSpace: 'nowrap' }}>Fecha:</div>
                            <div style={{ borderBottom: '1px solid #888', width: 70, height: 20 }} />
                        </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: 8, color: '#555', marginBottom: 3 }}>Firma:</div>
                        <div style={{ borderBottom: '1px solid #888', height: 36 }} />
                    </div>
                </div>
            </div>

            {/* Franja inferior ArtDent */}
            <div style={{ flex: 1 }} />
            <div style={{ marginTop: 10, background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.green})`, height: 5, borderRadius: 2 }} />
            <div style={{ textAlign: 'center', fontSize: 7, color: '#aaa', marginTop: 4 }}>
                Generado por ArtCode CRM — {fmtDateShort(new Date())}
            </div>
        </div>
    );
}

function AfipPanel({ order, invoice, isDark }) {
    const [generating, setGenerating] = React.useState(false);

    const handleGenerate = () => {
        setGenerating(true);
        router.post(route('ecommerce-orders.generate-invoice', order.id), {}, {
            onFinish: () => setGenerating(false),
        });
    };

    const hasCae = Boolean(invoice?.cae);
    const isPaid = order.payment_status === 'paid';

    return (
        <Section title="Comprobante AFIP" icon={FileCheck2} isDark={isDark}>
            {hasCae ? (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold mb-3">
                        <Check size={13} /> Autorizado por AFIP
                    </div>
                    {[
                        ['Tipo',    invoice.invoice_type?.name ?? '—'],
                        ['Nº',      invoice.number],
                        ['CAE',     invoice.cae],
                        ['Vto CAE', invoice.cae_expiry ? new Date(invoice.cae_expiry).toLocaleDateString('es-AR') : '—'],
                    ].map(([label, value]) => value && (
                        <div key={label} className="flex justify-between text-xs">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{label}</span>
                            <span className={`font-semibold font-mono ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</span>
                        </div>
                    ))}
                </div>
            ) : isPaid ? (
                <div className="space-y-3">
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Pedido pagado sin comprobante fiscal.
                    </p>
                    <button
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #397B9C, #49949C)', opacity: generating ? 0.7 : 1 }}
                    >
                        {generating
                            ? <><Loader2 size={13} className="animate-spin" /> Generando…</>
                            : <><FileCheck2 size={13} /> Generar Factura AFIP</>}
                    </button>
                </div>
            ) : (
                <div className="flex items-start gap-2 text-xs">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-500" />
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        Se generará automáticamente al confirmar el pago.
                    </span>
                </div>
            )}
        </Section>
    );
}

function AndreaniPanel({ order, isDark }) {
    const shipment = (order.shipments || []).find(s => s.carrier === 'andreani') ?? null;
    const [creating, setCreating] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);
    const [errorMsg, setErrorMsg] = React.useState(null);

    const handleCreate = () => {
        if (!window.confirm('Esto va a generar un envío REAL en Andreani (planifican el retiro). ¿Confirmás?')) {
            return;
        }
        setErrorMsg(null);
        setCreating(true);
        router.post(route('ecommerce-orders.andreani.shipment', order.id), {}, {
            onError: (errs) => setErrorMsg(errs.andreani ?? 'No se pudo crear el envío.'),
            onFinish: () => setCreating(false),
        });
    };

    const handleRefresh = () => {
        setErrorMsg(null);
        setRefreshing(true);
        router.post(route('ecommerce-orders.andreani.tracking', order.id), {}, {
            onError: (errs) => setErrorMsg(errs.andreani ?? 'No se pudo consultar el estado.'),
            onFinish: () => setRefreshing(false),
        });
    };

    return (
        <Section title="Andreani" icon={Truck} isDark={isDark}>
            {shipment ? (
                <div className="space-y-3">
                    <div className="flex justify-between text-xs">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Nº de envío</span>
                        <span className={`font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{shipment.tracking_code}</span>
                    </div>
                    <div className="flex justify-between text-xs items-center">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Estado</span>
                        <Badge value={shipment.status} config={STATUS_CONFIG_TRACKING} />
                    </div>
                    <div className="flex gap-2 pt-1">
                        <button
                            onClick={() => window.open(route('ecommerce-orders.andreani.label', order.id), '_blank')}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border
                                ${isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                            <FileDown size={13} /> Etiqueta PDF
                        </button>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border
                                ${isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                            {refreshing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                            Actualizar estado
                        </button>
                    </div>
                </div>
            ) : order.shipping_method_type === 'home_delivery' ? (
                <div className="space-y-3">
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Todavía no se creó el envío en Andreani para este pedido.
                    </p>
                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="w-full py-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-opacity"
                        style={{ background: 'linear-gradient(135deg, #397B9C, #49949C)', opacity: creating ? 0.7 : 1 }}
                    >
                        {creating
                            ? <><Loader2 size={13} className="animate-spin" /> Creando envío…</>
                            : <><PackagePlus size={13} /> Crear envío en Andreani</>}
                    </button>
                </div>
            ) : (
                <div className="flex items-start gap-2 text-xs">
                    <AlertTriangle size={13} className="shrink-0 mt-0.5 text-amber-500" />
                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        Este pedido no es de envío a domicilio.
                    </span>
                </div>
            )}
            {errorMsg && (
                <p className="mt-3 text-xs font-semibold text-red-500">{errorMsg}</p>
            )}
        </Section>
    );
}

const STATUS_CONFIG_TRACKING = {
    preparing:  { label: 'En preparación', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20'       },
    shipped:    { label: 'Despachado',     cls: 'bg-purple-500/10 text-purple-600 border-purple-500/20'    },
    in_transit: { label: 'En tránsito',    cls: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20'    },
    delivered:  { label: 'Entregado',      cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    returned:   { label: 'Devuelto',       cls: 'bg-red-500/10 text-red-600 border-red-500/20'             },
};

export default function Show({ auth, order, invoice }) {
    const { isDark } = useTheme();
    const { props: pageProps } = usePage();
    const tenantId = pageProps.tenant_info?.id;
    const [saved, setSaved] = useState(false);

    const handlePrintRemito = () => {
        const el = document.getElementById('remito-print-zone');
        if (!el) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html>
            <head>
                <title>Remito — Orden #${order.order_number}</title>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet">
                <style>
                    @page { margin: 0; size: A4; }
                    body { margin: 0; padding: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                </style>
            </head>
            <body>${el.outerHTML}</body>
            </html>
        `);
        win.document.close();
        setTimeout(() => { win.print(); win.close(); }, 600);
    };

    const shipment = order.shipments?.[0] ?? null;

    const toDateInput = (v) => v ? toLocalDateIso(v) : '';

    const { data, setData, put, processing } = useForm({
        status:            order.status            || 'pending',
        payment_status:    order.payment_status    || 'pending',
        admin_notes:       order.admin_notes       || '',
        shipping_name:     order.shipping_name     || '',
        shipping_address:  order.shipping_address  || '',
        shipping_city:     order.shipping_city     || '',
        shipping_province: order.shipping_province || '',
        shipping_postal:   order.shipping_postal   || '',
        shipping_phone:    order.shipping_phone    || '',
        // Tracking
        carrier:           shipment?.carrier          || '',
        tracking_code:     shipment?.tracking_code    || '',
        tracking_url:      shipment?.tracking_url     || '',
        tracking_status:   shipment?.status           || '',
        shipped_at:        toDateInput(shipment?.shipped_at),
        estimated_delivery:toDateInput(shipment?.estimated_delivery),
        delivered_at:      toDateInput(shipment?.delivered_at),
        tracking_notes:    shipment?.notes            || '',
    });

    // Auto-reload order data (updates badges/status without resetting form fields).
    // El poll de 30s queda como red de seguridad; el Echo listener de abajo es
    // la vía principal para reflejar cambios de otros usuarios/webhooks al instante.
    useEffect(() => {
        const id = setInterval(() => {
            if (!processing) {
                router.reload({ only: ['order'] });
            }
        }, 30_000);
        return () => clearInterval(id);
    }, [processing]);

    useEffect(() => {
        if (!window.Echo || !tenantId || !order?.company_id || !order?.id) { return; }
        const channelName = `tenant.${tenantId}.company.${order.company_id}.orders.${order.id}`;
        const ch = window.Echo.private(channelName);
        ch.listen('.order-status-changed', () => {
            if (!processing) {
                router.reload({ only: ['order'] });
            }
        });
        return () => { window.Echo.leave(channelName); };
    }, [tenantId, order?.company_id, order?.id, processing]);

    const submit = (e) => {
        e?.preventDefault();
        put(route('ecommerce-orders.update', order.id), {
            onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2500); },
        });
    };

    const fmt = (n) => `$${Number(n || 0).toLocaleString('es-AR')}`;
    const fmtDate = (d) => d ? new Date(d).toLocaleString('es-AR') : '—';

    const inp = `w-full rounded-xl border px-4 py-2 text-sm focus:ring-2 focus:outline-none
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Pedido #${order.order_number || order.id}`} />

            <div className="flex flex-col gap-6 font-sans max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                        <Link href={route('ecommerce-orders.index')}>
                            <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
                                <ArrowLeft size={18} />
                            </button>
                        </Link>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                #{order.order_number || order.id.toString().padStart(6, '0')}
                            </h1>
                            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Creado el {fmtDate(order.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge value={order.status} config={STATUS_CONFIG} />
                        <Badge value={order.payment_status} config={PAYMENT_CONFIG} />
                        {order.selected_payment_method && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold bg-sky-500/10 text-sky-600 border-sky-500/20`}>
                                <CreditCard size={11} className="mr-1" />
                                {PAYMENT_METHOD_LABELS[order.selected_payment_method] ?? order.selected_payment_method}
                            </span>
                        )}
                        {order.coupon && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold bg-purple-500/10 text-purple-600 border-purple-500/20`}>
                                Cupón: {order.coupon.code}
                            </span>
                        )}

                        {saved && (
                            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs">
                                <CheckCircle2 size={14} /> Guardado
                            </span>
                        )}
                        <Button
                            onClick={handlePrintRemito}
                            variant="outline"
                            className={`border-slate-300 ${isDark ? 'border-slate-600 text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}`}
                        >
                            <Printer size={15} className="mr-2" />
                            Remito
                        </Button>
                        <Button
                            onClick={submit}
                            disabled={processing}
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            className="text-white border-none shadow-md"
                        >
                            <Save size={15} className="mr-2" />
                            {processing ? 'Guardando…' : 'Guardar cambios'}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Columna 1 — Productos */}
                    <div className="flex flex-col gap-6">

                        <Section title="Productos Pedidos" icon={Package} isDark={isDark}>
                            <div className="space-y-3">
                                {(order.ecommerce_order_items || []).map((item) => {
                                    const img = item.product?.product_images?.find(i => i.is_cover)?.url
                                        || item.product?.product_images?.[0]?.url;
                                    return (
                                        <div key={item.id} className={`flex items-center gap-4 p-3 rounded-xl ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                                            <div className={`w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                                                {img ? (
                                                    <img src={img} alt={item.product_name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <Package size={20} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold text-sm leading-tight truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                    {item.product_name}
                                                </p>
                                                {item.sku && (
                                                    <p className={`text-[10px] mt-0.5 font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                        SKU: {item.sku}
                                                    </p>
                                                )}
                                                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                    {fmt(item.unit_price)} × {item.quantity}
                                                    {item.discount > 0 && <span className="ml-2 text-green-500">-{fmt(item.discount)}</span>}
                                                </p>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`font-extrabold text-sm ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>{fmt(item.total)}</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {(!order.ecommerce_order_items || order.ecommerce_order_items.length === 0) && (
                                    <p className={`text-sm text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sin ítems registrados</p>
                                )}
                            </div>

                            {/* Totales */}
                            <div className={`mt-5 pt-4 border-t space-y-1.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                {[
                                    { label: 'Subtotal',  value: fmt(order.subtotal) },
                                    order.discount_amount > 0 && { label: 'Descuento', value: `-${fmt(order.discount_amount)}`, cls: 'text-green-500' },
                                    order.shipping_cost > 0   && { label: 'Envío',     value: fmt(order.shipping_cost) },
                                    order.tax_amount > 0      && { label: 'Impuestos', value: fmt(order.tax_amount) },
                                ].filter(Boolean).map((row) => (
                                    <div key={row.label} className={`flex items-center justify-between text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        <span>{row.label}</span>
                                        <span className={row.cls || ''}>{row.value}</span>
                                    </div>
                                ))}
                                <div className={`flex items-center justify-between pt-2 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                    <span className={`font-bold text-base ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Total</span>
                                    <span className="font-extrabold text-xl" style={{ color: B.blue }}>{fmt(order.total)}</span>
                                </div>
                            </div>
                        </Section>

                        {order.customer_notes && (
                            <Section title="Notas del Cliente" icon={FileText} isDark={isDark}>
                                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{order.customer_notes}</p>
                            </Section>
                        )}
                    </div>

                    {/* Columna 2 — Cliente + Gestionar */}
                    <div className="flex flex-col gap-6">

                        <Section title="Cliente" icon={User} isDark={isDark}>
                            {order.customer ? (
                                <div className="space-y-1.5 text-sm">
                                    <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{order.customer.name}</p>
                                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{order.customer.email}</p>
                                    {order.customer.phone && <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{order.customer.phone}</p>}
                                    <Link href={route('customers.edit', order.customer.id)}
                                        className="inline-block mt-2 text-xs font-semibold" style={{ color: B.teal }}>
                                        Ver perfil →
                                    </Link>
                                </div>
                            ) : (
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {order.shipping_name || 'Invitado'}
                                </p>
                            )}
                        </Section>

                        <Section title="Gestionar Pedido" icon={CheckCircle2} isDark={isDark}>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className={lbl}>Estado del Pedido</label>
                                    <SearchableSelect
                                        value={data.status}
                                        onChange={v => setData('status', v)}
                                        options={[
                                            { value: 'pending', label: 'Pendiente' },
                                            { value: 'confirmed', label: 'Confirmado' },
                                            { value: 'processing', label: 'En proceso' },
                                            { value: 'shipped', label: 'Enviado' },
                                            { value: 'delivered', label: 'Entregado' },
                                            { value: 'cancelled', label: 'Cancelado' },
                                            { value: 'refunded', label: 'Reembolsado' },
                                        ]}
                                    />
                                </div>
                                <div>
                                    <label className={lbl}>Estado del Pago</label>
                                    <SearchableSelect
                                        value={data.payment_status}
                                        onChange={v => setData('payment_status', v)}
                                        options={[
                                            { value: 'pending', label: 'Pendiente' },
                                            { value: 'paid', label: 'Pagado' },
                                            { value: 'failed', label: 'Fallido' },
                                            { value: 'refunded', label: 'Reembolsado' },
                                        ]}
                                    />
                                </div>
                                <div>
                                    <label className={lbl}>Notas Internas</label>
                                    <textarea rows={3} value={data.admin_notes} onChange={e => setData('admin_notes', e.target.value)}
                                        className={inp} placeholder="Observaciones del equipo..." />
                                </div>
                            </form>
                        </Section>

                        {/* Panel AFIP */}
                        <AfipPanel order={order} invoice={invoice} isDark={isDark} />

                        {order.coupon && (
                            <Section title="Cupón Aplicado" icon={Tag} isDark={isDark}>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Código</span>
                                        <span className={`font-mono font-extrabold tracking-widest px-2 py-0.5 rounded-lg ${isDark ? 'bg-slate-800 text-teal-300' : 'bg-slate-100 text-teal-700'}`}>
                                            {order.coupon.code}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Descuento</span>
                                        <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                            {order.coupon.type === 'percentage'
                                                ? `${order.coupon.value}%`
                                                : fmt(order.coupon.value)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Ahorro</span>
                                        <span className={`font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>-{fmt(order.discount_amount)}</span>
                                    </div>
                                </div>
                            </Section>
                        )}
                    </div>

                    {/* Columna 3 — Datos de Envío + Seguimiento */}
                    <div className="flex flex-col gap-6">

                        <Section title="Datos de Envío" icon={Truck} isDark={isDark}>
                            {order.shipping_method_type && (
                                <div className={`mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold
                                    ${isDark ? 'bg-slate-800 text-teal-300' : 'bg-teal-50 text-teal-700'}`}>
                                    <Truck size={14} />
                                    {SHIPPING_METHOD_LABELS[order.shipping_method_type] ?? order.shipping_method_type}
                                </div>
                            )}
                            <form onSubmit={submit} className="space-y-3">
                                {[
                                    { key: 'shipping_name',     label: 'Nombre',     placeholder: 'Destinatario' },
                                    { key: 'shipping_phone',    label: 'Teléfono',   placeholder: '...' },
                                    { key: 'shipping_address',  label: 'Dirección',  placeholder: 'Calle y número' },
                                    { key: 'shipping_city',     label: 'Ciudad',     placeholder: '...' },
                                    { key: 'shipping_province', label: 'Provincia',  placeholder: '...' },
                                    { key: 'shipping_postal',   label: 'CP',         placeholder: '...' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className={lbl}>{f.label}</label>
                                        <input type="text" value={data[f.key]} onChange={e => setData(f.key, e.target.value)}
                                            className={inp} placeholder={f.placeholder} />
                                    </div>
                                ))}
                            </form>
                        </Section>

                        <Section title="Seguimiento del Envío" icon={MapPin} isDark={isDark}>
                            <form onSubmit={submit} className="space-y-3">
                                <div>
                                    <label className={lbl}>Carrier / Correo</label>
                                    <input type="text" value={data.carrier} onChange={e => setData('carrier', e.target.value)}
                                        className={inp} placeholder="Ej: Andreani, OCA..." />
                                </div>
                                <div>
                                    <label className={lbl}>Código de seguimiento</label>
                                    <input type="text" value={data.tracking_code} onChange={e => setData('tracking_code', e.target.value)}
                                        className={`${inp} font-mono`} placeholder="ej: AR123456789" />
                                </div>
                                <div>
                                    <label className={lbl}>Link de seguimiento</label>
                                    <input type="url" value={data.tracking_url} onChange={e => setData('tracking_url', e.target.value)}
                                        className={inp} placeholder="https://..." />
                                </div>
                                <div>
                                    <label className={lbl}>Estado del envío</label>
                                    <SearchableSelect
                                        value={data.tracking_status || ''}
                                        onChange={v => setData('tracking_status', v)}
                                        placeholder="— Sin estado —"
                                        options={Object.entries(TRACKING_STATUS_LABELS).map(([v, l]) => ({ value: v, label: l }))}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className={lbl}>Fecha despacho</label>
                                        <input type="date" value={data.shipped_at} onChange={e => setData('shipped_at', e.target.value)} className={inp} />
                                    </div>
                                    <div>
                                        <label className={lbl}>Entrega estimada</label>
                                        <input type="date" value={data.estimated_delivery} onChange={e => setData('estimated_delivery', e.target.value)} className={inp} />
                                    </div>
                                </div>
                                <div>
                                    <label className={lbl}>Fecha entrega</label>
                                    <input type="date" value={data.delivered_at} onChange={e => setData('delivered_at', e.target.value)} className={inp} />
                                </div>
                                <div>
                                    <label className={lbl}>Notas de envío</label>
                                    <textarea rows={2} value={data.tracking_notes} onChange={e => setData('tracking_notes', e.target.value)}
                                        className={inp} placeholder="Observaciones del envío..." />
                                </div>
                            </form>
                        </Section>

                        <AndreaniPanel order={order} isDark={isDark} />

                    </div>
                </div>


            </div>

            {/* Remito oculto — sólo se imprime, no se muestra en pantalla */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' }}>
                <RemitoEcommerce order={order} />
            </div>
        </AuthenticatedLayout>
    );
}

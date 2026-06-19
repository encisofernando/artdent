import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Printer, Download, CreditCard, User, Check, FileCheck2, AlertTriangle, Loader2, ChevronDown, Mail, Send, Trash2, FileMinus, FilePlus } from 'lucide-react';
import axios from 'axios';
import SearchableSelect from '@/Components/SearchableSelect';
import FacturaA4 from '@/Components/Sale/FacturaA4';
import { Ticket80, Ticket57 } from '@/Components/Sale/TicketBase';
import {
    buildPrintHtml,
    getThermalPrintZoom,
    getThermalZoneWidth,
    MONTSERRAT_PRINT_HEAD,
    openBrowserPrint,
    printElementWithElectron,
} from '@/lib/print';

// Mapea tipo de factura a sus NC/ND correspondientes
function getNotaFiscalTypes(rt) {
    const r = (rt || '').toUpperCase();
    if (['FA', 'A'].includes(r)) return { nc: 'NCA', nd: 'NDA', label: 'A' };
    if (['FB', 'B'].includes(r)) return { nc: 'NCB', nd: 'NDB', label: 'B' };
    if (['FC', 'C'].includes(r)) return { nc: 'NCC', nd: 'NDC', label: 'C' };
    return null;
}

// ─── Paleta ArtDent (Manual de Identidad) ───────────────────────────────────
const AD = {
    blue: '#397B9C',
    green: '#5AAD9C',
    mint: '#ACD6CE',
    teal: '#49949C',
    soft: '#7CA5C3',
    light: '#DAE6F0',
    pale: '#DAEEE3',
};

const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';
const fmtDateTime = (d) => d ? new Date(d).toLocaleString('es-AR') : '—';

// ─── Logos — usa logo_url de la empresa si existe, si no el asset estático ────
function CompanyLogo({ company, height = 50, variant = 'color' }) {
    if (company?.logo_url) {
        return (
            <img
                src={company.logo_url}
                alt={company.fantasy_name || company.name || 'ArtDent'}
                style={{ height, objectFit: 'contain', display: 'block', maxWidth: 180 }}
            />
        );
    }
    const src = variant === 'icon'
        ? '/assets/logo-artdent-icon.png'
        : variant === 'blanco'
        ? '/assets/logo-artdent-blanco.png'
        : '/assets/logo-artdent-color.png';
    return (
        <img
            src={src}
            alt="ArtDent"
            style={{ height, objectFit: 'contain', display: 'block' }}
        />
    );
}

// Backwards-compat para usos previos
function LogoColor({ height = 50, company }) {
    return <CompanyLogo company={company} height={height} variant="color" />;
}
function LogoIcon({ height = 32, company }) {
    return <CompanyLogo company={company} height={height} variant="icon" />;
}

// ─── Helpers fiscales ─────────────────────────────────────────────────────────
const IVA_LABELS = {
    responsable_inscripto: 'Responsable Inscripto',
    monotributista: 'Responsable Monotributo',
    exento: 'IVA Exento',
    consumidor_final: 'Consumidor Final',
};

// Parsea receipt_type (formato nuevo FA/FB/FC/NCA… o legacy A/B/C/X)
function parseReceiptType(rt) {
    const r = (rt || 'X').toUpperCase();
    const MAP = {
        X:   { letter: 'X', label: 'TICKET',       code: '00', isAfip: false },
        A:   { letter: 'A', label: 'FACTURA A',     code: '01', isAfip: true  },
        FA:  { letter: 'A', label: 'FACTURA A',     code: '01', isAfip: true  },
        B:   { letter: 'B', label: 'FACTURA B',     code: '06', isAfip: true  },
        FB:  { letter: 'B', label: 'FACTURA B',     code: '06', isAfip: true  },
        C:   { letter: 'C', label: 'FACTURA C',     code: '11', isAfip: true  },
        FC:  { letter: 'C', label: 'FACTURA C',     code: '11', isAfip: true  },
        NCA: { letter: 'A', label: 'N. CRÉDITO A',  code: '02', isAfip: true  },
        NCB: { letter: 'B', label: 'N. CRÉDITO B',  code: '07', isAfip: true  },
        NCC: { letter: 'C', label: 'N. CRÉDITO C',  code: '12', isAfip: true  },
        NDA: { letter: 'A', label: 'N. DÉBITO A',   code: '03', isAfip: true  },
        NDB: { letter: 'B', label: 'N. DÉBITO B',   code: '08', isAfip: true  },
        NDC: { letter: 'C', label: 'N. DÉBITO C',   code: '13', isAfip: true  },
    };
    return MAP[r] ?? { letter: r, label: r, code: '00', isAfip: false };
}

// Genera la URL QR según especificación ARCA (https://www.arca.gob.ar/fe/qr/)
function buildAfipQrUrl(invoice, company) {
    if (!invoice?.cae) return null;
    const cuitNum = parseInt(String(company?.cuit || '').replace(/\D/g, ''), 10);
    const data = {
        ver:        1,
        fecha:      (invoice.issued_at || new Date().toISOString()).substring(0, 10),
        cuit:       cuitNum,
        ptoVta:     invoice.point_sale || company?.afip_point_sale || 1,
        tipoCmp:    invoice.invoice_type?.afip_code || 11,
        nroCmp:     invoice.number || 1,
        importe:    Number(invoice.total),
        moneda:     'PES',
        ctz:        1,
        tipoCodAut: 'E',
        codAut:     parseInt(invoice.cae, 10),
    };
    // Datos del receptor (de corresponder)
    if (invoice.recipient_cuit) {
        const doc = String(invoice.recipient_cuit).replace(/\D/g, '');
        data.tipoDocRec = doc.length === 11 ? 80 : 96;
        data.nroDocRec  = parseInt(doc, 10);
    }
    return `https://www.arca.gob.ar/fe/qr/?p=${btoa(JSON.stringify(data))}`;
}


// ─── MODOS DE SALIDA ──────────────────────────────────────────────────────────
const MODES = [
    { id: '80mm', label: 'Ticket 80mm', icon: '🖨️', desc: 'Impresora térmica estándar' },
    { id: '57mm', label: 'Ticket 57mm', icon: '🧾', desc: 'Impresora térmica compacta' },
    { id: 'a4', label: 'PDF A4', icon: '📄', desc: 'Comprobante con marca institucional' },
];

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function Show({ auth, sale, account, paymentMethods = [] }) {
    const { isDark } = useTheme();
    const [mode, setMode] = useState('a4');
    const saleBalance = Math.max(0, Number(sale.total || 0) - Number(sale.paid_amount || 0));

    // ── Cuenta Corriente ─────────────────────────────────────
    const [ccBalance, setCcBalance]       = useState(account?.balance ?? null);
    const [pagoCC, setPagoCC]             = useState({ amount: '', payment_method_id: '', description: '' });
    const [savingCC, setSavingCC]         = useState(false);
    const [ccError, setCcError]           = useState('');
    const [ccSuccess, setCcSuccess]       = useState(false);
    const hasCuentaCorriente = Boolean(sale.customer_id) && saleBalance > 0;

    // ── Estado AFIP ───────────────────────────────────────────────────────────
    const company = sale.company || {};
    const needsAfip = parseReceiptType(sale.receipt_type).isAfip;
    const allowedKeys = (() => {
        const iva = company.iva_condition;
        if (iva === 'responsable_inscripto') return ['FA', 'FB', 'NCA', 'NCB', 'NDA', 'NDB'];
        return ['FC', 'NCC', 'NDC'];
    })();
    const RECEIPT_KEY_LABELS = {
        FA: 'Factura A', FB: 'Factura B', FC: 'Factura C',
        NCA: 'N. Crédito A', NCB: 'N. Crédito B', NCC: 'N. Crédito C',
        NDA: 'N. Débito A',  NDB: 'N. Débito B',  NDC: 'N. Débito C',
    };
    const suggestedKey = (() => {
        if (company.iva_condition === 'responsable_inscripto') {
            return sale.customer?.cuit ? 'FA' : 'FB';
        }
        return 'FC';
    })();

    const [afipKey, setAfipKey]         = useState(suggestedKey);
    const [afipLoading, setAfipLoading] = useState(false);
    const [afipResult, setAfipResult]   = useState(sale.invoice || null);
    const [afipError, setAfipError]     = useState('');

    // ── Eliminar (solo X) ─────────────────────────────────────────────────────
    const isTicketX = sale.receipt_type === 'X';
    const hasCae = Boolean(afipResult?.cae || sale.invoice?.cae);
    const notaFiscalTypes = getNotaFiscalTypes(sale.receipt_type);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [notaFiscalOpen, setNotaFiscalOpen] = useState(false);

    const handleDelete = () => {
        router.delete(route('sales.destroy', sale.id), {
            onSuccess: () => {},
        });
    };

    // ── Email ─────────────────────────────────────────────────────────────────
    const [emailOpen, setEmailOpen]     = useState(false);
    const [emailAddr, setEmailAddr]     = useState(sale.customer?.email || '');
    const [emailSending, setEmailSending] = useState(false);
    const [emailMsg, setEmailMsg]       = useState('');

    const handleSendEmail = async () => {
        if (!emailAddr) return;
        setEmailSending(true);
        setEmailMsg('');
        try {
            await axios.post(route('sales.send-email', sale.id), { email: emailAddr });
            setEmailMsg('✓ Email enviado correctamente.');
            setTimeout(() => { setEmailOpen(false); setEmailMsg(''); }, 2000);
        } catch (e) {
            setEmailMsg('✗ ' + (e.response?.data?.message || 'Error al enviar.'));
        } finally {
            setEmailSending(false);
        }
    };

    const handleAfipGenerate = async () => {
        setAfipLoading(true);
        setAfipError('');
        try {
            const res = await axios.post(
                route('afip.sales.generate', sale.id),
                { receipt_key: afipKey },
                { headers: { Accept: 'application/json' } }
            );
            setAfipResult(res.data.invoice);
            router.reload({ only: ['sale'] });
        } catch (e) {
            setAfipError(e.response?.data?.error || 'Error al generar comprobante AFIP.');
        } finally {
            setAfipLoading(false);
        }
    };

    const handlePayCC = async () => {
        if (!pagoCC.amount || Number(pagoCC.amount) <= 0) {
            setCcError('Ingresá un monto válido.');
            return;
        }
        if (Number(pagoCC.amount) > saleBalance) {
            setCcError('El monto no puede superar el saldo pendiente del comprobante.');
            return;
        }
        setSavingCC(true);
        setCcError('');
        try {
            const res = await axios.post(
                route('sales.pay', sale.id),
                {
                    amount: pagoCC.amount,
                    payment_method_id: pagoCC.payment_method_id || null,
                    description: pagoCC.description || `Pago venta ${sale.sale_number}`,
                },
                { headers: { Accept: 'application/json' } }
            );
            if (res.data.balance !== null) setCcBalance(res.data.balance);
            setCcSuccess(true);
            setPagoCC({ amount: '', payment_method_id: '', description: '' });
            // Recarga la venta y la cuenta para actualizar paid_amount, status y saldo CC
            router.reload({ only: ['sale', 'account'] });
        } catch (e) {
            setCcError(e.response?.data?.message || 'Error al registrar pago.');
        } finally {
            setSavingCC(false);
        }
    };

    const handlePrint = async () => {
        const printElement = document.getElementById('print-zone');
        if (!printElement) return;

        const isA4 = mode === 'a4';
        const is57 = mode === '57mm';

        if (isA4) {
            const html = buildPrintHtml({
                title: `ArtDent — ${sale.sale_number}`,
                bodyHtml: printElement.outerHTML,
                pageSize: 'A4',
                zoneWidth: '210mm',
                extraHead: MONTSERRAT_PRINT_HEAD,
            });
            openBrowserPrint(html, { delay: 700 });
            return;
        }

        const result = await printElementWithElectron({
            element: printElement,
            title: `ArtDent — ${sale.sale_number}`,
            mode,
            zoneWidth: getThermalZoneWidth(mode),
            zoom: getThermalPrintZoom(mode),
            extraHead: MONTSERRAT_PRINT_HEAD,
            fallbackToBrowser: true,
            browserDelay: 700,
        });

        if (!result.ok && !result.fallbackUsed) {
            alert('⚠️ El gestor de impresión ArtDent no está activo. Por favor, inicie la aplicación.');
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Venta ${sale.sale_number}`} />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet" />

            <div className="max-w-6xl mx-auto space-y-6 font-sans">

                {/* Barra superior */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('sales.index')}>
                            <Button variant="outline" size="icon" className={`rounded-xl ${isDark ? 'border-slate-700 hover:bg-slate-800' : ''}`}>
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Comprobante de Venta
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {sale.sale_number} · {fmtDate(sale.sold_at || sale.created_at)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">

                        {/* Eliminar — solo para tickets X */}
                        {isTicketX && (
                            confirmDelete ? (
                                <div className="flex items-center gap-1.5">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete}
                                        className="rounded-xl gap-1.5 border-red-400 text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 size={14} /> Confirmar
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setConfirmDelete(false)}
                                        className={`rounded-xl ${isDark ? 'border-slate-700' : ''}`}
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => setConfirmDelete(true)}
                                    className={`rounded-xl gap-2 border-red-300 text-red-500 hover:bg-red-50 ${isDark ? 'border-red-800/60 hover:bg-red-950/30' : ''}`}
                                >
                                    <Trash2 size={16} /> Eliminar
                                </Button>
                            )
                        )}

                        {/* Nota Fiscal — solo para comprobantes AFIP con CAE */}
                        {hasCae && notaFiscalTypes && (
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    onClick={() => setNotaFiscalOpen(v => !v)}
                                    className={`rounded-xl gap-2 ${isDark ? 'border-slate-700 hover:bg-slate-800' : ''}`}
                                >
                                    <FileMinus size={16} /> Nota Fiscal <ChevronDown size={14} />
                                </Button>
                                {notaFiscalOpen && (
                                    <div className={`absolute right-0 top-12 z-50 w-52 rounded-2xl border shadow-xl overflow-hidden ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                        <Link
                                            href={route('sales.create') + `?receipt_type=${notaFiscalTypes.nc}`}
                                            className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                                            onClick={() => setNotaFiscalOpen(false)}
                                        >
                                            <FileMinus size={15} className="text-amber-500" />
                                            Nota de Crédito {notaFiscalTypes.label}
                                        </Link>
                                        <div className={`h-px ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                                        <Link
                                            href={route('sales.create') + `?receipt_type=${notaFiscalTypes.nd}`}
                                            className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}
                                            onClick={() => setNotaFiscalOpen(false)}
                                        >
                                            <FilePlus size={15} className="text-blue-500" />
                                            Nota de Débito {notaFiscalTypes.label}
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Enviar por email */}
                        <div className="relative">
                            <Button
                                variant="outline"
                                onClick={() => setEmailOpen(v => !v)}
                                className={`rounded-xl gap-2 ${isDark ? 'border-slate-700 hover:bg-slate-800' : ''}`}
                            >
                                <Mail size={16} /> Email
                            </Button>

                            {emailOpen && (
                                <div className={`absolute right-0 top-12 z-50 w-72 rounded-2xl border shadow-xl p-4 space-y-3 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Enviar comprobante por email
                                    </p>
                                    <input
                                        type="email"
                                        value={emailAddr}
                                        onChange={e => setEmailAddr(e.target.value)}
                                        placeholder="destinatario@email.com"
                                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
                                    />
                                    {emailMsg && (
                                        <p className={`text-xs font-medium ${emailMsg.startsWith('✓') ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {emailMsg}
                                        </p>
                                    )}
                                    <div className="flex gap-2">
                                        <Button size="sm" disabled={emailSending || !emailAddr} onClick={handleSendEmail} className="flex-1 gap-1.5">
                                            <Send size={13} /> {emailSending ? 'Enviando…' : 'Enviar'}
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => setEmailOpen(false)}>
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handlePrint}
                            className="text-white border-none shadow-md rounded-xl"
                            style={{ background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal})` }}
                        >
                            {mode === 'a4'
                                ? <><Download size={16} className="mr-2" />Exportar PDF</>
                                : <><Printer size={16} className="mr-2" />Imprimir Ticket</>}
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-6">

                    {/* Panel izquierdo: selector */}
                    <div className="xl:w-64 flex-shrink-0 space-y-2">
                        <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Formato de salida
                        </h3>
                        {MODES.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setMode(m.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${mode === m.id
                                    ? isDark ? 'border-blue-500/50 bg-blue-900/20' : 'border-blue-300 bg-blue-50 shadow-sm'
                                    : isDark ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{m.icon}</span>
                                    <div>
                                        <div className={`text-sm font-bold ${mode === m.id ? 'text-blue-500' : isDark ? 'text-slate-200' : 'text-slate-700'}`}>{m.label}</div>
                                        <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{m.desc}</div>
                                    </div>
                                </div>
                            </button>
                        ))}

                        {/* Resumen */}
                        <div className={`mt-4 p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Resumen</h4>
                            {[
                                ['Nº', sale.sale_number],
                                ['Estado', sale.status === 'pending' ? '⏳ Pendiente' : sale.status],
                                ['Total', `$${fmt(sale.total)}`],
                                ['Cobrado', `$${fmt(sale.paid_amount)}`],
                                ['Saldo', `$${fmt(saleBalance)}`],
                                ['Ítems', (sale.sale_items?.length || 0) + ' producto(s)'],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between text-xs py-0.5">
                                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{label}</span>
                                    <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</span>
                                </div>
                            ))}
                            {sale.customer && (
                                <div className="mt-2 pt-2 border-t" style={{ borderColor: isDark ? '#334155' : '#e2e8f0' }}>
                                    <div className="flex items-center gap-1.5">
                                        <User size={12} style={{ color: AD.teal }} />
                                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                            {sale.customer.name}
                                        </span>
                                    </div>
                                    {sale.customer.dni && (
                                        <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            DNI: {sale.customer.dni}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Panel cuenta corriente */}
                        {hasCuentaCorriente && (
                            <div className={`mt-3 p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-teal-700/50' : 'bg-teal-50 border-teal-200'}`}>
                                <div className="flex items-center gap-2 mb-3">
                                    <CreditCard size={14} style={{ color: AD.teal }} />
                                    <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: AD.teal }}>
                                        Cuenta Corriente
                                    </h4>
                                </div>

                                <div className="flex justify-between text-xs mb-3">
                                    <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Saldo pendiente</span>
                                    <span className="font-bold text-sm" style={{ color: ccBalance > 0 ? AD.blue : '#22c55e' }}>
                                        ${fmt(ccBalance ?? account?.balance ?? 0)}
                                    </span>
                                </div>

                                {ccSuccess && (
                                    <div className="flex items-center gap-1.5 text-[11.5px] font-semibold mb-2 text-emerald-500">
                                        <Check size={12} />
                                        Pago registrado correctamente.
                                    </div>
                                )}

                                {ccError && (
                                    <p className="text-[11.5px] text-red-400 mb-2">{ccError}</p>
                                )}

                                <div className="space-y-2">
                                    <input
                                        type="number"
                                        placeholder="Monto a abonar"
                                        value={pagoCC.amount}
                                        onChange={e => setPagoCC(p => ({ ...p, amount: e.target.value }))}
                                        className="w-full outline-none text-sm"
                                        style={{
                                            padding: '8px 10px', borderRadius: 8,
                                            border: `1.5px solid ${isDark ? '#334155' : '#cbd5e1'}`,
                                            background: isDark ? '#1e293b' : '#fff',
                                            color: isDark ? '#f1f5f9' : '#1e293b',
                                            fontFamily: 'inherit',
                                        }}
                                    />
                                    <SearchableSelect
                                        value={String(pagoCC.payment_method_id || '')}
                                        onChange={v => setPagoCC(p => ({ ...p, payment_method_id: v }))}
                                        placeholder="— Método de pago —"
                                        options={paymentMethods.map(pm => ({ value: String(pm.id), label: pm.name }))}
                                    />
                                    <button
                                        onClick={handlePayCC}
                                        disabled={savingCC || !pagoCC.amount}
                                        className="w-full py-2 rounded-lg text-[12.5px] font-bold text-white transition-opacity"
                                        style={{ background: `linear-gradient(135deg, ${AD.teal}, ${AD.blue})`, opacity: savingCC ? 0.6 : 1 }}
                                    >
                                        {savingCC ? 'Guardando...' : 'Registrar pago'}
                                    </button>
                                    <Link href={route('customers.account', sale.customer_id)}
                                        className="block text-center text-[11px] mt-1" style={{ color: AD.teal }}>
                                        Ver cuenta completa →
                                    </Link>
                                </div>
                            </div>
                        )}
                    {/* Panel AFIP / ARCA */}
                    {needsAfip && (
                        <div className={`mt-3 p-4 rounded-xl border ${isDark ? 'bg-slate-900 border-blue-700/40' : 'bg-blue-50/60 border-blue-200'}`}>
                            <div className="flex items-center gap-2 mb-3">
                                <FileCheck2 size={14} style={{ color: AD.blue }} />
                                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: AD.blue }}>
                                    Comprobante AFIP
                                </h4>
                            </div>

                            {/* Ya tiene CAE */}
                            {(afipResult?.cae || sale.invoice?.cae) ? (
                                <div className="space-y-1.5">
                                    <div className={`flex items-center gap-1.5 text-[11.5px] font-semibold text-emerald-500`}>
                                        <Check size={12} /> Autorizado por AFIP
                                    </div>
                                    {[
                                        ['Tipo', sale.invoice?.invoice_type?.name || afipKey],
                                        ['Nº', sale.invoice?.number || afipResult?.number],
                                        ['CAE', sale.invoice?.cae || afipResult?.cae],
                                        ['Vto CAE', sale.invoice?.cae_expiry
                                            ? new Date(sale.invoice.cae_expiry).toLocaleDateString('es-AR')
                                            : afipResult?.cae_expiry],
                                    ].map(([l, v]) => v && (
                                        <div key={l} className="flex justify-between text-[11px]">
                                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{l}</span>
                                            <span className={`font-semibold font-mono ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {/* Selector de tipo */}
                                    <SearchableSelect
                                        value={String(afipKey || '')}
                                        onChange={v => setAfipKey(v)}
                                        options={allowedKeys.map(k => ({ value: k, label: RECEIPT_KEY_LABELS[k] }))}
                                    />

                                    {afipError && (
                                        <div className="flex items-start gap-1.5 text-[11px] text-red-500">
                                            <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                                            <span>{afipError}</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleAfipGenerate}
                                        disabled={afipLoading}
                                        className="w-full py-2 rounded-lg text-[12px] font-bold text-white flex items-center justify-center gap-1.5 transition-opacity"
                                        style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})`, opacity: afipLoading ? 0.7 : 1 }}
                                    >
                                        {afipLoading
                                            ? <><Loader2 size={13} className="animate-spin" /> Procesando…</>
                                            : <><FileCheck2 size={13} /> Generar con AFIP</>}
                                    </button>

                                    <p className={`text-[10px] text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Ambiente: {company.afip_environment === 'prod' ? 'Producción' : 'Homologación'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    </div>

                    {/* Panel de preview */}
                    <div className="flex-1 min-w-0">
                        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                            {/* Barra titular */}
                            <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <span className={`text-xs ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Vista previa — {MODES.find(m => m.id === mode)?.label}
                                </span>
                            </div>

                            {/* Área de preview */}
                            <div
                                className="overflow-auto p-6 flex justify-center"
                                style={{ minHeight: 500, maxHeight: '75vh', background: isDark ? '#0d1520' : '#dde2e8' }}
                            >
                                <div style={{
                                    boxShadow: '0 6px 30px rgba(0,0,0,0.22), 0 1px 5px rgba(0,0,0,0.12)',
                                    display: 'inline-block',
                                    transform: mode === 'a4' ? 'scale(0.72)' : 'scale(1)',
                                    transformOrigin: 'top center',
                                }}>
                                    {mode === '80mm' && <Ticket80 sale={sale} />}
                                    {mode === '57mm' && <Ticket57 sale={sale} />}
                                    {mode === 'a4' && <FacturaA4 sale={sale} />}
                                </div>
                            </div>
                        </div>
                        {mode === 'a4' && (
                            <p className={`text-xs mt-2 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Vista al 72% · El PDF se genera a tamaño real (A4)
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

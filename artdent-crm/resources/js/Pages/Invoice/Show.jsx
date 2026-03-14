/**
 * Invoice/Show.jsx — Detalle y Preview del Presupuesto
 * - Vista previa A4 en pantalla
 * - Botón: Imprimir / Guardar PDF (abre la vista pública para imprimir)
 * - Botón: Compartir por WhatsApp (enlace público /q/{token})
 * - Botón: Copiar enlace
 * - Cambio de estado (borrador → enviado → aceptado / cancelado)
 */
import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    ArrowLeft, Download, Copy, Check, Trash2,
    Send, CheckCircle2, XCircle, Clock, FileText,
} from 'lucide-react';

// ── Brand ──────────────────────────────────────────────────────────────────────
const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE', light: '#DAE6F0' };
const fmt     = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS = {
    draft:     { label: 'Borrador',  css: 'bg-slate-500/10 text-slate-500 border-slate-500/20 dark:text-slate-400', icon: Clock },
    sent:      { label: 'Enviado',   css: 'bg-blue-500/10 text-blue-600 border-blue-500/20',     icon: Send },
    accepted:  { label: 'Aceptado',  css: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 },
    expired:   { label: 'Vencido',   css: 'bg-amber-500/10 text-amber-600 border-amber-500/20',  icon: Clock },
    cancelled: { label: 'Cancelado', css: 'bg-red-500/10 text-red-600 border-red-500/20',        icon: XCircle },
};

function StatusBadge({ status }) {
    const s = STATUS[status] || STATUS.draft;
    const Icon = s.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-bold ${s.css}`}>
            <Icon size={14} />
            {s.label}
        </span>
    );
}

// ── A4 Preview Component ───────────────────────────────────────────────────────
function QuoteA4({ quote }) {
    const items   = quote.invoice_items || [];
    const subtotal = Number(quote.subtotal || 0);
    const discount = Number(quote.discount || 0);
    const taxAmt   = Number(quote.tax_amount || 0);
    const total    = Number(quote.total || 0);

    const notes = quote.notes || '';
    const extraNotes = notes.split('\n').filter(l => !l.startsWith('Tel:') && !l.startsWith('Email:')).join('\n').trim();
    const telLine   = notes.split('\n').find(l => l.startsWith('Tel:'))?.replace('Tel: ', '') || '';
    const emailLine = notes.split('\n').find(l => l.startsWith('Email:'))?.replace('Email: ', '') || '';

    return (
        <div id="quote-a4" style={{
            width: '210mm', minHeight: '297mm',
            fontFamily: "'Montserrat', sans-serif", fontSize: '10pt',
            color: '#1A202C', background: '#fff',
            display: 'flex', flexDirection: 'column',
            boxSizing: 'border-box', overflow: 'hidden',
        }}>
            {/* Top stripe */}
            <div style={{ height: 8, background: `linear-gradient(135deg, ${AD.blue} 0%, ${AD.teal} 55%, ${AD.green} 100%)`, flexShrink: 0 }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8mm 15mm 6mm', borderBottom: `1px solid ${AD.light}`, flexShrink: 0 }}>
                <img src="/assets/logo-artdent-color.png" alt="ArtDent" style={{ height: 52, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                <div style={{ textAlign: 'center', border: '2.5px solid #222', padding: '6px 18px', minWidth: 108, alignSelf: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>P</div>
                    <div style={{ borderTop: '1px solid #222', marginTop: 3, paddingTop: 3, fontSize: 7, fontWeight: 700, letterSpacing: 1 }}>PRESUPUESTO</div>
                    <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1 }}>ORIGINAL</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: AD.blue, letterSpacing: -0.5 }}>PRESUPUESTO</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#222', marginTop: 2 }}>{quote.quote_number}</div>
                    <div style={{ fontSize: 8.5, color: '#555', marginTop: 5, lineHeight: 1.8 }}>
                        <div><strong>Fecha de Emisión:</strong> {fmtDate(quote.issued_at || quote.created_at)}</div>
                        {quote.due_date && <div><strong>Válido hasta:</strong> {fmtDate(quote.due_date)}</div>}
                    </div>
                </div>
            </div>

            {/* Emisor */}
            <div style={{ padding: '5mm 15mm', borderBottom: `1px solid ${AD.light}`, flexShrink: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm', fontSize: 8.5 }}>
                    <div>
                        <div style={{ fontWeight: 800, fontSize: 10.5, color: '#111', marginBottom: 2 }}>ArtDent Laboratorio Odontológico</div>
                        <div style={{ color: '#333', lineHeight: 1.8 }}>Laboratorio Odontológico<br />Argentina</div>
                    </div>
                    <div style={{ textAlign: 'right', color: '#333', lineHeight: 1.8 }}>
                        <div><strong>Condición IVA:</strong> Monotributista</div>
                    </div>
                </div>
            </div>

            {/* Cliente */}
            <div style={{ padding: '4mm 15mm', borderBottom: `1px solid ${AD.light}`, flexShrink: 0, background: '#fafcfe' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8mm', fontSize: 8.5, lineHeight: 1.9 }}>
                    <div>
                        <div><span style={{ fontWeight: 700 }}>Cliente: </span>{quote.recipient_name}</div>
                        {quote.recipient_cuit && <div><span style={{ fontWeight: 700 }}>CUIT/DNI: </span>{quote.recipient_cuit}</div>}
                        {quote.recipient_iva && <div><span style={{ fontWeight: 700 }}>Cond. IVA: </span>{quote.recipient_iva}</div>}
                        {quote.recipient_address && <div><span style={{ fontWeight: 700 }}>Dirección: </span>{quote.recipient_address}</div>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {telLine && <div><span style={{ fontWeight: 700 }}>Tel: </span>{telLine}</div>}
                        {emailLine && <div><span style={{ fontWeight: 700 }}>Email: </span>{emailLine}</div>}
                        <div><span style={{ fontWeight: 700 }}>Cond. Venta: </span>A convenir</div>
                    </div>
                </div>
            </div>

            {/* Ítems */}
            <div style={{ padding: '5mm 15mm 0', flexShrink: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt' }}>
                    <thead>
                        <tr style={{ background: AD.blue, color: '#fff' }}>
                            {[
                                { label: 'Descripción', align: 'left', w: '48%' },
                                { label: 'Cantidad',    align: 'center', w: '12%' },
                                { label: 'U. Medida',   align: 'center', w: '10%' },
                                { label: 'P. Unit.',    align: 'right',  w: '15%' },
                                { label: 'Importe',     align: 'right',  w: '15%' },
                            ].map((h, i) => (
                                <th key={h.label} style={{ padding: '5px 8px', textAlign: h.align, fontWeight: 700, fontSize: 7.5, textTransform: 'uppercase', letterSpacing: 0.3, width: h.w, borderLeft: i > 0 ? '1px solid rgba(255,255,255,.15)' : 'none' }}>
                                    {h.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f5f9fc', borderBottom: `1px solid ${AD.light}` }}>
                                <td style={{ padding: '6px 8px', fontWeight: 600, fontSize: 9 }}>{item.description}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: 9 }}>{Number(item.quantity)}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', fontSize: 8.5, color: '#666' }}>Unid.</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: 9 }}>${fmt(item.unit_price)}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, fontSize: 9, color: AD.blue }}>${fmt(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1, minHeight: '8mm' }} />

            {/* Totales + Footer */}
            <div style={{ flexShrink: 0 }}>
                <div style={{ padding: '0 15mm 5mm', borderTop: `1px solid ${AD.light}` }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '5mm' }}>
                        <div style={{ width: '72mm' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8.5pt', border: `1px solid ${AD.light}` }}>
                                <thead>
                                    <tr style={{ background: '#f0f4f8' }}>
                                        <th style={{ padding: '4px 8px', textAlign: 'left',  fontWeight: 700, fontSize: 7.5, textTransform: 'uppercase' }}>Descripción</th>
                                        <th style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 700, fontSize: 7.5, textTransform: 'uppercase' }}>Importe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subtotal > 0 && <tr style={{ borderTop: `1px solid ${AD.light}` }}><td style={{ padding: '4px 8px' }}>Neto gravado:</td><td style={{ padding: '4px 8px', textAlign: 'right' }}>${fmt(subtotal)}</td></tr>}
                                    {discount > 0 && <tr style={{ borderTop: `1px solid ${AD.light}` }}><td style={{ padding: '4px 8px' }}>Descuento:</td><td style={{ padding: '4px 8px', textAlign: 'right', color: '#dc2626' }}>-${fmt(discount)}</td></tr>}
                                    {taxAmt > 0 && <tr style={{ borderTop: `1px solid ${AD.light}` }}><td style={{ padding: '4px 8px' }}>IVA (discriminado):</td><td style={{ padding: '4px 8px', textAlign: 'right' }}>${fmt(taxAmt)}</td></tr>}
                                </tbody>
                            </table>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 8px', background: AD.blue, color: '#fff', borderRadius: '0 0 4px 4px' }}>
                                <span style={{ fontWeight: 900, fontSize: '10pt', letterSpacing: 0.5 }}>IMPORTE TOTAL: $</span>
                                <span style={{ fontWeight: 900, fontSize: '13pt' }}>{fmt(total)}</span>
                            </div>
                        </div>
                    </div>
                    {extraNotes && (
                        <div style={{ marginTop: 8, fontSize: 8, color: '#555', lineHeight: 1.6 }}>
                            <strong>Notas:</strong> {extraNotes}
                        </div>
                    )}
                    <div style={{ marginTop: 8, fontSize: 8, color: '#888' }}>
                        Este presupuesto no constituye factura. Precios sujetos a variación.
                        {quote.due_date && ` Válido hasta: ${fmtDate(quote.due_date)}.`}
                    </div>
                </div>

                <div style={{ padding: '4mm 15mm', borderTop: `1px solid ${AD.light}`, background: '#fafcfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img src="/assets/logo-artdent-icon.png" alt="ArtDent" style={{ height: 26, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
                            <span style={{ fontSize: 7.5, color: AD.teal, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                Tu sonrisa, es nuestra prioridad.
                            </span>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 7, color: '#bbb', lineHeight: 1.7 }}>
                            <div>Presupuesto no válido como factura</div>
                            <div>ArtDent CRM — {new Date().toLocaleDateString('es-AR')}</div>
                        </div>
                    </div>
                </div>
                <div style={{ height: 5, background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.green})` }} />
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Show({ auth, item, shareUrl }) {
    const { isDark } = useTheme();
    const [copied, setCopied]       = useState(false);
    const [changing, setChanging]   = useState(false);

    const handlePrint = () => {
        if (shareUrl) {
            window.open(shareUrl, '_blank');
        }
    };

    const copyLink = () => {
        if (shareUrl) {
            navigator.clipboard.writeText(shareUrl).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    const changeStatus = (newStatus) => {
        setChanging(true);
        router.patch(route('quotes.status', item.id), { status: newStatus }, {
            onFinish: () => setChanging(false),
        });
    };

    const waText = shareUrl
        ? encodeURIComponent(`Hola ${item.recipient_name}! Te comparto el presupuesto ${item.quote_number} de ArtDent Laboratorio Odontológico. Podés verlo o imprimirlo aquí: ${shareUrl}`)
        : '';

    const STATUS_ACTIONS = [
        { id: 'draft',     label: 'Borrador',  icon: Clock,       show: item.status !== 'draft' && item.status !== 'cancelled' },
        { id: 'sent',      label: 'Enviado',   icon: Send,        show: item.status === 'draft' || item.status === 'accepted' },
        { id: 'accepted',  label: 'Aceptado',  icon: CheckCircle2,show: item.status === 'sent' || item.status === 'draft' },
        { id: 'expired',   label: 'Vencido',   icon: Clock,       show: item.status === 'sent' },
        { id: 'cancelled', label: 'Cancelar',  icon: XCircle,     show: item.status !== 'cancelled' },
    ].filter(a => a.show);

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Presupuesto ${item.quote_number}`}>
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet" />
            </Head>

            <div className="max-w-6xl mx-auto space-y-5 font-sans px-4 sm:px-0">

                {/* ── Top bar ── */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href={route('quotes.index')}>
                            <Button variant="outline" size="icon" className={`rounded-xl ${isDark ? 'border-slate-700 hover:bg-slate-800' : ''}`}>
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight flex flex-wrap items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {item.quote_number}
                                <StatusBadge status={item.status} />
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {item.recipient_name} · {fmtDate(item.issued_at || item.created_at)}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Copy link */}
                        {shareUrl && (
                            <button
                                onClick={copyLink}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all
                                    ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}
                                `}
                            >
                                {copied ? <Check size={15} className="text-green-500" /> : <Copy size={15} />}
                                {copied ? 'Copiado!' : 'Copiar enlace'}
                            </button>
                        )}

                        {/* WhatsApp */}
                        {shareUrl && (
                            <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
                                    style={{ background: '#25D366' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    WhatsApp
                                </button>
                            </a>
                        )}

                        {/* Print / PDF */}
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg"
                            style={{ background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal})` }}
                        >
                            <Download size={15} />
                            Guardar PDF
                        </button>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-5">

                    {/* ── Left sidebar ── */}
                    <div className="xl:w-64 flex-shrink-0 space-y-4">

                        {/* Summary */}
                        <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Resumen
                            </h3>
                            {[
                                ['Número', item.quote_number],
                                ['Cliente', item.recipient_name],
                                ['Emitido', fmtDate(item.issued_at || item.created_at)],
                                ['Validez', item.due_date ? fmtDate(item.due_date) : '—'],
                                ['Ítems', `${(item.invoice_items?.length || 0)} producto(s)`],
                                ['Total', `$${fmt(item.total)}`],
                            ].map(([label, value]) => (
                                <div key={label} className={`flex justify-between text-xs py-0.5 border-b last:border-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                                    <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>{label}</span>
                                    <span className={`font-semibold text-right max-w-[120px] truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Shareable link */}
                        {shareUrl && (
                            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Enlace público
                                </h3>
                                <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Compartí este enlace con tu cliente. Podrá verlo sin iniciar sesión.
                                </p>
                                <div className={`flex items-center gap-2 p-2 rounded-xl border text-xs break-all mb-2 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                    {shareUrl}
                                </div>
                                <button onClick={copyLink}
                                    className={`w-full py-2 rounded-xl text-xs font-bold border transition-colors ${isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    {copied ? '✓ Copiado!' : 'Copiar enlace'}
                                </button>
                            </div>
                        )}

                        {/* Status actions */}
                        {STATUS_ACTIONS.length > 0 && (
                            <div className={`rounded-2xl border p-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Cambiar estado
                                </h3>
                                <div className="space-y-2">
                                    {STATUS_ACTIONS.map(action => {
                                        const Icon = action.icon;
                                        return (
                                            <button key={action.id} disabled={changing}
                                                onClick={() => changeStatus(action.id)}
                                                className={`w-full flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold border transition-colors
                                                    ${action.id === 'cancelled'
                                                        ? (isDark ? 'border-red-800 text-red-400 hover:bg-red-900/20' : 'border-red-200 text-red-600 hover:bg-red-50')
                                                        : (isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50')
                                                    }
                                                `}>
                                                <Icon size={13} />
                                                {action.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── A4 Preview ── */}
                    <div className="flex-1 min-w-0">
                        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-slate-50'}`}>
                            {/* Browser chrome bar */}
                            <div className={`flex items-center gap-2 px-4 py-2.5 border-b ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <span className={`text-xs ml-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Vista previa A4 · {item.quote_number}
                                </span>
                                {shareUrl && (
                                    <a href={shareUrl} target="_blank" rel="noopener noreferrer"
                                        className={`ml-auto text-xs underline ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'}`}>
                                        Abrir vista pública ↗
                                    </a>
                                )}
                            </div>

                            {/* Preview area */}
                            <div className="overflow-auto p-6 flex justify-center"
                                style={{ minHeight: 500, maxHeight: '75vh', background: isDark ? '#0d1520' : '#dde2e8' }}>
                                <div style={{
                                    boxShadow: '0 6px 30px rgba(0,0,0,.22), 0 1px 5px rgba(0,0,0,.12)',
                                    transform: 'scale(0.72)',
                                    transformOrigin: 'top center',
                                    marginBottom: '-83mm', // collapses dead whitespace: (1-0.72)*297mm
                                }}>
                                    <QuoteA4 quote={item} />
                                </div>
                            </div>
                        </div>
                        <p className={`text-xs mt-2 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Vista al 72% · El PDF se genera a tamaño real (A4) al hacer "Guardar PDF"
                        </p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

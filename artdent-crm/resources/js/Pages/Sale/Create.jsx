/**
 * Sale/Create.jsx — POS Facturar
 * Mobile: Catálogo full-screen + FAB carrito → Bottom Sheet
 * Desktop: Split layout 65/35
 */
import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    ShoppingCart, User, Search, Plus, Minus, Trash2,
    CreditCard, X, Package, ReceiptText, Store,
    Download, Share2, Printer, MessageCircle, Check,
    ChevronRight,
} from 'lucide-react';
import {
    B, G, useD, fmt,
    FAB, BottomSheet, Modal, Btn, ProductCard, TabStrip,
    Badge,
} from '@/Components/_appkit';

const TIPOS = [
    { id: 'X', label: 'Ticket X',  desc: 'Sin factura',    accentColor: '#64748b' },
    { id: 'A', label: 'Factura A', desc: 'Resp. Inscripto', accentColor: B.blue   },
    { id: 'B', label: 'Factura B', desc: 'Cons. Final',     accentColor: B.green  },
    { id: 'C', label: 'Factura C', desc: 'Monotributista',  accentColor: B.teal   },
];

const PAYMENT_METHODS = [
    { id: 'cash',     name: 'Efectivo'       },
    { id: 'debit',    name: 'Débito'         },
    { id: 'credit',   name: 'Crédito'        },
    { id: 'transfer', name: 'Transferencia'  },
];

// ─── Brand / layout ──────────────────────────────────────────
const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE' };
const G_bar     = `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.green})`;
const G_primary = `linear-gradient(135deg, ${AD.blue}, ${AD.teal})`;
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';
const fmtTime   = (d) => d ? new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : '—';

// ─── Ticket thermal (80mm / 57mm) ────────────────────────────
function TicketBase({ sale, widthMM = 80 }) {
    const is57   = widthMM === 57;
    const items  = sale.sale_items || sale.items || [];
    const total  = Number(sale.total || 0);
    const fmtN   = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
    const medioPago = sale.sale_payments?.[0]?.payment_method?.name || sale.payment_method || 'Efectivo';
    const cajero    = sale.user?.name || 'Sistema';
    const nroComp   = sale.sale_number || `VNT-${String(sale.id ?? 1).padStart(8, '0')}`;
    const F = { logo: is57?28:36, cond: is57?9:10, head: is57?11:14, label: is57?8:10, th: is57?7.5:9, td: is57?7.5:9, total: is57?12:16, small: is57?7:8 };
    const LINE = '2px solid #000', DASH = '2px dashed #000';
    const Row = ({ label, value }) => (
        <div style={{ fontSize:`${F.label}pt`, marginBottom:3, lineHeight:1.25, wordWrap:'break-word' }}>
            <span style={{ fontWeight:700, marginRight:4 }}>{label}:</span>
            <span style={{ fontWeight:500 }}>{value}</span>
        </div>
    );
    return (
        <div style={{ width:`${is57?50:74}mm`, fontFamily:"'Courier New',Courier,monospace", fontSize:`${F.label}pt`, color:'#000', background:'#fff', lineHeight:1.45, boxSizing:'border-box' }}>
            <div style={{ textAlign:'center', marginBottom:is57?5:7, marginTop:5 }}>
                <img src="/assets/logo-artdent-negro.png" alt="ArtDent" style={{ height:F.logo, objectFit:'contain', display:'inline-block' }} />
            </div>
            <div style={{ textAlign:'center', fontSize:F.cond, fontWeight:700, marginBottom:is57?5:6 }}>MONOTRIBUTISTA</div>
            <div style={{ borderTop:LINE, marginBottom:is57?5:6 }} />
            <div style={{ textAlign:'center', fontWeight:900, fontSize:F.head, marginBottom:is57?6:8, padding:`${is57?3:4}px 0`, borderTop:'2px solid #000', borderBottom:'2px solid #000' }}>
                TICKET X
            </div>
            <div style={{ marginBottom:is57?6:8 }}>
                <Row label="NRO" value={nroComp} />
                <Row label="FECHA" value={`${fmtDate(sale.sold_at)}, ${fmtTime(sale.sold_at)}`} />
                <Row label="CLIENTE" value={sale.customer_name || 'Consumidor Final'} />
            </div>
            <div style={{ borderTop:LINE, marginBottom:is57?4:5 }} />
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:F.th, marginBottom:is57?4:6 }}>
                <thead><tr style={{ borderBottom:'2px solid #000' }}>
                    {['Descripción','Can','Uni','Total'].map((h,i) => (
                        <th key={h} style={{ padding:`3px ${i===0?0:2}px`, textAlign:i===0?'left':'center', fontWeight:900, fontSize:F.th, borderBottom:'2px solid #000', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                </tr></thead>
                <tbody>
                    {items.map((it, i) => (
                        <tr key={i} style={{ borderBottom:'1px solid #000' }}>
                            <td style={{ padding:'3px 0', fontSize:F.td, fontWeight:600 }}>{it.name || it.product_name}</td>
                            <td style={{ padding:'3px 2px', textAlign:'center', fontSize:F.td, fontWeight:700 }}>{Number(it.quantity)}</td>
                            <td style={{ padding:'3px 2px', textAlign:'center', fontSize:F.td }}>{fmtN(it.unit_price)}</td>
                            <td style={{ padding:'3px 0', textAlign:'center', fontSize:F.td, fontWeight:900 }}>{fmtN(it.total)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div style={{ borderTop:LINE, marginBottom:is57?5:6 }} />
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:F.total, fontWeight:900, marginBottom:is57?6:8 }}>
                <span>TOTAL</span><span>$ {fmtN(total)}</span>
            </div>
            <div style={{ borderTop:DASH, marginBottom:is57?5:6 }} />
            <Row label="MEDIO DE PAGO" value={medioPago} />
            <Row label="CAJERO" value={cajero} />
            {Number(sale.change_amount) > 0 && <Row label="VUELTO" value={`$ ${fmtN(sale.change_amount)}`} />}
            <div style={{ borderTop:DASH, marginBottom:is57?5:7 }} />
            <div style={{ textAlign:'center', fontSize:F.small, fontWeight:600 }}>
                <div style={{ fontWeight:900 }}>Gracias por su compra.</div>
                <div style={{ marginTop:2, fontWeight:500 }}>Comprobante no válido como factura</div>
            </div>
        </div>
    );
}

// ─── Factura A4 ───────────────────────────────────────────────
function FacturaA4({ sale }) {
    const items    = sale.sale_items || sale.items || [];
    const total    = Number(sale.total || 0);
    const discount = Number(sale.discount_amount || 0);
    const fmtN     = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
    return (
        <div id="postsale-a4" style={{ width:'210mm', minHeight:'297mm', fontFamily:"'Montserrat',sans-serif", fontSize:'10pt', color:'#1A202C', background:'#fff', display:'flex', flexDirection:'column', boxSizing:'border-box' }}>
            <div style={{ background:G_bar, height:8, flexShrink:0 }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'8mm 15mm 6mm', borderBottom:`1px solid ${AD.light||'#DAE6F0'}`, flexShrink:0 }}>
                <img src="/assets/logo-artdent-color.png" alt="ArtDent" style={{ height:52, objectFit:'contain' }} />
                <div style={{ textAlign:'center', border:'2.5px solid #222', padding:'6px 18px', minWidth:108, alignSelf:'center' }}>
                    <div style={{ fontSize:32, fontWeight:900, lineHeight:1, letterSpacing:-1 }}>X</div>
                    <div style={{ borderTop:'1px solid #222', marginTop:3, paddingTop:3, fontSize:7, fontWeight:700, letterSpacing:1 }}>CÓD. 00</div>
                    <div style={{ fontSize:7, fontWeight:700, letterSpacing:1 }}>ORIGINAL</div>
                </div>
                <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:22, fontWeight:900, color:AD.blue, letterSpacing:-0.5 }}>TICKET</div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#222', marginTop:2 }}>{sale.sale_number || `VNT-${String(sale.id??1).padStart(8,'0')}`}</div>
                    <div style={{ fontSize:8.5, color:'#555', marginTop:5, lineHeight:1.8 }}>
                        <div><strong>Fecha:</strong> {fmtDate(sale.sold_at)}</div>
                        <div><strong>Hora:</strong> {fmtTime(sale.sold_at)}</div>
                    </div>
                </div>
            </div>
            <div style={{ padding:'5mm 15mm', borderBottom:`1px solid #DAE6F0`, flexShrink:0 }}>
                <div style={{ fontSize:8.5, lineHeight:1.8, color:'#333' }}>
                    <div style={{ fontWeight:800, fontSize:10.5, color:'#111', marginBottom:2 }}>ArtDent Laboratorio Odontológico</div>
                    <div>Argentina · <strong>Cond. IVA:</strong> Monotributista</div>
                </div>
            </div>
            <div style={{ padding:'4mm 15mm', borderBottom:`1px solid #DAE6F0`, flexShrink:0, background:'#fafcfe' }}>
                <div style={{ fontSize:8.5, lineHeight:1.9 }}>
                    <div><strong>Nombre:</strong> {sale.customer_name || 'Consumidor Final'}</div>
                    <div><strong>Cond. Venta:</strong> Contado</div>
                </div>
            </div>
            <div style={{ padding:'5mm 15mm 0', flexShrink:0 }}>
                <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'8.5pt' }}>
                    <thead><tr style={{ background:AD.blue, color:'#fff' }}>
                        {[{l:'Descripción',w:'44%',a:'left'},{l:'Cantidad',w:'12%',a:'center'},{l:'P. Unit.',w:'18%',a:'right'},{l:'Importe',w:'14%',a:'right'}].map((h,i) => (
                            <th key={h.l} style={{ padding:'5px 8px', textAlign:h.a, fontWeight:700, fontSize:7.5, textTransform:'uppercase', letterSpacing:0.3, width:h.w, borderLeft:i>0?'1px solid rgba(255,255,255,0.15)':'none' }}>{h.l}</th>
                        ))}
                    </tr></thead>
                    <tbody>
                        {items.map((it, i) => (
                            <tr key={i} style={{ background:i%2===0?'#fff':'#f5f9fc', borderBottom:`1px solid #DAE6F0` }}>
                                <td style={{ padding:'6px 8px', fontWeight:600, fontSize:9 }}>{it.name || it.product_name}</td>
                                <td style={{ padding:'6px 8px', textAlign:'center', fontSize:9 }}>{Number(it.quantity)}</td>
                                <td style={{ padding:'6px 8px', textAlign:'right', fontSize:9 }}>{fmtN(it.unit_price)}</td>
                                <td style={{ padding:'6px 8px', textAlign:'right', fontWeight:700, fontSize:9, color:AD.blue }}>{fmtN(it.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div style={{ flex:1, minHeight:'8mm' }} />
            <div style={{ flexShrink:0 }}>
                <div style={{ padding:'0 15mm 5mm', borderTop:`1px solid #DAE6F0` }}>
                    <div style={{ display:'flex', justifyContent:'flex-end', paddingTop:'5mm' }}>
                        <div style={{ width:'72mm' }}>
                            {discount > 0 && (
                                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:'8.5pt' }}>
                                    <span>Descuento:</span><span style={{ color:'#c00' }}>-{fmtN(discount)}</span>
                                </div>
                            )}
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'5px 8px', background:AD.blue, color:'#fff', borderRadius:4 }}>
                                <span style={{ fontWeight:900, fontSize:'10pt' }}>IMPORTE TOTAL: $</span>
                                <span style={{ fontWeight:900, fontSize:'13pt' }}>{fmtN(total)}</span>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginTop:6, fontSize:8, color:'#555' }}>
                        <strong>Recibido:</strong> ${fmtN(sale.paid_amount)}
                        {Number(sale.change_amount) > 0 && <span style={{ marginLeft:12 }}><strong>Vuelto:</strong> ${fmtN(sale.change_amount)}</span>}
                    </div>
                </div>
                <div style={{ padding:'4mm 15mm', borderTop:`1px solid #DAE6F0`, background:'#fafcfe', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <img src="/assets/logo-artdent-icon.png" alt="ArtDent" style={{ height:26, objectFit:'contain' }} />
                        <span style={{ fontSize:7.5, color:AD.teal, fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>Tu sonrisa, es nuestra prioridad.</span>
                    </div>
                    <div style={{ textAlign:'right', fontSize:7, color:'#bbb', lineHeight:1.7 }}>
                        <div>Comprobante no válido como factura</div>
                        <div>Generado por ArtDent CRM</div>
                    </div>
                </div>
                <div style={{ background:G_bar, height:5 }} />
            </div>
        </div>
    );
}

export default function Create({ auth, products }) {
    const { isDark, sidebarCollapsed } = useTheme();
    const D = useD(isDark);

    // ── State ────────────────────────────────────────────────
    const [busca, setBusca]               = useState('');
    const [cart, setCart]                 = useState([]);
    const [receiptType, setReceiptType]   = useState('C');
    const [customerName, setCustomerName] = useState('Consumidor Final');
    const [customerId, setCustomerId]     = useState('');
    const [notes, setNotes]               = useState('');
    const [processing, setProcessing]     = useState(false);

    // Mobile sheets
    const [cartOpen, setCartOpen]         = useState(false);
    const [clienteOpen, setClienteOpen]   = useState(false);
    const [pagoOpen, setPagoOpen]         = useState(false);
    const [altaOpen, setAltaOpen]         = useState(false);

    // Pago
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [receivedAmount, setReceivedAmount] = useState('');

    // Alta rápida
    const [newProd, setNewProd]           = useState({ name: '', sku: '', price: '', tax_rate: '21' });
    const [savingProd, setSavingProd]     = useState(false);
    const [prodError, setProdError]       = useState('');

    // Post-sale modal
    const [postSale, setPostSale]         = useState(null);  // sale object returned from server
    const [postSaleOpen, setPostSaleOpen] = useState(false);
    const [printMode, setPrintMode]       = useState('80mm'); // '80mm' | '57mm'
    const [printView, setPrintView]       = useState('actions'); // 'actions' | 'print'
    const [waPhone, setWaPhone]           = useState('');
    const [waStep, setWaStep]             = useState('actions'); // 'actions' | 'phone'

    // ── Derived ──────────────────────────────────────────────
    const filteredProducts = useMemo(() => {
        if (!busca) return products;
        const lower = busca.toLowerCase();
        return products.filter(p =>
            (p.name   && p.name.toLowerCase().includes(lower))   ||
            (p.sku    && p.sku.toLowerCase().includes(lower))     ||
            (p.barcode && p.barcode.toLowerCase().includes(lower))
        );
    }, [products, busca]);

    const totals = useMemo(() => {
        let total = 0, neto = 0, iva = 0;
        cart.forEach(item => {
            const lineTotal = item.total;
            total += lineTotal;
            if (item.tax_rate > 0 && !['C', 'X'].includes(receiptType)) {
                const lineNeto = lineTotal / (1 + item.tax_rate);
                neto += lineNeto;
                iva  += lineTotal - lineNeto;
            } else {
                neto += lineTotal;
            }
        });
        return { total, neto, iva };
    }, [cart, receiptType]);

    const itemCount   = cart.reduce((s, i) => s + i.quantity, 0);
    const isCash      = paymentMethod === 'cash';
    const changeAmt   = isCash && Number(receivedAmount) > totals.total
        ? Number(receivedAmount) - totals.total : 0;

    // ── Cart actions ─────────────────────────────────────────
    const addToCart = (product) => {
        const existing = cart.find(i => i.product_id === product.id);
        const price    = Number(product.price);
        const taxRate  = Number(product.tax_rate || 21) / 100;

        if (existing) {
            updateQty(product.id, existing.quantity + 1);
        } else {
            setCart(prev => [...prev, {
                product_id: product.id, name: product.name,
                unit_price: price, tax_rate: taxRate,
                quantity: 1, discount: 0, total: price,
            }]);
        }
    };

    const updateQty = (productId, qty) => {
        if (qty <= 0) return removeFromCart(productId);
        setCart(prev => prev.map(i => i.product_id === productId
            ? { ...i, quantity: qty, total: i.unit_price * qty - i.discount }
            : i
        ));
    };

    const removeFromCart = (productId) =>
        setCart(prev => prev.filter(i => i.product_id !== productId));

    const clearCart = () => {
        setCart([]);
        setCustomerName('Consumidor Final');
        setCustomerId('');
    };

    // ── Submit ───────────────────────────────────────────────
    const handleCobrar = () => {
        if (cart.length === 0) return;
        setReceivedAmount(String(totals.total));
        setPagoOpen(true);
    };

    const handleConfirmPayment = () => {
        const paid = Number(receivedAmount);
        const payload = {
            customer_id: customerId,
            customer_name: customerName,
            notes,
            items: cart,
            subtotal: totals.neto,
            discount_amount: 0,
            tax_amount: totals.iva,
            total: totals.total,
            paid_amount: paid,
            change_amount: Math.max(0, paid - totals.total),
            payment_method: paymentMethod,
            receipt_type: receiptType,
        };
        setProcessing(true);
        router.post(route('sales.store'), payload, {
            preserveState: true,   // no navegar automáticamente
            onSuccess: (page) => {
                setProcessing(false);
                setPagoOpen(false);
                // Intentar obtener la venta del flash o props de la página
                const sale = page?.props?.sale || page?.props?.flash?.sale || {
                    ...payload,
                    id: page?.props?.saleId || Date.now(),
                    sale_number: page?.props?.saleNumber || `VNT-${Date.now()}`,
                    sold_at: new Date().toISOString(),
                };
                setPostSale(sale);
                setPrintView('actions');
                setWaStep('actions');
                setWaPhone('');
                setPostSaleOpen(true);
            },
            onError: (errs) => {
                setProcessing(false);
                alert('Error: ' + (errs?.error || Object.values(errs).join(' | ')));
            },
        });
    };

    // ── Post-sale actions ─────────────────────────────────────
    const handleExportPDF = () => {
        if (!postSale) return;
        const el = document.getElementById('postsale-a4');
        if (!el) return;
        const win = window.open('', '_blank');
        win.document.write(`<!DOCTYPE html><html><head>
            <title>ArtDent — ${postSale.sale_number || 'Comprobante'}</title>
            <base href="${window.location.origin}">
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;900&display=swap" rel="stylesheet">
            <style>
                @page { size: A4; margin: 0; }
                body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            </style>
            </head><body>${el.outerHTML}</body></html>`);
        win.document.close();
        setTimeout(() => { win.focus(); win.print(); }, 600);
    };

    const handleShare = async () => {
        if (!postSale) return;
        const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
        const text = `🦷 *ArtDent* — Comprobante ${postSale.sale_number}\nTotal: $${Number(postSale.total).toLocaleString('es-AR')}\nFecha: ${new Date().toLocaleDateString('es-AR')}`;

        if (isMobile && navigator.share) {
            try { await navigator.share({ title: 'Comprobante ArtDent', text }); } catch {}
            return;
        }
        // Desktop → WhatsApp
        setWaStep('phone');
    };

    const handleSendWhatsApp = () => {
        if (!postSale) return;
        const phone = waPhone.replace(/\D/g, '');
        const text  = encodeURIComponent(
            `🦷 *ArtDent* — Comprobante ${postSale.sale_number}\n` +
            `Cliente: ${postSale.customer_name || 'Consumidor Final'}\n` +
            `Total: $${Number(postSale.total).toLocaleString('es-AR')}\n` +
            `Fecha: ${new Date().toLocaleDateString('es-AR')}\n\n` +
            `_ArtDent Laboratorio Odontológico_`
        );
        window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
    };

    const handlePrint = async () => {
        if (!postSale) return;
        const el = document.getElementById('postsale-ticket');
        if (!el) return;
        const html = `<!DOCTYPE html><html><head>
            <base href="${window.location.origin}">
            <style>@page{margin:0;size:auto}body{margin:0;background:#fff;-webkit-print-color-adjust:exact}</style>
            </head><body>${el.outerHTML}</body></html>`;
        try {
            const res = await fetch('http://localhost:1234/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html, mode: printMode }),
            });
            if (!res.ok) alert('Error en el servidor de impresión.');
        } catch {
            alert('⚠️ El gestor de impresión ArtDent no está activo.');
        }
    };

    const handleClosePostSale = () => {
        setPostSaleOpen(false);
        setPostSale(null);
        clearCart();
        // navegar al index de ventas
        router.visit(route('sales.index'));
    };

    // ── Alta rápida ──────────────────────────────────────────
    const handleCreateProd = async () => {
        if (!newProd.name.trim() || !newProd.price) {
            setProdError('Nombre y precio son obligatorios.');
            return;
        }
        setSavingProd(true);
        setProdError('');
        try {
            const res = await axios.post(route('products.store'), newProd, {
                headers: { Accept: 'application/json' },
            });
            setAltaOpen(false);
            setNewProd({ name: '', sku: '', price: '', tax_rate: '21' });
            router.reload({ only: ['products'] });
            addToCart({ ...res.data.product, price: Number(res.data.product.price) });
        } catch (e) {
            setProdError(e.response?.data?.message || 'Error al crear producto');
        } finally {
            setSavingProd(false);
        }
    };

    // ── Input styles (inline, compatibles con light/dark) ────
    const inputStyle = {
        width: '100%', padding: '10px 12px', borderRadius: 11,
        border: `1.5px solid ${D.inputBorder}`, background: D.input,
        color: D.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
    };

    // ── Cart panel JSX (shared between desktop & bottom sheet) ─
    const CartPanel = ({ inSheet = false }) => (
        <>
            {/* Header carrito */}
            <div className={`px-4 pt-4 pb-3 flex-shrink-0 ${!inSheet ? `border-b` : ''}`}
                style={!inSheet ? { borderColor: D.divider } : {}}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={18} color={B.blue} />
                        <span className="font-extrabold text-[14.5px]" style={{ color: D.text }}>Orden</span>
                        {itemCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-[5px] text-[10.5px] font-bold"
                                style={{ background: `${B.blue}33`, color: B.blue, border: `1px solid ${B.blue}40` }}>
                                {itemCount}
                            </span>
                        )}
                    </div>
                    {cart.length > 0 && (
                        <button onClick={clearCart} className="text-[11.5px] font-semibold px-2.5 py-1 rounded-[7px] transition-colors"
                            style={{ color: B.red }}>
                            Limpiar
                        </button>
                    )}
                </div>

                {/* Selector cliente */}
                <button
                    onClick={() => setClienteOpen(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-[10px] text-[12.5px] font-semibold mb-2 transition-colors"
                    style={{
                        border: `1.5px solid ${customerId ? `${B.blue}73` : D.border}`,
                        color: customerId ? B.blue : D.muted,
                        background: customerId ? `${B.blue}1F` : 'transparent',
                    }}
                >
                    <User size={15} />
                    <span className="flex-1 text-left truncate">
                        {customerName === 'Consumidor Final' ? 'Seleccionar cliente' : customerName}
                    </span>
                    {!customerId && <Plus size={13} className="opacity-50" />}
                </button>

                {/* Tipo comprobante */}
                <div className="relative">
                    <select
                        value={receiptType}
                        onChange={e => setReceiptType(e.target.value)}
                        className="w-full appearance-none outline-none font-bold cursor-pointer"
                        style={{ ...inputStyle, padding: '9px 32px 9px 12px', fontSize: 13 }}
                    >
                        {TIPOS.map(t => (
                            <option key={t.id} value={t.id}>{t.id} — {t.label} ({t.desc})</option>
                        ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 4l4 4 4-4" stroke={D.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3"
                style={{ minHeight: inSheet ? 120 : 0 }}>
                {cart.length === 0 ? (
                    <div className="h-full min-h-[120px] flex flex-col items-center justify-center text-center pb-4">
                        <ShoppingCart size={36} style={{ color: 'rgba(255,255,255,0.08)' }} className="mb-2" />
                        <p className="text-[13px] font-semibold" style={{ color: D.muted }}>Carrito vacío</p>
                        <p className="text-[11.5px] mt-1" style={{ color: D.placeholder }}>
                            Tocá un artículo para agregarlo
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {cart.map(item => (
                            <div key={item.product_id}
                                className="flex items-center gap-3 p-[8px_10px] rounded-[10px]"
                                style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${D.border}` }}>
                                <div className="flex-1 min-w-0">
                                    <div className="text-[12.5px] font-bold leading-[1.2] mb-0.5 truncate" style={{ color: D.text }}>
                                        {item.name}
                                    </div>
                                    <div className="text-[11px]" style={{ color: D.muted }}>
                                        ${fmt(item.unit_price)} × {item.quantity}
                                        {' '}<span className="font-bold" style={{ color: B.blue }}>= ${fmt(item.total)}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                    <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                                        className="w-[26px] h-[26px] rounded-lg flex items-center justify-center transition-colors"
                                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <Minus size={12} color={D.text} />
                                    </button>
                                    <span className="w-5 text-center text-[12px] font-extrabold" style={{ color: D.text }}>
                                        {item.quantity}
                                    </span>
                                    <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                                        className="w-[26px] h-[26px] rounded-lg flex items-center justify-center transition-colors"
                                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <Plus size={12} color={D.text} />
                                    </button>
                                    <button onClick={() => removeFromCart(item.product_id)}
                                        className="w-[26px] h-[26px] ml-1 rounded-lg flex items-center justify-center"
                                        style={{ color: B.red }}>
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Totales + Cobrar */}
            {cart.length > 0 && (
                <div className="px-4 pt-3 pb-4 flex-shrink-0 space-y-2"
                    style={{ borderTop: `1px solid ${D.divider}` }}>
                    <div className="space-y-1 text-[11.5px]">
                        {['A', 'B'].includes(receiptType) && (
                            <div className="flex justify-between">
                                <span style={{ color: D.muted }}>Subtotal neto</span>
                                <span className="font-semibold" style={{ color: D.text }}>${fmt(totals.neto)}</span>
                            </div>
                        )}
                        {totals.iva > 0 && !['C', 'X'].includes(receiptType) && (
                            <div className="flex justify-between">
                                <span style={{ color: D.muted }}>IVA 21%</span>
                                <span className="font-semibold" style={{ color: D.text }}>${fmt(totals.iva)}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-baseline pt-1">
                        <span className="text-[13px] font-extrabold tracking-[0.01em]" style={{ color: D.text }}>TOTAL</span>
                        <span className="text-[28px] font-extrabold tracking-[-0.02em]" style={{ color: B.blue }}>
                            ${fmt(totals.total)}
                        </span>
                    </div>

                    <button
                        onClick={handleCobrar}
                        disabled={processing}
                        className="w-full flex items-center justify-center gap-2 py-[14px] rounded-[12px] text-white font-extrabold text-[15px] transition-all active:scale-[0.98]"
                        style={{
                            background: G.horizontal,
                            boxShadow: `0 6px 20px ${B.green}6B`,
                            opacity: processing ? 0.7 : 1,
                        }}
                    >
                        <ReceiptText size={19} />
                        Cobrar ${fmt(totals.total)}
                    </button>
                </div>
            )}
        </>
    );

    // ─────────────────────────────────────────────────────────
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Facturar POS" />

            {/*
                Full-viewport container. Ocupa todo el espacio después del nav (top-16 = 64px).
                En desktop también compensa el sidebar (left-64 / left-20).
            */}
            <div
                className={`fixed inset-0 top-16 z-[5] flex flex-col lg:flex-row overflow-hidden transition-all duration-300
                    ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}
                `}
                style={{ background: D.surface }}
            >
                {/* ═══ LEFT — Catálogo ═══════════════════════════════════════ */}
                <div className="w-full lg:flex-1 h-full flex flex-col overflow-hidden"
                    style={{ borderRight: `1px solid ${D.divider}` }}>

                    {/* Search bar */}
                    <div className="px-4 pt-4 pb-3 flex items-center gap-3 flex-shrink-0">
                        <div className="flex-1 flex items-center h-10 px-3 rounded-[10px]"
                            style={{ background: D.card }}>
                            <Search size={16} className="mr-2 flex-shrink-0" style={{ color: D.muted }} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, SKU o código..."
                                value={busca}
                                onChange={e => setBusca(e.target.value)}
                                className="w-full h-full bg-transparent border-none focus:ring-0 text-[13.5px] outline-none"
                                style={{ color: D.text }}
                            />
                            {busca && (
                                <button onClick={() => setBusca('')} className="ml-1 p-1 rounded-full">
                                    <X size={13} style={{ color: D.muted }} />
                                </button>
                            )}
                        </div>

                        {/* Alta rápida */}
                        <button
                            onClick={() => setAltaOpen(true)}
                            title="Alta rápida de artículo"
                            className="w-10 h-10 rounded-[10px] flex items-center justify-center border-dashed border-[1.5px] transition-colors"
                            style={{ borderColor: `${B.blue}66`, color: B.blue }}
                        >
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Grid productos */}
                    <div className="flex-1 overflow-y-auto px-4 pb-24 lg:pb-4">
                        {filteredProducts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <Package size={38} strokeWidth={1.5} className="mb-3" style={{ color: D.muted }} />
                                <h3 className="font-bold text-[14.5px] mb-1" style={{ color: D.text }}>Sin artículos</h3>
                                <p className="text-[12.5px]" style={{ color: D.muted }}>Creá tu primer artículo con +</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-[10px]">
                                {filteredProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        cartItem={cart.find(c => c.product_id === product.id)}
                                        onAdd={addToCart}
                                        isDark={isDark}
                                        D={D}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ RIGHT — Cart (DESKTOP only) ═══════════════════════════ */}
                <div className="hidden lg:flex w-[35%] flex-col flex-shrink-0 h-full"
                    style={{ background: D.sidebar }}>
                    <CartPanel />
                </div>
            </div>

            {/* ═══ MOBILE — FAB carrito ═══════════════════════════════════════ */}
            <div className="lg:hidden">
                <button
                    onClick={() => setCartOpen(true)}
                    className="fixed bottom-6 right-5 z-30 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
                    style={{ background: G.success, boxShadow: `0 8px 24px ${B.green}55` }}
                >
                    <Badge count={itemCount} color={B.blue}>
                        <ShoppingCart size={22} color="#fff" />
                    </Badge>
                </button>
            </div>

            {/* ═══ MOBILE — Cart Bottom Sheet ═════════════════════════════════ */}
            <BottomSheet
                open={cartOpen}
                onClose={() => setCartOpen(false)}
                title={null}
                maxHeight="88vh"
                D={D}
            >
                {/* Reutilizamos el mismo CartPanel pero inSheet=true */}
                <div className="flex flex-col" style={{ height: '80vh' }}>
                    <CartPanel inSheet />
                </div>
            </BottomSheet>

            {/* ═══ MODAL CLIENTE ══════════════════════════════════════════════ */}
            <Modal open={clienteOpen} onClose={() => setClienteOpen(false)} title="Seleccionar Cliente" D={D}
                footer={
                    <>
                        <Btn variant="ghost" size="sm" onClick={() => setClienteOpen(false)}
                            style={{ color: D.muted }}>Cancelar</Btn>
                        <Btn variant="primary" size="sm" onClick={() => setClienteOpen(false)}>Confirmar</Btn>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-[11px] font-bold tracking-widest mb-1.5"
                            style={{ color: D.label }}>NOMBRE DEL CLIENTE</label>
                        <input
                            type="text"
                            value={customerName === 'Consumidor Final' ? '' : customerName}
                            onChange={e => setCustomerName(e.target.value || 'Consumidor Final')}
                            placeholder="Ej: Juan Pérez"
                            className="w-full outline-none"
                            style={{
                                padding: '10px 12px', borderRadius: 11,
                                border: `1.5px solid ${D.inputBorder}`,
                                background: D.input, color: D.text, fontSize: 13.5, fontFamily: 'inherit',
                            }}
                        />
                    </div>
                    <button
                        onClick={() => { setCustomerName('Consumidor Final'); setCustomerId(''); setClienteOpen(false); }}
                        className="text-[12px] font-semibold transition-colors"
                        style={{ color: D.muted }}
                    >
                        ← Usar Consumidor Final
                    </button>
                </div>
            </Modal>

            {/* ═══ MODAL PAGO ════════════════════════════════════════════════ */}
            <Modal open={pagoOpen} onClose={() => setPagoOpen(false)} title="Cobrar" D={D}>
                <div className="space-y-5">
                    {/* Total a cobrar */}
                    <div className="p-[14px_16px] rounded-[12px]"
                        style={{ border: `1px solid ${B.blue}38`, background: `linear-gradient(135deg, ${B.blue}38, ${B.teal}26)` }}>
                        <div className="text-[11px] font-semibold tracking-[0.04em] mb-1" style={{ color: D.muted }}>TOTAL A COBRAR</div>
                        <div className="text-[30px] font-extrabold leading-none" style={{ color: B.blue }}>${fmt(totals.total)}</div>
                    </div>

                    {/* Método de pago */}
                    <div>
                        <div className="text-[10.5px] font-semibold tracking-[0.06em] mb-2" style={{ color: D.muted }}>MÉTODO DE PAGO</div>
                        <div className="grid grid-cols-2 gap-2">
                            {PAYMENT_METHODS.map(pm => (
                                <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                                    className="p-[10px_12px] rounded-[10px] text-[12.5px] font-medium transition-colors border-[1.5px]"
                                    style={{
                                        borderColor: paymentMethod === pm.id ? B.blue : D.border,
                                        color: paymentMethod === pm.id ? B.blue : D.text,
                                        background: paymentMethod === pm.id
                                            ? `linear-gradient(135deg, ${B.blue}38, ${B.teal}26)`
                                            : 'transparent',
                                    }}>
                                    {pm.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Efectivo */}
                    {isCash && (
                        <div className="space-y-3">
                            <div className="relative">
                                <div className="absolute top-2 left-3 text-[10px] font-bold" style={{ color: B.blue }}>Recibe</div>
                                <span className="absolute left-3 top-[22px] font-bold" style={{ color: D.muted }}>$</span>
                                <input
                                    type="number"
                                    value={receivedAmount}
                                    onChange={e => setReceivedAmount(e.target.value)}
                                    className="w-full outline-none"
                                    style={{
                                        paddingLeft: 28, paddingRight: 12, paddingTop: 22, paddingBottom: 8,
                                        borderRadius: 10, background: D.input, border: `1.5px solid ${D.inputBorder}`,
                                        color: D.text, fontSize: 16, fontWeight: 700, fontFamily: 'inherit',
                                    }}
                                />
                            </div>
                            {changeAmt > 0 && (
                                <div className="flex justify-between items-center p-[10px_14px] rounded-[10px]"
                                    style={{ background: `${B.green}2E`, border: `1px solid ${B.green}4D` }}>
                                    <span className="text-[13px] font-semibold" style={{ color: B.green }}>Vuelto</span>
                                    <span className="text-[20px] font-extrabold" style={{ color: B.green }}>${fmt(changeAmt)}</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <Btn variant="ghost" size="sm" onClick={() => setPagoOpen(false)} style={{ color: D.muted }}>
                            Cancelar
                        </Btn>
                        <Btn
                            variant="success"
                            size="md"
                            disabled={processing || (isCash && Number(receivedAmount) < totals.total)}
                            onClick={handleConfirmPayment}
                        >
                            {processing ? '...' : 'Confirmar cobro'}
                        </Btn>
                    </div>
                </div>
            </Modal>

            {/* ═══ MODAL ALTA RÁPIDA ══════════════════════════════════════════ */}
            <Modal open={altaOpen} onClose={() => setAltaOpen(false)} title="Alta rápida de artículo" D={D}
                footer={
                    <>
                        <Btn variant="ghost" size="sm" onClick={() => setAltaOpen(false)} style={{ color: D.muted }}>Cancelar</Btn>
                        <Btn variant="primary" size="sm"
                            disabled={savingProd || !newProd.name || !newProd.price}
                            onClick={handleCreateProd}>
                            {savingProd ? '...' : 'Crear y agregar'}
                        </Btn>
                    </>
                }
            >
                <div className="space-y-4">
                    {prodError && (
                        <div className="p-2.5 rounded-lg text-[12.5px] font-medium text-center"
                            style={{ background: `${B.red}18`, color: B.red, border: `1px solid ${B.red}33` }}>
                            {prodError}
                        </div>
                    )}
                    {[
                        { label: 'NOMBRE *', key: 'name', placeholder: 'Nombre del producto' },
                        { label: 'SKU / CÓDIGO', key: 'sku', placeholder: 'Opcional' },
                    ].map(({ label, key, placeholder }) => (
                        <div key={key}>
                            <label className="block text-[11px] font-bold tracking-widest mb-1.5" style={{ color: D.label }}>
                                {label}
                            </label>
                            <input type="text" value={newProd[key]}
                                onChange={e => setNewProd({ ...newProd, [key]: e.target.value })}
                                placeholder={placeholder}
                                className="w-full outline-none"
                                style={{
                                    padding: '10px 12px', borderRadius: 11,
                                    border: `1.5px solid ${D.inputBorder}`,
                                    background: D.input, color: D.text, fontSize: 13.5, fontFamily: 'inherit',
                                }}
                            />
                        </div>
                    ))}
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <label className="block text-[11px] font-bold tracking-widest mb-1.5" style={{ color: D.label }}>PRECIO *</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{ color: D.muted }}>$</span>
                                <input type="number" value={newProd.price}
                                    onChange={e => setNewProd({ ...newProd, price: e.target.value })}
                                    className="w-full outline-none"
                                    style={{
                                        padding: '10px 12px 10px 24px', borderRadius: 11,
                                        border: `1.5px solid ${D.inputBorder}`,
                                        background: D.input, color: D.text, fontSize: 13.5, fontFamily: 'inherit',
                                    }}
                                />
                            </div>
                        </div>
                        <div className="w-[100px]">
                            <label className="block text-[11px] font-bold tracking-widest mb-1.5" style={{ color: D.label }}>IVA</label>
                            <div className="relative">
                                <select value={newProd.tax_rate}
                                    onChange={e => setNewProd({ ...newProd, tax_rate: e.target.value })}
                                    className="w-full outline-none appearance-none"
                                    style={{
                                        padding: '10px 28px 10px 12px', borderRadius: 11,
                                        border: `1.5px solid ${D.inputBorder}`,
                                        background: D.input, color: D.text, fontSize: 13.5, fontFamily: 'inherit',
                                    }}>
                                    <option value="0">0%</option>
                                    <option value="10.5">10.5%</option>
                                    <option value="21">21%</option>
                                    <option value="27">27%</option>
                                </select>
                                <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                                    width="11" height="11" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 4l4 4 4-4" stroke={D.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>

            {/* ══════════════════════════════════════════════════════════
                MODAL POST-VENTA — Exportar / Compartir / Imprimir
                Aparece tras confirmar cobro exitosamente.
                ══════════════════════════════════════════════════════════ */}
            {postSaleOpen && postSale && (() => {
                const isMobileDevice = /iPhone|iPad|Android/i.test(navigator.userAgent);
                const fmtARS = (n) => Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

                return (
                    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', alignItems:'flex-end', justifyContent:'center', background:'rgba(0,0,0,0.72)', backdropFilter:'blur(4px)' }}>
                        <div style={{
                            width:'100%', maxWidth:460,
                            background: isDark ? '#0f1f2a' : '#fff',
                            borderRadius:'20px 20px 0 0',
                            border: `1.5px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                            borderBottom:'none',
                            boxShadow:'0 -12px 48px rgba(0,0,0,0.35)',
                            paddingBottom:'env(safe-area-inset-bottom, 0px)',
                            fontFamily:"'Montserrat',sans-serif",
                        }}>
                            {/* Handle bar */}
                            <div style={{ display:'flex', justifyContent:'center', paddingTop:12, paddingBottom:4 }}>
                                <div style={{ width:36, height:4, borderRadius:99, background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }} />
                            </div>

                            {/* ── Vista ACCIONES principales ── */}
                            {printView === 'actions' && waStep === 'actions' && (
                                <>
                                    {/* Header — check verde + datos de la venta */}
                                    <div style={{ padding:'16px 20px 14px', borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'}` }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:10 }}>
                                            <div style={{ width:40, height:40, borderRadius:'50%', background:'rgba(90,173,156,0.18)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                <Check size={20} color={AD.green} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <p style={{ margin:0, fontWeight:900, fontSize:15, color: isDark?'#e2e8f0':'#1e293b' }}>¡Cobro registrado!</p>
                                                <p style={{ margin:'2px 0 0', fontSize:11, color: isDark?'#94a3b8':'#64748b' }}>
                                                    {postSale.sale_number} · {postSale.customer_name || 'Consumidor Final'}
                                                </p>
                                            </div>
                                            <div style={{ marginLeft:'auto', textAlign:'right' }}>
                                                <p style={{ margin:0, fontWeight:900, fontSize:18, color:AD.teal }}>${fmtARS(postSale.total)}</p>
                                                {Number(postSale.change_amount) > 0 && (
                                                    <p style={{ margin:'2px 0 0', fontSize:11, color:AD.green, fontWeight:600 }}>Vuelto ${fmtARS(postSale.change_amount)}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3 botones de acción */}
                                    <div style={{ padding:'16px 20px', display:'flex', flexDirection:'column', gap:10 }}>

                                        {/* EXPORTAR PDF */}
                                        <button onClick={handleExportPDF} style={{
                                            display:'flex', alignItems:'center', gap:14,
                                            padding:'14px 16px', borderRadius:14,
                                            border:`1.5px solid ${isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,
                                            background: isDark?'rgba(255,255,255,0.04)':'#f8fafc',
                                            cursor:'pointer', fontFamily:'inherit', textAlign:'left', width:'100%',
                                            transition:'all .13s',
                                        }}
                                            onMouseEnter={e=>{e.currentTarget.style.background=`rgba(57,123,156,0.08)`;e.currentTarget.style.borderColor=AD.blue}}
                                            onMouseLeave={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,0.04)':'#f8fafc';e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}}
                                        >
                                            <div style={{ width:38, height:38, borderRadius:10, background:`rgba(57,123,156,0.13)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                <Download size={19} color={AD.blue} />
                                            </div>
                                            <div style={{ flex:1 }}>
                                                <p style={{ margin:0, fontWeight:700, fontSize:13, color: isDark?'#e2e8f0':'#1e293b' }}>Exportar PDF</p>
                                                <p style={{ margin:'2px 0 0', fontSize:11, color: isDark?'#64748b':'#94a3b8' }}>Genera y abre el comprobante A4</p>
                                            </div>
                                            <ChevronRight size={15} color={isDark?'#475569':'#cbd5e1'} />
                                        </button>

                                        {/* COMPARTIR */}
                                        <button onClick={handleShare} style={{
                                            display:'flex', alignItems:'center', gap:14,
                                            padding:'14px 16px', borderRadius:14,
                                            border:`1.5px solid ${isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,
                                            background: isDark?'rgba(255,255,255,0.04)':'#f8fafc',
                                            cursor:'pointer', fontFamily:'inherit', textAlign:'left', width:'100%',
                                            transition:'all .13s',
                                        }}
                                            onMouseEnter={e=>{e.currentTarget.style.background=`rgba(90,173,156,0.08)`;e.currentTarget.style.borderColor=AD.green}}
                                            onMouseLeave={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,0.04)':'#f8fafc';e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}}
                                        >
                                            <div style={{ width:38, height:38, borderRadius:10, background:`rgba(90,173,156,0.13)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                {isMobileDevice ? <Share2 size={19} color={AD.green} /> : <MessageCircle size={19} color={AD.green} />}
                                            </div>
                                            <div style={{ flex:1 }}>
                                                <p style={{ margin:0, fontWeight:700, fontSize:13, color: isDark?'#e2e8f0':'#1e293b' }}>
                                                    {isMobileDevice ? 'Compartir' : 'Enviar por WhatsApp'}
                                                </p>
                                                <p style={{ margin:'2px 0 0', fontSize:11, color: isDark?'#64748b':'#94a3b8' }}>
                                                    {isMobileDevice ? 'Abre opciones del sistema' : 'Genera link de WhatsApp'}
                                                </p>
                                            </div>
                                            <ChevronRight size={15} color={isDark?'#475569':'#cbd5e1'} />
                                        </button>

                                        {/* IMPRIMIR */}
                                        <button onClick={() => setPrintView('print')} style={{
                                            display:'flex', alignItems:'center', gap:14,
                                            padding:'14px 16px', borderRadius:14,
                                            border:`1.5px solid ${isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,
                                            background: isDark?'rgba(255,255,255,0.04)':'#f8fafc',
                                            cursor:'pointer', fontFamily:'inherit', textAlign:'left', width:'100%',
                                            transition:'all .13s',
                                        }}
                                            onMouseEnter={e=>{e.currentTarget.style.background=`rgba(73,148,156,0.08)`;e.currentTarget.style.borderColor=AD.teal}}
                                            onMouseLeave={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,0.04)':'#f8fafc';e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}}
                                        >
                                            <div style={{ width:38, height:38, borderRadius:10, background:`rgba(73,148,156,0.13)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                <Printer size={19} color={AD.teal} />
                                            </div>
                                            <div style={{ flex:1 }}>
                                                <p style={{ margin:0, fontWeight:700, fontSize:13, color: isDark?'#e2e8f0':'#1e293b' }}>Imprimir ticket</p>
                                                <p style={{ margin:'2px 0 0', fontSize:11, color: isDark?'#64748b':'#94a3b8' }}>Térmica 80mm o 57mm vía ArtDent</p>
                                            </div>
                                            <ChevronRight size={15} color={isDark?'#475569':'#cbd5e1'} />
                                        </button>
                                    </div>

                                    {/* Botón cerrar / ir a ventas */}
                                    <div style={{ padding:'0 20px 20px' }}>
                                        <button onClick={handleClosePostSale} style={{
                                            width:'100%', padding:'12px', borderRadius:13, border:'none',
                                            background: G_primary, color:'#fff', fontWeight:700, fontSize:14,
                                            cursor:'pointer', fontFamily:'inherit',
                                            boxShadow:'0 4px 14px rgba(57,123,156,0.28)',
                                        }}>
                                            Finalizar y nueva venta
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* ── Vista IMPRIMIR ── */}
                            {printView === 'print' && (
                                <>
                                    <div style={{ padding:'16px 20px 14px', borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'}`, display:'flex', alignItems:'center', gap:12 }}>
                                        <button onClick={() => setPrintView('actions')} style={{ background:'none', border:'none', cursor:'pointer', color: isDark?'#94a3b8':'#64748b', padding:0 }}>
                                            <ChevronRight size={20} style={{ transform:'rotate(180deg)' }} />
                                        </button>
                                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                            <Printer size={18} color={AD.teal} />
                                            <p style={{ margin:0, fontWeight:900, fontSize:15, color: isDark?'#e2e8f0':'#1e293b' }}>Imprimir ticket</p>
                                        </div>
                                    </div>
                                    <div style={{ padding:'18px 20px' }}>
                                        {/* Selector 80mm / 57mm */}
                                        <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7, color: isDark?'#64748b':'#94a3b8' }}>Ancho de papel</p>
                                        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
                                            {['80mm','57mm'].map(m => (
                                                <button key={m} onClick={() => setPrintMode(m)} style={{
                                                    flex:1, padding:'12px 0', borderRadius:12,
                                                    border:`2px solid ${printMode===m ? AD.teal : (isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.1)')}`,
                                                    background: printMode===m ? 'rgba(73,148,156,0.13)' : 'transparent',
                                                    color: printMode===m ? AD.teal : (isDark?'#94a3b8':'#64748b'),
                                                    fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit',
                                                    transition:'all .13s',
                                                }}>
                                                    🖨️ {m}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Hidden ticket para captura */}
                                        <div style={{ position:'absolute', left:-9999, top:-9999, pointerEvents:'none' }}>
                                            <div id="postsale-ticket">
                                                <TicketBase sale={postSale} widthMM={printMode==='57mm'?57:80} />
                                            </div>
                                        </div>
                                        <button onClick={handlePrint} style={{
                                            width:'100%', padding:'13px', borderRadius:13, border:'none',
                                            background:`linear-gradient(135deg, ${AD.teal}, ${AD.green})`,
                                            color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit',
                                            boxShadow:'0 4px 14px rgba(73,148,156,0.30)',
                                        }}>
                                            Imprimir {printMode}
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* ── Vista WHATSAPP (solo desktop) ── */}
                            {waStep === 'phone' && printView === 'actions' && (
                                <>
                                    <div style={{ padding:'16px 20px 14px', borderBottom:`1px solid ${isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'}`, display:'flex', alignItems:'center', gap:12 }}>
                                        <button onClick={() => setWaStep('actions')} style={{ background:'none', border:'none', cursor:'pointer', color: isDark?'#94a3b8':'#64748b', padding:0 }}>
                                            <ChevronRight size={20} style={{ transform:'rotate(180deg)' }} />
                                        </button>
                                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                            <MessageCircle size={18} color={AD.green} />
                                            <p style={{ margin:0, fontWeight:900, fontSize:15, color: isDark?'#e2e8f0':'#1e293b' }}>Enviar por WhatsApp</p>
                                        </div>
                                    </div>
                                    <div style={{ padding:'20px 20px 24px' }}>
                                        <p style={{ margin:'0 0 10px', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:0.7, color: isDark?'#64748b':'#94a3b8' }}>Número de teléfono</p>
                                        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                                            <div style={{ width:42, height:42, borderRadius:10, background:'rgba(90,173,156,0.12)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                <span style={{ fontSize:20 }}>🇦🇷</span>
                                            </div>
                                            <input
                                                type="tel"
                                                placeholder="Ej: 1122334455 (sin +54)"
                                                value={waPhone}
                                                onChange={e => setWaPhone(e.target.value)}
                                                autoFocus
                                                style={{
                                                    flex:1, padding:'11px 14px', borderRadius:11,
                                                    border:`1.5px solid ${isDark?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.12)'}`,
                                                    background: isDark?'rgba(255,255,255,0.05)':'#f8fafc',
                                                    color: isDark?'#e2e8f0':'#1e293b', fontSize:14,
                                                    fontFamily:'inherit', outline:'none',
                                                }}
                                                onFocus={e => e.target.style.borderColor=AD.green}
                                                onBlur={e => e.target.style.borderColor=isDark?'rgba(255,255,255,0.10)':'rgba(0,0,0,0.12)'}
                                            />
                                        </div>
                                        <p style={{ margin:'0 0 16px', fontSize:11, color: isDark?'#475569':'#94a3b8' }}>
                                            Se abrirá WhatsApp Web con el número ingresado y el detalle del comprobante.
                                        </p>
                                        <button
                                            onClick={handleSendWhatsApp}
                                            disabled={waPhone.replace(/\D/g,'').length < 8}
                                            style={{
                                                width:'100%', padding:'13px', borderRadius:13, border:'none',
                                                background: waPhone.replace(/\D/g,'').length >= 8
                                                    ? `linear-gradient(135deg, #25D366, #128C7E)`
                                                    : (isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'),
                                                color: waPhone.replace(/\D/g,'').length >= 8 ? '#fff' : (isDark?'#475569':'#cbd5e1'),
                                                fontWeight:700, fontSize:14, cursor: waPhone.replace(/\D/g,'').length >= 8 ?'pointer':'not-allowed',
                                                fontFamily:'inherit', transition:'all .2s',
                                            }}
                                        >
                                            Abrir WhatsApp →
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Ticket A4 oculto para PDF export */}
                            <div style={{ position:'absolute', left:-9999, top:-9999, pointerEvents:'none' }}>
                                <FacturaA4 sale={postSale} />
                            </div>
                        </div>
                    </div>
                );
            })()}

        </AuthenticatedLayout>
    );
}
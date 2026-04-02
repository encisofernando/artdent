/**
 * Sale/Create.jsx — POS Facturar
 * Mobile: Catálogo full-screen + FAB carrito → Bottom Sheet
 * Desktop: Split layout 65/35
 */
import React, { useState, useMemo, useEffect } from 'react';
import FacturaA4 from '@/Components/Sale/FacturaA4';
import { Ticket80, Ticket57 } from '@/Components/Sale/TicketBase';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import axios from 'axios';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    ShoppingCart, User, Search, Plus, Minus, Trash2,
    CreditCard, X, Package, ReceiptText, Store,
    Download, Share2, Printer, MessageCircle, Check,
    ChevronRight, Loader2,
} from 'lucide-react';
import {
    B, G, useD, fmt,
    FAB, BottomSheet, Modal, Btn, ProductCard, TabStrip,
    Badge,
} from '@/Components/_appkit';
import SearchableSelect from '@/Components/SearchableSelect';
import {
    buildPrintHtml,
    getThermalPrintZoom,
    getThermalZoneWidth,
    getStoredTicketFormat,
    MONTSERRAT_PRINT_HEAD,
    openBrowserPrint,
    printElementWithElectron,
    setStoredTicketFormat,
} from '@/lib/print';

const ALL_TIPOS = [
    { id: 'X',   label: 'Ticket X',          desc: 'Sin factura',    accentColor: '#64748b', condition: null },
    { id: 'A',   label: 'Factura A',          desc: 'Resp. Inscripto', accentColor: B.blue,   condition: 'responsable_inscripto' },
    { id: 'NCA', label: 'Nota de Crédito A',  desc: 'Resp. Inscripto', accentColor: B.blue,   condition: 'responsable_inscripto' },
    { id: 'NDA', label: 'Nota de Débito A',   desc: 'Resp. Inscripto', accentColor: B.blue,   condition: 'responsable_inscripto' },
    { id: 'B',   label: 'Factura B',          desc: 'Cons. Final',    accentColor: B.green,  condition: 'responsable_inscripto' },
    { id: 'NCB', label: 'Nota de Crédito B',  desc: 'Cons. Final',    accentColor: B.green,  condition: 'responsable_inscripto' },
    { id: 'NDB', label: 'Nota de Débito B',   desc: 'Cons. Final',    accentColor: B.green,  condition: 'responsable_inscripto' },
    { id: 'C',   label: 'Factura C',          desc: 'Monotributista', accentColor: B.teal,   condition: 'monotributista' },
    { id: 'NCC', label: 'Nota de Crédito C',  desc: 'Monotributista', accentColor: B.teal,   condition: 'monotributista' },
    { id: 'NDC', label: 'Nota de Débito C',   desc: 'Monotributista', accentColor: B.teal,   condition: 'monotributista' },
];

function getTipos(ivaCondition) {
    const always = ALL_TIPOS.filter(t => t.condition === null);
    const filtered = ALL_TIPOS.filter(t => t.condition === ivaCondition);
    return [...always, ...filtered];
}

function parseReceiptType(rt) {
    const r = (rt || 'X').toUpperCase();
    const MAP = {
        X:   { letter: 'X', label: 'TICKET',        code: '00', isAfip: false },
        A:   { letter: 'A', label: 'FACTURA A',      code: '01', isAfip: true  },
        FA:  { letter: 'A', label: 'FACTURA A',      code: '01', isAfip: true  },
        B:   { letter: 'B', label: 'FACTURA B',      code: '06', isAfip: true  },
        FB:  { letter: 'B', label: 'FACTURA B',      code: '06', isAfip: true  },
        C:   { letter: 'C', label: 'FACTURA C',      code: '11', isAfip: true  },
        FC:  { letter: 'C', label: 'FACTURA C',      code: '11', isAfip: true  },
        NCA: { letter: 'A', label: 'N. CRÉDITO A',   code: '02', isAfip: true  },
        NCB: { letter: 'B', label: 'N. CRÉDITO B',   code: '07', isAfip: true  },
        NCC: { letter: 'C', label: 'N. CRÉDITO C',   code: '12', isAfip: true  },
        NDA: { letter: 'A', label: 'N. DÉBITO A',    code: '03', isAfip: true  },
        NDB: { letter: 'B', label: 'N. DÉBITO B',    code: '08', isAfip: true  },
        NDC: { letter: 'C', label: 'N. DÉBITO C',    code: '13', isAfip: true  },
    };
    return MAP[r] ?? { letter: r, label: r, code: '00', isAfip: false };
}

const PAYMENT_METHODS = [
    { id: 'cash',              name: 'Efectivo',        requiresCustomer: false },
    { id: 'debit',             name: 'Débito',          requiresCustomer: false },
    { id: 'credit',            name: 'Crédito',         requiresCustomer: false },
    { id: 'transfer',          name: 'Transferencia',   requiresCustomer: false },
    { id: 'cuenta_corriente',  name: 'Cta. Corriente',  requiresCustomer: true  },
];

// ─── Brand / layout ──────────────────────────────────────────
const AD = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE' };
const G_bar     = `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.green})`;
const G_primary = `linear-gradient(135deg, ${AD.blue}, ${AD.teal})`;
const fmtDate   = (d) => d ? new Date(d).toLocaleDateString('es-AR') : '—';
// ─── Ticket80 / Ticket57 — importados desde @/Components/Sale/TicketBase ─────

export default function Create({ auth, products, customers = [], company = null }) {
    const { isDark, sidebarCollapsed } = useTheme();
    const D = useD(isDark);

    const TIPOS = getTipos(company?.iva_condition ?? '');

    // ── State ────────────────────────────────────────────────
    const [busca, setBusca]               = useState('');
    const [cart, setCart]                 = useState([]);
    const [receiptType, setReceiptType]   = useState('X');
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

    // Alta rápida producto
    const [newProd, setNewProd]           = useState({ name: '', sku: '', price: '', tax_rate: '21' });
    const [savingProd, setSavingProd]     = useState(false);
    const [prodError, setProdError]       = useState('');

    // Alta rápida cliente
    const [altaClienteOpen, setAltaClienteOpen] = useState(false);
    const [newCliente, setNewCliente]           = useState({ name: '', phone: '', dni: '', cuit: '', iva_condition: 'consumidor_final', address: '' });
    const [padronLoading, setPadronLoading]     = useState(false);
    const [padronResult, setPadronResult]       = useState(null);
    const [savingCliente, setSavingCliente]     = useState(false);
    const [clienteError, setClienteError]       = useState('');
    const [clienteSearch, setClienteSearch]     = useState('');

    // Variant picker
    const [variantProduct, setVariantProduct] = useState(null); // product whose variants are being picked

    // Post-sale modal
    const [postSale, setPostSale]         = useState(null);  // sale object returned from server
    const [postSaleOpen, setPostSaleOpen] = useState(false);
    const [printMode, setPrintMode]       = useState(() => getStoredTicketFormat('80mm'));
    const [printView, setPrintView]       = useState('actions'); // 'actions' | 'print' (kept for WhatsApp flow compat)
    const [waPhone, setWaPhone]           = useState('');
    const [waStep, setWaStep]             = useState('actions'); // 'actions' | 'phone'
    const [waLoading, setWaLoading]       = useState(false);
    const [pdfUrl, setPdfUrl]             = useState(null);

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
            if (item.tax_rate > 0 && ['A', 'B', 'NCA', 'NDA', 'NCB', 'NDB'].includes(receiptType)) {
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
    const isCash             = paymentMethod === 'cash';
    const isCuentaCorriente  = paymentMethod === 'cuenta_corriente';
    const changeAmt          = isCash && Number(receivedAmount) > totals.total
        ? Number(receivedAmount) - totals.total : 0;

    // ── Cart actions ─────────────────────────────────────────
    const addToCart = (product) => {
        // Products with variants require variant selection first
        if (product.has_variants && product.variants?.length > 0) {
            setVariantProduct(product);
            return;
        }

        const key      = `${product.id}_0`;
        const existing = cart.find(i => i.cartKey === key);
        const price    = Number(product.price);
        const taxRate  = Number(product.tax_rate || 21) / 100;

        if (existing) {
            updateQty(key, existing.quantity + 1);
        } else {
            setCart(prev => [...prev, {
                cartKey: key, product_id: product.id, variant_id: null,
                name: product.name, unit_price: price, tax_rate: taxRate,
                quantity: 1, discount: 0, total: price,
            }]);
        }
    };

    const addVariantToCart = (product, variant) => {
        const key      = `${product.id}_${variant.id}`;
        const existing = cart.find(i => i.cartKey === key);
        const price    = Number(variant.price || product.price);
        const taxRate  = Number(product.tax_rate || 21) / 100;

        if (existing) {
            updateQty(key, existing.quantity + 1);
        } else {
            setCart(prev => [...prev, {
                cartKey: key, product_id: product.id, variant_id: variant.id,
                variant_sku: variant.sku,
                name: `${product.name} — ${variant.label}`,
                unit_price: price, tax_rate: taxRate,
                quantity: 1, discount: 0, total: price,
            }]);
        }
        setVariantProduct(null);
    };

    const updateQty = (cartKey, qty) => {
        if (qty <= 0) return removeFromCart(cartKey);
        setCart(prev => prev.map(i => i.cartKey === cartKey
            ? { ...i, quantity: qty, total: i.unit_price * qty - i.discount }
            : i
        ));
    };

    const removeFromCart = (cartKey) =>
        setCart(prev => prev.filter(i => i.cartKey !== cartKey));

    const clearCart = () => {
        setCart([]);
        setCustomerName('Consumidor Final');
        setCustomerId('');
    };

    // ── Submit ───────────────────────────────────────────────
    const handleCobrar = () => {
        if (cart.length === 0) return;
        setReceivedAmount(String(totals.total));
        // Reset CC if no customer selected
        if (paymentMethod === 'cuenta_corriente' && !customerId) {
            setPaymentMethod('cash');
        }
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
                setPdfUrl(null);
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
        const el = document.getElementById('print-zone');
        if (!el) return;
        const html = buildPrintHtml({
            title: `ArtDent — ${postSale.sale_number || 'Comprobante'}`,
            bodyHtml: el.outerHTML,
            pageSize: 'A4',
            zoneWidth: '210mm',
            extraHead: MONTSERRAT_PRINT_HEAD,
        });
        openBrowserPrint(html, { delay: 600 });
    };

    const handleShare = async () => {
        if (!postSale) return;
        const el = document.getElementById('print-zone');
        if (!el) return;

        setWaLoading(true);
        try {
            const html = buildPrintHtml({
                title: `ArtDent — ${postSale.sale_number || 'Comprobante'}`,
                bodyHtml: el.outerHTML,
                pageSize: 'A4',
                zoneWidth: '210mm',
                extraHead: MONTSERRAT_PRINT_HEAD,
            });

            const res = await axios.post(`/sales/${postSale.id}/generate-pdf`, { html });
            setPdfUrl(res.data.url);
            setWaStep('phone');
        } catch (e) {
            alert('Error al generar PDF: ' + (e.response?.data?.message || e.message));
        } finally {
            setWaLoading(false);
        }
    };

    const handleSendWhatsApp = () => {
        if (!postSale) return;
        const phone = waPhone.replace(/\D/g, '');

        const vars = {
            '{empresa}': company?.name || company?.fantasy_name || 'ArtDent',
            '{numero}':  postSale.sale_number || '',
            '{cliente}': postSale.customer_name || 'Consumidor Final',
            '{total}':   `$${Number(postSale.total).toLocaleString('es-AR')}`,
            '{fecha}':   new Date().toLocaleDateString('es-AR'),
            '{link}':    pdfUrl || '',
        };

        const defaultTemplate =
            `🦷 *{empresa}* — Comprobante {numero}\n` +
            `Cliente: {cliente}\n` +
            `Total: {total}\n` +
            `Fecha: {fecha}` +
            (pdfUrl ? `\n\n📄 Ver comprobante: {link}` : '');

        const template = company?.whatsapp_message_template || defaultTemplate;
        const text = template.replace(/\{empresa\}|\{numero\}|\{cliente\}|\{total\}|\{fecha\}|\{link\}/g, m => vars[m] ?? m);

        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handlePrint = async () => {
        if (!postSale) return;
        const el = document.getElementById('print-zone');
        if (!el) return;

        const isA4 = printMode === 'a4';
        const is57 = printMode === '57mm';

        if (isA4) {
            const html = buildPrintHtml({
                title: `ArtDent — ${postSale.sale_number || 'Comprobante'}`,
                bodyHtml: el.outerHTML,
                pageSize: 'A4',
                zoneWidth: '210mm',
                extraHead: MONTSERRAT_PRINT_HEAD,
            });
            openBrowserPrint(html, { delay: 600 });
            return;
        }

        const result = await printElementWithElectron({
            element: el,
            title: `ArtDent — ${postSale.sale_number || 'Comprobante'}`,
            mode: printMode,
            zoneWidth: getThermalZoneWidth(printMode),
            zoom: getThermalPrintZoom(printMode),
            extraHead: MONTSERRAT_PRINT_HEAD,
            fallbackToBrowser: true,
            browserDelay: 600,
        });

        if (!result.ok && !result.fallbackUsed) {
            alert('⚠️ El gestor de impresión ArtDent no está activo.');
        }
    };

    const handleClosePostSale = () => {
        setPostSaleOpen(false);
        setPostSale(null);
        clearCart();
        router.visit(route('sales.create'));
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

    // ── Alta rápida cliente ──────────────────────────────────
    const handleCreateCliente = async () => {
        if (!newCliente.name.trim()) {
            setClienteError('El nombre es obligatorio.');
            return;
        }
        setSavingCliente(true);
        setClienteError('');
        try {
            const res = await axios.post(route('customers.store'), { ...newCliente, is_active: true }, {
                headers: { Accept: 'application/json' },
            });
            const c = res.data.customer;
            setCustomerId(String(c.id));
            setCustomerName(c.name);
            setAltaClienteOpen(false);
            setNewCliente({ name: '', phone: '', dni: '', cuit: '', iva_condition: 'consumidor_final', address: '' });
            setPadronResult(null);
            setClienteOpen(false);
        } catch (e) {
            setClienteError(e.response?.data?.message || 'Error al crear cliente');
        } finally {
            setSavingCliente(false);
        }
    };

    // ── Padrón ARCA lookup ───────────────────────────────────
    const handlePadronLookup = async () => {
        const cuit = newCliente.cuit.replace(/\D/g, '');
        if (cuit.length !== 11) { setClienteError('El CUIT debe tener 11 dígitos.'); return; }
        setPadronLoading(true);
        setClienteError('');
        setPadronResult(null);
        try {
            const res = await axios.get(route('padron.lookup', { cuit }), { headers: { Accept: 'application/json' } });
            const d = res.data.data;
            setPadronResult(d);
            setNewCliente(p => ({
                ...p,
                name: d.razon_social || p.name,
                address: d.direccion || p.address,
                iva_condition: d.condicion_iva || p.iva_condition,
            }));
        } catch (e) {
            setClienteError(e.response?.data?.error || 'No se encontró el CUIT en el padrón ARCA.');
        } finally {
            setPadronLoading(false);
        }
    };

    // Persiste el formato de ticket en localStorage
    const savePrintMode = (mode) => {
        setPrintMode(mode);
        if (mode !== 'a4') {
            setStoredTicketFormat(mode);
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
                <SearchableSelect
                    value={receiptType}
                    onChange={v => setReceiptType(v)}
                    options={TIPOS.map(t => ({ value: t.id, label: `${t.id} — ${t.label} (${t.desc})` }))}
                />
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
                            <div key={item.cartKey}
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
                                    <button onClick={() => updateQty(item.cartKey, item.quantity - 1)}
                                        className="w-[26px] h-[26px] rounded-lg flex items-center justify-center transition-colors"
                                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <Minus size={12} color={D.text} />
                                    </button>
                                    <span className="w-5 text-center text-[12px] font-extrabold" style={{ color: D.text }}>
                                        {item.quantity}
                                    </span>
                                    <button onClick={() => updateQty(item.cartKey, item.quantity + 1)}
                                        className="w-[26px] h-[26px] rounded-lg flex items-center justify-center transition-colors"
                                        style={{ background: 'rgba(255,255,255,0.08)' }}>
                                        <Plus size={12} color={D.text} />
                                    </button>
                                    <button onClick={() => removeFromCart(item.cartKey)}
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
                        {['A', 'B', 'NCA', 'NDA', 'NCB', 'NDB'].includes(receiptType) && (
                            <div className="flex justify-between">
                                <span style={{ color: D.muted }}>Subtotal neto</span>
                                <span className="font-semibold" style={{ color: D.text }}>${fmt(totals.neto)}</span>
                            </div>
                        )}
                        {totals.iva > 0 && ['A', 'B', 'NCA', 'NDA', 'NCB', 'NDB'].includes(receiptType) && (
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
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

            {/*
                Full-viewport container. Ocupa todo el espacio después del nav (top-16 = 64px).
                En desktop también compensa el sidebar (left-64 / left-20).
            */}
            <div
                className={`fixed top-16 right-0 left-0 bottom-14 lg:bottom-0 z-[5] flex flex-col lg:flex-row overflow-hidden transition-all duration-300
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
                    className="fixed bottom-[76px] right-5 z-[56] w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
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

            {/* ═══ MODAL VARIANTES ════════════════════════════════════════════ */}
            <Modal
                open={!!variantProduct}
                onClose={() => setVariantProduct(null)}
                title={variantProduct?.name ?? ''}
                maxWidth={500}
                D={D}
            >
                {variantProduct && (() => {
                    const available = (variantProduct.variants ?? []).filter(v =>
                        v.is_active && (!variantProduct.track_stock || (v.stock_quantity ?? 0) > 0)
                    );

                    if (available.length === 0) {
                        return (
                            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                                <Package size={30} style={{ color: D.muted }} />
                                <p className="font-bold text-[13px]" style={{ color: D.text }}>Sin stock disponible</p>
                                <p className="text-[12px]" style={{ color: D.muted }}>Ninguna variante tiene stock actualmente</p>
                            </div>
                        );
                    }

                    return (
                        <div
                            className="grid grid-cols-2 gap-2 overflow-y-auto"
                            style={{ maxHeight: '58vh' }}
                        >
                            {available.map(variant => {
                                const inCart = cart.some(i => i.variant_id === variant.id);
                                const cartQty = cart.find(i => i.variant_id === variant.id)?.quantity ?? 0;
                                return (
                                    <button
                                        key={variant.id}
                                        onClick={() => addVariantToCart(variantProduct, variant)}
                                        className="flex flex-col gap-1.5 w-full px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.97]"
                                        style={{
                                            background: inCart ? `${B.green}1a` : D.input,
                                            border: `1.5px solid ${inCart ? B.green : D.inputBorder ?? D.border}`,
                                        }}
                                    >
                                        {/* Variant name + in-cart badge */}
                                        <div className="flex items-start justify-between gap-1">
                                            <span className="text-[12px] font-bold leading-snug" style={{ color: D.text }}>
                                                {variant.label}
                                            </span>
                                            {inCart && (
                                                <span className="shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full"
                                                    style={{ background: `${B.green}33`, color: B.green }}>
                                                    ×{cartQty}
                                                </span>
                                            )}
                                        </div>

                                        {/* Price + stock */}
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-[13px] font-extrabold" style={{ color: B.blue }}>
                                                ${fmt(variant.price)}
                                            </span>
                                            {variantProduct.track_stock && (
                                                <span className="text-[10px] font-semibold" style={{ color: D.muted }}>
                                                    Stock {variant.stock_quantity}
                                                </span>
                                            )}
                                        </div>

                                        {/* SKU */}
                                        {variant.sku && (
                                            <span className="text-[10px] font-mono truncate" style={{ color: D.placeholder ?? D.muted }}>
                                                {variant.sku}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })()}
            </Modal>

            {/* ═══ MODAL CLIENTE ══════════════════════════════════════════════ */}
            <Modal open={clienteOpen} onClose={() => { setClienteOpen(false); setAltaClienteOpen(false); setClienteSearch(''); }} title="Seleccionar Cliente" D={D}>
                {!altaClienteOpen ? (
                    <div className="space-y-3">
                        {/* Buscador */}
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: D.text }} />
                            <input
                                type="text"
                                value={clienteSearch}
                                onChange={e => setClienteSearch(e.target.value)}
                                placeholder="Buscar por nombre, DNI o teléfono..."
                                className="w-full outline-none pl-8"
                                style={{ ...inputStyle, fontSize: 13 }}
                                autoFocus
                            />
                        </div>

                        {/* Lista de clientes */}
                        <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5">
                            {/* Consumidor Final */}
                            <button
                                onClick={() => { setCustomerName('Consumidor Final'); setCustomerId(''); setClienteOpen(false); setClienteSearch(''); }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors"
                                style={{
                                    background: !customerId ? `${B.blue}1F` : 'transparent',
                                    border: `1.5px solid ${!customerId ? `${B.blue}60` : D.border}`,
                                }}
                            >
                                <User size={14} style={{ color: D.muted }} />
                                <div>
                                    <div className="text-[13px] font-semibold" style={{ color: D.text }}>Consumidor Final</div>
                                    <div className="text-[11px]" style={{ color: D.muted }}>Sin identificar</div>
                                </div>
                                {!customerId && <Check size={14} className="ml-auto" style={{ color: B.blue }} />}
                            </button>

                            {/* Clientes filtrados */}
                            {customers
                                .filter(c => {
                                    if (!clienteSearch) return true;
                                    const q = clienteSearch.toLowerCase();
                                    return (c.name && c.name.toLowerCase().includes(q))
                                        || (c.dni && c.dni.toLowerCase().includes(q))
                                        || (c.phone && c.phone.toLowerCase().includes(q));
                                })
                                .map(c => {
                                    const isSelected = customerId === String(c.id);
                                    return (
                                        <button
                                            key={c.id}
                                            onClick={() => { setCustomerId(String(c.id)); setCustomerName(c.name); setClienteOpen(false); setClienteSearch(''); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors"
                                            style={{
                                                background: isSelected ? `${B.blue}1F` : 'transparent',
                                                border: `1.5px solid ${isSelected ? `${B.blue}60` : D.border}`,
                                            }}
                                        >
                                            <User size={14} style={{ color: isSelected ? B.blue : D.muted }} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-semibold truncate" style={{ color: D.text }}>{c.name}</div>
                                                <div className="text-[11px]" style={{ color: D.muted }}>
                                                    {[c.dni && `DNI: ${c.dni}`, c.phone].filter(Boolean).join(' · ') || 'Sin datos adicionales'}
                                                </div>
                                            </div>
                                            {isSelected && <Check size={14} style={{ color: B.blue }} />}
                                        </button>
                                    );
                                })
                            }

                            {customers.length === 0 && (
                                <p className="text-[12px] text-center py-4" style={{ color: D.muted }}>
                                    No hay clientes registrados aún.
                                </p>
                            )}
                        </div>

                        {/* Alta rápida */}
                        <button
                            onClick={() => setAltaClienteOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[12.5px] font-semibold transition-colors"
                            style={{ border: `1.5px dashed ${B.teal}60`, color: B.teal, background: `${B.teal}0D` }}
                        >
                            <Plus size={14} />
                            Alta rápida de cliente
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <button
                            onClick={() => { setAltaClienteOpen(false); setClienteError(''); }}
                            className="flex items-center gap-1.5 text-[12px] font-semibold mb-1"
                            style={{ color: D.muted }}
                        >
                            ← Volver al listado
                        </button>

                        <div className="space-y-3">
                            {/* CUIT + Padrón */}
                            <div>
                                <label className="block text-[10.5px] font-bold tracking-widest mb-1" style={{ color: D.label }}>
                                    CUIT
                                </label>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <input
                                        type="text"
                                        value={newCliente.cuit}
                                        onChange={e => { setNewCliente(p => ({ ...p, cuit: e.target.value })); setPadronResult(null); }}
                                        placeholder="Sin guiones (11 dígitos)"
                                        className="outline-none"
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handlePadronLookup}
                                        disabled={padronLoading}
                                        style={{
                                            padding: '0 12px', borderRadius: 11, fontSize: 12, fontWeight: 700,
                                            background: D.accent, color: '#fff', border: 'none', cursor: padronLoading ? 'not-allowed' : 'pointer',
                                            opacity: padronLoading ? 0.6 : 1, whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {padronLoading ? '…' : 'Buscar ARCA'}
                                    </button>
                                </div>
                                {padronResult && (
                                    <div style={{ marginTop: 6, padding: '6px 10px', borderRadius: 8, background: D.inputBorder + '33', fontSize: 11, lineHeight: 1.5 }}>
                                        <span style={{ fontWeight: 700, color: D.text }}>{padronResult.razon_social}</span>
                                        <span style={{ color: D.muted }}> · {padronResult.condicion_iva_label}</span>
                                        {padronResult.estado && padronResult.estado !== 'ACTIVO' && (
                                            <span style={{ color: '#f59e0b', fontWeight: 700 }}> · {padronResult.estado}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Nombre */}
                            <div>
                                <label className="block text-[10.5px] font-bold tracking-widest mb-1" style={{ color: D.label }}>
                                    NOMBRE *
                                </label>
                                <input
                                    type="text"
                                    value={newCliente.name}
                                    onChange={e => setNewCliente(p => ({ ...p, name: e.target.value }))}
                                    placeholder="Nombre del cliente"
                                    className="w-full outline-none"
                                    style={inputStyle}
                                    autoFocus
                                />
                            </div>

                            {/* Condición IVA */}
                            <div>
                                <label className="block text-[10.5px] font-bold tracking-widest mb-1" style={{ color: D.label }}>
                                    CONDICIÓN IVA
                                </label>
                                <SearchableSelect
                                    value={newCliente.iva_condition}
                                    onChange={v => setNewCliente(p => ({ ...p, iva_condition: v }))}
                                    options={[
                                        { value: 'consumidor_final', label: 'Consumidor Final' },
                                        { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
                                        { value: 'monotributista', label: 'Monotributista' },
                                        { value: 'exento', label: 'Exento' },
                                    ]}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10.5px] font-bold tracking-widest mb-1" style={{ color: D.label }}>
                                        TELÉFONO
                                    </label>
                                    <input
                                        type="text"
                                        value={newCliente.phone}
                                        onChange={e => setNewCliente(p => ({ ...p, phone: e.target.value }))}
                                        placeholder="Ej: +54 9 11..."
                                        className="w-full outline-none"
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10.5px] font-bold tracking-widest mb-1" style={{ color: D.label }}>
                                        DNI
                                    </label>
                                    <input
                                        type="text"
                                        value={newCliente.dni}
                                        onChange={e => setNewCliente(p => ({ ...p, dni: e.target.value }))}
                                        placeholder="Ej: 12345678"
                                        className="w-full outline-none"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        </div>

                        {clienteError && (
                            <p className="text-[12px] text-red-400">{clienteError}</p>
                        )}

                        <div className="flex gap-2 pt-1">
                            <Btn variant="ghost" size="sm" onClick={() => { setAltaClienteOpen(false); setClienteError(''); }}
                                style={{ color: D.muted }}>
                                Cancelar
                            </Btn>
                            <Btn variant="primary" size="sm" disabled={savingCliente} onClick={handleCreateCliente}
                                style={{ background: B.teal, flex: 1 }}>
                                {savingCliente ? 'Guardando...' : 'Crear y seleccionar'}
                            </Btn>
                        </div>
                    </div>
                )}
            </Modal>

            {/* ═══ MODAL PAGO ════════════════════════════════════════════════ */}
            <Modal open={pagoOpen} onClose={() => setPagoOpen(false)} title="Cobrar" D={D}>
                <div className="space-y-5">
                    {/* Total a cobrar */}
                    <div className="p-[14px_16px] rounded-[12px]"
                        style={{ border: `1px solid ${B.blue}38`, background: `linear-gradient(135deg, ${B.blue}38, ${B.teal}26)` }}>
                        <div className="text-[11px] font-semibold tracking-[0.04em] mb-1" style={{ color: D.muted }}>TOTAL A COBRAR</div>
                        <div className="text-[30px] font-extrabold leading-none" style={{ color: B.blue }}>${fmt(totals.total)}</div>
                        {customerName !== 'Consumidor Final' && (
                            <div className="text-[11.5px] font-medium mt-1.5" style={{ color: D.muted }}>
                                Cliente: <span style={{ color: D.text }}>{customerName}</span>
                            </div>
                        )}
                    </div>

                    {/* Método de pago */}
                    <div>
                        <div className="text-[10.5px] font-semibold tracking-[0.06em] mb-2" style={{ color: D.muted }}>MÉTODO DE PAGO</div>
                        <div className="grid grid-cols-2 gap-2">
                            {PAYMENT_METHODS.map(pm => {
                                const isDisabled = pm.requiresCustomer && !customerId;
                                const isSelected = paymentMethod === pm.id;
                                return (
                                    <button key={pm.id}
                                        onClick={() => !isDisabled && setPaymentMethod(pm.id)}
                                        disabled={isDisabled}
                                        title={isDisabled ? 'Requiere cliente seleccionado' : undefined}
                                        className="p-[10px_12px] rounded-[10px] text-[12.5px] font-medium transition-colors border-[1.5px]"
                                        style={{
                                            borderColor: isSelected ? B.teal : D.border,
                                            color: isDisabled ? D.muted : (isSelected ? B.teal : D.text),
                                            background: isSelected
                                                ? `linear-gradient(135deg, ${B.teal}38, ${B.blue}26)`
                                                : 'transparent',
                                            opacity: isDisabled ? 0.45 : 1,
                                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        }}>
                                        {pm.name}
                                    </button>
                                );
                            })}
                        </div>
                        {isCuentaCorriente && (
                            <p className="text-[11px] mt-2" style={{ color: B.teal }}>
                                Se cargará ${ fmt(totals.total) } a la cuenta corriente de {customerName}.
                            </p>
                        )}
                    </div>

                    {/* Efectivo: monto recibido + vuelto */}
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
                            style={isCuentaCorriente ? { background: B.teal } : {}}
                        >
                            {processing ? '...' : isCuentaCorriente ? 'Cargar a cuenta' : 'Confirmar cobro'}
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
                            <SearchableSelect
                                value={String(newProd.tax_rate)}
                                onChange={v => setNewProd({ ...newProd, tax_rate: v })}
                                options={[
                                    { value: '0', label: '0%' },
                                    { value: '10.5', label: '10.5%' },
                                    { value: '21', label: '21%' },
                                    { value: '27', label: '27%' },
                                ]}
                            />
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
                                        <button onClick={handleShare} disabled={waLoading} style={{
                                            display:'flex', alignItems:'center', gap:14,
                                            padding:'14px 16px', borderRadius:14,
                                            border:`1.5px solid ${isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,
                                            background: isDark?'rgba(255,255,255,0.04)':'#f8fafc',
                                            cursor: waLoading ? 'not-allowed' : 'pointer',
                                            opacity: waLoading ? 0.7 : 1,
                                            fontFamily:'inherit', textAlign:'left', width:'100%',
                                            transition:'all .13s',
                                        }}
                                            onMouseEnter={e=>{ if (!waLoading) { e.currentTarget.style.background=`rgba(90,173,156,0.08)`;e.currentTarget.style.borderColor=AD.green; }}}
                                            onMouseLeave={e=>{ e.currentTarget.style.background=isDark?'rgba(255,255,255,0.04)':'#f8fafc';e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'; }}
                                        >
                                            <div style={{ width:38, height:38, borderRadius:10, background:`rgba(90,173,156,0.13)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                                {waLoading
                                                    ? <Loader2 size={19} color={AD.green} style={{ animation:'spin 1s linear infinite' }} />
                                                    : isMobileDevice ? <Share2 size={19} color={AD.green} /> : <MessageCircle size={19} color={AD.green} />
                                                }
                                            </div>
                                            <div style={{ flex:1 }}>
                                                <p style={{ margin:0, fontWeight:700, fontSize:13, color: isDark?'#e2e8f0':'#1e293b' }}>
                                                    {isMobileDevice ? 'Compartir' : 'Enviar por WhatsApp'}
                                                </p>
                                                <p style={{ margin:'2px 0 0', fontSize:11, color: isDark?'#64748b':'#94a3b8' }}>
                                                    {waLoading ? 'Generando PDF…' : isMobileDevice ? 'Abre opciones del sistema' : 'Genera link de WhatsApp'}
                                                </p>
                                            </div>
                                            {!waLoading && <ChevronRight size={15} color={isDark?'#475569':'#cbd5e1'} />}
                                        </button>

                                        {/* IMPRIMIR — directo con formato guardado */}
                                        <div style={{ display:'flex', gap:8 }}>
                                            <button onClick={handlePrint} style={{
                                                flex:1, display:'flex', alignItems:'center', gap:14,
                                                padding:'14px 16px', borderRadius:14,
                                                border:`1.5px solid ${isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'}`,
                                                background: isDark?'rgba(255,255,255,0.04)':'#f8fafc',
                                                cursor:'pointer', fontFamily:'inherit', textAlign:'left',
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
                                                    <p style={{ margin:'2px 0 0', fontSize:11, color: isDark?'#64748b':'#94a3b8' }}>
                                                        Formato: <strong style={{ color: AD.teal }}>{printMode}</strong> · vía ArtDent Print
                                                    </p>
                                                </div>
                                                <Printer size={15} color={AD.teal} />
                                            </button>
                                            {/* Toggle rápido 80mm / 57mm */}
                                            <div style={{ display:'flex', flexDirection:'column', gap:4, flexShrink:0 }}>
                                                {['80mm','57mm'].map(m => (
                                                    <button key={m} onClick={() => savePrintMode(m)} style={{
                                                        padding:'0 10px', height:'100%', maxHeight:28, borderRadius:8,
                                                        border:`1.5px solid ${printMode===m ? AD.teal : (isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)')}`,
                                                        background: printMode===m ? `rgba(73,148,156,0.15)` : 'transparent',
                                                        color: printMode===m ? AD.teal : (isDark?'#64748b':'#94a3b8'),
                                                        fontWeight:700, fontSize:10, cursor:'pointer', fontFamily:'inherit',
                                                        transition:'all .12s',
                                                    }}>
                                                        {m}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
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

                            {/* Ticket oculto — siempre renderizado para que handlePrint() lo encuentre */}
                            <div style={{ position:'absolute', left:-9999, top:-9999, pointerEvents:'none' }}>
                                {printMode === '57mm'
                                    ? <Ticket57 sale={{ ...postSale, company, sale_items: postSale.sale_items || postSale.items }} />
                                    : <Ticket80 sale={{ ...postSale, company, sale_items: postSale.sale_items || postSale.items }} />
                                }
                            </div>

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
                                <FacturaA4 sale={{ ...postSale, company, sale_items: postSale.sale_items || postSale.items }} />
                            </div>
                        </div>
                    </div>
                );
            })()}

        </AuthenticatedLayout>
    );
}

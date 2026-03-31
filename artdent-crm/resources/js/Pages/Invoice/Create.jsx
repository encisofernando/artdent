/**
 * Invoice/Create.jsx — Nuevo Presupuesto
 * Mobile: grid catálogo + FAB → BottomSheet con tabs Ítems / Cliente
 * Desktop: split layout catálogo izq / carrito der
 */
import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import axios from 'axios';
import {
    B, G, useD, fmt,
    FAB, BottomSheet, ProductCard, TabStrip, Modal, DatePicker,
} from '@/Components/_appkit';
import {
    Search, Plus, Minus, Trash2, FileText,
    User, Phone, Mail, MapPin,
    Package, X, Check, StickyNote, ShoppingCart,
    Loader2,
} from 'lucide-react';

function calcTotals(items, discountPct) {
    const gross = items.reduce((s, i) => s + i.qty * i.price, 0);
    const discountAmt = gross * (Number(discountPct) / 100);
    const total = gross - discountAmt;
    const taxAmt = items.reduce((s, i) => {
        const lineAfterDiscount = i.qty * i.price * (1 - Number(discountPct) / 100);
        return s + (i.taxRate > 0 ? lineAfterDiscount - lineAfterDiscount / (1 + i.taxRate / 100) : 0);
    }, 0);
    const subtotal = total - taxAmt;
    return { subtotal, discountAmt, taxAmt, total };
}

export default function Create({ auth, products = [], customers = [] }) {
    const { isDark, sidebarCollapsed } = useTheme();
    const D = useD(isDark);

    /* ── Cart state ───────────────────────────────────────── */
    const [cart, setCart]                   = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [discountPct, setDiscountPct]     = useState('0');
    const [dueDate, setDueDate]             = useState('');
    const [notes, setNotes]                 = useState('');
    const [submitting, setSubmitting]       = useState(false);

    /* ── Mobile sheets ────────────────────────────────────── */
    const [cartOpen, setCartOpen]           = useState(false);
    const [activeTab, setActiveTab]         = useState('items');
    const [clienteOpen, setClienteOpen]     = useState(false);

    /* ── Ítem libre modal ─────────────────────────────────── */
    const [itemLibreOpen, setItemLibreOpen] = useState(false);
    const [itemLibre, setItemLibre]         = useState({ name: '', price: '', qty: '1', taxRate: '0' });
    const [itemLibreError, setItemLibreError] = useState('');

    /* ── Customer ─────────────────────────────────────────── */
    const [customerId, setCustomerId]       = useState('');
    const [customerName, setCustomerName]   = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerCuit, setCustomerCuit]   = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [clienteSearch, setClienteSearch] = useState('');

    /* ── Alta rápida cliente ──────────────────────────────── */
    const [altaClienteOpen, setAltaClienteOpen] = useState(false);
    const [newCliente, setNewCliente]           = useState({ name: '', phone: '', dni: '', cuit: '', email: '', address: '', iva_condition: 'consumidor_final' });
    const [savingCliente, setSavingCliente]     = useState(false);
    const [clienteError, setClienteError]       = useState('');
    const [padronLoading, setPadronLoading]     = useState(false);
    const [padronResult, setPadronResult]       = useState(null);

    /* ── Input style ──────────────────────────────────────── */
    const inputStyle = {
        width: '100%', padding: '10px 12px', borderRadius: 11,
        border: `1.5px solid ${D.inputBorder}`, background: D.input,
        color: D.text, fontSize: 13, fontFamily: 'inherit', outline: 'none',
    };

    /* ── Derived ──────────────────────────────────────────── */
    const filtered = useMemo(() => {
        const q = productSearch.toLowerCase().trim();
        if (!q) return products;
        return products.filter(p =>
            p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
        );
    }, [products, productSearch]);

    const { subtotal, discountAmt, taxAmt, total } = calcTotals(cart, discountPct);
    const itemCount = cart.reduce((s, i) => s + i.qty, 0);

    /* ── Cart actions ─────────────────────────────────────── */
    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, {
                id: product.id, name: product.name, sku: product.sku || '',
                price: Number(product.price || 0), taxRate: Number(product.tax_rate || 0), qty: 1,
            }];
        });
    };

    const updateQty = (id, delta) =>
        setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0.001, i.qty + delta) } : i).filter(i => i.qty > 0));

    const setQtyDirect = (id, val) => {
        const n = parseFloat(val);
        if (!isNaN(n) && n > 0) setCart(prev => prev.map(i => i.id === id ? { ...i, qty: n } : i));
    };

    const setPrice = (id, val) => {
        const n = parseFloat(val);
        if (!isNaN(n) && n >= 0) setCart(prev => prev.map(i => i.id === id ? { ...i, price: n } : i));
    };

    const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

    const openItemLibre = () => {
        setItemLibre({ name: '', price: '', qty: '1', taxRate: '0' });
        setItemLibreError('');
        setItemLibreOpen(true);
    };

    const confirmItemLibre = () => {
        if (!itemLibre.name.trim()) { setItemLibreError('La descripción es obligatoria.'); return; }
        const price = parseFloat(itemLibre.price);
        if (isNaN(price) || price < 0) { setItemLibreError('El precio debe ser un número válido.'); return; }
        const qty = parseFloat(itemLibre.qty) || 1;
        const taxRate = parseFloat(itemLibre.taxRate) || 0;
        setCart(prev => [...prev, {
            id: `custom-${Date.now()}`,
            name: itemLibre.name.trim(),
            sku: '',
            price,
            taxRate,
            qty,
        }]);
        setItemLibreOpen(false);
    };

    /* ── Customer select ──────────────────────────────────── */
    const selectCustomer = (c) => {
        if (!c) {
            setCustomerId(''); setCustomerName(''); setCustomerPhone('');
            setCustomerEmail(''); setCustomerCuit(''); setCustomerAddress('');
        } else {
            setCustomerId(String(c.id));
            setCustomerName(c.name);
            setCustomerPhone(c.phone || '');
            setCustomerEmail(c.email || '');
            setCustomerCuit(c.cuit || c.dni || '');
            setCustomerAddress(c.address || '');
        }
        setClienteOpen(false);
        setClienteSearch('');
    };

    /* ── Alta rápida cliente ──────────────────────────────── */
    const handlePadronLookup = async () => {
        const cuit = newCliente.cuit.replace(/\D/g, '');
        if (cuit.length !== 11) { setClienteError('El CUIT debe tener 11 dígitos.'); return; }
        setPadronLoading(true); setClienteError(''); setPadronResult(null);
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

    const handleCreateCliente = async () => {
        if (!newCliente.name.trim()) { setClienteError('El nombre es obligatorio.'); return; }
        setSavingCliente(true); setClienteError('');
        try {
            const res = await axios.post(route('customers.store'), { ...newCliente, is_active: true }, { headers: { Accept: 'application/json' } });
            const c = res.data.customer;
            selectCustomer(c);
            setAltaClienteOpen(false);
            setNewCliente({ name: '', phone: '', dni: '', cuit: '', email: '', address: '', iva_condition: 'consumidor_final' });
            setPadronResult(null);
        } catch (e) {
            setClienteError(e.response?.data?.message || 'Error al crear cliente');
        } finally {
            setSavingCliente(false);
        }
    };

    /* ── Submit ───────────────────────────────────────────── */
    const handleSubmit = (selectedStatus) => {
        if (!customerName.trim()) { alert('Seleccioná o ingresá un cliente.'); return; }
        if (cart.length === 0)    { alert('Agregá al menos un ítem.'); return; }
        setSubmitting(true);
        router.post(route('quotes.store'), {
            recipient_name:    customerName,
            recipient_cuit:    customerCuit,
            recipient_phone:   customerPhone,
            recipient_email:   customerEmail,
            recipient_address: customerAddress,
            customer_id:       customerId || null,
            items: cart.map(i => ({
                description: i.name,
                quantity:    i.qty,
                unit_price:  i.price,
                tax_rate:    i.taxRate,
                total:       parseFloat((i.qty * i.price).toFixed(2)),
            })),
            subtotal:   parseFloat(subtotal.toFixed(2)),
            discount:   parseFloat(discountAmt.toFixed(2)),
            tax_amount: parseFloat(taxAmt.toFixed(2)),
            total:      parseFloat(total.toFixed(2)),
            due_date:   dueDate || null,
            notes,
            status:     selectedStatus,
        }, { onError: () => setSubmitting(false) });
    };

    /* ── Customer selector button ─────────────────────────── */
    const CustomerBtn = ({ onClick }) => (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-[10px] text-[12.5px] font-semibold transition-colors"
            style={{
                border: `1.5px solid ${customerId ? `${B.blue}73` : D.border}`,
                color: customerId ? B.blue : D.muted,
                background: customerId ? `${B.blue}1F` : 'transparent',
            }}
        >
            <User size={15} />
            <span className="flex-1 text-left truncate">
                {customerName || 'Seleccionar cliente'}
            </span>
            {!customerId ? <Plus size={13} className="opacity-50" /> : <Check size={13} />}
        </button>
    );

    /* ── Cart items list (reusable) ───────────────────────── */
    const CartItems = () => (
        <>
            {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-10">
                    <ShoppingCart size={42} strokeWidth={1.2} className="mb-3" style={{ color: D.muted, opacity: 0.4 }} />
                    <p className="text-[14px] font-bold" style={{ color: D.muted }}>Carrito vacío</p>
                    <p className="text-[12px] mt-1" style={{ color: D.placeholder }}>
                        {cartOpen ? 'Cerrá y tocá un producto del catálogo' : 'Tocá un artículo para agregarlo'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {cart.map(item => (
                        <div key={item.id} className="p-3 rounded-[12px]"
                            style={{ background: D.card, border: `1px solid ${D.border}` }}>
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <p className="text-[13px] font-bold flex-1 min-w-0 leading-snug" style={{ color: D.text }}>
                                    {item.name}
                                </p>
                                <button onClick={() => removeItem(item.id)} className="flex-shrink-0 p-0.5"
                                    style={{ color: '#ef4444' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center rounded-[8px] overflow-hidden flex-shrink-0"
                                    style={{ border: `1px solid ${D.border}` }}>
                                    <button onClick={() => updateQty(item.id, -1)}
                                        className="w-8 h-8 flex items-center justify-center"
                                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                                        <Minus size={12} style={{ color: D.text }} />
                                    </button>
                                    <input type="number" value={item.qty}
                                        onChange={e => setQtyDirect(item.id, e.target.value)}
                                        min="1" step="1"
                                        className="w-10 text-center text-[12px] font-bold border-none bg-transparent focus:ring-0 p-0 outline-none"
                                        style={{ color: D.text }} />
                                    <button onClick={() => updateQty(item.id, 1)}
                                        className="w-8 h-8 flex items-center justify-center"
                                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                                        <Plus size={12} style={{ color: D.text }} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1.5 rounded-[8px] flex-1 min-w-0"
                                    style={{ border: `1px solid ${D.border}`, background: D.surface }}>
                                    <span className="text-[11px]" style={{ color: D.muted }}>$</span>
                                    <input type="number" value={item.price}
                                        onChange={e => setPrice(item.id, e.target.value)}
                                        min="0" step="any"
                                        className="w-full text-[12px] font-semibold border-none bg-transparent focus:ring-0 p-0 outline-none"
                                        style={{ color: D.text }} />
                                </div>
                                <span className="text-[13px] font-extrabold flex-shrink-0" style={{ color: B.blue }}>
                                    ${fmt(item.qty * item.price)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    /* ── Totals + submit footer ───────────────────────────── */
    const CartFooter = () => (
        <div className="px-4 pt-3 pb-4 flex-shrink-0 space-y-3" style={{ borderTop: `1px solid ${D.divider}` }}>
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-[10px]"
                    style={{ background: D.card, border: `1.5px solid ${D.border}` }}>
                    <span className="text-[11px] whitespace-nowrap" style={{ color: D.muted }}>Desc %</span>
                    <input type="number" min="0" max="100" step="0.5" value={discountPct}
                        onChange={e => setDiscountPct(e.target.value)}
                        className="flex-1 bg-transparent text-sm font-semibold border-none focus:ring-0 p-0 outline-none text-right"
                        style={{ color: D.text }} />
                </div>
                <div className="flex items-center px-3 py-2 rounded-[10px]"
                    style={{ background: D.card, border: `1.5px solid ${D.border}` }}>
                    <DatePicker value={dueDate} onChange={setDueDate} placeholder="Vencimiento" D={D} />
                </div>
            </div>

            <div className="space-y-1">
                {[[taxAmt > 0 ? 'Neto gravado' : 'Subtotal', `$${fmt(subtotal)}`],
                  discountAmt > 0 ? ['Descuento', `-$${fmt(discountAmt)}`] : null,
                  taxAmt > 0 ? ['IVA', `$${fmt(taxAmt)}`] : null,
                ].filter(Boolean).map(([l, v]) => (
                    <div key={l} className="flex justify-between text-[11.5px]">
                        <span style={{ color: D.muted }}>{l}</span>
                        <span className="font-semibold" style={{ color: D.text }}>{v}</span>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-baseline" style={{ borderTop: `1px solid ${D.divider}`, paddingTop: 8 }}>
                <span className="text-[13px] font-extrabold" style={{ color: D.text }}>TOTAL</span>
                <span className="text-[28px] font-extrabold tracking-[-0.02em]" style={{ color: B.blue }}>
                    ${fmt(total)}
                </span>
            </div>

            <div className="flex gap-2">
                <button onClick={() => handleSubmit('draft')} disabled={submitting}
                    className="flex-1 py-[13px] rounded-[12px] text-[13px] font-bold transition-colors"
                    style={{ border: `1.5px solid ${D.border}`, color: D.text, background: D.card }}>
                    Borrador
                </button>
                <button onClick={() => handleSubmit('sent')} disabled={submitting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-[13px] rounded-[12px] text-white text-[14px] font-extrabold transition-all active:scale-[0.98]"
                    style={{ background: G.horizontal, boxShadow: `0 6px 20px ${B.green}6B`, opacity: submitting ? 0.7 : 1 }}>
                    <Check size={15} />
                    Emitir
                </button>
            </div>
        </div>
    );

    /* ── Mobile tab: Ítems ────────────────────────────────── */
    const ItemsTab = () => (
        <div className="flex flex-col h-full">
            {/* Customer btn + item count header */}
            <div className="px-4 pt-2 pb-3 flex-shrink-0 space-y-2">
                <CustomerBtn onClick={() => setClienteOpen(true)} />
                <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold" style={{ color: D.muted }}>
                        {cart.length === 0 ? 'Sin ítems' : `${cart.length} producto${cart.length !== 1 ? 's' : ''}`}
                    </span>
                    <button onClick={openItemLibre}
                        className="text-[11.5px] font-semibold px-2.5 py-1 rounded-[7px]"
                        style={{ color: B.blue, background: `${B.blue}1A` }}>
                        + Ítem libre
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-2">
                <CartItems />
            </div>
            <CartFooter />
        </div>
    );

    /* ── Mobile tab: Cliente ──────────────────────────────── */
    const ClienteTab = () => (
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {/* Selected customer */}
            {customerName ? (
                <div className="p-4 rounded-[14px] space-y-2"
                    style={{ background: `${B.blue}18`, border: `1.5px solid ${B.blue}50` }}>
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="font-extrabold text-[15px]" style={{ color: D.text }}>{customerName}</p>
                            {customerPhone && <p className="text-[12px] mt-0.5" style={{ color: D.muted }}>{customerPhone}</p>}
                            {customerEmail && <p className="text-[12px]" style={{ color: D.muted }}>{customerEmail}</p>}
                        </div>
                        <button onClick={() => selectCustomer(null)}
                            className="p-1.5 rounded-lg" style={{ color: D.muted }}>
                            <X size={16} />
                        </button>
                    </div>
                    <button onClick={() => setClienteOpen(true)}
                        className="text-[12px] font-semibold" style={{ color: B.blue }}>
                        Cambiar cliente →
                    </button>
                </div>
            ) : (
                <button onClick={() => setClienteOpen(true)}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-[14px] text-left transition-all"
                    style={{ border: `2px dashed ${D.border}`, color: D.muted }}>
                    <User size={20} />
                    <div>
                        <p className="font-bold text-[14px]" style={{ color: D.text }}>Sin cliente seleccionado</p>
                        <p className="text-[12px]">Tocá para seleccionar o crear uno</p>
                    </div>
                </button>
            )}

            {/* Notes */}
            <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: D.muted }}>Notas</p>
                <div className="flex items-start gap-3 px-3 py-3 rounded-[12px]"
                    style={{ background: D.card, border: `1.5px solid ${D.border}` }}>
                    <StickyNote size={15} className="mt-0.5 flex-shrink-0" style={{ color: D.muted }} />
                    <textarea rows={3} placeholder="Condiciones, observaciones..." value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="flex-1 bg-transparent text-[14px] border-none focus:ring-0 p-0 outline-none resize-none"
                        style={{ color: D.text }} />
                </div>
            </div>
        </div>
    );

    /* ── Desktop cart panel ───────────────────────────────── */
    const DesktopCart = () => (
        <div className="flex flex-col h-full">
            <div className="px-4 pt-4 pb-3 flex-shrink-0 space-y-2" style={{ borderBottom: `1px solid ${D.divider}` }}>
                <div className="flex items-center gap-3">
                    <ShoppingCart size={15} style={{ color: B.blue }} />
                    <span className="font-extrabold text-[13px]" style={{ color: D.text }}>Presupuesto</span>
                    {itemCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-[5px] text-[10.5px] font-bold"
                            style={{ background: `${B.blue}33`, color: B.blue, border: `1px solid ${B.blue}40` }}>
                            {Math.round(itemCount)}
                        </span>
                    )}
                    <button onClick={openItemLibre} className="ml-auto text-[11.5px] font-semibold px-2.5 py-1 rounded-[7px]"
                        style={{ color: B.blue }}>
                        + Ítem libre
                    </button>
                </div>
                <CustomerBtn onClick={() => setClienteOpen(true)} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'thin' }}>
                <CartItems />
            </div>

            {/* Notes field desktop */}
            <div className="px-4 pb-2 flex-shrink-0">
                <div className="flex items-start gap-2 px-3 py-2 rounded-[10px]"
                    style={{ background: D.card, border: `1.5px solid ${D.border}` }}>
                    <StickyNote size={13} className="mt-0.5" style={{ color: D.muted }} />
                    <textarea rows={2} placeholder="Notas / condiciones (opcional)" value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="flex-1 bg-transparent text-sm border-none focus:ring-0 p-0 outline-none resize-none"
                        style={{ color: D.text }} />
                </div>
            </div>

            <CartFooter />
        </div>
    );

    /* ── Render ───────────────────────────────────────────── */
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nuevo Presupuesto" />

            {/* Full-screen container */}
            <div className={`fixed top-16 right-0 left-0 bottom-14 lg:bottom-0 z-[5] flex flex-col lg:flex-row overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}`}
                style={{ background: D.surface }}>

                {/* ═══ LEFT — Catálogo ═══════════════════════════════ */}
                <div className="w-full lg:flex-1 h-full flex flex-col overflow-hidden"
                    style={{ borderRight: `1px solid ${D.divider}` }}>

                    <div className="px-4 pt-4 pb-3 flex items-center gap-3 flex-shrink-0">
                        <div className="flex-1 flex items-center h-10 px-3 rounded-[10px]" style={{ background: D.card }}>
                            <Search size={16} className="mr-2 flex-shrink-0" style={{ color: D.muted }} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre o SKU..."
                                value={productSearch}
                                onChange={e => setProductSearch(e.target.value)}
                                className="w-full h-full bg-transparent border-none focus:ring-0 text-[13.5px] outline-none"
                                style={{ color: D.text }}
                            />
                            {productSearch && (
                                <button onClick={() => setProductSearch('')} className="ml-1 p-1 rounded-full">
                                    <X size={13} style={{ color: D.muted }} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-24 lg:pb-4">
                        {filtered.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <Package size={38} strokeWidth={1.5} className="mb-3" style={{ color: D.muted }} />
                                <h3 className="font-bold text-[14.5px] mb-1" style={{ color: D.text }}>Sin artículos</h3>
                                <p className="text-[12.5px]" style={{ color: D.muted }}>No se encontraron productos.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-[10px]">
                                {filtered.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        cartItem={cart.find(c => c.id === product.id)}
                                        onAdd={addToCart}
                                        isDark={isDark}
                                        D={D}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ RIGHT — Cart (desktop only) ═══════════════════ */}
                <div className="hidden lg:flex w-96 flex-shrink-0 flex-col overflow-hidden"
                    style={{ background: D.surface }}>
                    <div className="px-5 py-4 flex items-center gap-3 flex-shrink-0"
                        style={{ borderBottom: `1px solid ${D.divider}` }}>
                        <FileText size={18} style={{ color: B.teal }} />
                        <span className="font-extrabold" style={{ color: D.text }}>Nuevo Presupuesto</span>
                    </div>
                    <div className="flex-1 overflow-hidden"><DesktopCart /></div>
                </div>
            </div>

            {/* ═══ Mobile FAB ════════════════════════════════════════ */}
            <div className="lg:hidden">
                <FAB onClick={() => { setActiveTab('items'); setCartOpen(true); }} badge={Math.round(itemCount)} color={G.horizontal}>
                    <FileText size={22} className="text-white" />
                </FAB>
            </div>

            {/* ═══ Mobile BottomSheet con tabs ══════════════════════ */}
            <BottomSheet open={cartOpen} onClose={() => setCartOpen(false)} title="Nuevo Presupuesto" maxHeight="92vh" D={D}>
                <div className="px-4 pb-3 flex-shrink-0">
                    <TabStrip D={D} value={activeTab} onChange={setActiveTab}
                        tabs={[
                            { id: 'items',   label: `Ítems${cart.length > 0 ? ` (${cart.length})` : ''}` },
                            { id: 'cliente', label: `Cliente${customerName ? ' ✓' : ''}` },
                        ]}
                    />
                </div>
                <div className="flex-1 overflow-hidden flex flex-col">
                    {activeTab === 'items'   && <ItemsTab />}
                    {activeTab === 'cliente' && <ClienteTab />}
                </div>
            </BottomSheet>

            {/* ═══ Modal Ítem libre ═════════════════════════════════ */}
            <Modal open={itemLibreOpen} onClose={() => setItemLibreOpen(false)} title="Ítem libre" D={D}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10.5px] font-bold uppercase tracking-widest mb-1.5" style={{ color: D.muted }}>
                            Descripción *
                        </label>
                        <input
                            type="text"
                            placeholder="Ej: Consulta, Servicio de diseño..."
                            value={itemLibre.name}
                            onChange={e => { setItemLibre(p => ({ ...p, name: e.target.value })); setItemLibreError(''); }}
                            autoFocus
                            className="w-full outline-none"
                            style={{
                                padding: '10px 12px', borderRadius: 11,
                                border: `1.5px solid ${D.inputBorder}`, background: D.input,
                                color: D.text, fontSize: 14, fontFamily: 'inherit',
                            }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10.5px] font-bold uppercase tracking-widest mb-1.5" style={{ color: D.muted }}>
                                Precio unitario *
                            </label>
                            <div className="flex items-center gap-1.5 px-3 py-2.5 rounded-[11px]"
                                style={{ border: `1.5px solid ${D.inputBorder}`, background: D.input }}>
                                <span className="text-[13px] font-bold" style={{ color: D.muted }}>$</span>
                                <input
                                    type="number" min="0" step="0.01" placeholder="0,00"
                                    value={itemLibre.price}
                                    onChange={e => { setItemLibre(p => ({ ...p, price: e.target.value })); setItemLibreError(''); }}
                                    className="flex-1 bg-transparent border-none focus:ring-0 p-0 outline-none text-[14px] font-semibold"
                                    style={{ color: D.text }}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10.5px] font-bold uppercase tracking-widest mb-1.5" style={{ color: D.muted }}>
                                Cantidad
                            </label>
                            <input
                                type="number" min="0.001" step="1"
                                value={itemLibre.qty}
                                onChange={e => setItemLibre(p => ({ ...p, qty: e.target.value }))}
                                className="w-full outline-none text-[14px] font-semibold"
                                style={{
                                    padding: '10px 12px', borderRadius: 11,
                                    border: `1.5px solid ${D.inputBorder}`, background: D.input,
                                    color: D.text, fontFamily: 'inherit',
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10.5px] font-bold uppercase tracking-widest mb-1.5" style={{ color: D.muted }}>
                            Alícuota IVA
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {['0', '10.5', '21', '27'].map(rate => (
                                <button key={rate}
                                    onClick={() => setItemLibre(p => ({ ...p, taxRate: rate }))}
                                    className="py-2.5 rounded-[10px] text-[13px] font-bold transition-all"
                                    style={{
                                        background: itemLibre.taxRate === rate ? `${B.blue}33` : D.card,
                                        border: `1.5px solid ${itemLibre.taxRate === rate ? B.blue : D.border}`,
                                        color: itemLibre.taxRate === rate ? B.blue : D.muted,
                                    }}>
                                    {rate === '0' ? 'Exento' : `${rate}%`}
                                </button>
                            ))}
                        </div>
                    </div>

                    {itemLibre.price && parseFloat(itemLibre.price) > 0 && (
                        <div className="flex items-center justify-between px-4 py-3 rounded-[12px]"
                            style={{ background: `${B.blue}12`, border: `1px solid ${B.blue}30` }}>
                            <span className="text-[12px] font-semibold" style={{ color: D.muted }}>
                                Total ({itemLibre.qty || 1} × ${fmt(parseFloat(itemLibre.price) || 0)})
                            </span>
                            <span className="text-[16px] font-extrabold" style={{ color: B.blue }}>
                                ${fmt((parseFloat(itemLibre.qty) || 1) * (parseFloat(itemLibre.price) || 0))}
                            </span>
                        </div>
                    )}

                    {itemLibreError && (
                        <p className="text-[12px] font-semibold" style={{ color: '#ef4444' }}>{itemLibreError}</p>
                    )}

                    <div className="flex gap-2 pt-1">
                        <button onClick={() => setItemLibreOpen(false)}
                            className="flex-1 py-[13px] rounded-[12px] text-[13px] font-bold"
                            style={{ border: `1.5px solid ${D.border}`, color: D.text, background: D.card }}>
                            Cancelar
                        </button>
                        <button onClick={confirmItemLibre}
                            className="flex-1 flex items-center justify-center gap-1.5 py-[13px] rounded-[12px] text-white text-[14px] font-extrabold transition-all active:scale-[0.98]"
                            style={{ background: G.horizontal }}>
                            <Plus size={16} />
                            Agregar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* ═══ Modal selector de cliente ════════════════════════ */}
            <Modal open={clienteOpen} onClose={() => { setClienteOpen(false); setAltaClienteOpen(false); setClienteSearch(''); }} title="Seleccionar Cliente" D={D}>
                {!altaClienteOpen ? (
                    <div className="space-y-3">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" style={{ color: D.text }} />
                            <input type="text" value={clienteSearch} onChange={e => setClienteSearch(e.target.value)}
                                placeholder="Buscar por nombre, DNI o teléfono..."
                                className="w-full outline-none pl-8"
                                style={{ ...inputStyle, fontSize: 13 }}
                                autoFocus
                            />
                        </div>

                        <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5">
                            {customers
                                .filter(c => {
                                    if (!clienteSearch) return true;
                                    const q = clienteSearch.toLowerCase();
                                    return (c.name?.toLowerCase().includes(q))
                                        || (c.dni?.toLowerCase().includes(q))
                                        || (c.phone?.toLowerCase().includes(q));
                                })
                                .map(c => {
                                    const isSelected = customerId === String(c.id);
                                    return (
                                        <button key={c.id} onClick={() => selectCustomer(c)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left transition-colors"
                                            style={{
                                                background: isSelected ? `${B.blue}1F` : 'transparent',
                                                border: `1.5px solid ${isSelected ? `${B.blue}60` : D.border}`,
                                            }}>
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
                                <p className="text-[12px] text-center py-4" style={{ color: D.muted }}>No hay clientes registrados aún.</p>
                            )}
                        </div>

                        <button onClick={() => setAltaClienteOpen(true)}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[12.5px] font-semibold"
                            style={{ border: `1.5px dashed ${B.teal}60`, color: B.teal, background: `${B.teal}0D` }}>
                            <Plus size={14} />
                            Alta rápida de cliente
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <button onClick={() => { setAltaClienteOpen(false); setClienteError(''); }}
                            className="flex items-center gap-1.5 text-[12px] font-semibold mb-1"
                            style={{ color: D.muted }}>
                            ← Volver al listado
                        </button>

                        {/* CUIT + Padrón */}
                        <div>
                            <label className="block text-[10.5px] font-bold tracking-widest mb-1" style={{ color: D.muted }}>CUIT</label>
                            <div className="flex gap-2">
                                <input type="text" value={newCliente.cuit}
                                    onChange={e => { setNewCliente(p => ({ ...p, cuit: e.target.value })); setPadronResult(null); }}
                                    placeholder="Sin guiones (11 dígitos)" className="outline-none"
                                    style={{ ...inputStyle, flex: 1 }} />
                                <button type="button" onClick={handlePadronLookup} disabled={padronLoading}
                                    className="px-3 rounded-[11px] text-[12px] font-bold text-white flex-shrink-0"
                                    style={{ background: B.blue, opacity: padronLoading ? 0.6 : 1 }}>
                                    {padronLoading ? <Loader2 size={14} className="animate-spin" /> : 'ARCA'}
                                </button>
                            </div>
                            {padronResult && (
                                <div className="mt-1.5 px-3 py-2 rounded-[9px] text-[11.5px]"
                                    style={{ background: `${B.green}18`, border: `1px solid ${B.green}40`, color: B.green }}>
                                    ✓ {padronResult.razon_social} — {padronResult.condicion_iva}
                                </div>
                            )}
                        </div>

                        {[
                            { key: 'name',    label: 'Nombre *',   type: 'text'  },
                            { key: 'phone',   label: 'Teléfono',   type: 'tel'   },
                            { key: 'dni',     label: 'DNI',        type: 'text'  },
                            { key: 'email',   label: 'Email',      type: 'email' },
                            { key: 'address', label: 'Dirección',  type: 'text'  },
                        ].map(({ key, label, type }) => (
                            <div key={key}>
                                <label className="block text-[10.5px] font-bold tracking-widest mb-1" style={{ color: D.muted }}>{label.toUpperCase()}</label>
                                <input type={type} value={newCliente[key]}
                                    onChange={e => setNewCliente(p => ({ ...p, [key]: e.target.value }))}
                                    className="outline-none" style={inputStyle} />
                            </div>
                        ))}

                        {clienteError && (
                            <p className="text-[12px] font-semibold" style={{ color: '#ef4444' }}>{clienteError}</p>
                        )}

                        <button onClick={handleCreateCliente} disabled={savingCliente}
                            className="w-full py-[12px] rounded-[12px] text-white text-[14px] font-extrabold flex items-center justify-center gap-2"
                            style={{ background: G.horizontal, opacity: savingCliente ? 0.7 : 1 }}>
                            {savingCliente ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            Crear cliente
                        </button>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}

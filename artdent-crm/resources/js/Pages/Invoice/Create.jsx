/**
 * Invoice/Create.jsx — Nuevo Presupuesto
 * Split layout: productos izquierda / carrito derecha
 * Sin descuento de stock, sin pago.
 */
import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    Search, Plus, Minus, Trash2, FileText,
    User, Phone, Mail, MapPin, Calendar,
    Package, X, Check, StickyNote,
} from 'lucide-react';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C', mint: '#ACD6CE' };
const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });

function calcTotals(items, discountPct) {
    // prices already include IVA — total = gross - discount (no addition)
    const gross = items.reduce((s, i) => s + i.qty * i.price, 0);
    const discountAmt = gross * (Number(discountPct) / 100);
    const total = gross - discountAmt;
    // discriminate IVA from within the discounted total (not added on top)
    const taxAmt = items.reduce((s, i) => {
        const lineAfterDiscount = i.qty * i.price * (1 - Number(discountPct) / 100);
        return s + (i.taxRate > 0 ? lineAfterDiscount - lineAfterDiscount / (1 + i.taxRate / 100) : 0);
    }, 0);
    const subtotal = total - taxAmt; // neto gravado (sin IVA)
    return { subtotal, discountAmt, taxAmt, total };
}

function ProductCard({ product, onAdd, isDark }) {
    return (
        <button
            onClick={() => onAdd(product)}
            className={`w-full text-left p-3 rounded-xl border transition-all hover:-translate-y-0.5
                ${isDark ? 'bg-slate-900 border-slate-700/60 hover:border-teal-500/40' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'}
            `}
        >
            <div className="flex items-center gap-3">
                {product.image ? (
                    <img src={product.image} alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                ) : (
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${B.blue}15, ${B.teal}15)` }}>
                        <Package size={18} style={{ color: B.teal }} />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className={`text-sm font-semibold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{product.name}</p>
                    {product.sku && <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>SKU: {product.sku}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: B.teal }}>${Number(product.price || 0).toLocaleString('es-AR')}</p>
                    <div className="mt-1 w-6 h-6 rounded-full flex items-center justify-center ml-auto"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Plus size={13} className="text-white" />
                    </div>
                </div>
            </div>
        </button>
    );
}

export default function Create({ auth, products = [] }) {
    const { isDark, sidebarCollapsed } = useTheme();

    const [cart, setCart]           = useState([]);
    const [productSearch, setProductSearch] = useState('');
    const [discountPct, setDiscountPct] = useState('0');
    const [dueDate, setDueDate]     = useState('');
    const [notes, setNotes]         = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showCart, setShowCart]   = useState(false);

    const [customer, setCustomer] = useState({ name: '', cuit: '', phone: '', email: '', address: '' });

    const filtered = useMemo(() => {
        const q = productSearch.toLowerCase().trim();
        if (!q) return products;
        return products.filter(p => p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q));
    }, [products, productSearch]);

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { id: product.id, name: product.name, sku: product.sku || '', price: Number(product.price || 0), taxRate: Number(product.tax_rate || 0), qty: 1 }];
        });
    };

    const updateQty = (id, delta) => setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(0.001, i.qty + delta) } : i).filter(i => i.qty > 0));
    const setQtyDirect = (id, val) => { const n = parseFloat(val); if (!isNaN(n) && n > 0) setCart(prev => prev.map(i => i.id === id ? { ...i, qty: n } : i)); };
    const setPrice = (id, val) => { const n = parseFloat(val); if (!isNaN(n) && n >= 0) setCart(prev => prev.map(i => i.id === id ? { ...i, price: n } : i)); };
    const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

    const addCustomItem = () => {
        const name = window.prompt('Descripción del ítem:');
        if (!name?.trim()) return;
        const price = parseFloat(window.prompt('Precio unitario:') || '0');
        setCart(prev => [...prev, { id: `custom-${Date.now()}`, name: name.trim(), sku: '', price: price || 0, taxRate: 0, qty: 1 }]);
    };

    const { subtotal, discountAmt, taxAmt, total } = calcTotals(cart, discountPct);

    const handleSubmit = (selectedStatus) => {
        if (!customer.name.trim()) { alert('Ingresá el nombre del cliente.'); return; }
        if (cart.length === 0)     { alert('Agregá al menos un ítem.'); return; }
        setSubmitting(true);
        router.post(route('quotes.store'), {
            recipient_name:    customer.name,
            recipient_cuit:    customer.cuit,
            recipient_phone:   customer.phone,
            recipient_email:   customer.email,
            recipient_address: customer.address,
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

    const cartPanel = (
        <div className="flex flex-col h-full">
            {/* Customer */}
            <div className={`p-4 border-b flex-shrink-0 ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Datos del cliente</h3>
                <div className="space-y-2">
                    {[
                        { key: 'name',    icon: User,    ph: 'Nombre / Razón Social *' },
                        { key: 'cuit',    icon: FileText, ph: 'CUIT / DNI' },
                        { key: 'phone',   icon: Phone,   ph: 'Teléfono' },
                        { key: 'email',   icon: Mail,    ph: 'Email' },
                        { key: 'address', icon: MapPin,  ph: 'Dirección' },
                    ].map(({ key, icon: Icon, ph }) => (
                        <div key={key} className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-white border-slate-200'}`}>
                            <Icon size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input type={key === 'email' ? 'email' : 'text'} placeholder={ph} value={customer[key]}
                                onChange={e => setCustomer(p => ({ ...p, [key]: e.target.value }))}
                                className={`flex-1 bg-transparent text-sm border-none focus:ring-0 p-0 outline-none ${isDark ? 'text-slate-200 placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
                <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ítems ({cart.length})</h3>
                    <button onClick={addCustomItem} className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${isDark ? 'bg-slate-800 text-slate-400 hover:text-slate-200' : 'bg-slate-100 text-slate-500 hover:text-slate-700'}`}>
                        + Ítem libre
                    </button>
                </div>
                {cart.length === 0 ? (
                    <div className={`text-center py-8 text-sm ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Elegí productos del catálogo</div>
                ) : cart.map(item => (
                    <div key={item.id} className={`rounded-xl p-3 border mb-2 ${isDark ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <p className={`text-xs font-semibold flex-1 min-w-0 truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{item.name}</p>
                            <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 size={13} /></button>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`flex items-center rounded-lg border overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                                <button onClick={() => updateQty(item.id, -1)} className={`px-2 py-1 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}><Minus size={11} /></button>
                                <input type="number" value={item.qty} onChange={e => setQtyDirect(item.id, e.target.value)} min="0.001" step="1"
                                    className={`w-10 text-center text-xs font-bold border-none bg-transparent focus:ring-0 p-1 outline-none ${isDark ? 'text-slate-200' : 'text-slate-800'}`} />
                                <button onClick={() => updateQty(item.id, 1)} className={`px-2 py-1 ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}><Plus size={11} /></button>
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border flex-1 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white'}`}>
                                <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>$</span>
                                <input type="number" value={item.price} onChange={e => setPrice(item.id, e.target.value)} min="0" step="any"
                                    className={`w-full text-xs font-semibold border-none bg-transparent focus:ring-0 p-0 outline-none ${isDark ? 'text-slate-200' : 'text-slate-800'}`} />
                            </div>
                            <span className="text-xs font-bold flex-shrink-0" style={{ color: B.teal }}>${fmt(item.qty * item.price)}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals + actions */}
            <div className={`border-t p-4 space-y-3 flex-shrink-0 ${isDark ? 'border-slate-700/60 bg-slate-900' : 'border-slate-200 bg-white'}`}>
                <div className="grid grid-cols-2 gap-2">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                        <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Desc %</span>
                        <input type="number" min="0" max="100" step="0.5" value={discountPct} onChange={e => setDiscountPct(e.target.value)}
                            className={`flex-1 bg-transparent text-sm font-semibold border-none focus:ring-0 p-0 outline-none text-right ${isDark ? 'text-slate-200' : 'text-slate-800'}`} />
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                        <Calendar size={13} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                            className={`flex-1 bg-transparent text-xs border-none focus:ring-0 p-0 outline-none ${isDark ? 'text-slate-200' : 'text-slate-800'}`} />
                    </div>
                </div>
                <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                    <StickyNote size={13} className={`mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                    <textarea rows={2} placeholder="Notas / condiciones (opcional)" value={notes} onChange={e => setNotes(e.target.value)}
                        className={`flex-1 bg-transparent text-sm border-none focus:ring-0 p-0 outline-none resize-none ${isDark ? 'text-slate-200 placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'}`} />
                </div>
                <div className={`rounded-xl border p-3 space-y-1 ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                    {[[taxAmt > 0 ? 'Neto gravado' : 'Subtotal', `$${fmt(subtotal)}`], discountAmt > 0 ? ['Descuento', `-$${fmt(discountAmt)}`] : null, taxAmt > 0 ? ['IVA (discriminado)', `$${fmt(taxAmt)}`] : null].filter(Boolean).map(([l, v]) => (
                        <div key={l} className="flex justify-between text-xs">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>{l}</span>
                            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{v}</span>
                        </div>
                    ))}
                    <div className={`flex justify-between items-baseline pt-2 border-t mt-1 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                        <span className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>TOTAL</span>
                        <span className="text-xl font-extrabold" style={{ color: B.teal }}>${fmt(total)}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleSubmit('draft')} disabled={submitting}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-colors ${isDark ? 'border-slate-600 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                        Guardar Borrador
                    </button>
                    <button onClick={() => handleSubmit('sent')} disabled={submitting}
                        className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:shadow-lg"
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                        <Check size={14} className="inline mr-1" />
                        Emitir
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nuevo Presupuesto" />

            <div className={`fixed inset-0 top-16 z-[5] overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}`}>

                {/* ── Desktop: split ── */}
                <div className="hidden lg:flex h-full">
                    {/* Left: catalogue */}
                    <div className={`flex-1 flex flex-col border-r overflow-hidden ${isDark ? 'bg-[#0b1520] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`flex items-center gap-4 px-6 py-4 border-b flex-shrink-0 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                                <Package size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className={`text-lg font-extrabold leading-none ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Catálogo</h1>
                                <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Clic para agregar al presupuesto</p>
                            </div>
                            <div className={`ml-auto flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                                <Search size={16} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                <input type="text" placeholder="Buscar producto..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
                                    className={`bg-transparent text-sm border-none focus:ring-0 p-0 outline-none w-44 ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`} />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(73,148,156,.2) transparent' }}>
                            {filtered.length === 0 ? (
                                <div className={`text-center py-12 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No se encontraron productos.</div>
                            ) : (
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                                    {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} isDark={isDark} />)}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Right: cart */}
                    <div className={`w-96 flex-shrink-0 flex flex-col overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                        <div className={`px-5 py-4 border-b flex items-center gap-3 flex-shrink-0 ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
                            <FileText size={18} style={{ color: B.teal }} />
                            <span className={`font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Nuevo Presupuesto</span>
                        </div>
                        <div className="flex-1 overflow-hidden">{cartPanel}</div>
                    </div>
                </div>

                {/* ── Mobile: catalogue + FAB + bottom sheet ── */}
                <div className="lg:hidden h-full flex flex-col overflow-hidden">
                    <div className={`flex items-center gap-3 px-4 py-3 border-b flex-shrink-0 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                            <Package size={17} className="text-white" />
                        </div>
                        <span className={`flex-1 text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Nuevo Presupuesto</span>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                            <Search size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <input type="text" placeholder="Buscar..." value={productSearch} onChange={e => setProductSearch(e.target.value)}
                                className={`bg-transparent text-sm border-none focus:ring-0 p-0 outline-none w-28 ${isDark ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`} />
                        </div>
                    </div>
                    <div className={`flex-1 overflow-y-auto p-4 pb-28 ${isDark ? 'bg-[#0b1520]' : 'bg-slate-50'}`}>
                        <div className="flex flex-col gap-2">
                            {filtered.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} isDark={isDark} />)}
                        </div>
                    </div>
                    {/* FAB */}
                    <button onClick={() => setShowCart(true)} style={{
                        position: 'fixed', bottom: 22, right: 20, zIndex: 40,
                        padding: '14px 22px', borderRadius: 28, border: 'none',
                        background: `linear-gradient(135deg, ${B.blue}, ${B.teal})`,
                        color: '#fff', display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 8px 28px rgba(57,123,156,.45)', cursor: 'pointer',
                        fontSize: 14, fontWeight: 700,
                    }}>
                        <FileText size={18} />
                        Presupuesto
                        {cart.length > 0 && (
                            <span style={{ background: '#fff', color: B.blue, borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900 }}>
                                {cart.length}
                            </span>
                        )}
                    </button>
                    {/* Bottom sheet */}
                    {showCart && (
                        <div className="fixed inset-0 z-50 flex flex-col justify-end">
                            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
                            <div className={`relative z-10 rounded-t-3xl flex flex-col max-h-[90vh] ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
                                <div className={`flex items-center justify-between px-5 pt-4 pb-3 border-b flex-shrink-0 ${isDark ? 'border-slate-700/60' : 'border-slate-200'}`}>
                                    <span className={`font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Nuevo Presupuesto</span>
                                    <button onClick={() => setShowCart(false)} className={`p-2 rounded-xl ${isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-100'}`}><X size={18} /></button>
                                </div>
                                <div className="flex-1 overflow-hidden">{cartPanel}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

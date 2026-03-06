import React, { useState, useMemo, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import axios from 'axios';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import {
    ShoppingCart, User, Search, Plus, Minus, Trash2, ArrowLeft,
    CreditCard, Box as BoxIcon, Image as ImageIcon, ReceiptIcon,
    X, Check, Package, ReceiptText, Store
} from 'lucide-react';

const B = { blue: "#397B9C", green: "#5AAD9C", teal: "#49949C", mint: "#ACD6CE", soft: "#7CA5C3", red: "#E63946" };

const formatMoney = (val) => Number(val || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TIPOS = [
    { id: "X", label: "Ticket X", desc: "Sin factura", accentColor: "#64748b" },
    { id: "A", label: "Factura A", desc: "Resp. Inscripto", accentColor: B.blue },
    { id: "B", label: "Factura B", desc: "Cons. Final", accentColor: B.green },
    { id: "C", label: "Factura C", desc: "Monotributista", accentColor: B.teal },
];

export default function Create({ auth, products }) {
    const { isDark } = useTheme();
    const [busca, setBusca] = useState('');
    const [cart, setCart] = useState([]);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        customer_name: 'Consumidor Final',
        notes: '',
        items: [],
        subtotal: 0,
        discount_amount: 0,
        tax_amount: 0,
        total: 0,
        paid_amount: 0,
        payment_method: 'cash',
        receipt_type: 'C'
    });

    const [openCliente, setOpenCliente] = useState(false);
    const [openPago, setOpenPago] = useState(false);
    const [openAltaProd, setOpenAltaProd] = useState(false);

    // Quick Add Product Form State
    const [newProd, setNewProd] = useState({ name: '', sku: '', price: '', tax_rate: '21', is_active: 1, track_stock: 1 });
    const [savingProd, setSavingProd] = useState(false);
    const [prodError, setProdError] = useState('');

    const handleCreateProd = async () => {
        if (!newProd.name.trim() || !newProd.price) {
            setProdError("El nombre y precio son obligatorios.");
            return;
        }
        setSavingProd(true);
        setProdError('');
        try {
            const res = await axios.post(route('products.store'), newProd, {
                headers: { Accept: 'application/json' }
            });
            // Product created successfully
            const created = res.data.product;
            // Optionally close and refresh Inertia to get the new product list
            setOpenAltaProd(false);
            setNewProd({ name: '', sku: '', price: '', tax_rate: '21', is_active: 1, track_stock: 1 });
            router.reload({ only: ['products'] });

            // Auto add to cart if desired:
            addToCart({ ...created, price: Number(created.price) });
        } catch (e) {
            console.error(e);
            setProdError(e.response?.data?.message || "Error al crear producto");
        } finally {
            setSavingProd(false);
        }
    };
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [receivedAmount, setReceivedAmount] = useState('');

    const filteredProducts = useMemo(() => {
        if (!busca) return products;
        const lower = busca.toLowerCase();
        return products.filter(p =>
            (p.name && p.name.toLowerCase().includes(lower)) ||
            (p.sku && p.sku.toLowerCase().includes(lower)) ||
            (p.barcode && p.barcode.toLowerCase().includes(lower))
        );
    }, [products, busca]);

    const addToCart = (product) => {
        const existing = cart.find(item => item.product_id === product.id);
        const price = Number(product.price);
        const taxRate = Number(product.tax_rate || 21) / 100;

        if (existing) {
            updateQuantity(product.id, existing.quantity + 1);
        } else {
            const newItem = {
                product_id: product.id,
                name: product.name,
                unit_price: price,
                tax_rate: taxRate,
                quantity: 1,
                discount: 0,
                total: price
            };
            setCart([...cart, newItem]);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity <= 0) return removeFromCart(productId);
        setCart(cart.map(item => {
            if (item.product_id === productId) {
                return { ...item, quantity: newQuantity, total: (item.unit_price * newQuantity) - item.discount };
            }
            return item;
        }));
    };

    const removeFromCart = (productId) => setCart(cart.filter(item => item.product_id !== productId));
    const clearCart = () => { setCart([]); setData('customer_name', 'Consumidor Final'); setData('receipt_type', 'X'); };

    useEffect(() => {
        let total = 0, neto = 0;
        let iva21 = 0, iva105 = 0;

        cart.forEach(item => {
            const lineTotal = item.total;
            total += lineTotal;

            if (item.tax_rate > 0 && data.receipt_type !== 'C' && data.receipt_type !== 'X') {
                const lineNeto = lineTotal / (1 + item.tax_rate);
                neto += lineNeto;
                if (item.tax_rate === 0.21) iva21 += (lineTotal - lineNeto);
                if (item.tax_rate === 0.105) iva105 += (lineTotal - lineNeto);
            } else {
                neto += lineTotal;
            }
        });

        setData(prev => ({
            ...prev, items: cart, subtotal: neto, tax_amount: iva21 + iva105, total: total, paid_amount: total
        }));
    }, [cart, data.receipt_type]);

    const handleCobrarClick = () => {
        if (cart.length === 0) return alert("El carrito está vacío");
        setReceivedAmount(data.total.toString());
        setOpenPago(true);
    };

    const handleConfirmPayment = (e) => {
        e.preventDefault();
        const paid = Number(receivedAmount);
        setData('paid_amount', paid);
        setData('payment_method', paymentMethod);

        router.post(route('sales.store'),
            { ...data, paid_amount: paid, payment_method: paymentMethod },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setOpenPago(false);
                    clearCart();
                    alert("¡Cobro exitoso! Venta registrada y stock actualizado.");
                },
                onError: (errs) => {
                    alert("Error en la validación: " + JSON.stringify(errs));
                }
            }
        );
    };

    const selectedTypeInfo = TIPOS.find(t => t.id === data.receipt_type);
    const isCash = paymentMethod === 'cash';
    const changeAmount = isCash && Number(receivedAmount) > data.total ? Number(receivedAmount) - data.total : 0;
    const itemCount = cart.reduce((s, it) => s + it.quantity, 0);

    // Exact MUI FacturarPOS Colors
    const borderCol = isDark ? "border-[#FFFFFF12]" : "border-[#00000012]";
    const textCol = isDark ? "text-[#E6EEF5]" : "text-[#1A202C]";
    const mutedCol = isDark ? "text-[#E6EEF573]" : "text-[#1A202C73]";
    const surfaceBg = isDark ? "bg-[#0F1F2A]" : "bg-[#F4F7FA]";
    const cardBg = isDark ? "bg-[#172A36]" : "bg-[#fff]";
    const sidebarBg = isDark ? "bg-[#0D1B24]" : "bg-[#EEF3F8]";

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Facturar POS" />

            {/* Container that takes remaining height. Fixed absolute position layout matching MUI. */}
            <div className={`fixed inset-0 top-[65px] left-0 md:left-[250px] z-[5] flex flex-col lg:flex-row overflow-hidden ${surfaceBg} transition-all duration-300`}>

                {/* ═══ LEFT — Catálogo ══════════════════════════════════════════════ */}
                <div className={`w-full lg:flex-1 h-full flex flex-col border-r ${borderCol}`}>
                    {/* Search bar */}
                    <div className="px-4 pt-4 pb-3 flex items-center gap-3">
                        <div className={`flex-1 flex items-center h-10 px-3 rounded-[10px] ${cardBg} border-none`}>
                            <Search size={17} className={`mr-2 flex-shrink-0 ${mutedCol}`} />
                            <input
                                type="text"
                                placeholder="Buscar artículo por nombre, SKU o código..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className={`w-full h-full bg-transparent border-none focus:ring-0 text-[13.5px] outline-none ${textCol} placeholder-[#E6EEF573]`}
                                style={{ boxShadow: 'none' }}
                            />
                            {busca && (
                                <button onClick={() => setBusca('')} className="p-1 rounded-full hover:bg-white/10 ml-1">
                                    <X size={14} className={mutedCol} />
                                </button>
                            )}
                        </div>

                        <button className="w-10 h-10 rounded-[10px] flex items-center justify-center border-[1.5px] border-dashed border-[#397B9C66] text-[#397B9C] hover:bg-[#397B9C14] hover:border-solid transition-colors shrink-0">
                            <Plus size={18} />
                        </button>
                    </div>

                    {/* Product Grid / Empty State */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4 styled-scrollbar">
                        {filteredProducts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <Package size={38} strokeWidth={1.5} className={`mb-3 ${mutedCol}`} />
                                <h3 className={`font-bold text-[14.5px] mb-1 ${textCol}`}>Sin artículos activos</h3>
                                <p className={`text-[12.5px] ${mutedCol}`}>Creá tu primer artículo con el botón +</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-[10px]">
                                {filteredProducts.map(product => {
                                    const cartItem = cart.find(c => c.product_id === product.id);
                                    const inCart = !!cartItem;
                                    const stock = product.track_stock ? 10 : 999;
                                    const hasStock = stock > 0;

                                    return (
                                        <div
                                            key={product.id}
                                            onClick={() => addToCart(product)}
                                            className={`relative flex flex-col rounded-[11px] overflow-hidden cursor-pointer select-none transition-all duration-150 transform hover:-translate-y-[2px] 
                                                ${cardBg} border-[1.5px] ${inCart ? 'border-[#5AAD9C]' : borderCol}
                                            `}
                                            style={{
                                                boxShadow: inCart ? `0 4px 12px ${B.green}33` : undefined
                                            }}
                                        >
                                            {inCart && (
                                                <div className="absolute top-[7px] right-[7px] z-10 w-[19px] h-[19px] rounded-full flex items-center justify-center bg-[#5AAD9C] shadow-[0_2px_6px_#5AAD9C80]">
                                                    <span className="text-[9.5px] font-extrabold text-white leading-none">{cartItem.quantity}</span>
                                                </div>
                                            )}

                                            <div className="h-[88px] flex items-center justify-center bg-white/5 border-b border-transparent">
                                                <ImageIcon size={26} className="text-white/10" />
                                            </div>

                                            <div className="p-[8px_9px_9px] flex flex-col flex-1">
                                                <div className="text-[9px] font-semibold tracking-[0.04em] mb-0.5 text-[#E6EEF566] uppercase">
                                                    {product.sku || 'SIN SKU'}
                                                </div>
                                                <div className={`text-[11.5px] font-bold leading-[1.25] mb-1.5 line-clamp-2 ${textCol}`}>
                                                    {product.name}
                                                </div>
                                                <div className="text-[13px] font-extrabold tracking-[-0.01em] text-[#397B9C]">
                                                    ${formatMoney(product.price)}
                                                </div>
                                                <div className="mt-1 flex items-start">
                                                    <div className={`inline-flex items-center px-1.5 py-[1px] rounded-[4px] border
                                                        ${hasStock
                                                            ? 'bg-[#5AAD9C2E] border-[#5AAD9C47] text-[#5AAD9C]'
                                                            : 'bg-[#E639461A] border-[#E6394647] text-[#E63946]'
                                                        }
                                                    `}>
                                                        <span className="text-[9px] font-bold leading-tight">
                                                            {hasStock ? `Stock: ${stock}` : 'Sin stock'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ RIGHT ─ Cart panel ══════════════════════════ */}
                <div className={`w-full lg:w-[35%] flex flex-col shrink-0 ${sidebarBg} relative h-full`}>

                    <div className={`px-4 pt-4 pb-3 border-b ${borderCol}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <ShoppingCart size={18} className="text-[#397B9C]" />
                                <h2 className={`font-extrabold text-[14.5px] ${textCol}`}>Orden</h2>
                                {itemCount > 0 && (
                                    <div className="px-1.5 py-0.5 rounded-[5px] bg-[#397B9C33] border border-[#397B9C40]">
                                        <span className="text-[10.5px] font-bold text-[#397B9C] leading-none">{itemCount}</span>
                                    </div>
                                )}
                            </div>
                            {cart.length > 0 && (
                                <button onClick={clearCart} className="text-[#E63946] text-[11.5px] font-semibold px-2.5 py-1 rounded-[7px] hover:bg-[#E6394614] transition-colors">
                                    Limpiar
                                </button>
                            )}
                        </div>

                        {/* Customer Button */}
                        <button
                            onClick={() => setOpenCliente(true)}
                            className={`w-full flex items-center justify-start gap-2 px-3 py-2 rounded-[10px] border text-[12.5px] font-semibold mb-2 transition-colors
                                ${data.customer_id
                                    ? 'border-[#397B9C73] text-[#397B9C] bg-[#397B9C1F]'
                                    : `${borderCol} ${mutedCol} bg-transparent hover:border-[#397B9C] hover:bg-[#397B9C26]`
                                }
                            `}
                        >
                            <User size={15} />
                            <span>{data.customer_name === 'Consumidor Final' ? 'Seleccionar cliente' : data.customer_name}</span>
                            {!data.customer_id && <Plus size={14} className="ml-auto opacity-50" />}
                        </button>

                        {/* Ticket Type Selector */}
                        <div className={`mt-1`}>
                            <select
                                value={data.receipt_type}
                                onChange={(e) => setData('receipt_type', e.target.value)}
                                className={`w-full px-3 py-2.5 rounded-xl text-[13px] font-bold outline-none border transition-colors cursor-pointer appearance-none
                                    ${isDark ? 'bg-[#15232D] border-[#1E2D36] text-slate-200 focus:border-blue-500' : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500'}
                                `}
                            >
                                {TIPOS.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.id} - {t.label} ({t.desc})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto px-4 py-3 styled-scrollbar">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center pb-10">
                                <ShoppingCart size={38} className="mb-3 text-[#FFFFFF12]" />
                                <p className={`text-[13px] font-semibold ${mutedCol}`}>Carrito vacío</p>
                                <p className="text-[11.5px] text-[#FFFFFF38] mt-1">Hacé clic en un artículo para agregarlo</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {cart.map(item => (
                                    <div key={item.product_id} className={`flex items-center gap-3 p-[8px_10px] rounded-[10px] bg-white/5 border border-white/10`}>
                                        <div className="flex-1 min-w-0">
                                            <div className={`text-[12.5px] font-bold leading-[1.2] mb-0.5 truncate ${textCol}`}>
                                                {item.name}
                                            </div>
                                            <div className={`text-[11px] ${mutedCol}`}>
                                                ${formatMoney(item.unit_price)} × {item.quantity}{" "}
                                                <span className="text-[#397B9C] font-bold">= ${formatMoney(item.total)}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                className="w-[23px] h-[23px] rounded bg-white/10 flex items-center justify-center hover:bg-[#E6394626] transition-colors"
                                            >
                                                <Minus size={12} className={textCol} />
                                            </button>
                                            <div className={`w-[20px] text-center text-[12px] font-extrabold ${textCol}`}>
                                                {item.quantity}
                                            </div>
                                            <button
                                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                className="w-[23px] h-[23px] rounded bg-white/10 flex items-center justify-center hover:bg-[#5AAD9C33] transition-colors"
                                            >
                                                <Plus size={12} className={textCol} />
                                            </button>
                                            <button
                                                onClick={() => removeFromCart(item.product_id)}
                                                className="w-[23px] h-[23px] ml-1 rounded flex items-center justify-center hover:bg-[#E639461F] transition-colors"
                                            >
                                                <Trash2 size={13} className="text-[#E63946]" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Totals Frame */}
                    {cart.length > 0 && (
                        <div className={`border-t ${borderCol} px-4 pt-3 pb-4 space-y-3`}>
                            <div className="space-y-1 text-[11.5px]">
                                {['A', 'B'].includes(data.receipt_type) && (
                                    <div className="flex justify-between">
                                        <span className={mutedCol}>Subtotal neto</span>
                                        <span className={`font-semibold ${textCol}`}>${formatMoney(data.subtotal)}</span>
                                    </div>
                                )}
                                {data.tax_amount > 0 && data.receipt_type !== 'C' && data.receipt_type !== 'X' && (
                                    <div className="flex justify-between">
                                        <span className={mutedCol}>IVA 21%</span>
                                        <span className={`font-semibold ${textCol}`}>${formatMoney(data.tax_amount)}</span>
                                    </div>
                                )}
                            </div>

                            <div className={`my-2 border-t ${borderCol}`} />

                            <div className="flex justify-between items-baseline mb-3">
                                <span className={`text-[13px] font-extrabold tracking-[0.01em] ${textCol}`}>TOTAL</span>
                                <span className={`text-[26px] font-extrabold tracking-[-0.02em] text-[#397B9C]`}>
                                    ${formatMoney(data.total)}
                                </span>
                            </div>

                            <button
                                onClick={handleCobrarClick}
                                disabled={processing}
                                className={`w-full flex items-center justify-center gap-2 py-[14px] rounded-[12px] text-white font-extrabold text-[15px] shadow-[0_6px_20px_#5AAD9C6B] hover:shadow-[0_6px_24px_#49949C7A] transition-all`}
                                style={{ background: `linear-gradient(90deg, ${B.green}, ${B.teal})` }}
                            >
                                <ReceiptText size={19} />
                                <span>Cobrar ${formatMoney(data.total)}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL PAGO */}
            {openPago && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-sm rounded-[16px] shadow-2xl flex flex-col overflow-hidden bg-[#0F1F2A] border border-[#FFFFFF17]`}>
                        <div className="flex items-center justify-between p-4 pb-1">
                            <div className="flex items-center gap-2">
                                <CreditCard size={18} className="text-[#397B9C]" />
                                <h3 className={`font-extrabold text-[15px] text-[#E6EEF5]`}>Cobrar</h3>
                            </div>
                            <button onClick={() => setOpenPago(false)} className="text-[#E6EEF573] hover:text-[#E6EEF5]">
                                <X size={17} />
                            </button>
                        </div>

                        <div className="p-4 space-y-5">
                            <div className="p-[14px_16px] rounded-[12px] border border-[#397B9C38] bg-gradient-to-br from-[#397B9C38] to-[#49949C26]">
                                <div className="text-[11.5px] font-semibold text-[#E6EEF573] tracking-[0.04em] mb-1">TOTAL A COBRAR</div>
                                <div className="text-[30px] font-extrabold text-[#397B9C] leading-none">${formatMoney(data.total)}</div>
                            </div>

                            <div>
                                <div className="text-[10.5px] font-semibold tracking-[0.06em] text-[#E6EEF573] mb-2.5">MÉTODO DE PAGO</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'cash', name: 'Efectivo' },
                                        { id: 'debit', name: 'Débito' },
                                        { id: 'credit', name: 'Crédito' },
                                        { id: 'transfer', name: 'Transferencia' }
                                    ].map(pm => {
                                        const sel = paymentMethod === pm.id;
                                        return (
                                            <button
                                                key={pm.id}
                                                onClick={() => setPaymentMethod(pm.id)}
                                                className={`p-[10px_12px] rounded-[10px] text-[12.5px] font-medium transition-colors border-[1.5px]
                                                    ${sel
                                                        ? 'border-[#397B9C] text-[#397B9C] bg-gradient-to-br from-[#397B9C38] to-[#49949C26]'
                                                        : 'border-[#FFFFFF17] text-[#E6EEF5] hover:border-[#397B9C]'
                                                    }
                                                `}
                                            >
                                                {pm.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {isCash && (
                                <div className="space-y-3">
                                    <div className="relative">
                                        <div className="absolute top-2 left-3 text-[10px] font-bold text-[#397B9C]">Recibe</div>
                                        <span className="absolute left-3 top-6 font-bold text-[#E6EEF573]">$</span>
                                        <input
                                            type="number"
                                            value={receivedAmount}
                                            onChange={(e) => setReceivedAmount(e.target.value)}
                                            className={`w-full pl-7 pr-3 pt-6 pb-2 rounded-[10px] text-sm font-bold bg-[#FFFFFF0A] border-[#FFFFFF12] text-white focus:ring-1 focus:ring-[#397B9C] focus:border-[#397B9C]`}
                                        />
                                    </div>
                                    {changeAmount > 0 && (
                                        <div className="flex justify-between items-center p-[10px_14px] rounded-[10px] bg-[#5AAD9C2E] border border-[#5AAD9C4D]">
                                            <span className="text-[13px] font-semibold text-[#5AAD9C]">Vuelto</span>
                                            <span className="text-[20px] font-extrabold text-[#5AAD9C]">${formatMoney(changeAmount)}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-[10px_20px_16px] flex justify-end gap-3 items-center">
                            <button onClick={() => setOpenPago(false)} className="text-[13px] text-[#E6EEF573] font-medium hover:text-[#E6EEF5]">
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                disabled={processing || (isCash && Number(receivedAmount) < data.total)}
                                className={`px-6 py-2.5 rounded-[10px] text-white font-bold text-[13.5px] transition-all
                                    ${processing || (isCash && Number(receivedAmount) < data.total)
                                        ? 'bg-[#FFFFFF14] text-[#E6EEF573]'
                                        : 'bg-gradient-to-r from-[#5AAD9C] to-[#49949C] shadow-[0_4px_14px_#5AAD9C66] hover:shadow-[0_4px_18px_#49949C7A]'
                                    }
                                `}
                            >
                                {processing ? '...' : 'Confirmar cobro'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL ALTA RÁPIDA DE ARTÍCULO */}
            {openAltaProd && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`w-full max-w-sm rounded-[16px] shadow-2xl flex flex-col overflow-hidden
                            ${isDark ? 'bg-[#0F1F2A] border border-white/10' : 'bg-white border border-slate-200'}
                        `}>
                        <div className="flex items-center justify-between p-4 pb-2 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Package size={18} style={{ color: tealColor }} />
                                <h3 className={`font-extrabold text-[15px] ${isDark ? 'text-white' : 'text-slate-900'}`}>Alta rápida de artículo</h3>
                            </div>
                            <button onClick={() => setOpenAltaProd(false)} className="opacity-50 hover:opacity-100">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {prodError && (
                                <div className="p-2.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 text-[12.5px] font-medium text-center">
                                    {prodError}
                                </div>
                            )}
                            <div>
                                <label className={`text-[11px] font-bold tracking-widest mb-1.5 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>NOMBRE *</label>
                                <input
                                    type="text"
                                    value={newProd.name}
                                    onChange={e => setNewProd({ ...newProd, name: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-xl text-[13.5px] border outline-none 
                                        ${isDark ? 'bg-[#15232D] border-white/10 text-white focus:border-teal-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500'}
                                    `}
                                />
                            </div>
                            <div>
                                <label className={`text-[11px] font-bold tracking-widest mb-1.5 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>SKU / CÓDIGO</label>
                                <input
                                    type="text"
                                    value={newProd.sku}
                                    onChange={e => setNewProd({ ...newProd, sku: e.target.value })}
                                    className={`w-full px-3 py-2 rounded-xl text-[13.5px] border outline-none 
                                        ${isDark ? 'bg-[#15232D] border-white/10 text-white focus:border-teal-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500'}
                                    `}
                                />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className={`text-[11px] font-bold tracking-widest mb-1.5 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>PRECIO *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">$</span>
                                        <input
                                            type="number"
                                            value={newProd.price}
                                            onChange={e => setNewProd({ ...newProd, price: e.target.value })}
                                            className={`w-full pl-8 pr-3 py-2 rounded-xl text-[13.5px] border outline-none 
                                                ${isDark ? 'bg-[#15232D] border-white/10 text-white focus:border-teal-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500'}
                                            `}
                                        />
                                    </div>
                                </div>
                                <div className="w-[100px]">
                                    <label className={`text-[11px] font-bold tracking-widest mb-1.5 block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>IVA</label>
                                    <select
                                        value={newProd.tax_rate}
                                        onChange={e => setNewProd({ ...newProd, tax_rate: e.target.value })}
                                        className={`w-full pl-3 pr-8 py-2 rounded-xl text-[13.5px] border outline-none appearance-none
                                            ${isDark ? 'bg-[#15232D] border-white/10 text-white focus:border-teal-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500'}
                                        `}
                                    >
                                        <option value="0">0%</option>
                                        <option value="10.5">10.5%</option>
                                        <option value="21">21%</option>
                                        <option value="27">27%</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className={`p-4 border-t ${isDark ? 'border-white/10' : 'border-black/5'} flex justify-end gap-2`}>
                            <Button variant="ghost" className="rounded-xl" onClick={() => setOpenAltaProd(false)}>Cancelar</Button>
                            <Button
                                onClick={handleCreateProd}
                                disabled={savingProd || !newProd.name || !newProd.price}
                                className="px-6 rounded-xl text-white font-bold bg-teal-600 hover:bg-teal-700 disabled:opacity-50"
                            >
                                {savingProd ? '... ' : 'Crear y agregar'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}

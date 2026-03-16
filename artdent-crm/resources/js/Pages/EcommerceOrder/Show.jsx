import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Package, Truck, CreditCard, User, FileText, Save, CheckCircle2, Tag } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

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

export default function Show({ auth, order }) {
    const { isDark } = useTheme();
    const [saved, setSaved] = useState(false);

    const { data, setData, put, processing } = useForm({
        status:           order.status           || 'pending',
        payment_status:   order.payment_status   || 'pending',
        admin_notes:      order.admin_notes      || '',
        shipping_name:    order.shipping_name    || '',
        shipping_address: order.shipping_address || '',
        shipping_city:    order.shipping_city    || '',
        shipping_province:order.shipping_province|| '',
        shipping_postal:  order.shipping_postal  || '',
        shipping_phone:   order.shipping_phone   || '',
    });

    const submit = (e) => {
        e.preventDefault();
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
                        {order.coupon && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-bold bg-purple-500/10 text-purple-600 border-purple-500/20`}>
                                Cupón: {order.coupon.code}
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Columna izquierda */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Ítems del pedido */}
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

                        {/* Notas del cliente */}
                        {order.customer_notes && (
                            <Section title="Notas del Cliente" icon={FileText} isDark={isDark}>
                                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{order.customer_notes}</p>
                            </Section>
                        )}
                    </div>

                    {/* Columna derecha */}
                    <div className="flex flex-col gap-6">

                        {/* Cliente */}
                        <Section title="Cliente" icon={User} isDark={isDark}>
                            {order.customer ? (
                                <div className="space-y-1.5 text-sm">
                                    <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{order.customer.name}</p>
                                    <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{order.customer.email}</p>
                                    {order.customer.phone && <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>{order.customer.phone}</p>}
                                    <Link href={route('customers.show', order.customer.id)}
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

                        {/* Gestionar pedido */}
                        <Section title="Gestionar Pedido" icon={CheckCircle2} isDark={isDark}>
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className={lbl}>Estado del Pedido</label>
                                    <select value={data.status} onChange={e => setData('status', e.target.value)} className={inp}>
                                        <option value="pending">Pendiente</option>
                                        <option value="confirmed">Confirmado</option>
                                        <option value="processing">En proceso</option>
                                        <option value="shipped">Enviado</option>
                                        <option value="delivered">Entregado</option>
                                        <option value="cancelled">Cancelado</option>
                                        <option value="refunded">Reembolsado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>Estado del Pago</label>
                                    <select value={data.payment_status} onChange={e => setData('payment_status', e.target.value)} className={inp}>
                                        <option value="pending">Pendiente</option>
                                        <option value="paid">Pagado</option>
                                        <option value="failed">Fallido</option>
                                        <option value="refunded">Reembolsado</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={lbl}>Notas Internas</label>
                                    <textarea rows={3} value={data.admin_notes} onChange={e => setData('admin_notes', e.target.value)}
                                        className={inp} placeholder="Observaciones del equipo..." />
                                </div>
                                <Button type="submit" disabled={processing}
                                    style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                                    className="w-full text-white border-none shadow-md">
                                    {saved ? <><CheckCircle2 size={15} className="mr-2" />Guardado</> : <><Save size={15} className="mr-2" />Guardar cambios</>}
                                </Button>
                            </form>
                        </Section>

                        {/* Cupón aplicado */}
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

                        {/* Envío */}
                        <Section title="Datos de Envío" icon={Truck} isDark={isDark}>
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

                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

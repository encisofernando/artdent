import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Save, Tag, Settings2 } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

export default function Create({ auth }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        type: 'percentage',
        value: '',
        min_order_amount: '',
        max_uses: '',
        max_uses_per_customer: '',
        valid_from: '',
        valid_until: '',
        is_active: 1,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('coupons.store'));
    };

    const inp = `w-full rounded-xl border px-4 py-2 text-sm transition-colors focus:ring-2 focus:outline-none placeholder-slate-400
        ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const err = 'text-red-500 text-xs mt-1.5 font-medium';
    const section = `rounded-2xl border p-6 sm:p-8 shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const sectionHeader = `flex items-center gap-2 mb-6 pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`;

    const Toggle = ({ label }) => (
        <label className={`flex items-center cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <div className="relative">
                <input type="checkbox" className="sr-only"
                    checked={data.is_active === 1 || data.is_active === true}
                    onChange={e => setData('is_active', e.target.checked ? 1 : 0)} />
                <div className={`block w-10 h-6 rounded-full transition-colors ${(data.is_active === 1 || data.is_active === true) ? 'bg-emerald-500' : (isDark ? 'bg-slate-700' : 'bg-slate-300')}`} />
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${(data.is_active === 1 || data.is_active === true) ? 'translate-x-4' : ''}`} />
            </div>
            <div className="ml-3 font-medium text-sm">{label}</div>
        </label>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nuevo Cupón" />

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Nuevo Cupón</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Crear un código de descuento para el e-commerce</p>
                    </div>
                    <Link href={route('coupons.index')}>
                        <Button variant="outline" className={isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                            <ArrowLeft className="mr-2" size={16} /> Volver
                        </Button>
                    </Link>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    {/* Código y Tipo */}
                    <div className={section}>
                        <div className={sectionHeader}>
                            <Tag size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Código y Descuento</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={lbl}>Código del Cupón *</label>
                                <input type="text" value={data.code} onChange={e => setData('code', e.target.value.toUpperCase())}
                                    className={inp} placeholder="Ej. VERANO20" required />
                                {errors.code && <div className={err}>{errors.code}</div>}
                            </div>

                            <div>
                                <label className={lbl}>Tipo de Descuento *</label>
                                <select value={data.type} onChange={e => setData('type', e.target.value)} className={inp}>
                                    <option value="percentage">Porcentaje (%)</option>
                                    <option value="fixed">Monto Fijo ($)</option>
                                </select>
                                {errors.type && <div className={err}>{errors.type}</div>}
                            </div>

                            <div>
                                <label className={lbl}>{data.type === 'percentage' ? 'Porcentaje de Descuento *' : 'Monto de Descuento *'}</label>
                                <div className="relative">
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {data.type === 'percentage' ? '%' : '$'}
                                    </span>
                                    <input type="number" min="0" step="0.01" value={data.value} onChange={e => setData('value', e.target.value)}
                                        className={inp + ' pl-8'} placeholder="0" required />
                                </div>
                                {errors.value && <div className={err}>{errors.value}</div>}
                            </div>

                            <div>
                                <label className={lbl}>Pedido Mínimo (opcional)</label>
                                <div className="relative">
                                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>$</span>
                                    <input type="number" min="0" step="0.01" value={data.min_order_amount} onChange={e => setData('min_order_amount', e.target.value)}
                                        className={inp + ' pl-8'} placeholder="Sin mínimo" />
                                </div>
                                {errors.min_order_amount && <div className={err}>{errors.min_order_amount}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Restricciones */}
                    <div className={section}>
                        <div className={sectionHeader}>
                            <Settings2 size={18} style={{ color: B.teal }} />
                            <h2 className={`font-bold uppercase tracking-wider text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Restricciones y Vigencia</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className={lbl}>Usos Totales Máximos</label>
                                <input type="number" min="1" value={data.max_uses} onChange={e => setData('max_uses', e.target.value)}
                                    className={inp} placeholder="Sin límite" />
                                {errors.max_uses && <div className={err}>{errors.max_uses}</div>}
                            </div>

                            <div>
                                <label className={lbl}>Usos por Cliente</label>
                                <input type="number" min="1" value={data.max_uses_per_customer} onChange={e => setData('max_uses_per_customer', e.target.value)}
                                    className={inp} placeholder="Sin límite" />
                                {errors.max_uses_per_customer && <div className={err}>{errors.max_uses_per_customer}</div>}
                            </div>

                            <div>
                                <label className={lbl}>Válido Desde</label>
                                <input type="datetime-local" value={data.valid_from} onChange={e => setData('valid_from', e.target.value)}
                                    className={inp} />
                                {errors.valid_from && <div className={err}>{errors.valid_from}</div>}
                            </div>

                            <div>
                                <label className={lbl}>Válido Hasta</label>
                                <input type="datetime-local" value={data.valid_until} onChange={e => setData('valid_until', e.target.value)}
                                    className={inp} />
                                {errors.valid_until && <div className={err}>{errors.valid_until}</div>}
                            </div>

                            <div className="flex items-center mt-2">
                                <Toggle label="Cupón Activo" />
                            </div>
                        </div>
                    </div>

                    {/* Acciones */}
                    <div className={`rounded-2xl border p-6 shadow-sm flex justify-end gap-3 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                        <Link href={route('coupons.index')}>
                            <Button type="button" variant="outline" className={isDark ? 'bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing} style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }} className="text-white border-none shadow-md">
                            <Save className="mr-2" size={16} />
                            Crear Cupón
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

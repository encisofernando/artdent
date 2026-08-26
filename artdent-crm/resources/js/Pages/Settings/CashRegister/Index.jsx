import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { useToast } from '@/Contexts/ToastContext';
import { Button } from '@/Components/ui/button';
import { Wallet, Save, CheckCircle, CreditCard, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import axios from 'axios';

const B = { blue: '#397B9C', teal: '#49949C' };

const TYPE_OPTIONS = [
    { value: 'cash', label: 'Efectivo' },
    { value: 'card_debit', label: 'Tarjeta de débito' },
    { value: 'card_credit', label: 'Tarjeta de crédito' },
    { value: 'transfer', label: 'Transferencia' },
    { value: 'mp', label: 'Mercado Pago / QR' },
    { value: 'check', label: 'Cheque' },
    { value: 'other', label: 'Otro' },
];

const APPLIES_TO_OPTIONS = [
    { value: 'pos', label: 'Ventas (POS)' },
    { value: 'lab', label: 'Laboratorio' },
    { value: 'ecommerce', label: 'E-commerce' },
];

function PaymentMethodForm({ isDark, initial, onCancel, onSubmit, saving, error }) {
    const [form, setForm] = useState(initial);

    const inp = `w-full rounded-xl border text-sm font-medium px-3.5 py-2.5 transition-colors focus:ring-0 ${isDark
        ? 'bg-slate-800/50 border-slate-700 text-white focus:border-blue-500 placeholder:text-slate-600'
        : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-blue-500 shadow-sm'}`;
    const lbl = `block text-[10px] uppercase font-black tracking-widest mb-1.5 pl-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    const toggleAppliesTo = (value) => {
        setForm((f) => ({
            ...f,
            applies_to: f.applies_to.includes(value)
                ? f.applies_to.filter((v) => v !== value)
                : [...f.applies_to, value],
        }));
    };

    // No es un <form>: mismo criterio que BranchForm en Admin/Settings.jsx —
    // evita el problema de formularios HTML anidados si en el futuro este
    // componente se usa dentro de otro <form>. Ver project_nested_form_points_of_sale_bug.
    return (
        <div className={`p-4 rounded-xl border grid gap-4 sm:grid-cols-2 ${isDark ? 'bg-slate-900/60 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div>
                <label className={lbl}>Nombre</label>
                <input className={inp} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Ej: Efectivo" />
            </div>
            <div>
                <label className={lbl}>Tipo</label>
                <select className={inp} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    {TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className={lbl}>Recargo (%)</label>
                <input type="number" step="0.01" min="0" max="100" className={inp} value={form.surcharge_pct} onChange={(e) => setForm((f) => ({ ...f, surcharge_pct: e.target.value }))} placeholder="0" />
            </div>
            <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} className="rounded" />
                    Activo
                </label>
            </div>
            <div className="sm:col-span-2">
                <label className={lbl}>Dónde se puede usar</label>
                <div className="flex flex-wrap gap-4">
                    {APPLIES_TO_OPTIONS.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                            <input type="checkbox" checked={form.applies_to.includes(opt.value)} onChange={() => toggleAppliesTo(opt.value)} className="rounded" />
                            {opt.label}
                        </label>
                    ))}
                </div>
            </div>

            {error && <div className="sm:col-span-2 text-red-500 text-xs font-bold bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}

            <div className="sm:col-span-2 flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel} className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                    Cancelar
                </Button>
                <Button type="button" onClick={() => onSubmit(form)} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 min-w-32">
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
                </Button>
            </div>
        </div>
    );
}

function PaymentMethodsManager({ isDark }) {
    const confirmDialog = useConfirm();
    const toast = useToast();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(route('payment-methods.index'));
            setItems(data.payment_methods);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const blankForm = () => ({ name: '', type: 'cash', surcharge_pct: '', is_active: true, applies_to: ['pos', 'lab', 'ecommerce'] });

    const typeLabel = (type) => TYPE_OPTIONS.find((opt) => opt.value === type)?.label ?? type;

    const submitCreate = async (form) => {
        setSaving(true);
        setError('');
        try {
            await axios.post(route('payment-methods.store'), form);
            setShowCreate(false);
            await load();
        } catch (e) {
            setError(e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(' ') : (e.response?.data?.error || 'Error al guardar.'));
        } finally {
            setSaving(false);
        }
    };

    const submitUpdate = async (id, form) => {
        setSaving(true);
        setError('');
        try {
            await axios.put(route('payment-methods.update', id), form);
            setEditingId(null);
            await load();
        } catch (e) {
            setError(e.response?.data?.errors ? Object.values(e.response.data.errors).flat().join(' ') : (e.response?.data?.error || 'Error al guardar.'));
        } finally {
            setSaving(false);
        }
    };

    const destroy = (id) => {
        confirmDialog('¿Eliminar este medio de pago?', async () => {
            try {
                await axios.delete(route('payment-methods.destroy', id));
                await load();
            } catch (e) {
                toast.error(e.response?.data?.error || 'Error al eliminar.');
            }
        });
    };

    return (
        <div className={`rounded-2xl border shadow-sm transition-colors p-6 ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
            <div className="flex items-center justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                    <CreditCard size={18} className={isDark ? 'text-teal-400' : 'text-teal-600'} />
                    <h3 className={`text-base font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Medios de pago
                    </h3>
                </div>
                {!showCreate && (
                    <Button type="button" size="sm" onClick={() => { setShowCreate(true); setEditingId(null); }} className="gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                        <Plus size={14} /> Nuevo
                    </Button>
                )}
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Los medios de pago activos aparecen para elegir al cobrar una venta. Sin al menos
                "Efectivo" activo, el cierre de caja no va a poder calcular el efectivo esperado.
            </p>

            {showCreate && (
                <div className="mb-4">
                    <PaymentMethodForm
                        isDark={isDark}
                        initial={blankForm()}
                        onCancel={() => { setShowCreate(false); setError(''); }}
                        onSubmit={submitCreate}
                        saving={saving}
                        error={error}
                    />
                </div>
            )}

            {loading ? (
                <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cargando…</div>
            ) : items.length === 0 && !showCreate ? (
                <div className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No hay medios de pago configurados.</div>
            ) : (
                <div className="space-y-2">
                    {items.map((pm) => (
                        <div key={pm.id}>
                            {editingId === pm.id ? (
                                <PaymentMethodForm
                                    isDark={isDark}
                                    initial={{
                                        name: pm.name,
                                        type: pm.type ?? 'other',
                                        surcharge_pct: pm.surcharge_pct ?? '',
                                        is_active: pm.is_active,
                                        applies_to: pm.applies_to ? pm.applies_to.split(',') : [],
                                    }}
                                    onCancel={() => { setEditingId(null); setError(''); }}
                                    onSubmit={(form) => submitUpdate(pm.id, form)}
                                    saving={saving}
                                    error={error}
                                />
                            ) : (
                                <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isDark ? 'bg-slate-900/40 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                            {pm.name}
                                        </p>
                                        <p className={`text-xs truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            {typeLabel(pm.type)}{pm.surcharge_pct > 0 ? ` · +${pm.surcharge_pct}%` : ''}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {pm.is_active ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500">Activo</span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400">Inactivo</span>
                                        )}
                                        <Button type="button" size="sm" variant="outline" onClick={() => { setEditingId(pm.id); setShowCreate(false); setError(''); }} className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                                            <Edit size={13} />
                                        </Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => destroy(pm.id)} className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20">
                                            <Trash2 size={13} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function CashRegisterSettingsIndex({ auth, settings }) {
    const { isDark } = useTheme();
    const [saved, setSaved] = useState(false);

    const { data, setData, put, processing } = useForm({
        is_enabled: settings.is_enabled ?? false,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('cash-register-settings.update'), {
            onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Caja — Configuración" />

            <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Wallet size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                            Caja
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Apertura/cierre de caja con arqueo. Si tu negocio no maneja caja física
                            (solo pagos digitales), dejalo apagado y el sistema vende con normalidad.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit} className={`rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`}>
                    <div className={`flex items-center justify-between gap-4 px-6 py-4 ${data.is_enabled ? 'border-b' : ''} ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                        <div>
                            <span className={`text-xs font-semibold block ${data.is_enabled ? 'text-emerald-500' : (isDark ? 'text-slate-500' : 'text-slate-400')}`}>
                                {data.is_enabled ? 'Habilitado' : 'Deshabilitado'}
                            </span>
                            {data.is_enabled && (
                                <p className={`text-xs mt-1 max-w-md ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    Con esto prendido, hace falta abrir caja para poder vender, y si a
                                    alguien le queda una caja abierta de un día anterior el sistema lo
                                    obliga a cerrarla antes de seguir. Sólo afecta a Ventas — no a
                                    Laboratorio ni al e-commerce.
                                </p>
                            )}
                        </div>
                        <label className="flex items-center cursor-pointer gap-2 shrink-0">
                            <div className="relative">
                                <input type="checkbox" className="sr-only" checked={data.is_enabled}
                                    onChange={e => setData('is_enabled', e.target.checked)} />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${data.is_enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
                                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${data.is_enabled ? 'translate-x-4' : ''}`} />
                            </div>
                        </label>
                    </div>

                    <div className="px-6 py-5 space-y-4">
                        {saved && (
                            <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold">
                                <CheckCircle size={16} /> Guardado correctamente
                            </div>
                        )}

                        <div className="flex justify-end pt-1">
                            <Button type="submit" disabled={processing} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white">
                                <Save size={15} /> {processing ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </div>
                </form>

                <PaymentMethodsManager isDark={isDark} />
            </div>
        </AuthenticatedLayout>
    );
}

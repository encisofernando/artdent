import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, Wallet, Save, CheckSquare, Square } from 'lucide-react';

export default function Create({ auth, employees }) {
    const { isDark } = useTheme();
    const B = { blue: '#397B9C', teal: '#49949C' };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;
    const inputCls = `w-full rounded-xl border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${isDark ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'}`;
    const labelCls = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const errCls = 'text-red-500 text-xs mt-1';

    const [form, setForm] = useState({
        period_from: '', period_to: '', type: 'mensual', notes: '',
        employee_ids: employees.map(e => e.id),
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});

    const toggleEmployee = (id) => {
        setForm(f => ({
            ...f,
            employee_ids: f.employee_ids.includes(id) ? f.employee_ids.filter(x => x !== id) : [...f.employee_ids, id],
        }));
    };

    const toggleAll = () => {
        setForm(f => ({ ...f, employee_ids: f.employee_ids.length === employees.length ? [] : employees.map(e => e.id) }));
    };

    const submit = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post(route('payroll-runs.store'), form, {
            onError: (errs) => { setErrors(errs); setProcessing(false); },
        });
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Nueva Liquidación" />
            <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                    <Link href={route('payroll-runs.index')} className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        <ArrowLeft size={16} />
                    </Link>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <Wallet size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Nueva Liquidación</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Genera recibos de sueldo para el período y empleados seleccionados</p>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5">
                    <div className={`${card} p-5 grid grid-cols-1 sm:grid-cols-3 gap-4`}>
                        <div>
                            <label className={labelCls}>Período desde *</label>
                            <input type="date" value={form.period_from} onChange={e => setForm(f => ({ ...f, period_from: e.target.value }))} className={inputCls} required />
                            {errors.period_from && <p className={errCls}>{errors.period_from}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Período hasta *</label>
                            <input type="date" value={form.period_to} onChange={e => setForm(f => ({ ...f, period_to: e.target.value }))} className={inputCls} required />
                            {errors.period_to && <p className={errCls}>{errors.period_to}</p>}
                        </div>
                        <div>
                            <label className={labelCls}>Tipo</label>
                            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={inputCls}>
                                <option value="mensual">Mensual</option>
                                <option value="sac">SAC / Aguinaldo</option>
                                <option value="final">Liquidación final</option>
                            </select>
                        </div>
                        <div className="sm:col-span-3">
                            <label className={labelCls}>Notas</label>
                            <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inputCls} />
                        </div>
                    </div>

                    <div className={`${card} p-5`}>
                        <div className="flex items-center justify-between mb-3">
                            <label className={labelCls}>Empleados incluidos ({form.employee_ids.length} de {employees.length})</label>
                            <button type="button" onClick={toggleAll} className="text-xs font-bold" style={{ color: B.teal }}>
                                {form.employee_ids.length === employees.length ? 'Ninguno' : 'Todos'}
                            </button>
                        </div>
                        {errors.employee_ids && <p className={errCls}>{errors.employee_ids}</p>}
                        <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
                            {employees.map(emp => {
                                const checked = form.employee_ids.includes(emp.id);
                                return (
                                    <button type="button" key={emp.id} onClick={() => toggleEmployee(emp.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                        {checked ? <CheckSquare size={16} style={{ color: B.teal }} /> : <Square size={16} className={isDark ? 'text-slate-600' : 'text-slate-300'} />}
                                        <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>{emp.user?.name ?? `Empleado #${emp.id}`}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Link href={route('payroll-runs.index')} className={`px-4 py-2.5 min-h-[40px] rounded-xl text-sm border font-medium ${isDark ? 'border-slate-700 text-slate-300' : 'border-slate-200 text-slate-600'}`}>Cancelar</Link>
                        <button type="submit" disabled={processing || form.employee_ids.length === 0} className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[40px] rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} /> Generar Liquidación
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { IdCard, Save } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';

const B = { blue: '#397B9C', teal: '#49949C' };
const fmtDate = (d) => { if (!d) { return '—'; } const [y, m, day] = String(d).split('T')[0].split('-'); return `${day}/${m}/${y}`; };

export default function MiLegajo({ auth, employee }) {
    const { isDark } = useTheme();
    const { data, setData, put, processing, errors, recentlySuccessful } = useForm({
        phone: employee.phone || '',
        personal_email: employee.personal_email || '',
        address: employee.address || '',
        city: employee.city || '',
        province: employee.province || '',
        postal_code: employee.postal_code || '',
        bank_cbu: employee.bank_cbu || '',
        bank_name: employee.bank_name || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('portal.legajo.update'));
    };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/70'}`;
    const inputClass = `w-full px-3 py-2 rounded-xl border text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'} outline-none`;
    const labelClass = `block text-xs font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`;
    const readOnlyRow = (label, value) => (
        <div>
            <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-sm font-medium mt-0.5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{value || '—'}</p>
        </div>
    );

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Mi Legajo" />

            <div className="flex flex-col gap-6 font-sans max-w-3xl mx-auto">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}>
                        <IdCard size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Mi Legajo</h1>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Datos laborales y de contacto</p>
                    </div>
                </div>

                <div className={`${card} p-6`}>
                    <h2 className={`font-bold text-sm uppercase tracking-wide mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Datos Laborales (no editable)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {readOnlyRow('Nombre', employee.user?.name)}
                        {readOnlyRow('CUIL', employee.cuil)}
                        {readOnlyRow('Fecha de Ingreso', fmtDate(employee.hire_date))}
                        {readOnlyRow('Categoría', employee.labor_agreement_category?.name)}
                        {readOnlyRow('Convenio', employee.labor_agreement_category?.labor_agreement?.name)}
                        {readOnlyRow('Departamento', employee.department?.name)}
                        {readOnlyRow('Puesto', employee.job_position?.name || employee.position)}
                        {readOnlyRow('Supervisor', employee.supervisor?.user?.name)}
                    </div>
                </div>

                <form onSubmit={submit} className={`${card} p-6`}>
                    <h2 className={`font-bold text-sm uppercase tracking-wide mb-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Datos de Contacto y Bancarios</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Teléfono</label>
                            <input className={inputClass} value={data.phone} onChange={e => setData('phone', e.target.value)} />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Email Personal</label>
                            <input type="email" className={inputClass} value={data.personal_email} onChange={e => setData('personal_email', e.target.value)} />
                            {errors.personal_email && <p className="text-red-500 text-xs mt-1">{errors.personal_email}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>Dirección</label>
                            <input className={inputClass} value={data.address} onChange={e => setData('address', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Ciudad</label>
                            <input className={inputClass} value={data.city} onChange={e => setData('city', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Provincia</label>
                            <input className={inputClass} value={data.province} onChange={e => setData('province', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Código Postal</label>
                            <input className={inputClass} value={data.postal_code} onChange={e => setData('postal_code', e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Banco</label>
                            <input className={inputClass} value={data.bank_name} onChange={e => setData('bank_name', e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelClass}>CBU</label>
                            <input className={inputClass} value={data.bank_cbu} onChange={e => setData('bank_cbu', e.target.value)} />
                            {errors.bank_cbu && <p className="text-red-500 text-xs mt-1">{errors.bank_cbu}</p>}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 mt-5">
                        <Button type="submit" disabled={processing} className="text-white border-none shadow-md" style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Save size={14} className="mr-2" /> Guardar Cambios
                        </Button>
                        {recentlySuccessful && <span className="text-xs text-emerald-500 font-semibold">Guardado ✓</span>}
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}

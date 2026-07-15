import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { Building2, Plus, X } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import SearchableSelect from '@/Components/SearchableSelect';

const IVA_CONDITIONS = [
    { value: 'responsable_inscripto', label: 'Responsable Inscripto' },
    { value: 'monotributista', label: 'Monotributista' },
    { value: 'exento', label: 'Exento' },
    { value: 'consumidor_final', label: 'Consumidor Final' },
];

function CompanyForm({ onClose }) {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        fantasy_name: '',
        cuit: '',
        iva_condition: '',
    });

    const inp = `w-full rounded-xl border px-3.5 py-2.5 text-sm transition-colors focus:ring-2 focus:outline-none ${
        isDark
            ? 'bg-slate-800/50 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
    }`;
    const lbl = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;
    const err = 'text-red-500 text-xs mt-1 font-medium';

    const submit = (e) => {
        e.preventDefault();
        post(route('companies.store'), {
            onSuccess: () => {
                reset();
                onClose();
            },
        });
    };

    return (
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <div>
                <label className={lbl}>Razón social</label>
                <input className={inp} value={data.name} onChange={(e) => setData('name', e.target.value)} placeholder="Ej: ArtCode S.A." />
                {errors.name && <p className={err}>{errors.name}</p>}
            </div>
            <div>
                <label className={lbl}>Nombre de fantasía</label>
                <input className={inp} value={data.fantasy_name} onChange={(e) => setData('fantasy_name', e.target.value)} placeholder="Opcional" />
                {errors.fantasy_name && <p className={err}>{errors.fantasy_name}</p>}
            </div>
            <div>
                <label className={lbl}>CUIT</label>
                <input className={inp} value={data.cuit} onChange={(e) => setData('cuit', e.target.value)} placeholder="30-12345678-9" />
                {errors.cuit && <p className={err}>{errors.cuit}</p>}
            </div>
            <div>
                <label className={lbl}>Condición IVA</label>
                <SearchableSelect
                    value={data.iva_condition}
                    onChange={(v) => setData('iva_condition', v)}
                    placeholder="Seleccionar condición"
                    options={IVA_CONDITIONS}
                />
                {errors.iva_condition && <p className={err}>{errors.iva_condition}</p>}
            </div>

            <p className={`sm:col-span-2 text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Se crea junto con una sucursal "Casa Central" por defecto. El resto de los datos (logo, AFIP, facturación, etc.) se completan después desde Configuración con esa compañía activa.
            </p>

            <div className="sm:col-span-2 flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" onClick={onClose} className={isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : ''}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={processing} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white min-w-32">
                    {processing ? 'Creando...' : 'Crear compañía'}
                </Button>
            </div>
        </form>
    );
}

export default function Index({ auth, companies }) {
    const { isDark } = useTheme();
    const [showCreate, setShowCreate] = useState(false);

    const card = `rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Empresas" />

            <div className="flex w-full flex-col gap-6 font-sans max-w-none">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #397B9C, #49949C)' }}>
                            <Building2 size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Empresas</h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Compañías dentro de este tenant. Alterná entre ellas desde el selector del topbar.
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setShowCreate((v) => !v)} className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shrink-0">
                        {showCreate ? <X size={16} /> : <Plus size={16} />}
                        {showCreate ? 'Cancelar' : 'Nueva compañía'}
                    </Button>
                </div>

                {showCreate && (
                    <div className={`${card} p-6`}>
                        <h2 className={`text-base font-bold mb-5 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Nueva compañía</h2>
                        <CompanyForm onClose={() => setShowCreate(false)} />
                    </div>
                )}

                {companies.length === 0 ? (
                    <div className={`${card} p-12 text-center`}>
                        <Building2 size={40} className={`mx-auto mb-3 ${isDark ? 'text-slate-600' : 'text-slate-300'}`} />
                        <p className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>No hay compañías</p>
                    </div>
                ) : (
                    <div className={`${card} overflow-hidden`}>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className={`border-b text-xs font-bold uppercase tracking-wider ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-100 text-slate-500'}`}>
                                        <th className="px-4 py-3 text-left">Compañía</th>
                                        <th className="px-4 py-3 text-left">CUIT</th>
                                        <th className="px-4 py-3 text-left">Condición IVA</th>
                                        <th className="px-4 py-3 text-center">Sucursales</th>
                                        <th className="px-4 py-3 text-left">Alta</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {companies.map((c) => (
                                        <tr key={c.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                                            <td className={`px-4 py-3 font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={14} className="text-teal-500 shrink-0" />
                                                    <div>
                                                        <p>{c.fantasy_name || c.name}</p>
                                                        {c.fantasy_name && <p className={`text-xs font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{c.name}</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{c.cuit || '—'}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {IVA_CONDITIONS.find((o) => o.value === c.iva_condition)?.label || c.iva_condition || '—'}
                                            </td>
                                            <td className={`px-4 py-3 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{c.branches_count}</td>
                                            <td className={`px-4 py-3 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {new Date(c.created_at).toLocaleDateString('es-AR')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

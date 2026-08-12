import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import DentistPortalLayout from '@/Layouts/DentistPortalLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { ArrowLeft, UploadCloud, X, FileText, Loader2 } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

const JOB_TYPES = ['Corona', 'Prótesis removible', 'Placa oclusal', 'Carilla', 'Otro'];

export default function NewOrder() {
    const { isDark } = useTheme();
    const { data, setData, post, processing, errors } = useForm({
        patient_name: '',
        job_type_label: JOB_TYPES[0],
        due_date_requested: '',
        notes: '',
        files: [],
    });
    const [dragOver, setDragOver] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('dentist-portal.orders.store'), { forceFormData: true });
    };

    const addFiles = (fileList) => {
        setData('files', [...data.files, ...Array.from(fileList)]);
    };

    const removeFile = (index) => {
        setData('files', data.files.filter((_, i) => i !== index));
    };

    const inputClasses = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-teal-500/30 ${
        isDark ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-teal-500' : 'bg-white border-slate-200 text-slate-900 focus:border-teal-500'
    }`;
    const labelClasses = `block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

    return (
        <DentistPortalLayout>
            <Head title="Nueva orden" />

            <div className="max-w-lg mx-auto flex flex-col gap-6">
                <div>
                    <Link
                        href={route('dentist-portal.show')}
                        className={`inline-flex items-center gap-1.5 text-sm font-bold ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        <ArrowLeft size={15} /> Mis órdenes
                    </Link>
                    <h1 className={`text-xl font-extrabold tracking-tight mt-3 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Nueva solicitud de trabajo
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        El laboratorio revisará tu solicitud y la convertirá en una orden con tarifas y fases.
                    </p>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label className={labelClasses}>Paciente</label>
                        <input
                            type="text"
                            value={data.patient_name}
                            onChange={(e) => setData('patient_name', e.target.value)}
                            placeholder="Nombre y apellido"
                            className={inputClasses}
                        />
                        {errors.patient_name && <p className="text-red-500 text-xs mt-1.5">{errors.patient_name}</p>}
                    </div>

                    <div>
                        <label className={labelClasses}>Tipo de trabajo</label>
                        <select
                            value={data.job_type_label}
                            onChange={(e) => setData('job_type_label', e.target.value)}
                            className={inputClasses}
                        >
                            {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className={labelClasses}>Fecha deseada de entrega</label>
                        <input
                            type="date"
                            value={data.due_date_requested}
                            onChange={(e) => setData('due_date_requested', e.target.value)}
                            className={inputClasses}
                        />
                        {errors.due_date_requested && <p className="text-red-500 text-xs mt-1.5">{errors.due_date_requested}</p>}
                    </div>

                    <div>
                        <label className={labelClasses}>Notas para el laboratorio</label>
                        <textarea
                            rows={3}
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            placeholder="Detalles clínicos, color, preferencias de material…"
                            className={`${inputClasses} resize-y`}
                        />
                        {errors.notes && <p className="text-red-500 text-xs mt-1.5">{errors.notes}</p>}
                    </div>

                    <div>
                        <label className={labelClasses}>Escaneos intraorales / fotos</label>
                        <label
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                            className={`flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed px-6 py-8 text-center cursor-pointer transition-colors ${
                                dragOver ? 'border-teal-500 bg-teal-500/5' : (isDark ? 'border-slate-700 bg-slate-900/40' : 'border-slate-300 bg-slate-50')
                            }`}
                        >
                            <UploadCloud size={22} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                            <span className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Arrastrá archivos aquí o tocá para elegir</span>
                            <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>STL, PLY, JPG o PDF · hasta 50 MB por archivo</span>
                            <input
                                type="file"
                                multiple
                                accept=".stl,.ply,.jpg,.jpeg,.png,.webp,.pdf"
                                onChange={(e) => addFiles(e.target.files)}
                                className="hidden"
                            />
                        </label>
                        {errors['files.0'] && <p className="text-red-500 text-xs mt-1.5">{errors['files.0']}</p>}

                        {data.files.length > 0 && (
                            <div className="flex flex-col gap-2 mt-3">
                                {data.files.map((f, i) => (
                                    <div key={i} className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 ${isDark ? 'border-slate-800 bg-slate-900/40' : 'border-slate-200 bg-slate-50'}`}>
                                        <FileText size={15} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                        <span className={`text-xs font-medium truncate flex-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{f.name}</span>
                                        <button type="button" onClick={() => removeFile(i)} className="text-red-500 shrink-0">
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full py-3.5 rounded-xl text-sm font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                        style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                    >
                        {processing ? <><Loader2 size={16} className="animate-spin" /> Enviando…</> : 'Enviar solicitud'}
                    </button>
                </form>
            </div>
        </DentistPortalLayout>
    );
}

import { useState, useEffect } from 'react';
import { router, Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { 
    FileText, Download, RefreshCw, Calendar, 
    CheckCircle, Clock, AlertCircle, FileSearch,
    XCircle
} from 'lucide-react';
import axios from 'axios';
import dayjs from 'dayjs';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogDescription 
} from '@/Components/ui/dialog';

export default function Reports({ auth, reports: initialReports }) {
    const { isDark } = useTheme();
    const { props } = usePage();
    const [reports, setReports] = useState(initialReports);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState(null);
    const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'info' });
    const [dates, setDates] = useState({
        start: dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
        end: dayjs().format('YYYY-MM-DD')
    });

    const showAlert = (title, message, type = 'info') => {
        setModal({ open: true, title, message, type });
    };

    const handleGenerate = (e) => {
        e.preventDefault();
        setLoading(true);
        router.post(route('ecommerce-reports.generate'), {
            start_date: dates.start,
            end_date: dates.end
        }, {
            onSuccess: () => setLoading(false),
            onError: () => setLoading(false),
            preserveScroll: true
        });
    };

    useEffect(() => {
        const { flash } = props;
        if (flash?.success) {
            showAlert('Éxito', flash.success, 'success');
        }
        if (flash?.error) {
            showAlert('Error', flash.error, 'error');
        }
    }, [props.flash]);

    const getStatusStyle = (status) => {
        // En v1, si está en el listado es porque está listo
        return { 
            bg: 'bg-emerald-500/10', 
            text: 'text-emerald-600 dark:text-emerald-400', 
            icon: <CheckCircle size={14} /> 
        };
    };

    const cardClass = `rounded-2xl border p-6 transition-all duration-200 ${
        isDark ? 'bg-slate-900 border-slate-700/60 shadow-slate-950/20' : 'bg-white border-slate-100 shadow-sm'
    }`;

    const labelClass = `block text-xs font-bold uppercase tracking-wider mb-2 ${
        isDark ? 'text-slate-400' : 'text-slate-500'
    }`;

    const inputClass = `w-full rounded-xl border px-4 py-2.5 text-sm transition-all focus:ring-2 focus:outline-none ${
        isDark 
            ? 'bg-slate-800 border-slate-700 text-white focus:border-teal-500 focus:ring-teal-500/20' 
            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-teal-500 focus:ring-teal-500/20'
    }`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Reportes Mercado Pago" />

            <div className="max-w-6xl mx-auto space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                <FileText className="text-teal-600 dark:text-teal-400" size={18} />
                            </div>
                            <h1 className={`text-2xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Reportes de Mercado Pago
                            </h1>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Genera y descarga reportes de liquidación (Releases) para conciliación.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Filter / Generator Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <section className={cardClass}>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar size={18} className="text-teal-500" />
                                <h2 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                    Nuevo Reporte
                                </h2>
                            </div>
                            
                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div>
                                    <label className={labelClass}>Fecha de Inicio</label>
                                    <input 
                                        type="date" 
                                        className={inputClass}
                                        value={dates.start}
                                        onChange={e => setDates(prev => ({...prev, start: e.target.value}))}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Fecha de Fin</label>
                                    <input 
                                        type="date" 
                                        className={inputClass}
                                        value={dates.end}
                                        onChange={e => setDates(prev => ({...prev, end: e.target.value}))}
                                    />
                                </div>
                                <Button 
                                    className="w-full mt-2 bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/20"
                                    disabled={loading}
                                >
                                    {loading ? 'Solicitando...' : 'Generar Reporte'}
                                </Button>
                                <p className="text-[10px] text-center text-slate-400 mt-2">
                                    El periodo máximo permitido es de 60 días.
                                </p>
                            </form>
                        </section>

                        <div className={`p-4 rounded-xl border ${isDark ? 'bg-blue-500/5 border-blue-500/20 text-blue-300' : 'bg-blue-50 border-blue-100 text-blue-700'} text-xs leading-relaxed`}>
                            <div className="flex items-start gap-2">
                                <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                <p>
                                    Mercado Pago procesa los reportes de forma asíncrona. 
                                    Una vez solicitado, aparecerá en el listado y podrá tardar unos minutos en estar listo para descargar.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reports List Table Column */}
                    <div className="lg:col-span-8">
                        <div className={`${cardClass} overflow-hidden p-0`}>
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <h3 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                    Historial de Liquidaciones
                                </h3>
                                <button 
                                    onClick={() => router.reload({ preserveScroll: true })}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                                    title="Refrescar lista"
                                >
                                    <RefreshCw size={16} />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Archivo</th>
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Creación</th>
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Estado</th>
                                            <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {reports.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <FileSearch size={40} className="text-slate-200 dark:text-slate-800" />
                                                        <p className="text-sm font-medium text-slate-400">No se encontraron reportes generados.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            reports.map((report) => {
                                                const st = getStatusStyle(report.status);
                                                const fileName = report['file_name'];
                                                return (
                                                    <tr key={fileName} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                                    <FileText size={16} className="text-slate-400" />
                                                                </div>
                                                                <span className={`text-sm font-medium truncate max-w-[180px] ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                                                    {fileName}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                                {dayjs(report.created_date).format('DD MMM YYYY')}
                                                            </p>
                                                            <p className="text-[10px] text-slate-400">
                                                                {dayjs(report.created_date).format('HH:mm')} hs
                                                            </p>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${st.bg} ${st.text}`}>
                                                                {st.icon}
                                                                {report.status?.toUpperCase() || 'N/A'}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <a 
                                                                    href={route('ecommerce-reports.download', fileName)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                                >
                                                                    <Download size={14} />
                                                                    Bajar
                                                                </a>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Aesthetic Alert Modal */}
            <Dialog open={modal.open} onOpenChange={(open) => setModal(m => ({...m, open}))}>
                <DialogContent className={`border-none p-0 overflow-hidden ${isDark ? 'bg-slate-900 shadow-2xl shadow-black/50' : 'bg-white shadow-xl'}`}>
                    <div className={`p-8 text-center flex flex-col items-center gap-4`}>
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                            modal.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 
                            modal.type === 'error' ? 'bg-red-500/10 text-red-500' : 
                            'bg-blue-500/10 text-blue-500'
                        }`}>
                            {modal.type === 'success' && <CheckCircle size={32} />}
                            {modal.type === 'error' && <XCircle size={32} />}
                            {modal.type === 'info' && <AlertCircle size={32} />}
                        </div>
                        
                        <div>
                            <DialogTitle className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {modal.title}
                            </DialogTitle>
                            <DialogDescription className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                {modal.message}
                            </DialogDescription>
                        </div>

                        <Button 
                            onClick={() => setModal(m => ({...m, open: false}))}
                            className={`mt-4 px-8 ${
                                modal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                                modal.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 
                                'bg-teal-600 hover:bg-teal-700'
                            } text-white font-bold rounded-xl`}
                        >
                            Entendido
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}

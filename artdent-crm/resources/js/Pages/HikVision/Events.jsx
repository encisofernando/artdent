import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import Pagination from '@/Components/Pagination';
import { Fingerprint, CheckCircle2, XCircle, Clock } from 'lucide-react';

const STATUS_LABELS = {
    checkIn: { label: 'Entrada', color: 'text-emerald-500' },
    checkOut: { label: 'Salida', color: 'text-slate-400' },
    breakIn: { label: 'Pausa in', color: 'text-amber-500' },
    breakOut: { label: 'Pausa out', color: 'text-amber-400' },
    overtimeIn: { label: 'Extra in', color: 'text-blue-400' },
    overtimeOut: { label: 'Extra out', color: 'text-blue-300' },
};

const VERIFY_LABELS = {
    face: 'Rostro',
    fingerprint: 'Huella',
    card: 'Tarjeta',
    pin: 'PIN',
    cardOrFace: 'Tarjeta/Rostro',
    fingerprintOrFace: 'Huella/Rostro',
};

export default function Events({ auth, events }) {
    const { isDark } = useTheme();
    const card = isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200/60';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const th = isDark ? 'text-slate-400 border-slate-700/60' : 'text-slate-500 border-slate-200/60';
    const td = isDark ? 'text-slate-200 border-slate-700/30' : 'text-slate-800 border-slate-100';

    const { data, current_page, last_page, prev_page_url, next_page_url } = events;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Eventos Biométricos" />
            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Fingerprint className={`h-7 w-7 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                    <div>
                        <h1 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Eventos Biométricos
                        </h1>
                        <p className={`text-sm ${muted}`}>
                            Registro de eventos recibidos desde terminales HikVision
                        </p>
                    </div>
                </div>

                {/* Table */}
                <div className={`rounded-2xl border overflow-hidden ${card}`}>
                    <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`border-b ${th}`}>
                                <th className="px-4 py-3 text-left font-medium">Fecha/Hora</th>
                                <th className="px-4 py-3 text-left font-medium">Terminal</th>
                                <th className="px-4 py-3 text-left font-medium">Colaborador</th>
                                <th className="px-4 py-3 text-left font-medium">Evento</th>
                                <th className="px-4 py-3 text-left font-medium">Verificación</th>
                                <th className="px-4 py-3 text-left font-medium">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className={`px-4 py-12 text-center ${muted}`}>
                                        No hay eventos registrados aún.
                                    </td>
                                </tr>
                            ) : data.map(ev => {
                                const statusInfo = STATUS_LABELS[ev.attendance_status] ?? { label: ev.attendance_status ?? '—', color: muted };
                                return (
                                    <tr key={ev.id} className={`border-b ${td}`}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`text-xs ${muted}`}>
                                                {ev.event_time
                                                    ? new Date(ev.event_time).toLocaleString('es-AR')
                                                    : new Date(ev.created_at).toLocaleString('es-AR')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span>{ev.device?.name ?? <span className={muted}>{ev.source_ip}</span>}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {ev.collaborator
                                                ? ev.collaborator.name
                                                : <span className={`${muted} text-xs`}>employeeNo: {ev.employee_no}</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-medium ${statusInfo.color}`}>
                                                {statusInfo.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={muted}>
                                                {VERIFY_LABELS[ev.verify_mode] ?? ev.verify_mode ?? '—'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {ev.processed
                                                ? <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                : ev.error
                                                    ? <span className="text-xs text-red-400" title={ev.error}>✗ Error</span>
                                                    : <Clock className={`h-4 w-4 ${muted}`} />}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    </div>
                </div>

                <Pagination data={events} />
            </div>
        </AuthenticatedLayout>
    );
}

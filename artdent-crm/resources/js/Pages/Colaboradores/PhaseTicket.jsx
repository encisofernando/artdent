import { Head, router } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

const AD = { blue: '#397B9C', teal: '#5AAD9C', mint: '#ACD6CE' };
const fmt = (v) => Number(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PhaseTicket({ job, phase, ticket, collaborator }) {
    const handlePrint = () => window.print();

    const printedDate = ticket?.created_at
        ? new Date(ticket.created_at).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
        : new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

    return (
        <div className="min-h-screen" style={{ background: '#0f172a' }}>
            <Head title={`Ticket ${ticket?.ticket_number ?? ''}`} />

            {/* Toolbar (solo pantalla) */}
            <div className="print:hidden sticky top-0 z-10 px-4 py-3 border-b border-slate-800 bg-slate-900 flex items-center gap-3">
                <button onClick={() => window.history.back()}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                    <ArrowLeft size={18} />
                </button>
                <span className="text-white font-semibold text-sm flex-1">Ticket de Fase</span>
                <button onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-bold"
                    style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                    <Printer size={14} />
                    Imprimir / PDF
                </button>
            </div>

            {/* Ticket */}
            <div className="flex justify-center py-8 print:py-0">
                <div className="w-72 bg-white rounded-2xl overflow-hidden shadow-2xl print:rounded-none print:shadow-none print:w-full"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}>

                    {/* Header */}
                    <div className="px-5 pt-5 pb-4 text-white text-center"
                        style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                        <img src="/assets/artcode-horizontal-white.png" alt="ArtCode"
                            className="h-7 mx-auto mb-2 object-contain" />
                        <p className="text-[10px] tracking-widest uppercase opacity-80 font-medium">
                            Ticket de Trabajo
                        </p>
                    </div>

                    {/* Body */}
                    <div className="px-5 py-4 space-y-3">

                        {ticket && (
                            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                                <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider">N° Ticket</span>
                                <span className="text-slate-800 font-black text-base font-mono">{ticket.ticket_number}</span>
                            </div>
                        )}

                        <Row label="Orden" value={job.job_number} mono />
                        <Row label="Odontólogo" value={job.dentist?.name ?? '—'} />
                        <Row label="Descripción" value={job.description} small />
                        <Row label="Fase" value={phase.name} highlight />
                        <Row label="Técnico" value={collaborator.name} />
                        <Row label="Fecha" value={printedDate} />

                        {/* Total */}
                        <div className="pt-3 mt-3 border-t-2"
                            style={{ borderColor: AD.mint }}>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-bold text-xs uppercase tracking-wider">Importe</span>
                                <span className="font-black text-xl" style={{ color: AD.blue }}>
                                    $ {fmt(ticket?.amount ?? phase.price)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer gradient */}
                    <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${AD.blue}, ${AD.teal}, ${AD.mint})` }} />
                </div>
            </div>

            {/* Print styles */}
            <style>{`
                @media print {
                    body { background: white !important; }
                    @page { size: 80mm auto; margin: 0; }
                }
            `}</style>
        </div>
    );
}

function Row({ label, value, mono, highlight, small }) {
    if (!value) return null;
    return (
        <div className="flex justify-between items-start gap-2">
            <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider shrink-0">{label}</span>
            <span className={`text-right leading-snug ${mono ? 'font-mono' : ''} ${small ? 'text-xs text-slate-600' : 'text-sm text-slate-800 font-semibold'} ${highlight ? 'font-black' : ''}`}
                style={highlight ? { color: AD.teal } : {}}>
                {value}
            </span>
        </div>
    );
}

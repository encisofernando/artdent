import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import { ArrowLeft, Printer, Trash2, CheckCircle, XCircle, PackageMinus } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n ?? 0);

const STATUS_CFG = {
    confirmed: { label: 'Confirmado', icon: CheckCircle, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    cancelled:  { label: 'Cancelado',  icon: XCircle,     cls: 'bg-red-100 text-red-700 border-red-200'           },
};

export default function Show({ auth, withdrawal }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const B = { blue: '#397B9C', teal: '#49949C' };

    const statusCfg = STATUS_CFG[withdrawal.status] ?? STATUS_CFG.confirmed;
    const StatusIcon = statusCfg.icon;

    const number = '#' + String(withdrawal.id).padStart(4, '0');
    const recipient = withdrawal.collaborator?.name ?? withdrawal.external_person ?? '—';

    const handleCancel = () => {
        confirmDialog('¿Cancelar este retiro? Se revertirá el stock descontado.', () => {
            router.delete(route('lab-withdrawals.destroy', withdrawal.id));
        });
    };

    const card = `rounded-2xl border shadow-sm ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-100'}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Retiro ${number}`} />

            {/* Print CSS */}
            <style>{`
                @media print {
                    body * { visibility: hidden !important; }
                    #ticket, #ticket * { visibility: visible !important; }
                    #ticket { position: fixed; inset: 0; padding: 24px; }
                    .no-print { display: none !important; }
                }
            `}</style>

            <div className="flex flex-col gap-6 font-sans max-w-4xl mx-auto">
                {/* Header — no-print */}
                <div className="no-print flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link href={route('lab-withdrawals.index')}>
                            <button className={`w-9 h-9 rounded-xl flex items-center justify-center border
                                ${isDark ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                <ArrowLeft size={16} />
                            </button>
                        </Link>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                                Retiro {number}
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Detalle e impresión del retiro de insumos
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white shadow-md"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}>
                            <Printer size={15} /> Imprimir Ticket
                        </button>
                        {withdrawal.status === 'confirmed' && (
                            <button onClick={handleCancel}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border
                                    ${isDark ? 'bg-red-900/20 border-red-800/40 text-red-400 hover:bg-red-900/30' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'}`}>
                                <Trash2 size={15} /> Cancelar Retiro
                            </button>
                        )}
                    </div>
                </div>

                {/* Datos del retiro */}
                <div className={`no-print ${card} p-6`}>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                        {[
                            { label: 'Número', value: number },
                            { label: 'Fecha', value: new Date(withdrawal.withdrawn_at).toLocaleDateString('es-AR') },
                            { label: 'Destinatario', value: recipient },
                            { label: 'Depósito', value: withdrawal.warehouse?.name ?? '—' },
                            { label: 'Registrado por', value: withdrawal.user?.name ?? '—' },
                            { label: 'Estado', value: (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold border ${statusCfg.cls}`}>
                                    <StatusIcon size={11} /> {statusCfg.label}
                                </span>
                            )},
                        ].map(({ label, value }) => (
                            <div key={label}>
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                                <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{value}</p>
                            </div>
                        ))}
                        {withdrawal.notes && (
                            <div className="col-span-2 md:col-span-4">
                                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Notas</p>
                                <p className={isDark ? 'text-slate-300' : 'text-slate-700'}>{withdrawal.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── TICKET IMPRIMIBLE ─── */}
                <div id="ticket" className={`${card} p-8`}>
                    {/* Encabezado ticket */}
                    <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-200">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <PackageMinus size={20} style={{ color: B.teal }} />
                                <span className="font-black text-xl text-slate-900 dark:text-white">Retiro de Insumos</span>
                            </div>
                            <p className="text-slate-500 text-sm">ArtDent Laboratorio</p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-slate-900" style={{ color: B.teal }}>{number}</p>
                            <p className="text-sm text-slate-500">{new Date(withdrawal.withdrawn_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    {/* Info ticket */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Destinatario</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{recipient}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Depósito</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{withdrawal.warehouse?.name ?? '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Registrado por</p>
                            <p className="font-semibold text-slate-800 mt-0.5">{withdrawal.user?.name ?? '—'}</p>
                        </div>
                        {withdrawal.notes && (
                            <div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Notas</p>
                                <p className="text-slate-700 mt-0.5">{withdrawal.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Tabla items */}
                    <table className="w-full text-sm border-collapse mb-6">
                        <thead>
                            <tr className="border-y border-slate-200 bg-slate-50">
                                <th className="text-left px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Producto</th>
                                <th className="text-right px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Cant.</th>
                                <th className="text-right px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Costo Unit.</th>
                                <th className="text-right px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-500">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {withdrawal.items?.map((item, i) => (
                                <tr key={i} className="border-b border-slate-100">
                                    <td className="px-3 py-2.5 font-medium text-slate-800">
                                        {item.product?.name ?? '—'}
                                        {item.variant && <span className="text-slate-400 text-xs ml-1">({item.variant.sku ?? `Var. #${item.variant.id}`})</span>}
                                    </td>
                                    <td className="px-3 py-2.5 text-right text-slate-700">{Number(item.quantity).toLocaleString('es-AR')}</td>
                                    <td className="px-3 py-2.5 text-right text-slate-700">{fmt(item.unit_cost)}</td>
                                    <td className="px-3 py-2.5 text-right font-semibold text-slate-800">{fmt(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colSpan="3" className="px-3 pt-3 text-right font-black text-slate-800 text-base">Total a precio de costo:</td>
                                <td className="px-3 pt-3 text-right font-black text-xl" style={{ color: B.teal }}>{fmt(withdrawal.total_cost)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Sección firma */}
                    <div className="mt-10 grid grid-cols-2 gap-8">
                        <div className="text-center">
                            <div className="border-t-2 border-slate-300 pt-2">
                                <p className="text-xs text-slate-500">Firma y aclaración — quien entrega</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t-2 border-slate-300 pt-2">
                                <p className="text-xs text-slate-500">Firma y aclaración — quien retira</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

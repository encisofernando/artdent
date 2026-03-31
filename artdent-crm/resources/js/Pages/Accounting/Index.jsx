import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useTheme } from '@/Contexts/ThemeContext';
import { DatePicker } from '@/Components/_appkit';
import {
    Landmark,
    Download,
    ReceiptText,
    ShoppingBag,
    Wallet,
    ArrowRight,
    CircleCheck,
    TriangleAlert,
    FileSpreadsheet,
} from 'lucide-react';

const money = (value) => Number(value || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
});

const date = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString('es-AR') : '—';

function SummaryCard({ title, value, hint, icon: Icon, accent, isDark }) {
    return (
        <div className={`rounded-3xl border p-5 relative overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}55)` }} />
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className={`text-[11px] uppercase tracking-[0.24em] font-black ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{title}</div>
                    <div className={`text-2xl font-black mt-2 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</div>
                    <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{hint}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${accent}15`, color: accent }}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );
}

export default function AccountingIndex({
    auth,
    company,
    filters,
    accountingSettings,
    obligations,
    summary,
    invoiceTotalsBySource,
    recentInvoices,
    recentPurchases,
    recentMovements,
}) {
    const { isDark } = useTheme();
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    const panel = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm';
    const soft = isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50/80 border-slate-200';
    const muted = isDark ? 'text-slate-400' : 'text-slate-500';
    const strong = isDark ? 'text-white' : 'text-slate-900';

    const applyFilters = () => {
        router.get(route('accounting.index'), { from, to }, { preserveState: true, preserveScroll: true, replace: true });
    };

    const exportUrl = (name) => `${route(name)}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Contable" />

            <div className="space-y-6">
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className={`w-14 h-14 rounded-3xl flex items-center justify-center ${isDark ? 'bg-cyan-500/10 text-cyan-300' : 'bg-cyan-50 text-cyan-700'}`}>
                            <Landmark size={26} />
                        </div>
                        <div>
                            <h1 className={`text-3xl font-black tracking-tight ${strong}`}>Contable</h1>
                            <p className={`text-sm mt-1 max-w-2xl ${muted}`}>
                                Panel separado para estudio contable y fiscal. Consolida facturación general, compras, libros IVA y movimientos sin mezclar operación diaria.
                            </p>
                            <p className={`text-xs mt-2 ${muted}`}>
                                {company?.name} · {company?.cuit || 'CUIT sin configurar'} · {company?.iva_condition || 'Condición IVA pendiente'}
                            </p>
                        </div>
                    </div>

                    <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row gap-3 ${soft}`}>
                        <DatePicker value={from} onChange={setFrom} className={isDark ? 'bg-slate-800 border-slate-700 text-slate-200 rounded-xl' : 'bg-white border-slate-200 text-slate-800 rounded-xl'} />
                        <DatePicker value={to} onChange={setTo} className={isDark ? 'bg-slate-800 border-slate-700 text-slate-200 rounded-xl' : 'bg-white border-slate-200 text-slate-800 rounded-xl'} />
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white"
                            style={{ background: 'linear-gradient(90deg, #397B9C, #49949C)' }}
                        >
                            Aplicar período
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <SummaryCard title="Facturado" value={money(summary.total_invoices)} hint="Comprobantes emitidos en el período." icon={ReceiptText} accent="#397B9C" isDark={isDark} />
                    <SummaryCard title="IVA Neto" value={money(summary.vat_position)} hint={`IVA ventas ${money(summary.vat_sales)} vs compras ${money(summary.vat_purchases)}.`} icon={FileSpreadsheet} accent="#49949C" isDark={isDark} />
                    <SummaryCard title="Compras" value={money(summary.total_purchases)} hint={`${summary.pending_purchases} comprobantes pendientes o parciales.`} icon={ShoppingBag} accent="#F59E0B" isDark={isDark} />
                    <SummaryCard title="Ingresos Manuales" value={money(summary.total_incomes)} hint="Ingresos cargados fuera de facturación." icon={CircleCheck} accent="#10B981" isDark={isDark} />
                    <SummaryCard title="Egresos" value={money(summary.total_expenses)} hint="Gastos y pagos operativos registrados." icon={Wallet} accent="#EF4444" isDark={isDark} />
                    <SummaryCard title="Resultado Operativo" value={money(summary.operating_result)} hint={`${summary.authorized_invoices} comprobantes con CAE en el período.`} icon={ArrowRight} accent="#6366F1" isDark={isDark} />
                </div>

                <div className="grid grid-cols-1 2xl:grid-cols-[1.15fr_0.85fr] gap-6">
                    <div className={`rounded-3xl border p-6 ${panel}`}>
                        <div className="flex items-center justify-between gap-4 mb-5">
                            <div>
                                <h2 className={`text-lg font-black ${strong}`}>Libros y presentaciones</h2>
                                <p className={`text-sm mt-1 ${muted}`}>Exportaciones listas para entregar al estudio contable o usar como soporte interno.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                {
                                    title: 'Libro IVA Ventas',
                                    hint: 'Comprobantes emitidos y débito fiscal.',
                                    href: exportUrl('export.iva-ventas'),
                                },
                                {
                                    title: 'Libro IVA Compras',
                                    hint: 'Compras, crédito fiscal y proveedores.',
                                    href: exportUrl('export.iva-compras'),
                                },
                                {
                                    title: 'Estado de resultados',
                                    hint: 'Ingresos vs gastos del período.',
                                    href: exportUrl('export.income-statement'),
                                },
                            ].map((item) => (
                                <a
                                    key={item.title}
                                    href={item.href}
                                    className={`rounded-2xl border p-4 transition-colors ${isDark ? 'border-slate-700 bg-slate-950/40 hover:border-slate-500' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                                >
                                    <div className={`text-sm font-black ${strong}`}>{item.title}</div>
                                    <p className={`text-xs mt-1.5 ${muted}`}>{item.hint}</p>
                                    <span className="inline-flex items-center gap-2 mt-4 text-xs font-black text-cyan-500">
                                        <Download size={14} />
                                        Descargar CSV
                                    </span>
                                </a>
                            ))}
                        </div>

                        <div className="mt-6">
                            <h3 className={`text-sm font-black mb-3 ${strong}`}>Facturación por origen</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {invoiceTotalsBySource.map((item) => (
                                    <div key={item.key} className={`rounded-2xl border px-4 py-3 ${isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/70'}`}>
                                        <div className="flex items-center justify-between gap-4">
                                            <div>
                                                <div className={`text-sm font-black ${strong}`}>{item.label}</div>
                                                <p className={`text-xs mt-1 ${muted}`}>{item.count} comprobante(s)</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-base font-black ${strong}`}>{money(item.total)}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className={`rounded-3xl border p-6 ${panel}`}>
                        <h2 className={`text-lg font-black ${strong}`}>Perfil fiscal preparado</h2>
                        <div className="grid grid-cols-1 gap-3 mt-4">
                            <div className={`rounded-2xl border px-4 py-3 ${soft}`}>
                                <div className={`text-[11px] uppercase tracking-[0.2em] font-black ${muted}`}>Régimen fiscal</div>
                                <div className={`text-sm font-black mt-2 ${strong}`}>{accountingSettings.tax_regime || 'No configurado'}</div>
                            </div>
                            <div className={`rounded-2xl border px-4 py-3 ${soft}`}>
                                <div className={`text-[11px] uppercase tracking-[0.2em] font-black ${muted}`}>IVA</div>
                                <div className={`text-sm font-black mt-2 ${strong}`}>{accountingSettings.vat_presentation || 'No configurado'}</div>
                            </div>
                            <div className={`rounded-2xl border px-4 py-3 ${soft}`}>
                                <div className={`text-[11px] uppercase tracking-[0.2em] font-black ${muted}`}>Ingresos Brutos</div>
                                <div className={`text-sm font-black mt-2 ${strong}`}>
                                    {accountingSettings.gross_income_regime || 'No configurado'}
                                    {accountingSettings.gross_income_jurisdiction ? ` · ${accountingSettings.gross_income_jurisdiction}` : ''}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className={`text-sm font-black mb-3 ${strong}`}>Obligaciones activas</h3>
                            <div className="space-y-3">
                                {obligations.map((item) => (
                                    <div key={item.key} className={`rounded-2xl border p-4 ${isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/70'}`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 ${item.status === 'attention' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {item.status === 'attention' ? <TriangleAlert size={18} /> : <CircleCheck size={18} />}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-black ${strong}`}>{item.label}</div>
                                                <p className={`text-xs mt-1 ${muted}`}>{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className={`rounded-3xl border p-6 xl:col-span-1 ${panel}`}>
                        <h2 className={`text-lg font-black mb-4 ${strong}`}>Última facturación</h2>
                        <div className="space-y-3">
                            {recentInvoices.length === 0 && <p className={`text-sm ${muted}`}>No hay comprobantes en el período.</p>}
                            {recentInvoices.map((item) => (
                                <div key={item.id} className={`rounded-2xl border p-4 ${soft}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className={`text-sm font-black ${strong}`}>{item.document}</div>
                                            <p className={`text-xs mt-1 ${muted}`}>{item.source} · {item.recipient_name || 'Sin receptor'}</p>
                                            <p className={`text-xs mt-1 ${muted}`}>{item.recipient_cuit || 'CUIT no informado'} · {date(item.issued_at)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-black ${strong}`}>{money(item.total)}</div>
                                            {item.cae && <div className="text-[11px] mt-1 text-emerald-500 font-black">CAE OK</div>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`rounded-3xl border p-6 xl:col-span-1 ${panel}`}>
                        <h2 className={`text-lg font-black mb-4 ${strong}`}>Últimas compras</h2>
                        <div className="space-y-3">
                            {recentPurchases.length === 0 && <p className={`text-sm ${muted}`}>No hay compras registradas en el período.</p>}
                            {recentPurchases.map((item) => (
                                <div key={item.id} className={`rounded-2xl border p-4 ${soft}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className={`text-sm font-black ${strong}`}>{item.vendor_name || 'Proveedor sin nombre'}</div>
                                            <p className={`text-xs mt-1 ${muted}`}>{item.invoice_label}</p>
                                            <p className={`text-xs mt-1 ${muted}`}>{item.vendor_cuit || 'CUIT no informado'} · {date(item.purchased_at)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-black ${strong}`}>{money(item.total)}</div>
                                            <div className={`text-[11px] mt-1 font-black ${item.status === 'received' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                {item.status}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`rounded-3xl border p-6 xl:col-span-1 ${panel}`}>
                        <h2 className={`text-lg font-black mb-4 ${strong}`}>Ingresos y egresos recientes</h2>
                        <div className="space-y-3">
                            {recentMovements.length === 0 && <p className={`text-sm ${muted}`}>No hay movimientos para el período seleccionado.</p>}
                            {recentMovements.map((item, index) => (
                                <div key={`${item.type}-${index}-${item.date}`} className={`rounded-2xl border p-4 ${soft}`}>
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className={`text-sm font-black ${strong}`}>{item.label}</div>
                                            <p className={`text-xs mt-1 ${muted}`}>{item.category} · {item.scope}</p>
                                            <p className={`text-xs mt-1 ${muted}`}>{date(item.date)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-sm font-black ${item.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {item.type === 'income' ? '+' : '-'}{money(item.amount + (item.tax_amount || 0))}
                                            </div>
                                            {item.tax_amount > 0 && (
                                                <div className={`text-[11px] mt-1 ${muted}`}>IVA {money(item.tax_amount)}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

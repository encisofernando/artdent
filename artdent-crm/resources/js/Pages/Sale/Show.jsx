import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Button } from '@/Components/ui/button';
import { ArrowLeft, Printer, FileText, Download } from 'lucide-react';

export default function Show({ auth, sale }) {
    const { isDark } = useTheme();

    const formatMoney = (val) => Number(val || 0).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
    const B = { blue: "#397B9C", teal: "#49949C" };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Venta ${sale.sale_number}`} />

            <div className={`max-w-4xl mx-auto space-y-6 font-sans`}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('sales.index')}>
                            <Button variant="outline" size="icon" className={`rounded-xl ${isDark ? 'border-slate-700 hover:bg-slate-800' : ''}`}>
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Detalle de Venta
                            </h1>
                            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                                {sale.sale_number} • {new Date(sale.sold_at || sale.created_at).toLocaleString('es-AR')}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className={`rounded-xl shadow-sm ${isDark ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white' : ''}`}>
                            <Download size={16} className="mr-2" /> PDF
                        </Button>
                        <Button
                            className="text-white rounded-xl shadow-md border-none"
                            style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
                            onClick={() => window.print()}
                        >
                            <Printer size={16} className="mr-2" /> Imprimir
                        </Button>
                    </div>
                </div>

                {/* Receipt Card */}
                <div className={`rounded-2xl border p-8 shadow-sm print:shadow-none print:border-none
                    ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
                `}>
                    <div className={`flex justify-between items-start pb-8 border-b
                        ${isDark ? 'border-slate-800' : 'border-slate-100'}
                    `}>
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md bg-blue-600">
                                <FileText size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className={`text-xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    ArtDent CRM
                                </h2>
                                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>TICKET DE VENTA</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2
                                ${sale.status === 'paid'
                                    ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-600 border border-red-500/20'}
                            `}>
                                {sale.status === 'paid' ? 'Pagado' : sale.status}
                            </div>
                            <p className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Nº {sale.sale_number}</p>
                            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                                Fecha: {new Date(sale.sold_at || sale.created_at).toLocaleDateString('es-AR')}
                            </p>
                        </div>
                    </div>

                    <div className="py-6">
                        <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Cliente</h3>
                        <p className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            {sale.notes?.includes('Cliente: ') ? sale.notes : 'Consumidor Final'}
                        </p>
                    </div>

                    <div className="mt-4">
                        <table className="w-full text-left text-sm">
                            <thead className={`text-xs uppercase font-bold tracking-wider 
                                ${isDark ? 'bg-slate-800/50 text-slate-400' : 'bg-slate-50 text-slate-500'}
                            `}>
                                <tr>
                                    <th className="py-3 px-4 rounded-l-lg">Producto</th>
                                    <th className="py-3 px-4 text-center">Cant</th>
                                    <th className="py-3 px-4 text-right">Precio Unit.</th>
                                    <th className="py-3 px-4 text-right">Dcto</th>
                                    <th className="py-3 px-4 text-right rounded-r-lg">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                                {sale.sale_items?.map(item => (
                                    <tr key={item.id}>
                                        <td className={`py-4 px-4 font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                            {item.product_name}
                                        </td>
                                        <td className="py-4 px-4 text-center font-bold">
                                            {item.quantity}
                                        </td>
                                        <td className="py-4 px-4 text-right">
                                            {formatMoney(item.unit_price)}
                                        </td>
                                        <td className="py-4 px-4 text-right text-red-500">
                                            {Number(item.discount) > 0 ? `-${formatMoney(item.discount)}` : '-'}
                                        </td>
                                        <td className="py-4 px-4 text-right font-bold" style={{ color: B.blue }}>
                                            {formatMoney(item.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end mt-8">
                        <div className="w-full max-w-sm space-y-3">
                            <div className={`flex justify-between text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                <span>Subtotal</span>
                                <span>{formatMoney(sale.subtotal)}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                <span>Descuento</span>
                                <span className="text-emerald-500">-{formatMoney(sale.discount_amount)}</span>
                            </div>
                            <div className={`flex justify-between text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                <span>IVA</span>
                                <span>{formatMoney(sale.tax_amount)}</span>
                            </div>
                            <div className={`flex justify-between items-center pt-4 border-t border-dashed
                                ${isDark ? 'border-slate-700' : 'border-slate-200'}
                            `}>
                                <span className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Total</span>
                                <span className="text-3xl font-black" style={{ color: B.blue }}>
                                    {formatMoney(sale.total)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    nav, header, aside, .not-prose { display: none !important; }
                    main { padding: 0 !important; margin: 0 !important; background: white !important; }
                    body { background: white !important; }
                }
            `}</style>
        </AuthenticatedLayout>
    );
}

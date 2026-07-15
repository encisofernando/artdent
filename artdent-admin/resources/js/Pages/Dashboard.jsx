import AdminLayout from '@/Layouts/AdminLayout';
import Card from '@/Components/ui/Card';
import Badge from '@/Components/ui/Badge';
import { Head, Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Building2, CheckCircle2, Clock, AlertTriangle, CreditCard, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { STATUS_LABELS, STATUS_COLORS, PLAN_LABELS, PLAN_COLORS } from '@/lib/tenantMeta';

function StatCard({ icon: Icon, label, value, description, color }) {
    const { isDark } = useTheme();
    const COLOR_MAP = {
        primary: isDark ? 'text-brand-cyan bg-brand-cyan/10' : 'text-brand-blue bg-brand-mint',
        success: isDark ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50',
        warning: isDark ? 'text-amber-400 bg-amber-500/10' : 'text-amber-600 bg-amber-50',
        danger: isDark ? 'text-rose-400 bg-rose-500/10' : 'text-rose-600 bg-rose-50',
    };

    return (
        <Card>
            <div className="flex items-start justify-between">
                <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{label}</p>
                    <p className="text-3xl font-black mt-1.5">{value}</p>
                    {description && <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{description}</p>}
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${COLOR_MAP[color] || COLOR_MAP.primary}`}>
                    <Icon size={20} />
                </div>
            </div>
        </Card>
    );
}

export default function Dashboard({ stats, activity, recentTenants }) {
    const { isDark } = useTheme();

    return (
        <AdminLayout title="Dashboard">
            <Head title="Dashboard" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard icon={Building2} label="Total de empresas" value={stats.total} description="Registradas en el sistema" color="primary" />
                <StatCard icon={CheckCircle2} label="Activas" value={stats.active} description={`+${stats.new_this_month} este mes`} color="success" />
                <StatCard icon={Clock} label="En prueba" value={stats.trial} description="Con acceso completo" color="warning" />
                <StatCard icon={AlertTriangle} label="Suspendidas" value={stats.suspended} description="Requieren atención" color="danger" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card
                    title="Nuevas empresas por mes"
                    description="Evolución reciente del alta de tenants en la plataforma."
                    className="lg:col-span-2"
                >
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={activity}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#17B3A3" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="#17B3A3" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#ffffff1a' : '#ACD6CE55'} vertical={false} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#5AAD9C' }} axisLine={false} tickLine={false} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#5AAD9C' }} axisLine={false} tickLine={false} width={28} />
                                <Tooltip
                                    contentStyle={{
                                        background: isDark ? '#0F2C3A' : '#fff',
                                        border: `1px solid ${isDark ? '#ffffff1a' : '#ACD6CE'}`,
                                        borderRadius: 8,
                                        fontSize: 13,
                                    }}
                                />
                                <Area type="monotone" dataKey="count" name="Nuevas empresas" stroke="#17B3A3" strokeWidth={2} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Planes disponibles" description={`${stats.active_plans} planes públicos e internos`}>
                    <Link
                        href="/plans"
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}
                    >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-brand-blue/15 text-brand-blue' : 'bg-brand-mint text-brand-blue'}`}>
                            <CreditCard size={18} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Ver y gestionar planes</p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Precios, límites y publicación en MercadoPago</p>
                        </div>
                    </Link>

                    <Link
                        href="/tenants"
                        className={`flex items-center gap-3 p-3 rounded-xl transition-colors mt-1 ${isDark ? 'hover:bg-white/5' : 'hover:bg-brand-mint'}`}
                    >
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                            <TrendingUp size={18} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Ver todas las empresas</p>
                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Suspender, activar o dar de alta tenants</p>
                        </div>
                    </Link>
                </Card>
            </div>

            <Card title="Últimas empresas registradas" className="mt-6">
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className={`text-left text-xs uppercase tracking-wider font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                <th className="px-6 py-2">Empresa</th>
                                <th className="px-6 py-2">Plan</th>
                                <th className="px-6 py-2">Estado</th>
                                <th className="px-6 py-2">Alta</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentTenants.map((t) => (
                                <tr key={t.id} className={`border-t ${isDark ? 'border-white/10' : 'border-brand-aqua/30'}`}>
                                    <td className="px-6 py-3">
                                        <Link href={`/tenants/${t.id}/edit`} className="font-bold hover:text-brand-cyan transition-colors">{t.name}</Link>
                                        <div className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{t.id}</div>
                                    </td>
                                    <td className="px-6 py-3"><Badge color={PLAN_COLORS[t.plan]}>{PLAN_LABELS[t.plan] || t.plan}</Badge></td>
                                    <td className="px-6 py-3"><Badge color={STATUS_COLORS[t.status]}>{STATUS_LABELS[t.status] || t.status}</Badge></td>
                                    <td className={`px-6 py-3 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{new Date(t.created_at).toLocaleDateString('es-AR')}</td>
                                </tr>
                            ))}
                            {recentTenants.length === 0 && (
                                <tr>
                                    <td colSpan={4} className={`px-6 py-8 text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Todavía no hay empresas registradas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AdminLayout>
    );
}

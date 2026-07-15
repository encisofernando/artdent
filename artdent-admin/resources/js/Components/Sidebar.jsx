import { Link, usePage } from '@inertiajs/react';
import { LayoutDashboard, Building2, CreditCard, Receipt, Users, ShieldCheck, FileText, LifeBuoy, BookOpen } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';
import BrandLogo from '@/Components/ui/BrandLogo';

const NAV = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Empresas', icon: Building2, path: '/tenants' },
    { label: 'Planes', icon: CreditCard, path: '/plans' },
    { label: 'Suscripciones', icon: Receipt, path: '/subscriptions' },
    { label: 'Facturación AFIP', icon: FileText, path: '/afip-issuer' },
    { label: 'Soporte', icon: LifeBuoy, path: '/tickets' },
    { label: 'Base de Conocimiento', icon: BookOpen, path: '/kb-articles' },
    { label: 'Usuarios', icon: Users, path: '/users' },
    { label: 'Auditoría', icon: ShieldCheck, path: '/audit-logs' },
];

// Sigue el toggle claro/oscuro: navy en modo oscuro, azul de marca en modo
// claro (mismo criterio que ya usa el Sidebar del CRM) — evita un sidebar
// blanco/plano y mantiene presencia de marca en los dos temas.
export default function Sidebar() {
    const { url } = usePage();
    const { isDark } = useTheme();

    const isActive = (path) => url === path || url.startsWith(`${path}/`);

    return (
        <aside className={`w-64 shrink-0 h-screen flex flex-col border-r transition-colors duration-300 ${
            isDark ? 'bg-brand-navy border-white/10' : 'bg-brand-blue border-brand-blue/60'
        }`}>
            <div className="h-16 flex items-center px-5 border-b border-white/15 shrink-0">
                <BrandLogo variant="white" height={38} />
            </div>

            <div className="px-5 pt-4 pb-2">
                <span className="text-[10px] uppercase tracking-widest font-bold text-white/50">Superadmin</span>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
                {NAV.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                active
                                    ? (isDark ? 'bg-brand-cyan/15 text-brand-cyan' : 'bg-white/15 text-white')
                                    : 'text-white/60 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/15 shrink-0 text-[10px] text-center uppercase tracking-widest font-bold text-white/40">
                © {new Date().getFullYear()} ArtCode
            </div>
        </aside>
    );
}

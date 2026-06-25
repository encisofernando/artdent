import { Link, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { LayoutDashboard, Receipt, Plus, Users, Menu } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C', active: '#5AAD9C' };

export default function BottomNav({ onMenuOpen }) {
    const { url } = usePage();
    const { isDark } = useTheme();

    const isActive = (path) => {
        if (path === '/dashboard') return url === '/dashboard' || url === '/';
        return url.startsWith(path);
    };

    const muted = isDark ? '#475569' : 'rgba(255,255,255,0.55)';
    const activeColor = isDark ? B.active : '#ACD6CE';

    const NavItem = ({ path, icon: Icon, label }) => {
        const active = isActive(path);
        const color = active ? activeColor : muted;
        return (
            <Link href={path} className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 select-none">
                <Icon size={22} style={{ color }} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-semibold" style={{ color }}>{label}</span>
            </Link>
        );
    };

    return (
        <nav
            className={`fixed bottom-0 left-0 right-0 z-50 lg:hidden
                ${isDark ? 'bg-slate-900/95 border-t border-slate-800' : 'bg-[#397B9C]/95 border-t border-[#2D6585]'}
            `}
            style={{
                backdropFilter: 'blur(12px)',
                paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                WebkitBackdropFilter: 'blur(12px)',
            }}
        >
            <div className="flex items-center h-[56px]">
                <NavItem path="/dashboard" icon={LayoutDashboard} label="Panel" />
                <NavItem path="/sales" icon={Receipt} label="Ventas" />

                {/* FAB center */}
                <div className="flex-1 flex justify-center items-center">
                    <Link href="/sales/create" className="flex items-center justify-center">
                        <div
                            className="w-[52px] h-[52px] -mt-5 rounded-full flex items-center justify-center text-white shadow-xl"
                            style={{
                                background: `linear-gradient(135deg, ${B.blue}, ${B.teal})`,
                                boxShadow: `0 4px 20px ${B.teal}55`,
                            }}
                        >
                            <Plus size={26} strokeWidth={2.5} />
                        </div>
                    </Link>
                </div>

                <NavItem path="/customers" icon={Users} label="Clientes" />

                {/* Menu button */}
                <button
                    onClick={onMenuOpen}
                    className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5 select-none"
                >
                    <Menu size={22} style={{ color: muted }} strokeWidth={2} />
                    <span className="text-[10px] font-semibold" style={{ color: muted }}>Menú</span>
                </button>
            </div>
        </nav>
    );
}

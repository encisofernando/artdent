import { Link, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Moon, Sun, LogOut, Menu } from 'lucide-react';

// Mismo color que el Sidebar en cada tema (navy oscuro / azul de marca en
// claro), para que la "cáscara" del panel se lea como una sola pieza.
export default function Topbar({ title, onMenuOpen }) {
    const { isDark, toggleTheme } = useTheme();
    const { auth } = usePage().props;
    const initial = auth?.user?.name ? auth.user.name[0].toUpperCase() : 'A';

    return (
        <header className={`h-16 flex items-center justify-between px-4 sm:px-6 border-b shrink-0 transition-colors duration-300 text-white ${
            isDark ? 'bg-brand-navy border-white/10' : 'bg-brand-blue border-brand-blue/60'
        }`}>
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onMenuOpen}
                    className="p-2 -ml-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors lg:hidden shrink-0"
                    title="Abrir menú"
                >
                    <Menu size={20} />
                </button>
                <h1 className="text-lg font-black truncate">{title}</h1>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    title={isDark ? 'Modo claro' : 'Modo oscuro'}
                >
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <Link
                    href="/logout"
                    method="post"
                    as="button"
                    className="p-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    title="Cerrar sesión"
                >
                    <LogOut size={18} />
                </Link>

                <div className="w-px h-6 mx-1 bg-white/15" />

                <div className="flex items-center gap-2.5 pl-1">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${isDark ? 'bg-brand-cyan/20 text-brand-cyan' : 'bg-white/15 text-white'}`}>
                        {initial}
                    </div>
                    <span className="text-sm font-semibold hidden sm:inline">{auth?.user?.name}</span>
                </div>
            </div>
        </header>
    );
}

import { Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    Menu,
    Moon,
    Sun,
    Bell,
    Download,
    LogOut,
} from 'lucide-react';

export default function Topbar({ user, onSidebarToggle, onLogout }) {
    const { isDark, toggleTheme, toggleSidebar } = useTheme();
    const userInitial = user?.name ? user.name[0].toUpperCase() : 'A';
    const printManagerDownloadUrl = (() => {
        const baseUrl = route('print-manager.download');

        if (typeof window === 'undefined') {
            return baseUrl;
        }

        const url = new URL(baseUrl, window.location.origin);
        const userAgent = window.navigator.userAgent || '';
        const normalized = userAgent.toLowerCase();

        if (normalized.includes('windows')) {
            url.searchParams.set('platform', 'windows');
        } else if (normalized.includes('linux') && !normalized.includes('android')) {
            url.searchParams.set('platform', 'linux');
        }

        return url.toString();
    })();

    return (
        <header className={`h-16 flex items-center justify-between px-4 border-b transition-colors shadow-sm
            ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}
        `}>
            {/* Left side: Hamburger & Status */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onSidebarToggle}
                    className={`lg:hidden p-2 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                >
                    <Menu className="h-5 w-5" />
                </button>

                {/* Status Badge */}
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold select-none
                    ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300'
                        : 'bg-slate-50 border-slate-200 text-slate-700'}
                `}>
                    <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]"></div>
                    Sistema Activo
                </div>
            </div>

            {/* Right side: Actions & Profile */}
            <div className="flex items-center gap-1">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={`p-2 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    title={isDark ? "Modo Claro" : "Modo Oscuro"}
                >
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>

                {/* Notifications */}
                <button
                    className={`p-2 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    title="Notificaciones"
                >
                    <Bell className="h-5 w-5" />
                </button>

                <a
                    href={printManagerDownloadUrl}
                    className={`inline-flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md border transition-colors ${isDark
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    title="Descargar gestor de impresión"
                >
                    <Download className="h-4 w-4" />
                    <span className="hidden lg:inline text-sm font-semibold">Impresión</span>
                </a>

                {/* Logout */}
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className={`p-2 rounded-md transition-colors ${isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                    title="Cerrar sesión"
                >
                    <LogOut className="h-5 w-5" />
                </Link>

                <div className={`w-px h-6 mx-2 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

                {/* User Profile */}
                <Link
                    href={route('profile.edit')}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                        }`}
                >
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm">
                        {userInitial}
                    </div>
                    <div className="hidden lg:block text-left">
                        <p className={`text-sm font-semibold truncate max-w-[120px] leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'
                            }`}>
                            {user?.name || "Usuario"}
                        </p>
                    </div>
                </Link>
            </div>
        </header>
    );
}

import { Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { LogOut, Moon, Sun } from 'lucide-react';

const B = { blue: '#397B9C', teal: '#49949C' };

/**
 * Shell propio del portal de odontólogos (panel.artdent.com.ar) — sin
 * Sidebar/Topbar del CRM interno, login independiente de la sesión de staff.
 */
export default function DentistPortalLayout({ dentist, children }) {
    const { isDark, toggleTheme } = useTheme();

    return (
        <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <header
                className="h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm"
                style={{ background: `linear-gradient(90deg, ${B.blue}, ${B.teal})` }}
            >
                <div className="flex items-center gap-2 text-white font-extrabold text-lg tracking-tight">
                    <img src="/logo-artdent-blanco.png" alt="ArtDent" className="h-7 w-auto" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                    Portal de Odontólogos
                </div>

                <div className="flex items-center gap-3">
                    {dentist && (
                        <span className="hidden sm:block text-sm font-semibold text-white/90 truncate max-w-[220px]">
                            {dentist.name}
                        </span>
                    )}
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-lg text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                        title={isDark ? 'Modo claro' : 'Modo oscuro'}
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    {dentist && (
                        <Link
                            href={route('dentist-portal.logout')}
                            method="post"
                            as="button"
                            className="p-2 rounded-lg text-white/80 hover:bg-white/15 hover:text-white transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut size={18} />
                        </Link>
                    )}
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                {children}
            </main>
        </div>
    );
}

import { Link, Head } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { ShieldAlert, Search, Server, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';

export default function Error({ status }) {
    const { isDark } = useTheme();

    const title = {
        503: 'Servicio No Disponible',
        500: 'Error del Servidor',
        404: 'Página No Encontrada',
        403: 'Acceso Restringido',
        419: 'Sesión Expirada',
    }[status] || 'Algo salió mal';

    const description = {
        503: 'Estamos realizando tareas de mantenimiento. Por favor, volvé a intentarlo en unos minutos.',
        500: 'Oops! Estamos experimentando dificultades técnicas internas. Nuestro equipo ya ha sido notificado.',
        404: 'Lo sentimos, la página que buscás no existe o ha sido movida a otra ubicación.',
        403: 'Lo sentimos, no tenés los permisos necesarios para acceder a esta sección del sistema.',
        419: 'Tu sesión ha expirado por inactividad. Por favor, recargá la página e intentá de nuevo.',
    }[status] || 'Ha ocurrido un error inesperado. Por favor, contactá al soporte técnico.';

    const Icon = {
        503: Server,
        500: Server,
        404: Search,
        403: ShieldAlert,
        419: ShieldAlert,
    }[status] || ShieldAlert;

    return (
        <div className={`min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ${
            isDark ? 'bg-slate-950 text-slate-300' : 'bg-slate-50 text-slate-600'
        }`}>
            <Head title={title} />
            
            <div className="max-w-md w-full text-center">
                {/* Background Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-96 h-96 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 rounded-full bg-blue-500 blur-[120px]"></div>
                </div>

                {/* Status Code Badge */}
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-8 shadow-2xl ${
                    isDark ? 'bg-slate-900 shadow-black' : 'bg-white shadow-slate-200'
                }`}>
                    <Icon size={48} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                </div>

                <h1 className={`text-6xl font-black mb-2 tracking-tighter ${
                    isDark ? 'text-white' : 'text-slate-900'
                }`}>
                    {status}
                </h1>
                
                <h2 className={`text-xl font-bold mb-4 ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                }`}>
                    {title}
                </h2>

                <p className="text-sm leading-relaxed mb-10 opacity-70">
                    {description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        variant="outline"
                        onClick={() => window.history.back()}
                        className={`font-bold rounded-xl gap-2 h-12 px-6 ${
                            isDark ? 'border-slate-800 hover:bg-slate-900 text-slate-400' : 'border-slate-200 hover:bg-white text-slate-600'
                        }`}
                    >
                        <ArrowLeft size={18} />
                        Volver Atrás
                    </Button>
                    
                    <Link href="/dashboard">
                        <Button 
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl gap-2 h-12 px-8 shadow-lg shadow-blue-500/20 w-full"
                        >
                            <Home size={18} />
                            Ir al Inicio
                        </Button>
                    </Link>
                </div>

                {/* Footer brand */}
                <div className="mt-16 opacity-30 flex items-center justify-center gap-2">
                    <img src="/assets/logo-artdent-icon.png" alt="ArtDent" className="h-4 w-4 grayscale" />
                    <span className="text-[10px] uppercase font-black tracking-widest">ArtDent CRM</span>
                </div>
            </div>
        </div>
    );
}

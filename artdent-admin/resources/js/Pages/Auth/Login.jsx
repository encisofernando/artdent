import { Head, useForm } from '@inertiajs/react';
import { Building2, Layers } from 'lucide-react';
import BrandIcon from '@/Components/ui/BrandIcon';
import BrandLogo from '@/Components/ui/BrandLogo';

// Pantalla de login siempre en navy de marca — es la única aplicación que
// muestra el manual de identidad para "pantalla de login · SaaS", así que
// no sigue el toggle claro/oscuro del resto del panel (ver Sidebar.jsx).
export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex bg-brand-navy text-white">
            <Head title="Acceso Superadmin" />

            {/* Panel izquierdo — branding */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-brand-navy-light border-r border-white/10">
                <div className="flex items-center gap-3">
                    <BrandIcon size={30} className="text-white" />
                    <div>
                        <div className="text-xs uppercase tracking-widest text-white/50">Superadmin</div>
                        <div className="font-bold">Panel Central</div>
                    </div>
                </div>

                <div className="space-y-4">
                    <span className="text-xs uppercase tracking-widest text-brand-cyan font-semibold">ArtCode Central</span>
                    <h2 className="text-3xl font-black leading-tight text-balance">
                        Control total del ecosistema, con una vista clara de cada empresa.
                    </h2>
                    <p className="text-white/60 leading-relaxed">
                        Administrá altas, dominios, planes y bases de cada clínica desde un panel central pensado para escritorio y mobile.
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <Building2 size={18} className="text-brand-cyan mb-2" />
                        <div className="text-sm font-bold">Empresas</div>
                        <div className="text-white/50 text-xs mt-1">Provisioning automatizado con owner listo para login.</div>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                        <Layers size={18} className="text-brand-cyan mb-2" />
                        <div className="text-sm font-bold">Módulos</div>
                        <div className="text-white/50 text-xs mt-1">Planes, módulos y suscripciones desde un solo lugar.</div>
                    </div>
                </div>
            </div>

            {/* Panel derecho — form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col items-center text-center mb-8">
                        <BrandIcon size={44} className="text-white mb-4" />
                        <BrandLogo variant="white" height={30} className="mb-3" />
                        <p className="text-sm text-white/50">
                            Ingresá con tu cuenta de superadmin para gestionar empresas, planes y suscripciones.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-white/80">Email</label>
                            <input
                                type="email"
                                autoFocus
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 focus:border-brand-cyan placeholder:text-white/30"
                            />
                            {errors.email && <p className="text-rose-400 text-xs mt-1.5">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1.5 text-white/80">Contraseña</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 focus:border-brand-cyan placeholder:text-white/30"
                            />
                            {errors.password && <p className="text-rose-400 text-xs mt-1.5">{errors.password}</p>}
                        </div>

                        <label className="flex items-center gap-2 text-sm text-white/70">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded border-white/30 bg-white/5"
                            />
                            Recordarme
                        </label>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-brand-cyan hover:brightness-110 text-white font-bold py-2.5 text-sm transition-all disabled:opacity-60"
                        >
                            {processing ? 'Ingresando…' : 'Ingresar'}
                        </button>
                    </form>

                    <p className="text-xs mt-8 text-center text-white/30">
                        © {new Date().getFullYear()} ArtCode — Panel Central
                    </p>
                </div>
            </div>
        </div>
    );
}

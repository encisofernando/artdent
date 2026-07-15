import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Sparkles, Check } from 'lucide-react';
import BrandIcon from '@/Components/ui/BrandIcon';
import BrandLogo from '@/Components/ui/BrandLogo';

// Misma estética siempre-navy que Login.jsx — la única pantalla pública de
// alta, coherente con el resto de las pantallas "cara al público" del manual
// de marca (ver Sidebar.jsx / Login.jsx para el criterio de cuándo no se
// sigue el toggle claro/oscuro).
export default function Create({ plans }) {
    const { props } = usePage();
    const [slugTouched, setSlugTouched] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        id: '',
        name: '',
        owner_name: '',
        owner_email: '',
        owner_password: '',
        owner_password_confirmation: '',
        plan: plans[0]?.slug || '',
    });

    const slugify = (value) => value
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const onCompanyName = (value) => {
        setData((current) => ({
            ...current,
            name: value,
            id: slugTouched ? current.id : slugify(value),
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('signup.store'));
    };

    return (
        <div className="min-h-screen flex bg-brand-navy text-white">
            <Head title="Creá tu cuenta" />

            {/* Panel izquierdo — branding */}
            <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 bg-brand-navy-light border-r border-white/10">
                <div className="flex items-center gap-3">
                    <BrandIcon size={30} className="text-white" />
                    <div className="font-bold">ArtCode</div>
                </div>

                <div className="space-y-4">
                    <span className="text-xs uppercase tracking-widest text-brand-cyan font-semibold">Probalo gratis</span>
                    <h2 className="text-3xl font-black leading-tight text-balance">
                        Tu clínica o laboratorio, gestionado de punta a punta.
                    </h2>
                    <ul className="space-y-2.5 text-white/70 text-sm">
                        <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan shrink-0" /> Sin tarjeta para empezar</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan shrink-0" /> Tu base de datos lista al instante</li>
                        <li className="flex items-center gap-2"><Check size={16} className="text-brand-cyan shrink-0" /> Cancelá cuando quieras</li>
                    </ul>
                </div>

                <p className="text-white/30 text-xs">© {new Date().getFullYear()} ArtCode</p>
            </div>

            {/* Panel derecho — form */}
            <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    <div className="flex flex-col items-center text-center mb-8 lg:hidden">
                        <BrandIcon size={40} className="text-white mb-3" />
                        <BrandLogo variant="white" height={28} />
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-black flex items-center gap-2"><Sparkles size={20} className="text-brand-cyan" /> Creá tu cuenta</h1>
                        <p className="text-sm text-white/50 mt-1">Empezá gratis — te mandamos un email para confirmar.</p>
                    </div>

                    {props.flash?.error && (
                        <div className="mb-5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm px-4 py-3">
                            {props.flash.error}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <Field label="Nombre de tu empresa" error={errors.name}>
                            <input
                                autoFocus
                                value={data.name}
                                onChange={(e) => onCompanyName(e.target.value)}
                                className={inputCls}
                                placeholder="Clínica Dental Sonrisas"
                            />
                        </Field>

                        <Field label="Identificador interno" error={errors.id} help="Se genera solo a partir del nombre — uso interno, no lo necesitás para ingresar (entrás siempre con tu email).">
                            <input
                                value={data.id}
                                onChange={(e) => { setSlugTouched(true); setData('id', slugify(e.target.value)); }}
                                className={inputCls}
                                placeholder="tu-empresa"
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Tu nombre" error={errors.owner_name}>
                                <input value={data.owner_name} onChange={(e) => setData('owner_name', e.target.value)} className={inputCls} />
                            </Field>
                            <Field label="Tu email" error={errors.owner_email}>
                                <input type="email" value={data.owner_email} onChange={(e) => setData('owner_email', e.target.value)} className={inputCls} />
                            </Field>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Contraseña" error={errors.owner_password}>
                                <input type="password" value={data.owner_password} onChange={(e) => setData('owner_password', e.target.value)} className={inputCls} />
                            </Field>
                            <Field label="Repetir contraseña">
                                <input type="password" value={data.owner_password_confirmation} onChange={(e) => setData('owner_password_confirmation', e.target.value)} className={inputCls} />
                            </Field>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2 text-white/80">Plan</label>
                            <div className="grid grid-cols-1 gap-2">
                                {plans.map((p) => (
                                    <label
                                        key={p.slug}
                                        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-colors ${
                                            data.plan === p.slug ? 'border-brand-cyan bg-brand-cyan/10' : 'border-white/15 bg-white/5 hover:bg-white/10'
                                        }`}
                                    >
                                        <div>
                                            <input type="radio" name="plan" className="hidden" checked={data.plan === p.slug} onChange={() => setData('plan', p.slug)} />
                                            <p className="font-bold text-sm">{p.name}</p>
                                            <p className="text-xs text-white/50">{p.trial_days} días gratis</p>
                                        </div>
                                        <p className="font-bold text-sm text-brand-cyan">${Number(p.price).toLocaleString('es-AR')}/mes</p>
                                    </label>
                                ))}
                            </div>
                            {errors.plan && <p className="text-rose-400 text-xs mt-1.5">{errors.plan}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full rounded-lg bg-brand-cyan hover:brightness-110 text-white font-bold py-2.5 text-sm transition-all disabled:opacity-60 mt-2"
                        >
                            {processing ? 'Creando…' : 'Crear mi cuenta gratis'}
                        </button>
                    </form>

                    <p className="text-xs mt-6 text-center text-white/30">
                        ¿Ya tenés cuenta? <a href="/login" className="text-brand-cyan hover:underline">Ingresá acá</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

const inputCls = 'w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none transition-colors focus:ring-2 focus:ring-brand-cyan/40 focus:border-brand-cyan placeholder:text-white/30';

function Field({ label, help, error, children }) {
    return (
        <div>
            <label className="block text-sm font-semibold mb-1.5 text-white/80">{label}</label>
            {children}
            {help && !error && <p className="text-white/30 text-xs mt-1.5 font-mono">{help}</p>}
            {error && <p className="text-rose-400 text-xs mt-1.5">{error}</p>}
        </div>
    );
}

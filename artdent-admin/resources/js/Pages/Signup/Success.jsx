import { Head } from '@inertiajs/react';
import { PartyPopper } from 'lucide-react';
import BrandIcon from '@/Components/ui/BrandIcon';

export default function Success({ loginUrl }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-navy text-white p-8">
            <Head title="¡Cuenta creada!" />

            <div className="w-full max-w-sm text-center">
                <BrandIcon size={40} className="text-white mx-auto mb-6" />

                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
                    <PartyPopper size={28} className="text-emerald-400" />
                </div>

                <h1 className="text-2xl font-black mb-2">¡Tu cuenta está lista!</h1>
                <p className="text-white/60 text-sm leading-relaxed mb-8">
                    Ya podés ingresar con el email y la contraseña que elegiste.
                </p>

                <a
                    href={loginUrl || '/login'}
                    className="inline-block w-full rounded-lg bg-brand-cyan hover:brightness-110 text-white font-bold py-2.5 text-sm transition-all"
                >
                    Ir a mi panel
                </a>
            </div>
        </div>
    );
}

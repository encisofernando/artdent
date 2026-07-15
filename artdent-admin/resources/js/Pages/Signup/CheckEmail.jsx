import { Head } from '@inertiajs/react';
import { MailCheck } from 'lucide-react';
import BrandIcon from '@/Components/ui/BrandIcon';

export default function CheckEmail({ email }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-navy text-white p-8">
            <Head title="Revisá tu email" />

            <div className="w-full max-w-sm text-center">
                <BrandIcon size={40} className="text-white mx-auto mb-6" />

                <div className="w-16 h-16 rounded-2xl bg-brand-cyan/15 flex items-center justify-center mx-auto mb-6">
                    <MailCheck size={28} className="text-brand-cyan" />
                </div>

                <h1 className="text-2xl font-black mb-2">Revisá tu email</h1>
                <p className="text-white/60 text-sm leading-relaxed">
                    Te mandamos un link de confirmación {email ? <>a <strong className="text-white">{email}</strong></> : 'a tu correo'}.
                    Hacé click ahí para activar tu cuenta — el link vence en 24 horas.
                </p>

                <p className="text-xs mt-8 text-white/30">
                    ¿No te llegó? Revisá spam o <a href="/signup" className="text-brand-cyan hover:underline">intentá de nuevo</a>.
                </p>
            </div>
        </div>
    );
}

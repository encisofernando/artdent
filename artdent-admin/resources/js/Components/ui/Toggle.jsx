import { Check, X } from 'lucide-react';

/**
 * Switch on/off con ícono de estado dentro del thumb — el color (verde/gris)
 * ya indica el estado, pero el ícono lo deja inequívoco de un vistazo y en
 * capturas de pantalla comprimidas.
 */
export default function Toggle({ checked, onChange, disabled = false, title }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            title={title}
            disabled={disabled}
            onClick={onChange}
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-white/15'
            }`}
        >
            <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-200 ${
                    checked ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
            >
                {checked
                    ? <Check size={12} strokeWidth={3} className="text-emerald-600" />
                    : <X size={12} strokeWidth={3} className="text-slate-400" />}
            </span>
        </button>
    );
}

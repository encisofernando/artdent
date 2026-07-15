import { useTheme } from '@/Contexts/ThemeContext';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children }) {
    const { isDark } = useTheme();

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-navy/70" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl ${isDark ? 'bg-brand-navy-light border-white/10' : 'bg-white border-brand-aqua/40'}`}>
                <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-brand-aqua/40'}`}>
                    <h3 className="font-bold">{title}</h3>
                    <button onClick={onClose} className={isDark ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'}>
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

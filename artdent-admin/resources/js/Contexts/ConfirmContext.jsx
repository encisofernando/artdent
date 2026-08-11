import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useTheme } from './ThemeContext';
import { AlertTriangle, Info, HelpCircle } from 'lucide-react';
import Button from '@/Components/ui/Button';

const ConfirmContext = createContext(null);

const VARIANTS = {
    danger: { Icon: AlertTriangle, iconColor: 'text-rose-500', iconBg: 'bg-rose-500/10', buttonVariant: 'danger' },
    warning: { Icon: AlertTriangle, iconColor: 'text-amber-500', iconBg: 'bg-amber-500/10', buttonVariant: 'warning' },
    info: { Icon: Info, iconColor: 'text-brand-cyan', iconBg: 'bg-brand-cyan/10', buttonVariant: 'primary' },
    default: { Icon: HelpCircle, iconColor: 'text-brand-cyan', iconBg: 'bg-brand-cyan/10', buttonVariant: 'primary' },
};

function ConfirmModal({ dialog, onConfirm, onCancel }) {
    const { isDark } = useTheme();
    const v = VARIANTS[dialog.variant || 'danger'];
    const { Icon } = v;

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onCancel]);

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-brand-navy/70 backdrop-blur-sm" onClick={onCancel} />
            <div className={`relative w-full max-w-sm rounded-2xl border shadow-2xl p-6 ${isDark ? 'bg-brand-navy-light border-white/10' : 'bg-white border-brand-aqua/40'}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 ${v.iconBg}`}>
                    <Icon size={21} className={v.iconColor} strokeWidth={2.2} />
                </div>

                {dialog.title && (
                    <p className="font-bold text-base mb-1.5">{dialog.title}</p>
                )}

                <p className={`text-sm mb-6 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {dialog.message}
                </p>

                <div className="flex flex-col gap-2">
                    <Button type="button" variant={v.buttonVariant} onClick={onConfirm} className="w-full justify-center">
                        {dialog.confirmLabel || 'Confirmar'}
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel} className="w-full justify-center">
                        {dialog.cancelLabel || 'Cancelar'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

export function ConfirmProvider({ children }) {
    const [dialog, setDialog] = useState(null);

    // Misma API que artdent-crm (@/Contexts/ConfirmContext): confirmDialog(mensaje, onConfirm)
    // o confirmDialog({ title, message, variant, confirmLabel, cancelLabel, onConfirm, onCancel }).
    const confirmDialog = useCallback((messageOrOptions, onConfirmCallback) => {
        if (typeof messageOrOptions === 'string') {
            setDialog({ message: messageOrOptions, onConfirm: onConfirmCallback, variant: 'danger' });
        } else {
            setDialog(messageOrOptions);
        }
    }, []);

    const handleConfirm = useCallback(() => {
        const fn = dialog?.onConfirm;
        setDialog(null);
        fn?.();
    }, [dialog]);

    const handleCancel = useCallback(() => {
        dialog?.onCancel?.();
        setDialog(null);
    }, [dialog]);

    return (
        <ConfirmContext.Provider value={confirmDialog}>
            {children}
            {dialog && (
                <ConfirmModal dialog={dialog} onConfirm={handleConfirm} onCancel={handleCancel} />
            )}
        </ConfirmContext.Provider>
    );
}

export const useConfirm = () => useContext(ConfirmContext);

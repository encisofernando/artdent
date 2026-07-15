import { useTheme } from '@/Contexts/ThemeContext';

export default function Card({ title, description, actions, className = '', children }) {
    const { isDark } = useTheme();

    return (
        <div className={`rounded-2xl border shadow-sm transition-colors ${isDark ? 'bg-brand-navy-light border-white/10' : 'bg-white border-brand-aqua/40'} ${className}`}>
            {(title || actions) && (
                <div className={`flex items-center justify-between gap-4 px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-brand-aqua/40'}`}>
                    <div>
                        {title && <h2 className="font-bold text-base">{title}</h2>}
                        {description && <p className={`text-sm mt-0.5 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>{description}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
                </div>
            )}
            <div className="p-6">{children}</div>
        </div>
    );
}

import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Building2, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

export default function CompanySwitcher() {
    const { companyContext: company } = usePage().props;
    const { isDark } = useTheme();
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Sólo se muestra a usuarios con permiso companies.switch (available trae
    // más de una company); el resto de los usuarios queda fijo a la suya.
    if (!company?.available || company.available.length < 2) {
        return null;
    }

    const switchTo = (companyId) => {
        setOpen(false);
        if (companyId === company.active?.id) {
            return;
        }
        router.post(route('companies.set-active'), { company_id: companyId }, {
            preserveScroll: true,
        });
    };

    const activeLabel = company.active?.fantasy_name || company.active?.name || 'Compañía';

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold transition-colors
                    ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white/15 border-white/25 text-white hover:bg-white/25'}
                `}
                title="Cambiar compañía activa"
            >
                <Building2 size={14} />
                <span className="max-w-[140px] truncate">{activeLabel}</span>
                <ChevronDown size={14} />
            </button>

            {open && (
                <div className={`absolute left-0 top-full mt-2 w-64 rounded-xl shadow-2xl border z-50 overflow-hidden
                    ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-artdent-border'}
                `}>
                    <div className={`px-4 py-2.5 border-b text-xs font-semibold ${isDark ? 'border-slate-700 text-slate-400' : 'border-artdent-border text-slate-500'}`}>
                        Trabajando con
                    </div>
                    <ul className="max-h-72 overflow-y-auto py-1">
                        {company.available.map((c) => (
                            <li key={c.id}>
                                <button
                                    onClick={() => switchTo(c.id)}
                                    className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-left transition-colors
                                        ${isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}
                                    `}
                                >
                                    <span className="truncate">{c.fantasy_name || c.name}</span>
                                    {c.id === company.active?.id && (
                                        <Check size={14} className="text-emerald-500 shrink-0" />
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

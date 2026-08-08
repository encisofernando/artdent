import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Store, Check, ChevronDown } from 'lucide-react';
import { useTheme } from '@/Contexts/ThemeContext';

export default function BranchSwitcher() {
    const { branchContext: branch } = usePage().props;
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

    // Sólo se muestra a usuarios sin sucursal fija (available trae más de
    // una); el resto queda fijo a la suya sin selector.
    if (!branch?.available || branch.available.length < 2) {
        return null;
    }

    const switchTo = (branchId) => {
        setOpen(false);
        if (branchId === branch.active?.id) {
            return;
        }
        router.post(route('branchs.set-active'), { branch_id: branchId }, {
            preserveScroll: true,
        });
    };

    const activeLabel = branch.active?.name || 'Sucursal';

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold transition-colors
                    ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white/15 border-white/25 text-white hover:bg-white/25'}
                `}
                title="Cambiar sucursal activa"
            >
                <Store size={14} />
                <span className="max-w-[140px] truncate">{activeLabel}</span>
                <ChevronDown size={14} />
            </button>

            {open && (
                <div className={`absolute left-0 top-full mt-2 w-64 rounded-xl shadow-2xl border z-50 overflow-hidden
                    ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-artdent-border'}
                `}>
                    <div className={`px-4 py-2.5 border-b text-xs font-semibold ${isDark ? 'border-slate-700 text-slate-400' : 'border-artdent-border text-slate-500'}`}>
                        Facturando desde
                    </div>
                    <ul className="max-h-72 overflow-y-auto py-1">
                        {branch.available.map((b) => (
                            <li key={b.id}>
                                <button
                                    onClick={() => switchTo(b.id)}
                                    className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-sm text-left transition-colors
                                        ${isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'}
                                    `}
                                >
                                    <span className="truncate">{b.name}</span>
                                    {b.id === branch.active?.id && (
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

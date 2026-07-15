import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function FlashBanner() {
    const { flash } = usePage().props;
    const [dismissed, setDismissed] = useState({});

    useEffect(() => {
        setDismissed({});
    }, [flash?.success, flash?.error]);

    const items = [
        flash?.success && !dismissed.success ? { type: 'success', text: flash.success } : null,
        flash?.error && !dismissed.error ? { type: 'error', text: flash.error } : null,
    ].filter(Boolean);

    if (items.length === 0) return null;

    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {items.map((item) => (
                <div
                    key={item.type}
                    className={`flex items-start gap-2.5 rounded-xl shadow-lg border px-4 py-3 text-sm font-medium ${
                        item.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300'
                            : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300'
                    }`}
                >
                    {item.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <XCircle size={18} className="shrink-0 mt-0.5" />}
                    <span className="flex-1">{item.text}</span>
                    <button onClick={() => setDismissed((d) => ({ ...d, [item.type]: true }))}>
                        <X size={14} className="opacity-60" />
                    </button>
                </div>
            ))}
        </div>
    );
}

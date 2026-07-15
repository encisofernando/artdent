const COLORS = {
    gray: 'bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-300',
    primary: 'bg-brand-mint text-brand-blue dark:bg-brand-cyan/15 dark:text-brand-cyan',
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
    info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
};

export default function Badge({ color = 'gray', children }) {
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${COLORS[color] || COLORS.gray}`}>
            {children}
        </span>
    );
}

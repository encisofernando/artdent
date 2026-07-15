import { Link } from '@inertiajs/react';

const VARIANTS = {
    primary: 'bg-brand-cyan hover:brightness-110 text-white shadow-sm shadow-brand-cyan/20',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-600/20',
    warning: 'bg-amber-500 hover:bg-amber-400 text-white shadow-sm shadow-amber-500/20',
    outline: 'border border-brand-aqua dark:border-white/15 hover:bg-brand-mint dark:hover:bg-white/5 text-brand-navy dark:text-slate-300',
};

const SIZES = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
};

export default function Button({ as = 'button', variant = 'primary', size = 'md', className = '', children, ...props }) {
    const classes = `inline-flex items-center gap-1.5 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`;

    if (as === 'link') {
        return (
            <Link className={classes} {...props}>
                {children}
            </Link>
        );
    }

    return (
        <button className={classes} {...props}>
            {children}
        </button>
    );
}

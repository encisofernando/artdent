import { Link } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';

/**
 * Unified pagination component for all list pages.
 * Accepts the Laravel paginator object directly (items / reviews / moves / etc.).
 *
 * Props:
 *   data        — Laravel LengthAwarePaginator (has .links, .current_page, .last_page, .from, .to, .total)
 *   className   — optional wrapper class
 *   showInfo    — show "Mostrando X-Y de Z" footer (default true)
 */
export default function Pagination({ data, className = '', showInfo = true }) {
    const { isDark } = useTheme();

    if (!data?.links || data.links.length <= 3) return null;

    const prev    = data.links[0];
    const next    = data.links[data.links.length - 1];
    const pages   = data.links.slice(1, -1);
    const current = data.current_page;
    const last    = data.last_page;

    const base     = 'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors select-none';
    const active   = isDark ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600';
    const enabled  = isDark ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100';
    const muted    = isDark ? 'text-slate-700 cursor-default' : 'text-slate-300 cursor-default';
    const wrap     = `flex gap-1 p-1 rounded-xl border ${isDark ? 'bg-slate-900 border-slate-700/60' : 'bg-white border-slate-200'}`;

    const PrevLink = prev.url
        ? <Link href={prev.url} preserveScroll className={`${base} ${enabled}`}>«</Link>
        : <span className={`${base} ${muted}`}>«</span>;

    const NextLink = next.url
        ? <Link href={next.url} preserveScroll className={`${base} ${enabled}`}>»</Link>
        : <span className={`${base} ${muted}`}>»</span>;

    return (
        <div className={`flex flex-col items-center gap-1.5 mt-4 ${className}`}>

            {/* Mobile: Anterior / X de Y / Siguiente */}
            <div className={`flex sm:hidden items-center justify-between w-full max-w-xs ${wrap}`}>
                {prev.url
                    ? <Link href={prev.url} preserveScroll className={`${base} ${enabled}`}>← Anterior</Link>
                    : <span className={`${base} ${muted}`}>← Anterior</span>}
                <span className={`${base} font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {current} / {last}
                </span>
                {next.url
                    ? <Link href={next.url} preserveScroll className={`${base} ${enabled}`}>Siguiente →</Link>
                    : <span className={`${base} ${muted}`}>Siguiente →</span>}
            </div>

            {/* Desktop: all page numbers with ellipsis truncation */}
            <div className={`hidden sm:flex flex-wrap justify-center ${wrap}`}>
                {PrevLink}
                {pages.map((link, i) => {
                    const n    = parseInt(link.label, 10);
                    const prev = i > 0 ? parseInt(pages[i - 1].label, 10) : -Infinity;
                    const show = isNaN(n) || n === 1 || n === last || Math.abs(n - current) <= 2;

                    if (!show) {
                        // show a single ellipsis at each gap boundary
                        const showDots = !isNaN(n) && !isNaN(prev) && n - prev === 1;
                        return showDots
                            ? <span key={i} className={`${base} ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>…</span>
                            : null;
                    }

                    return link.url
                        ? <Link key={i} href={link.url} preserveScroll className={`${base} ${link.active ? active : enabled}`}>{link.label}</Link>
                        : <span key={i} className={`${base} ${link.active ? active : muted}`}>{link.label}</span>;
                })}
                {NextLink}
            </div>

            {/* Record count */}
            {showInfo && data.from != null && data.total != null && (
                <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    Mostrando {data.from}–{data.to} de {data.total}
                </p>
            )}
        </div>
    );
}

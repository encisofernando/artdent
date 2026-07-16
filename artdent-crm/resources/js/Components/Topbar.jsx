import { Link, router, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { usePwaInstall } from '@/hooks/usePwaInstall';
import CompanySwitcher from '@/Components/CompanySwitcher';
import {
    Menu,
    Moon,
    Sun,
    Bell,
    Download,
    LogOut,
    ShoppingCart,
    CreditCard,
    Star,
    XCircle,
    X,
    CheckCheck,
    PackageOpen,
} from 'lucide-react';

const TYPE_ICON = {
    new_order: ShoppingCart,
    payment_approved: CreditCard,
    new_review: Star,
    order_cancelled: XCircle,
    low_stock: PackageOpen,
};

const TYPE_COLOR = {
    new_order: 'text-emerald-500',
    payment_approved: 'text-blue-500',
    new_review: 'text-amber-500',
    order_cancelled: 'text-red-500',
    low_stock: 'text-orange-500',
};

function timeAgo(dateStr) {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return 'ahora';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
    return `hace ${Math.floor(diff / 86400)}d`;
}

const MAX_TOASTS = 5;
const TOAST_DURATION = 5000;

function ToastItem({ toast, onDismiss, isDark }) {
    const Icon = TYPE_ICON[toast.type] ?? Bell;
    const color = TYPE_COLOR[toast.type] ?? 'text-slate-400';

    return (
        <div
            className={`pointer-events-auto w-80 rounded-xl shadow-2xl border overflow-hidden
                ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-artdent-border'}
            `}
            style={{ animation: 'toastSlideIn 0.3s ease' }}
        >
            <div className="flex items-start gap-3 px-4 py-3.5">
                <Icon size={18} className={`${color} shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {toast.title}
                    </p>
                    <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {toast.body}
                    </p>
                    {toast.url && (
                        <button
                            onClick={() => { router.visit(toast.url); onDismiss(toast.id); }}
                            className="mt-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                        >
                            Ver detalles →
                        </button>
                    )}
                </div>
                <button
                    onClick={() => onDismiss(toast.id)}
                    className={`shrink-0 mt-0.5 ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <X size={14} />
                </button>
            </div>
            <div className="h-1 bg-emerald-500" style={{ animation: `shrink ${TOAST_DURATION}ms linear forwards` }} />
        </div>
    );
}

export default function Topbar({ user, onSidebarToggle }) {
    const { isDark, toggleTheme } = useTheme();
    const { props: pageProps } = usePage();
    const tenantId = pageProps.tenant_info?.id;
    const { canInstall, promptInstall } = usePwaInstall();
    const userInitial = user?.name ? user.name[0].toUpperCase() : 'A';
    const printManagerDownloadUrl = (() => {
        const baseUrl = route('print-manager.download');

        if (typeof window === 'undefined') {
            return baseUrl;
        }

        const url = new URL(baseUrl, window.location.origin);
        const userAgent = window.navigator.userAgent || '';
        const normalized = userAgent.toLowerCase();

        if (normalized.includes('windows')) {
            url.searchParams.set('platform', 'windows');
        } else if (normalized.includes('linux') && !normalized.includes('android')) {
            url.searchParams.set('platform', 'linux');
        }

        return url.toString();
    })();

    const [notifications, setNotifications] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [toasts, setToasts] = useState([]);
    const dropdownRef = useRef(null);
    const seenIds = useRef(null);
    const toastTimers = useRef(new Map());

    const unread = notifications.length;

    const dismissToast = (id) => {
        clearTimeout(toastTimers.current.get(id));
        toastTimers.current.delete(id);
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const addToast = (notif) => {
        setToasts((prev) => {
            const filtered = prev.filter((t) => t.id !== notif.id);
            return [...filtered, notif].slice(-MAX_TOASTS);
        });
        if (toastTimers.current.has(notif.id)) clearTimeout(toastTimers.current.get(notif.id));
        toastTimers.current.set(notif.id, setTimeout(() => dismissToast(notif.id), TOAST_DURATION));
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await axios.get('/crm/notifications');

            setNotifications(data);

            // First fetch: seed seenIds without toasting
            if (seenIds.current === null) {
                seenIds.current = new Set(data.map((n) => n.id));
                return;
            }

            // Subsequent fetches: queue new ones as toasts
            const newOnes = data.filter((n) => !seenIds.current.has(n.id));
            newOnes.forEach((n) => seenIds.current.add(n.id));
            newOnes.forEach((n) => addToast(n));
        } catch {
            // silent
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Red de seguridad — el Echo listener de abajo es la vía principal;
        // este poll más lento solo cubre una caída silenciosa del WebSocket.
        const id = setInterval(fetchNotifications, 120_000);
        return () => clearInterval(id);
    }, []);

    // Reverb real-time: re-fetch immediately when any notificación se crea.
    useEffect(() => {
        if (!window.Echo || !tenantId) { return; }
        const channelName = `tenant.${tenantId}.notifications`;
        const ch = window.Echo.private(channelName);
        ch.listen('.notification-created', () => fetchNotifications());
        return () => { window.Echo.leave(channelName); };
    }, [tenantId]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const markRead = async (notif) => {
        // Remove immediately from the list
        setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
        if (seenIds.current) seenIds.current.delete(notif.id);

        axios.post(`/crm/notifications/${notif.id}/read`).catch(() => {});

        if (notif.url) {
            setDropdownOpen(false);
            router.visit(notif.url);
        }
    };

    const markAllRead = async () => {
        setNotifications([]);
        seenIds.current = new Set();
        axios.post('/crm/notifications/read-all').catch(() => {});
    };

    return (
        <>
            <header className={`h-16 flex items-center justify-between px-4 border-b transition-colors shadow-sm
                ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-[#397B9C] border-[#2D6585]'}
            `}>
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onSidebarToggle}
                        className={`lg:hidden p-2 rounded-md transition-colors ${isDark
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            : 'text-white/80 hover:bg-white/15 hover:text-white'
                        }`}
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold select-none
                        ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-white/15 border-white/25 text-white'}
                    `}>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                        Sistema Activo
                    </div>

                    <CompanySwitcher />
                </div>

                {/* Right side */}
                <div className="flex items-center gap-1">
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-md transition-colors ${isDark
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            : 'text-white/80 hover:bg-white/15 hover:text-white'
                        }`}
                        title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
                    >
                        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>

                    {/* Notifications */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            onClick={() => setDropdownOpen((v) => !v)}
                            className={`relative p-2 rounded-md transition-colors ${isDark
                                ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                : 'text-white/80 hover:bg-white/15 hover:text-white'
                            }`}
                            title="Notificaciones"
                        >
                            <Bell className="h-5 w-5" />
                            {unread > 0 && (
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white leading-none">
                                    {unread > 9 ? '9+' : unread}
                                </span>
                            )}
                        </button>

                        {dropdownOpen && (
                            <div className={`absolute right-0 top-full mt-2 w-[min(24rem,calc(100vw-2rem))] rounded-xl shadow-2xl border z-50 overflow-hidden
                                ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-[#A8C8DC]'}
                            `}>
                                {/* Header */}
                                <div className={`flex items-center justify-between px-4 py-3 border-b
                                    ${isDark ? 'border-slate-700' : 'border-[#A8C8DC]'}
                                `}>
                                    <span className={`font-semibold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                        Notificaciones
                                        {unread > 0 && (
                                            <span className="ml-2 text-xs bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">
                                                {unread} nuevas
                                            </span>
                                        )}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        {unread > 0 && (
                                            <button
                                                onClick={markAllRead}
                                                className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                                                title="Marcar todas como leídas"
                                            >
                                                <CheckCheck size={13} /> Todo leído
                                            </button>
                                        )}
                                        <button onClick={() => setDropdownOpen(false)}>
                                            <X size={14} className={isDark ? 'text-slate-500' : 'text-slate-400'} />
                                        </button>
                                    </div>
                                </div>

                                {/* List */}
                                {notifications.length === 0 ? (
                                    <div className={`px-4 py-10 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        <Bell size={28} className="mx-auto mb-2 opacity-30" />
                                        Sin notificaciones por el momento.
                                    </div>
                                ) : (
                                    <ul className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                                        {notifications.map((n) => {
                                            const Icon = TYPE_ICON[n.type] ?? Bell;
                                            const color = TYPE_COLOR[n.type] ?? 'text-slate-400';
                                            return (
                                                <li
                                                    key={n.id}
                                                    className={`transition-colors cursor-pointer ${
                                                        isDark ? 'bg-slate-800 hover:bg-slate-700' : 'bg-blue-50 hover:bg-blue-100/60'
                                                    }`}
                                                    onClick={() => markRead(n)}
                                                >
                                                    <div className="flex items-start gap-3 px-4 py-3">
                                                        <div className={`mt-0.5 shrink-0 ${color}`}>
                                                            <Icon size={16} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-semibold leading-tight ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                                {n.title}
                                                            </p>
                                                            <p className={`text-xs mt-0.5 leading-snug ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                {n.body}
                                                            </p>
                                                            <p className="text-[10px] mt-1 text-slate-400">
                                                                {timeAgo(n.created_at)}
                                                            </p>
                                                        </div>
                                                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    {canInstall && (
                        <button
                            onClick={() => void promptInstall()}
                            className={`hidden sm:inline-flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md border transition-colors ${isDark
                                ? 'border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200'
                                : 'border-white/25 text-white/80 hover:bg-white/15 hover:text-white'
                            }`}
                            title="Instalar ArtCode CRM"
                        >
                            <Download className="h-4 w-4" />
                            <span className="hidden xl:inline text-sm font-semibold">Instalar app</span>
                        </button>
                    )}

                    <a
                        href={printManagerDownloadUrl}
                        className={`hidden sm:inline-flex items-center gap-2 px-2 sm:px-3 py-2 rounded-md border transition-colors ${isDark
                            ? 'border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white'
                            : 'border-white/25 text-white/80 hover:bg-white/15 hover:text-white'
                        }`}
                        title="Descargar gestor de impresión"
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden lg:inline text-sm font-semibold">Impresión</span>
                    </a>

                    {/* Logout */}
                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className={`p-2 rounded-md transition-colors ${isDark
                            ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            : 'text-white/80 hover:bg-white/15 hover:text-white'
                        }`}
                        title="Cerrar sesión"
                    >
                        <LogOut className="h-5 w-5" />
                    </Link>

                    <div className={`w-px h-6 mx-2 ${isDark ? 'bg-slate-700' : 'bg-white/25'}`} />

                    {/* User profile */}
                    <Link
                        href={route('profile.edit')}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-white/15'}`}
                    >
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm">
                            {userInitial}
                        </div>
                        <div className="hidden lg:block text-left">
                            <p className={`text-sm font-semibold truncate max-w-[120px] leading-tight ${isDark ? 'text-slate-200' : 'text-white'}`}>
                                {user?.name || 'Usuario'}
                            </p>
                        </div>
                    </Link>
                </div>
            </header>

            {/* Toast stack — bottom right, newest at bottom */}
            {toasts.length > 0 && (
                <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
                    {toasts.map((t) => (
                        <ToastItem key={t.id} toast={t} onDismiss={dismissToast} isDark={isDark} />
                    ))}
                </div>
            )}
        </>
    );
}

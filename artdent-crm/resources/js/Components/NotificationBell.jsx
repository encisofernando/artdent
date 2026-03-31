import { useState, useEffect, useRef } from 'react';
import { Bell, X, ShoppingCart, AlertTriangle, ExternalLink } from 'lucide-react';
import useRealtimeNotifications from '@/hooks/useRealtimeNotifications';
import { useTheme } from '@/Contexts/ThemeContext';

const TYPE_ICON = {
    'new-order': ShoppingCart,
    'low-stock': AlertTriangle,
};

const TYPE_COLOR = {
    'new-order': '#5AAD9C',
    'low-stock': '#F4A261',
};

export default function NotificationBell({ companyId }) {
    const { isDark } = useTheme();
    const [open, setOpen] = useState(false);
    const { notifications, dismiss, dismissAll } = useRealtimeNotifications(companyId);
    const ref = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); } };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const unread = notifications.length;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((o) => !o)}
                className={`relative p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                title="Notificaciones"
            >
                <Bell size={20} />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
                        style={{ background: '#E63946' }}>
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className={`absolute right-0 top-full mt-2 w-80 rounded-2xl border shadow-2xl z-50 overflow-hidden
                    ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                    {/* Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                        <span className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Notificaciones
                        </span>
                        {unread > 0 && (
                            <button onClick={dismissAll}
                                className={`text-[11px] font-semibold ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                                Limpiar todo
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className={`px-4 py-8 text-center text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                Sin notificaciones nuevas
                            </div>
                        ) : (
                            notifications.map((n) => {
                                const Icon = TYPE_ICON[n.type] ?? Bell;
                                const color = TYPE_COLOR[n.type] ?? '#397B9C';
                                return (
                                    <div key={n.id}
                                        className={`flex items-start gap-3 px-4 py-3 border-b last:border-0 transition-colors ${isDark ? 'border-slate-800 hover:bg-slate-800/40' : 'border-slate-50 hover:bg-slate-50'}`}>
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                                            style={{ background: `${color}18`, color }}>
                                            <Icon size={15} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-[12px] font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{n.title}</p>
                                            <p className={`text-[11px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{n.body}</p>
                                            {n.url && (
                                                <a href={n.url}
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold mt-1"
                                                    style={{ color }}
                                                    onClick={() => setOpen(false)}>
                                                    Ver <ExternalLink size={10} />
                                                </a>
                                            )}
                                        </div>
                                        <button onClick={() => dismiss(n.id)}
                                            className={`p-1 rounded-lg flex-shrink-0 ${isDark ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-100 text-slate-300'}`}>
                                            <X size={12} />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

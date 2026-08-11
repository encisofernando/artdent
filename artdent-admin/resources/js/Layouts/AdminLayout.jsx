import { useEffect, useState } from 'react';
import { useTheme } from '@/Contexts/ThemeContext';
import Sidebar from '@/Components/Sidebar';
import Topbar from '@/Components/Topbar';
import FlashBanner from '@/Components/FlashBanner';

export default function AdminLayout({ title, children }) {
    const { isDark } = useTheme();
    const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

    // Cerrar el sidebar mobile con Escape, mismo criterio que el CRM.
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setSidebarOpenMobile(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <div className={`flex h-dvh overflow-hidden transition-colors duration-300 brand-pattern ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            {/* Sidebar desktop — fijo */}
            <div className="hidden lg:block shrink-0">
                <Sidebar />
            </div>

            {/* Overlay mobile */}
            {sidebarOpenMobile && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpenMobile(false)}
                />
            )}

            {/* Sidebar mobile — drawer off-canvas */}
            <div
                className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden
                    ${sidebarOpenMobile ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <Sidebar onClose={() => setSidebarOpenMobile(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar title={title} onMenuOpen={() => setSidebarOpenMobile(true)} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            <FlashBanner />
        </div>
    );
}

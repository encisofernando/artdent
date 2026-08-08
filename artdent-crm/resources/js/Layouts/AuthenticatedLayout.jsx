import { useState, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import Topbar from '@/Components/Topbar';
import BottomNav from '@/Components/BottomNav';
import { useTheme } from '@/Contexts/ThemeContext';
import ArtieWidget from '@/Components/Artie/ArtieWidget';

export default function AuthenticatedLayout({ user, header, children }) {
  const { auth } = usePage().props;
  const currentUser = user || auth?.user;
  const { isDark } = useTheme();
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // Cerrar el sidebar en mobile si se presiona Escape
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
    <div className={`flex h-dvh overflow-hidden font-sans transition-colors duration-300
      ${isDark ? 'bg-slate-950 text-slate-300' : 'bg-artdent-bg text-slate-800'}
    `}>

      {/* Sidebar Desktop */}
      <div className="hidden lg:block shrink-0 transition-all duration-300">
        <Sidebar />
      </div>

      {/* Overlay Mobile */}
      {sidebarOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpenMobile(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden
                ${sidebarOpenMobile ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <Sidebar className="h-full" />
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar
          user={currentUser}
          onSidebarToggle={() => setSidebarOpenMobile(true)}
        />

        {/* Área de scroll principal */}
        <main className="flex-1 overflow-y-auto">
          {/* Header opcional (retrocompatibilidad con Breeze por defecto) */}
          {header && (
            <header className={`shadow-sm border-b transition-colors
                ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-artdent-border'}
            `}>
              <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {header}
              </div>
            </header>
          )}

          {/* Contenido de la página */}
          <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20 lg:pb-8 w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Bottom navigation — mobile only */}
      <BottomNav onMenuOpen={() => setSidebarOpenMobile(true)} />

      {/* Artie Asistente Premium */}
      <ArtieWidget />
    </div>
  );
}

import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    // Inicializar estado desde localStorage si existe, por defecto claro
    const [isDark, setIsDark] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved === 'dark') return true;
            if (saved === 'light') return false;
            // Opcional: leer preferencia del sistema
            return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('sidebar_collapsed') === 'true';
        }
        return false;
    });

    // Sincronizar tema con document y localStorage
    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    // Sincronizar sidebar collapse con localStorage
    useEffect(() => {
        localStorage.setItem('sidebar_collapsed', sidebarCollapsed.toString());
    }, [sidebarCollapsed]);

    const toggleTheme = () => setIsDark(!isDark);
    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme, sidebarCollapsed, toggleSidebar }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

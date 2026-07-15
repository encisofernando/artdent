import { useTheme } from '@/Contexts/ThemeContext';
import Sidebar from '@/Components/Sidebar';
import Topbar from '@/Components/Topbar';
import FlashBanner from '@/Components/FlashBanner';

export default function AdminLayout({ title, children }) {
    const { isDark } = useTheme();

    return (
        <div className={`flex h-screen overflow-hidden transition-colors duration-300 brand-pattern ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0">
                <Topbar title={title} />

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            <FlashBanner />
        </div>
    );
}

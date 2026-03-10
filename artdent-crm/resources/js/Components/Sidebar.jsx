import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    LayoutDashboard,
    Banknote,
    Users,
    Store,
    BadgeCheck,
    Briefcase,
    Beaker,
    BarChart3,
    Settings,
    ChevronDown,
    ChevronRight,
    Search,
    Receipt,
    List,
    AlignLeft,
    MessageSquare,
    RefreshCcw,
    Truck,
    Key,
} from 'lucide-react';

const NAV_SECTIONS = [
    {
        label: null,
        items: [
            { title: "Panel General", icon: LayoutDashboard, path: "/dashboard" },
        ],
    },
    {
        label: "Gestión",
        items: [
            {
                title: "Ventas", icon: Banknote, key: "ventas",
                children: [
                    { title: "Nueva Venta", path: "/sales/create" },
                    { title: "Lista de Ventas", path: "/sales" },
                    { title: "Facturación", path: "/invoices" },
                    { title: "Artículos", path: "/products" },
                ],
            },
            {
                title: "Clientes", icon: Users, key: "clientes",
                children: [
                    { title: "Lista de Clientes", path: "/customers" },
                    { title: "Cta. Cte.", path: "/ctacte" },
                    { title: "Pagos", path: "/pagoscte" },
                ],
            },
            {
                title: "Proveedores", icon: Store, key: "proveedores",
                children: [
                    { title: "Directorio", path: "/vendors" },
                    { title: "Comprobantes", path: "/proveedores/comprobantes" },
                    { title: "Pagos", path: "/proveedores/pagos" },
                    { title: "Cta. Cte.", path: "/proveedores/ctacte" },
                ],
            },
            {
                title: "Colaboradores", icon: BadgeCheck, key: "colaboradores",
                children: [
                    { title: "Lista", path: "/colaboradores" },
                    { title: "Asistencias", path: "/colaboradores/asistencias" },
                    { title: "Recibos", path: "/colaboradores/recibos" },
                ],
            },
        ],
    },
    {
        label: "Laboratorio",
        items: [
            {
                title: "Órdenes", icon: AlignLeft, key: "lab-ordenes",
                children: [
                    { title: "Nueva Orden", path: "/jobs/create" },
                    { title: "Consultar", path: "/jobs" },
                    { title: "Rehacimientos", path: "/job-remakes" },
                ],
            },
            {
                title: "Clientes / Odont.", icon: Users, key: "lab-clientes",
                children: [
                    { title: "Lista de Odontólogos", path: "/dentists" },
                    { title: "Pacientes", path: "/patients" },
                    { title: "Rutas de Entrega", path: "/dentist-delivery-routes" },
                    { title: "Cuentas Corrientes y Pagos", path: "/lab-account-moves" },
                ],
            },
            { title: "Aranceles y Costos", icon: Banknote, path: "/tariffs" },
        ],
    },
    {
        label: "CRM",
        items: [
            { title: "Interacciones", icon: MessageSquare, path: "/crm-interactions" },
        ],
    },
    {
        label: "Análisis",
        items: [
            { title: "Estadísticas", icon: BarChart3, path: "/estadisticas" },
            { title: "Reportes", icon: Receipt, path: "/reportes" },
            { title: "Operaciones", icon: Search, path: "/operaciones" },
        ],
    },
    {
        label: "Sistema",
        items: [
            {
                title: "Administración", icon: Settings, key: "administracion",
                children: [
                    { title: "Categorías", path: "/categorys" },
                    { title: "Usuarios", path: "/team" },
                    { title: "Empresa", path: "/settings" },
                    { title: "API", path: "/admin/api-tokens" },
                ],
            },
        ],
    },
];

export default function Sidebar({ className = "" }) {
    const { url } = usePage();
    const { sidebarCollapsed, isDark, toggleSidebar } = useTheme();
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (key) => {
        // Al estar colapsado, no permitimos expandir menú de acordeón
        if (sidebarCollapsed) return;
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const isActive = (path) => url.startsWith(path);
    const isAnyChildActive = (children) => children?.some(c => isActive(c.path));

    return (
        <aside
            className={`transition-all duration-300 ease-in-out flex flex-col h-screen shadow-xl z-20 shrink-0
            ${isDark ? 'bg-slate-900 border-r border-slate-800 text-slate-300'
                    : 'bg-white border-r border-slate-200 text-slate-600'}
            ${sidebarCollapsed ? 'w-20' : 'w-64'} 
            ${className}`}
        >
            {/* Logo Header */}
            <div className={`h-16 flex items-center border-b shrink-0 px-4 transition-colors relative
                ${isDark ? 'border-slate-800' : 'border-slate-100'}
                ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
            >
                {!sidebarCollapsed ? (
                    <img
                        src={isDark ? "/assets/logo-artdent-blanco.png" : "/assets/logo-artdent-color.png"}
                        alt="ArtDent"
                        className="h-8 object-contain transition-all"
                    />
                ) : (
                    <img
                        src="/assets/logo-artdent-icon.png"
                        alt="AD"
                        className="h-8 w-8 rounded-md object-cover transition-all"
                    />
                )}

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={toggleSidebar}
                    className={`hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full items-center justify-center border shadow-sm transition-colors z-50
                        ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900'}
                    `}
                >
                    <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${!sidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-slate-700">
                <nav className="space-y-6">
                    {NAV_SECTIONS.map((section, idx) => (
                        <div key={idx} className={sidebarCollapsed ? "px-2" : "px-3"}>
                            {!sidebarCollapsed && section.label && (
                                <h3 className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    {section.label}
                                </h3>
                            )}
                            <ul className="space-y-1">
                                {section.items.map((item) => {
                                    const expanded = openMenus[item.key] || isAnyChildActive(item.children);
                                    const activeNode = isActive(item.path) || isAnyChildActive(item.children);

                                    if (item.children) {
                                        return (
                                            <li key={item.key}>
                                                <button
                                                    onClick={() => toggleMenu(item.key)}
                                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors 
                                                        ${sidebarCollapsed ? 'justify-center' : 'justify-between'}
                                                        ${activeNode ? (isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-emerald-600')
                                                            : (isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-50 hover:text-emerald-700')}`}
                                                    title={sidebarCollapsed ? item.title : undefined}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <item.icon className={`h-5 w-5 shrink-0 ${activeNode ? 'text-emerald-400' : 'text-slate-400'}`} />
                                                        {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                                                    </div>
                                                    {!sidebarCollapsed && (expanded ? <ChevronDown className="h-4 w-4 opacity-50 shrink-0" /> : <ChevronRight className="h-4 w-4 opacity-50 shrink-0" />)}
                                                </button>

                                                {/* Children */}
                                                {expanded && !sidebarCollapsed && (
                                                    <ul className="mt-1 ml-4 pl-4 border-l border-slate-700 space-y-1">
                                                        {item.children.map(child => {
                                                            const childActive = isActive(child.path);
                                                            return (
                                                                <li key={child.path}>
                                                                    <Link
                                                                        href={child.path}
                                                                        className={`block px-3 py-2 text-sm rounded-md transition-colors truncate
                                                                            ${childActive ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-600 hover:bg-slate-50 hover:text-emerald-700')}`}
                                                                    >
                                                                        {child.title}
                                                                    </Link>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                )}
                                            </li>
                                        )
                                    }

                                    return (
                                        <li key={item.path}>
                                            <Link
                                                href={item.path}
                                                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors relative
                                                    ${sidebarCollapsed ? 'justify-center' : ''}
                                                    ${isActive(item.path) ? (isDark ? 'bg-slate-800 text-white' : 'bg-slate-100 text-emerald-600')
                                                        : (isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-50 hover:text-emerald-700')}`}
                                                title={sidebarCollapsed ? item.title : undefined}
                                            >
                                                {isActive(item.path) && (
                                                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r-md"></div>
                                                )}
                                                <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path) ? 'text-emerald-400' : 'text-slate-400'}`} />
                                                {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Footer */}
            {!sidebarCollapsed && (
                <div className="p-4 border-t border-slate-800 shrink-0">
                    <p className="text-xs text-slate-500 text-center truncate">
                        © {new Date().getFullYear()} ArtDent
                    </p>
                </div>
            )}
        </aside>
    );
}

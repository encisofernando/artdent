import { useState, useRef } from 'react';
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
    ShoppingCart,
    CreditCard,
    Bot,
    Landmark,
    Printer,
} from 'lucide-react';

export default function Sidebar({ className = "" }) {
    const { url, props } = usePage();
    const auth = props.auth;
    const billingEnabled = props.app_context?.billing_enabled !== false;

    const NAV_SECTIONS = [
        {
            label: null,
            items: [
                {
                    title: "Panel General",
                    icon: LayoutDashboard,
                    path: "/dashboard",
                    permission: ['products.view', 'customers.view', 'orders.view', 'ecommerce.view', 'reports.view', 'settings.edit', 'staff.view'],
                },
            ],
        },
        {
            label: "Gestión",
            items: [
                {
                    title: "Ventas", icon: Banknote, key: "ventas",
                    permission: 'products.view',
                    children: [
                        { title: "Nueva Venta", path: "/sales/create", permission: 'products.create' },
                        { title: "Lista de Ventas", path: "/sales" },
                        { title: "Presupuesto", path: "/quotes" },
                        { title: "Artículos", path: "/products" },
                        { title: "Etiquetas / Códigos", path: "/barcode-labels", permission: 'products.view' },
                    ],
                },
                {
                    title: "Clientes", icon: Users, key: "clientes",
                    permission: 'customers.view',
                    children: [
                        { title: "Lista de Clientes", path: "/customers" },
                        { title: "Cuentas Corrientes", path: "/customers-accounts" },
                    ],
                },
                {
                    title: "Proveedores", icon: Store, key: "proveedores",
                    permission: 'customers.view',
                    children: [
                        { title: "Directorio", path: "/vendors" },
                        { title: "Comprobantes", path: "/proveedores/comprobantes" },
                        { title: "Pagos", path: "/proveedores/pagos" },
                        { title: "Cta. Cte.", path: "/proveedores/ctacte" },
                    ],
                },

            ],
        },
            {
            label: "E-commerce",
            items: [
                {
                    title: "E-commerce", icon: ShoppingCart, key: "ecommerce",
                    permission: 'ecommerce.view',
                    children: [
                        { title: "Pedidos", path: "/ecommerce-orders" },
                        { title: "Cupones", path: "/coupons", permission: 'ecommerce.edit' },
                        { title: "Ofertas", path: "/offers", permission: 'ecommerce.edit' },
                        { title: "Carrusel Hero", path: "/hero-slides", permission: 'ecommerce.edit' },
                        { title: "Banners Sidebar", path: "/sidebar-banners", permission: 'ecommerce.edit' },
                        { title: "Reseñas", path: "/reviews" },
                        { title: "Puntos de Retiro", path: "/shipping-pickup-points", permission: 'ecommerce.edit' },
                        { title: "Moto Mandados", path: "/shipping-moto-companies", permission: 'ecommerce.edit' },
                        { title: "Métodos de Pago", path: "/ecommerce-payment-configs", permission: 'settings.edit' },
                        { title: "Reportes MP", path: "/ecommerce-reports", permission: 'reports.view' },
                    ],
                },
            ],
        },
        {
            label: "Laboratorio",
            items: [
                {
                    title: "Órdenes", icon: AlignLeft, key: "lab-ordenes",
                    permission: 'orders.view',
                    children: [
                        { title: "Nueva Orden", path: "/jobs/create", permission: 'orders.create' },
                        { title: "Consultar", path: "/jobs" },
                        { title: "Rehacimientos", path: "/job-remakes", permission: 'orders.edit' },
                    ],
                },
                {
                    title: "Clientes / Odont.", icon: Users, key: "lab-clientes",
                    permission: 'customers.view',
                    children: [
                        { title: "Lista de Odontólogos", path: "/dentists" },
                        { title: "Pacientes", path: "/patients" },
                        { title: "Rutas de Entrega", path: "/dentist-delivery-routes", permission: 'customers.edit' },
                        { title: "Cuentas Corrientes y Pagos", path: "/lab-account-moves", permission: 'orders.edit' },
                        { title: "Ingresos y Egresos", path: "/lab-finance", permission: 'orders.view' },
                    ],
                },
                { title: "Aranceles y Costos", icon: Banknote, path: "/tariffs", permission: 'products.view' },
                { title: "Analítica Lab", icon: BarChart3, path: "/analytics/lab", permission: 'reports.view' },
                {
                    title: "Colaboradores", icon: BadgeCheck, key: "colaboradores",
                    permission: 'staff.view',
                    children: [
                        { title: "Lista", path: "/collaborators" },
                        { title: "Asistencias", path: "/collaborator-attendances" },
                        { title: "Extras", path: "/collaborator-extras", permission: 'staff.view' },
                        { title: "Descuentos", path: "/collaborator-discounts", permission: 'staff.view' },
                        { title: "Recibos", path: "/collaborator-receipts", permission: 'staff.edit' },
                        { title: "Kiosk de Fichaje", path: "/attendance-kiosk", external: true },
                        { title: "Portal Técnicos", path: "/colaboradores", external: true },
                    ],
                },
            ],
        },

        {
            label: "Contable",
            items: [
                {
                    title: "Contable", icon: Landmark, key: "contable",
                    permission: 'accounting.view',
                    children: [
                        { title: "Panel contable", path: "/contable" },
                        { title: "Libro IVA Ventas", path: "/export/iva-ventas", external: true },
                        { title: "Libro IVA Compras", path: "/export/iva-compras", external: true },
                        { title: "Estado de Resultados", path: "/export/income-statement", external: true },
                    ],
                },
            ],
        },
        {
            label: "CRM",
            items: [
                { title: "Asistente Artie", icon: Bot, path: "/crm/chatbot", permission: 'customers.view' },
                { title: "Interacciones", icon: MessageSquare, path: "/crm-interactions", permission: 'customers.view' },
            ],
        },
        {
            label: "Análisis",
            items: [
                { title: "Estadísticas", icon: BarChart3, path: "/estadisticas", permission: 'reports.view' },
                { title: "Reportes", icon: Receipt, path: "/reportes", permission: 'reports.view' },
                { title: "Operaciones", icon: Search, path: "/operaciones", permission: 'reports.view' },
            ],
        },
        {
            label: "Sistema",
            items: [
                {
                    title: "Administración", icon: Settings, key: "administracion",
                    permission: 'settings.edit',
                    children: [
                        { title: "Categorías", path: "/categorys", permission: 'products.edit' },
                        { title: "Usuarios", path: "/users", permission: 'users.view' },
                        { title: "Roles y Permisos", path: "/roles", permission: 'roles.view' },
                        { title: "Empresa", path: "/settings", permission: 'settings.edit' },
                        { title: "Impresión", path: "/settings?tab=preferencias", permission: 'settings.edit' },
                        { title: "API", path: "/admin/api-tokens", permission: 'settings.edit' },
                        ...(billingEnabled ? [{ title: "Suscripción", path: "/subscription", permission: 'settings.edit' }] : []),
                    ],
                },
            ],
        },
    ];

    const { sidebarCollapsed, isDark, toggleSidebar } = useTheme();
    const [openMenus, setOpenMenus] = useState({});
    const [flyout, setFlyout] = useState(null); // { key, top, item }
    const flyoutRef = useRef(null);

    const hasPermission = (permission) => {
        if (!permission) return true;
        if (auth.user.is_super_admin) return true;
        if (Array.isArray(permission)) {
            return permission.some(item => auth.user.permissions?.includes(item));
        }
        return auth.user.permissions?.includes(permission);
    };

    const toggleMenu = (key) => {
        if (sidebarCollapsed) return;
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const isActive = (path) => url.startsWith(path);
    const isAnyChildActive = (children) => children?.some(c => isActive(c.path));

    return (
        <aside
            className={`transition-all duration-300 ease-in-out flex flex-col h-screen shadow-xl z-20 shrink-0
            ${isDark ? 'bg-slate-900 border-r border-slate-800 text-slate-300'
                    : 'bg-[#397B9C] border-r border-[#2D6585] text-white'}
            ${sidebarCollapsed ? 'w-20' : 'w-64'}
            ${className}`}
        >
            {/* Logo Header */}
            <div className={`h-16 flex items-center border-b shrink-0 px-4 transition-colors relative
                ${isDark ? 'border-slate-800' : 'border-white/20'}
                ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}
            >
                {!sidebarCollapsed ? (
                    <img
                        src="/assets/logo-artdent-blanco.png"
                        alt="ArtDent"
                        className="h-8 object-contain transition-all"
                    />
                ) : (
                    <img
                        src="/assets/logo-artdent-icon.png"
                        alt="AD"
                        className="h-8 w-8 rounded-md object-contain transition-all"
                        style={{ filter: 'brightness(0) invert(1)' }}
                    />
                )}

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={toggleSidebar}
                    className={`hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full items-center justify-center border shadow-sm transition-colors z-50
                        ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                            : 'bg-[#2D6585] border-white/30 text-white/70 hover:text-white'}
                    `}
                >
                    <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${!sidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 scrollbar-thin scrollbar-thumb-slate-700">
                <nav className="space-y-6">
                    {NAV_SECTIONS.map((section, idx) => {
                        // Filter items based on permissions
                        const visibleItems = section.items.filter(item => hasPermission(item.permission));
                        
                        if (visibleItems.length === 0) return null;

                        return (
                            <div key={idx} className={sidebarCollapsed ? "px-2" : "px-3"}>
                                {!sidebarCollapsed && section.label && (
                                    <h3 className={`px-3 text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-slate-500' : 'text-[#ACD6CE]'}`}>
                                        {section.label}
                                    </h3>
                                )}
                                <ul className="space-y-1">
                                    {visibleItems.map((item) => {
                                        const expanded = openMenus[item.key] || isAnyChildActive(item.children);
                                        const activeNode = isActive(item.path) || isAnyChildActive(item.children);

                                        if (item.children) {
                                            const visibleChildren = item.children.filter(child => hasPermission(child.permission));
                                            
                                            if (visibleChildren.length === 0 && !item.path) return null;

                                            return (
                                                <li key={item.key}>
                                                    <button
                                                        onClick={() => toggleMenu(item.key)}
                                                        onMouseEnter={sidebarCollapsed ? (e) => {
                                                            const rect = e.currentTarget.getBoundingClientRect();
                                                            setFlyout({ key: item.key, top: rect.top, item, visibleChildren });
                                                        } : undefined}
                                                        onMouseLeave={sidebarCollapsed ? () => {
                                                            setTimeout(() => {
                                                                if (!flyoutRef.current?.matches(':hover')) setFlyout(null);
                                                            }, 80);
                                                        } : undefined}
                                                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                                                            ${sidebarCollapsed ? 'justify-center' : 'justify-between'}
                                                            ${activeNode ? (isDark ? 'bg-slate-800 text-white' : 'bg-white/20 text-white')
                                                                : (isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-white/15 hover:text-white')}`}
                                                        title={sidebarCollapsed ? item.title : undefined}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <item.icon className={`h-5 w-5 shrink-0 ${activeNode ? (isDark ? 'text-emerald-400' : 'text-[#ACD6CE]') : (isDark ? 'text-slate-400' : 'text-white/60')}`} />
                                                            {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                                                        </div>
                                                        {!sidebarCollapsed && (expanded ? <ChevronDown className="h-4 w-4 opacity-50 shrink-0" /> : <ChevronRight className="h-4 w-4 opacity-50 shrink-0" />)}
                                                    </button>

                                                    {/* Children */}
                                                    {expanded && !sidebarCollapsed && (
                                                        <ul className={`mt-1 ml-4 pl-4 border-l space-y-1 ${isDark ? 'border-slate-700' : 'border-white/20'}`}>
                                                            {visibleChildren.map(child => {
                                                                const childActive = isActive(child.path);
                                                                const childClass = `block px-3 py-2 text-sm rounded-md transition-colors truncate
                                                                    ${childActive ? (isDark ? 'bg-emerald-500/10 text-emerald-500 font-semibold' : 'bg-white/20 text-white font-semibold') : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-white/70 hover:bg-white/10 hover:text-white')}`;
                                                                return (
                                                                    <li key={child.path}>
                                                                        {child.external ? (
                                                                            <a href={child.path} target="_blank" rel="noopener noreferrer" className={childClass}>
                                                                                {child.title}
                                                                            </a>
                                                                        ) : (
                                                                            <Link href={child.path} className={childClass}>
                                                                                {child.title}
                                                                            </Link>
                                                                        )}
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
                                                    onMouseEnter={sidebarCollapsed ? (e) => {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setFlyout({ key: item.path, top: rect.top, item, visibleChildren: null });
                                                    } : undefined}
                                                    onMouseLeave={sidebarCollapsed ? () => setFlyout(null) : undefined}
                                                    className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors relative
                                                        ${sidebarCollapsed ? 'justify-center' : ''}
                                                        ${isActive(item.path) ? (isDark ? 'bg-slate-800 text-white' : 'bg-white/20 text-white')
                                                            : (isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-white/15 hover:text-white')}`}
                                                    title={sidebarCollapsed ? item.title : undefined}
                                                >
                                                    {isActive(item.path) && (
                                                        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-emerald-500"></div>
                                                    )}
                                                    <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path) ? (isDark ? 'text-emerald-500' : 'text-[#ACD6CE]') : (isDark ? 'text-slate-400' : 'text-white/60')}`} />
                                                    {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </nav>
            </div>

            {/* Fly-out panel (collapsed mode hover) */}
            {sidebarCollapsed && flyout && (
                <div
                    ref={flyoutRef}
                    className="fixed z-[200] pointer-events-auto"
                    style={{ top: flyout.top, left: 80 }}
                    onMouseEnter={() => setFlyout(f => f)}
                    onMouseLeave={() => setFlyout(null)}
                >
                    <div className={`rounded-r-lg shadow-2xl min-w-[200px] py-1 overflow-hidden
                        ${isDark ? 'bg-slate-800 border border-l-0 border-slate-700' : 'bg-[#2D6585] border border-l-0 border-[#1E4F6A]'}`}
                    >
                        <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b
                            ${isDark ? 'text-slate-400 border-slate-700' : 'text-[#ACD6CE] border-white/20'}`}>
                            {flyout.item.title}
                        </div>
                        {flyout.visibleChildren ? (
                            <ul className="py-1">
                                {flyout.visibleChildren.map(child => (
                                    <li key={child.path}>
                                        {child.external ? (
                                            <a
                                                href={child.path}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`block px-4 py-2 text-sm transition-colors
                                                    ${isActive(child.path)
                                                        ? (isDark ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'bg-white/20 text-white font-semibold')
                                                        : (isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-white/80 hover:bg-white/15 hover:text-white')}`}
                                            >
                                                {child.title}
                                            </a>
                                        ) : (
                                            <Link
                                                href={child.path}
                                                onClick={() => setFlyout(null)}
                                                className={`block px-4 py-2 text-sm transition-colors
                                                    ${isActive(child.path)
                                                        ? (isDark ? 'bg-emerald-500/10 text-emerald-400 font-semibold' : 'bg-white/20 text-white font-semibold')
                                                        : (isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-white/80 hover:bg-white/15 hover:text-white')}`}
                                            >
                                                {child.title}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <Link
                                href={flyout.item.path}
                                onClick={() => setFlyout(null)}
                                className={`block px-4 py-2 text-sm transition-colors
                                    ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'}`}
                            >
                                Ir a {flyout.item.title}
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            {!sidebarCollapsed && (
                <div className={`p-4 border-t shrink-0 ${isDark ? 'border-slate-800' : 'border-white/20'}`}>
                    <p className={`text-xs text-center truncate ${isDark ? 'text-slate-500' : 'text-white/40'}`}>
                        © {new Date().getFullYear()} ArtDent
                    </p>
                </div>
            )}
        </aside>
    );
}

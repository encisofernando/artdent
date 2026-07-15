import { useState, useRef } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import {
    LayoutDashboard,
    Banknote,
    Users,
    Building2,
    BadgeCheck,
    BarChart3,
    Settings,
    ChevronDown,
    ChevronRight,
    Search,
    Receipt,
    MessageSquare,
    ShoppingCart,
    Bot,
    Landmark,
    Package,
    Wallet,
    UserCheck,
    ClipboardList,
    Stethoscope,
    DollarSign,
    TrendingUp,
    CalendarCheck,
    GraduationCap,
    Fingerprint,
    Factory,
    Cpu,
    History,
    LifeBuoy,
    Layers,
} from 'lucide-react';

export default function Sidebar({ className = "" }) {
    const { url, props } = usePage();
    const auth = props.auth;
    const billingEnabled = props.app_context?.billing_enabled !== false;
    const enabledModules = props.enabled_modules || [];

    const NAV_SECTIONS = [
        {
            label: null,
            items: [
                {
                    title: "Panel General",
                    icon: LayoutDashboard,
                    path: "/dashboard",
                    permission: ['sales.view', 'products.view', 'customers.view', 'orders.view', 'ecommerce.view', 'reports.view', 'settings.edit', 'staff.view', 'inventory.view', 'purchases.view', 'accounting.view'],
                },
            ],
        },
        {
            label: "Ventas",
            items: [
                {
                    title: "Ventas", icon: Banknote, key: "ventas",
                    permission: 'sales.view',
                    children: [
                        { title: "Nueva Venta", path: "/sales/create", permission: 'sales.create' },
                        { title: "Ventas", path: "/sales" },
                        { title: "Presupuestos", path: "/quotes" },
                        { title: "Artículos", path: "/products", permission: 'products.view' },
                        { title: "Etiquetas / Códigos", path: "/barcode-labels", permission: 'products.view' },
                    ],
                },
                {
                    title: "Clientes", icon: Users, key: "clientes",
                    permission: 'customers.view', module: 'clientes',
                    children: [
                        { title: "Clientes", path: "/customers" },
                        { title: "Cuentas Corrientes", path: "/customers-accounts" },
                    ],
                },
                {
                    title: "Proveedores", icon: Building2, key: "proveedores",
                    permission: 'purchases.view',
                    children: [
                        { title: "Proveedores", path: "/vendors" },
                        { title: "Comprobantes", path: "/proveedores/comprobantes" },
                        { title: "Pagos", path: "/proveedores/pagos" },
                        { title: "Cuenta Corriente", path: "/proveedores/ctacte" },
                    ],
                },
                {
                    title: "Inventario", icon: Package, key: "inventario",
                    permission: 'inventory.view', module: 'insumos',
                    children: [
                        { title: "Stock", path: "/stocks" },
                        { title: "Depósitos", path: "/warehouses" },
                        { title: "Movimientos", path: "/stock-movements" },
                        { title: "Retiros de Insumos", path: "/lab-withdrawals", permission: 'inventory.manage' },
                        { title: "Categorías", path: "/categorys", permission: 'products.edit' },
                    ],
                },
            ],
        },
        {
            label: "E-Commerce",
            items: [
                {
                    title: "Tienda Online", icon: ShoppingCart, key: "ecommerce",
                    permission: 'ecommerce.view', module: 'ecommerce',
                    children: [
                        { title: "Pedidos", path: "/ecommerce-orders" },
                        { title: "Cupones", path: "/coupons", permission: 'ecommerce.edit' },
                        { title: "Ofertas", path: "/offers", permission: 'ecommerce.edit' },
                        { title: "Carrusel Hero", path: "/hero-slides", permission: 'ecommerce.edit' },
                        { title: "Banners", path: "/sidebar-banners", permission: 'ecommerce.edit' },
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
                    title: "Órdenes", icon: ClipboardList, key: "lab-ordenes",
                    permission: 'orders.view', module: 'laboratorio',
                    children: [
                        { title: "Nueva Orden", path: "/jobs/create", permission: 'orders.create' },
                        { title: "Consultar", path: "/jobs" },
                        { title: "Rehacimientos", path: "/job-remakes", permission: 'orders.edit' },
                    ],
                },
                {
                    title: "Odontólogos", icon: Stethoscope, key: "lab-clientes",
                    permission: 'customers.view', module: ['laboratorio', 'clinica'],
                    children: [
                        { title: "Odontólogos", path: "/dentists", module: 'laboratorio' },
                        { title: "Pacientes", path: "/patients", module: 'clinica' },
                        { title: "Rutas de Entrega", path: "/dentist-delivery-routes", permission: 'customers.edit', module: 'laboratorio' },
                        { title: "Remitos de Entrega", path: "/remitos", permission: 'orders.edit', module: 'laboratorio' },
                        { title: "Cuentas Corrientes", path: "/lab-account-moves", permission: 'orders.edit', module: 'laboratorio' },
                        { title: "Ingresos y Egresos", path: "/lab-finance", permission: 'orders.view', module: 'laboratorio' },
                    ],
                },
                { title: "Aranceles y Costos", icon: DollarSign, path: "/tariffs", permission: 'products.view', module: 'laboratorio' },
                { title: "Catálogo de Fases", icon: Layers, path: "/phase-templates", permission: 'products.view', module: 'laboratorio' },
            ],
        },
        {
            label: "Personal",
            items: [
                {
                    title: "Colaboradores", icon: BadgeCheck, key: "colaboradores",
                    permission: 'staff.view', module: 'rrhh',
                    children: [
                        { title: "Colaboradores", path: "/collaborators" },
                        { title: "Asistencias", path: "/collaborator-attendances" },
                        { title: "Extras", path: "/collaborator-extras" },
                        { title: "Descuentos", path: "/collaborator-discounts" },
                        { title: "Recibos", path: "/collaborator-receipts", permission: 'staff.edit' },
                    ],
                },
                {
                    title: "Empleados", icon: UserCheck, key: "personal",
                    permission: 'staff.view', module: 'rrhh',
                    children: [
                        { title: "Empleados", path: "/employees" },
                        { title: "Organigrama", path: "/organigrama" },
                        { title: "Convenios Colectivos", path: "/convenios" },
                    ],
                },
                {
                    title: "Liquidación de Sueldos", icon: DollarSign, key: "liquidacion",
                    permission: 'staff.view', module: 'rrhh',
                    children: [
                        { title: "Motor de Fórmulas", path: "/conceptos" },
                        { title: "Liquidaciones", path: "/payroll-runs", permission: 'staff.edit' },
                        { title: "Recibos", path: "/employee-receipts", permission: 'staff.edit' },
                        { title: "Extras", path: "/employee-extras" },
                        { title: "Descuentos", path: "/employee-discounts" },
                        { title: "Reportes RRHH", path: "/reportes-rrhh", permission: 'reports.view' },
                        { title: "Libro de Sueldos Digital", path: "/libro-sueldos-digital", permission: 'rrhh.liquidaciones.approve' },
                    ],
                },
                {
                    title: "Asistencia y Licencias", icon: CalendarCheck, key: "asistencia-empleados",
                    permission: 'staff.view', module: 'rrhh',
                    children: [
                        { title: "Asistencias", path: "/employee-attendances" },
                        { title: "Vacaciones y Licencias", path: "/vacaciones" },
                        { title: "Medicina Laboral", path: "/medicina-laboral" },
                    ],
                },
                {
                    title: "Desarrollo y Capacitación", icon: GraduationCap, key: "desarrollo",
                    permission: 'staff.view', module: 'rrhh',
                    children: [
                        { title: "Evaluaciones", path: "/evaluaciones" },
                        { title: "Capacitaciones", path: "/capacitaciones" },
                    ],
                },
            ],
        },
        {
            label: "Accesos y Kiosks",
            items: [
                { title: "Mi Portal", icon: UserCheck, path: "/portal", module: 'rrhh' },
                { title: "Kiosk de Fichaje", icon: Fingerprint, path: "/attendance-kiosk", module: 'rrhh', external: true },
                { title: "Kiosk de Producción", icon: Factory, path: "/job-kiosk", module: 'laboratorio', external: true },
                { title: "Terminales HikVision", icon: Cpu, path: "/hikvision/devices", permission: 'staff.edit', module: 'rrhh' },
                { title: "Eventos Biométricos", icon: History, path: "/hikvision/events", permission: 'staff.edit', module: 'rrhh' },
                { title: "Ayuda", icon: LifeBuoy, path: "/ayuda" },
                { title: "Soporte", icon: MessageSquare, path: "/soporte" },
            ],
        },
        {
            label: "Finanzas",
            items: [
                {
                    title: "Contable", icon: Landmark, key: "contable",
                    permission: 'accounting.view', module: 'contabilidad',
                    children: [
                        { title: "Panel", path: "/contable" },
                        { title: "Libro IVA Ventas", path: "/export/iva-ventas", external: true },
                        { title: "Libro IVA Compras", path: "/export/iva-compras", external: true },
                        { title: "Estado de Resultados", path: "/export/income-statement", external: true },
                    ],
                },
                {
                    title: "Caja", icon: Wallet, key: "caja",
                    permission: 'reports.view', module: 'finanzas',
                    children: [
                        { title: "Caja", path: "/cash-sessions" },
                        { title: "Administrar Cajas", path: "/cash-drawers", permission: 'reports.create' },
                    ],
                },
            ],
        },
        {
            label: "CRM",
            items: [
                { title: "Artie", icon: Bot, path: "/crm/chatbot", permission: 'customers.view', module: 'laboratorio' },
                { title: "Interacciones", icon: MessageSquare, path: "/crm-interactions", permission: 'customers.view', module: 'laboratorio' },
            ],
        },
        {
            label: "Análisis",
            items: [
                { title: "Analítica Lab", icon: BarChart3, path: "/analytics/lab", permission: 'reports.view', module: 'laboratorio' },
                { title: "Estadísticas", icon: TrendingUp, path: "/estadisticas", permission: 'reports.view' },
                { title: "Reportes", icon: Receipt, path: "/reportes", permission: 'reports.view', module: 'reportes' },
                { title: "Costos y Ganancias", icon: DollarSign, path: "/reportes/costos-ganancias", permission: 'reports.view', module: 'reportes' },
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
                        { title: "Usuarios", path: "/users", permission: 'users.view' },
                        { title: "Roles y Permisos", path: "/roles", permission: 'roles.view' },
                        { title: "Auditoría", path: "/audit-logs", permission: 'settings.edit' },
                        { title: "Empresa", path: "/settings", permission: 'settings.edit' },
                        { title: "Impresión", path: "/settings?tab=preferencias", permission: 'settings.edit' },
                        { title: "Acceso Kiosk", path: "/admin/kiosk-access", permission: 'settings.edit', module: ['laboratorio', 'rrhh'] },
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

    // Backend (TenantModuleResolver) es la única fuente de verdad de qué
    // módulos tiene el tenant — esto sólo refleja esa lista en el menú.
    const hasModule = (module) => {
        if (!module) return true;
        if (Array.isArray(module)) {
            return module.some(m => enabledModules.includes(m));
        }
        return enabledModules.includes(module);
    };

    const isVisible = (node) => hasPermission(node.permission) && hasModule(node.module);

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
                        // Filter items based on permissions and contracted modules
                        const visibleItems = section.items.filter(isVisible);
                        
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
                                            const visibleChildren = item.children.filter(isVisible);
                                            
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

                                        const flatItemClass = `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors relative
                                            ${sidebarCollapsed ? 'justify-center' : ''}
                                            ${isActive(item.path) ? (isDark ? 'bg-slate-800 text-white' : 'bg-white/20 text-white')
                                                : (isDark ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-white/15 hover:text-white')}`;
                                        const flatItemContent = (
                                            <>
                                                {isActive(item.path) && (
                                                    <div className="absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-md bg-emerald-500"></div>
                                                )}
                                                <item.icon className={`h-5 w-5 shrink-0 ${isActive(item.path) ? (isDark ? 'text-emerald-500' : 'text-[#ACD6CE]') : (isDark ? 'text-slate-400' : 'text-white/60')}`} />
                                                {!sidebarCollapsed && <span className="truncate">{item.title}</span>}
                                            </>
                                        );
                                        const flatItemHoverProps = {
                                            onMouseEnter: sidebarCollapsed ? (e) => {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setFlyout({ key: item.path, top: rect.top, item, visibleChildren: null });
                                            } : undefined,
                                            onMouseLeave: sidebarCollapsed ? () => setFlyout(null) : undefined,
                                        };

                                        return (
                                            <li key={item.path}>
                                                {item.external ? (
                                                    <a
                                                        href={item.path}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        {...flatItemHoverProps}
                                                        className={flatItemClass}
                                                        title={sidebarCollapsed ? item.title : undefined}
                                                    >
                                                        {flatItemContent}
                                                    </a>
                                                ) : (
                                                    <Link
                                                        href={item.path}
                                                        {...flatItemHoverProps}
                                                        className={flatItemClass}
                                                        title={sidebarCollapsed ? item.title : undefined}
                                                    >
                                                        {flatItemContent}
                                                    </Link>
                                                )}
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
                        ) : flyout.item.external ? (
                            <a
                                href={flyout.item.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setFlyout(null)}
                                className={`block px-4 py-2 text-sm transition-colors
                                    ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-white/80 hover:bg-white/15 hover:text-white'}`}
                            >
                                Ir a {flyout.item.title}
                            </a>
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

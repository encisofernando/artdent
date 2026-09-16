import { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { useConfirm } from '@/Contexts/ConfirmContext';
import {
    Shield, Plus, Edit2, Trash2, CheckCircle2, 
    XCircle, Lock, Save, Sparkles, Search,
    CreditCard, ShoppingBag, Package, Receipt,
    UserCheck, RotateCcw, CheckCheck, X
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogDescription, DialogFooter 
} from '@/Components/ui/dialog';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

const MODULE_GROUPS = [
    {
        category: 'Punto de Venta & Comercial',
        modules: [
            {
                key: 'sales',
                name: 'Ventas y Mostrador (POS)',
                description: 'Acceso al punto de venta, emisión de tickets y comprobantes.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar / Anular' },
                    { key: 'pay', label: 'Cobrar en Caja', special: true },
                ],
            },
            {
                key: 'cash-register',
                name: 'Cajas y Turnos de Cobro',
                description: 'Apertura y cierre de turnos, arqueo y retiro de efectivo.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'operate', label: 'Operar Turno / Caja', special: true },
                ],
            },
            {
                key: 'customers',
                name: 'Clientes y Pacientes',
                description: 'Fichas de clientes, historial de compras y cuentas corrientes.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                ],
            },
            {
                key: 'ecommerce',
                name: 'Tienda Online / E-commerce',
                description: 'Gestión de pedidos web, carritos y publicaciones.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                ],
            },
        ],
    },
    {
        category: 'Catálogo, Almacén & Proveedores',
        modules: [
            {
                key: 'products',
                name: 'Artículos y Catálogo',
                description: 'Precios, códigos de barra, categorías y lista de productos.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                ],
            },
            {
                key: 'inventory',
                name: 'Stock e Inventario',
                description: 'Stock por sucursal, auditoría y movimientos.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                    { key: 'manage', label: 'Ajustes de Stock', special: true },
                ],
            },
            {
                key: 'purchases',
                name: 'Compras y Proveedores',
                description: 'Ingreso de mercadería, facturas de compras y cuentas a pagar.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                ],
            },
            {
                key: 'orders',
                name: 'Órdenes de Trabajo / Lab',
                description: 'Seguimiento de órdenes y trabajos técnicos.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                ],
            },
        ],
    },
    {
        category: 'Finanzas & Administración',
        modules: [
            {
                key: 'accounting',
                name: 'Facturación & Contabilidad',
                description: 'Libros fiscales, IVA ventas/compras y asientos contables.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                ],
            },
            {
                key: 'reports',
                name: 'Reportes y Estadísticas',
                description: 'Métricas comerciales, rentabilidad y ventas por período.',
                actions: [
                    { key: 'view', label: 'Ver' },
                ],
            },
            {
                key: 'users',
                name: 'Usuarios del Sistema',
                description: 'Cuentas de acceso, contraseñas y asignación de roles.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                ],
            },
            {
                key: 'roles',
                name: 'Roles y Permisos',
                description: 'Configuración de perfiles y matriz de acceso.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                ],
            },
            {
                key: 'staff',
                name: 'Personal & Empleados',
                description: 'Legajos de empleados y comisiones.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                ],
            },
            {
                key: 'branches',
                name: 'Sucursales / Locales',
                description: 'Configuración de puntos de venta y sucursales físicas.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'create', label: 'Crear' },
                    { key: 'edit', label: 'Editar' },
                    { key: 'delete', label: 'Eliminar' },
                ],
            },
            {
                key: 'companies',
                name: 'Multi-Empresa',
                description: 'Cambio y navegación entre empresas.',
                actions: [
                    { key: 'switch', label: 'Cambiar Empresa', special: true },
                ],
            },
            {
                key: 'settings',
                name: 'Configuración General',
                description: 'Parámetros del sistema, AFIP, impresoras y opciones generales.',
                actions: [
                    { key: 'view', label: 'Ver' },
                    { key: 'edit', label: 'Editar' },
                ],
            },
        ],
    },
];

const PRESETS = [
    {
        id: 'cajero',
        name: 'Cajero / POS',
        desc: 'Ventas, cobros y arqueo de caja',
        Icon: CreditCard,
        color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
        permissions: [
            'sales.view', 'sales.create', 'sales.pay',
            'cash-register.view', 'cash-register.operate',
            'products.view',
            'customers.view', 'customers.create',
        ],
    },
    {
        id: 'vendedor',
        name: 'Vendedor',
        desc: 'Ventas, presupuestos y clientes',
        Icon: ShoppingBag,
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
        permissions: [
            'sales.view', 'sales.create',
            'customers.view', 'customers.create', 'customers.edit',
            'products.view',
            'ecommerce.view',
            'reports.view',
        ],
    },
    {
        id: 'deposito',
        name: 'Depósito / Stock',
        desc: 'Inventario, catálogo y compras',
        Icon: Package,
        color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
        permissions: [
            'inventory.view', 'inventory.create', 'inventory.edit', 'inventory.manage',
            'products.view', 'products.edit',
            'purchases.view', 'purchases.create',
            'branches.view',
            'reports.view',
        ],
    },
    {
        id: 'contador',
        name: 'Contador',
        desc: 'Facturación, IVA y reportes',
        Icon: Receipt,
        color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
        permissions: [
            'accounting.view', 'accounting.create', 'accounting.edit',
            'reports.view',
        ],
    },
    {
        id: 'admin',
        name: 'Admin Total',
        desc: 'Todos los permisos operativos',
        Icon: UserCheck,
        color: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
        permissions: 'ALL',
    },
];

export default function Index({ auth, roles, all_permissions = [] }) {
    const { isDark } = useTheme();
    const confirmDialog = useConfirm();
    const { flash } = usePage().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [searchFilter, setSearchFilter] = useState('');

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        display_name: '',
        description: '',
        permissions: []
    });

    const openCreateModal = () => {
        reset();
        setSearchFilter('');
        setIsCreateModalOpen(true);
    };

    const canCreate = auth.user.is_super_admin || auth.user.permissions.includes('roles.create');
    const canEdit = auth.user.is_super_admin || auth.user.permissions.includes('roles.edit');
    const canDelete = auth.user.is_super_admin || auth.user.permissions.includes('roles.delete');

    const handleEdit = (role) => {
        if (!canEdit) return;
        setEditingRole(role);
        setSearchFilter('');
        setData({
            name: role.name,
            display_name: role.display_name,
            description: role.description || '',
            permissions: role.permissions || [],
        });
        setIsCreateModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (editingRole) {
            put(route('roles.update', editingRole.id), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    setEditingRole(null);
                },
            });
        } else {
            post(route('roles.store'), {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (role) => {
        if (role.name === 'Super Admin') return;
        confirmDialog(`¿Estás seguro de eliminar el rol "${role.display_name}"?`, () => {
            destroy(route('roles.destroy', role.id));
        });
    };

    const togglePermission = (perm) => {
        const current = [...data.permissions];
        const index = current.indexOf(perm);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(perm);
        }
        setData('permissions', current);
    };

    const applyPreset = (presetPerms) => {
        if (presetPerms === 'ALL') {
            setData('permissions', [...all_permissions]);
        } else {
            const valid = presetPerms.filter(p => all_permissions.includes(p));
            setData('permissions', valid);
        }
    };

    const toggleModuleAll = (module) => {
        const modulePerms = module.actions
            .map(a => `${module.key}.${a.key}`)
            .filter(p => all_permissions.includes(p));
        
        const allActive = modulePerms.length > 0 && modulePerms.every(p => data.permissions.includes(p));
        
        if (allActive) {
            setData('permissions', data.permissions.filter(p => !modulePerms.includes(p)));
        } else {
            const set = new Set([...data.permissions, ...modulePerms]);
            setData('permissions', Array.from(set));
        }
    };

    // Filter modules by search
    const filteredGroups = useMemo(() => {
        if (!searchFilter.trim()) return MODULE_GROUPS;
        const q = searchFilter.toLowerCase().trim();

        return MODULE_GROUPS.map(group => {
            const filteredModules = group.modules.filter(mod => {
                const matchName = mod.name.toLowerCase().includes(q);
                const matchKey = mod.key.toLowerCase().includes(q);
                const matchDesc = mod.description.toLowerCase().includes(q);
                const matchActions = mod.actions.some(a => 
                    a.label.toLowerCase().includes(q) || a.key.toLowerCase().includes(q)
                );
                return matchName || matchKey || matchDesc || matchActions;
            });
            return {
                ...group,
                modules: filteredModules,
            };
        }).filter(g => g.modules.length > 0);
    }, [searchFilter]);

    // All currently visible permissions in filter
    const visiblePermissions = useMemo(() => {
        const list = [];
        filteredGroups.forEach(g => {
            g.modules.forEach(m => {
                m.actions.forEach(a => {
                    const p = `${m.key}.${a.key}`;
                    if (all_permissions.includes(p)) list.push(p);
                });
            });
        });
        return list;
    }, [filteredGroups, all_permissions]);

    const selectAllVisible = () => {
        const set = new Set([...data.permissions, ...visiblePermissions]);
        setData('permissions', Array.from(set));
    };

    const deselectAllVisible = () => {
        const visibleSet = new Set(visiblePermissions);
        setData('permissions', data.permissions.filter(p => !visibleSet.has(p)));
    };

    const cardClass = `rounded-2xl border p-6 transition-all duration-200 ${
        isDark ? 'bg-slate-900 border-slate-700/60 shadow-slate-950/20' : 'bg-white border-slate-100 shadow-sm'
    }`;

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Roles y Permisos" />

            <div className="max-w-6xl mx-auto space-y-8 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
                                <Shield className="text-teal-600 dark:text-teal-400" size={18} />
                            </div>
                          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                            Roles y Permisos
                        </h1>
                        </div>
                        <p className="text-slate-500 font-medium text-sm mt-1">
                            Configuración de niveles de acceso y matriz de seguridad.
                        </p>
                    </div>

                    {canCreate && (
                        <Button 
                            onClick={openCreateModal}
                            style={{ background: B.blue }} 
                            className="text-white hover:opacity-90 font-bold rounded-xl gap-2 px-6 shadow-lg shadow-blue-500/20 border-none"
                        >
                            <Plus size={18} />
                            Crear Nuevo Rol
                        </Button>
                    )}
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                        isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                    }`}>
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-semibold">{flash.success}</span>
                    </div>
                )}
                {flash?.error && (
                    <div className={`flex items-center gap-3 p-4 rounded-xl border ${
                        isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-700'
                    }`}>
                        <XCircle size={18} />
                        <span className="text-sm font-semibold">{flash.error}</span>
                    </div>
                )}

                {/* Roles List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roles.map(role => {
                        const isSuperAdmin = role.name === 'Super Admin';
                        const perms = role.permissions || [];
                        const hasPos = perms.includes('sales.create') || perms.includes('sales.pay') || perms.includes('cash-register.operate');
                        const hasStock = perms.includes('inventory.manage') || perms.includes('inventory.view');
                        const hasAdmin = perms.includes('users.create') || perms.includes('roles.edit');

                        return (
                            <div key={role.id} className={cardClass}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                            isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'
                                        }`}>
                                            {role.name}
                                        </div>
                                        {isSuperAdmin && (
                                            <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[9px] font-bold">
                                                <Lock size={10} /> Sistema
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        {(canEdit || isSuperAdmin) && (
                                            <button 
                                                onClick={() => handleEdit(role)}
                                                disabled={isSuperAdmin || !canEdit}
                                                className={`p-1.5 rounded-lg transition-colors ${
                                                    isSuperAdmin || !canEdit
                                                        ? 'opacity-20 cursor-not-allowed'
                                                        : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
                                                }`}
                                                title={isSuperAdmin ? "Protegido por el sistema" : "Editar permisos"}
                                            >
                                                <Edit2 size={15} />
                                            </button>
                                        )}
                                        
                                        {canDelete && !isSuperAdmin && (
                                            <button 
                                                onClick={() => handleDelete(role)}
                                                className={`p-1.5 rounded-lg transition-colors ${
                                                    isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                                                }`}
                                                title="Eliminar rol"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {role.display_name}
                                </h3>
                                <p className={`text-xs mb-4 line-clamp-2 h-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {role.description ?? 'Sin descripción.'}
                                </p>

                                {/* Tags of Key capabilities */}
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {hasPos && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                            POS / Cobro
                                        </span>
                                    )}
                                    {hasStock && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                            Inventario
                                        </span>
                                    )}
                                    {hasAdmin && (
                                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                            Admin
                                        </span>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <span className={`text-[10px] uppercase font-bold tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {role.permissions.length} Permisos asignados
                                    </span>
                                    <div className="flex -space-x-1.5 overflow-hidden">
                                        {role.permissions.slice(0, 3).map((p, i) => (
                                            <div key={i} className={`w-5 h-5 rounded-full border-2 ${
                                                isDark ? 'border-slate-900 bg-teal-900' : 'border-white bg-teal-100'
                                            } flex items-center justify-center`}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                            </div>
                                        ))}
                                        {role.permissions.length > 3 && (
                                            <div className={`text-[8px] font-bold px-1.5 h-5 min-w-[20px] rounded-full flex items-center justify-center border-2 ${
                                                isDark ? 'border-slate-900 bg-slate-800 text-slate-400' : 'border-white bg-slate-100 text-slate-500'
                                            }`}>
                                                +{role.permissions.length - 3}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Edit / Create Modal */}
            <Dialog 
                open={isCreateModalOpen || !!editingRole} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateModalOpen(false);
                        setEditingRole(null);
                        reset();
                    }
                }}
            >
                <DialogContent className={`max-w-5xl max-h-[92vh] border-none p-0 overflow-hidden rounded-2xl flex flex-col ${
                    isDark ? 'bg-slate-900 shadow-2xl shadow-black/50' : 'bg-white shadow-xl'
                }`}>
                    <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-6">
                            <DialogHeader>
                                <DialogTitle className={`text-2xl font-black tracking-tight flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {editingRole ? `Editar Rol: ${editingRole.display_name}` : 'Crear Nuevo Perfil de Acceso'}
                                    {editingRole?.name === 'Super Admin' && (
                                        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border border-amber-500/20">
                                            <Lock size={12} /> Protegido por el Sistema
                                        </div>
                                    )}
                                </DialogTitle>
                                <DialogDescription className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Configurá la información del perfil y los accesos exactos que tendrá este rol.
                                </DialogDescription>
                            </DialogHeader>

                            {/* Basic Info (Responsive 3 Columns) */}
                            <div className={`p-4 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-4 ${
                                isDark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50/80 border-slate-200'
                            }`}>
                                {!editingRole && (
                                    <div className="space-y-1">
                                        <label className={`block text-[10px] uppercase font-black tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Identificador (Slug)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_'))}
                                            placeholder="ej: cajero_sucursal"
                                            className={`w-full rounded-xl border px-3 py-2 text-sm font-mono transition-all focus:ring-2 focus:outline-none ${
                                                isDark 
                                                    ? 'bg-[#1E293B] border-slate-700 text-white focus:border-blue-500' 
                                                    : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                                            }`}
                                        />
                                        {errors.name && <p className="text-[10px] text-red-500 font-bold">{errors.name}</p>}
                                    </div>
                                )}
                                <div className={`space-y-1 ${editingRole ? 'md:col-span-1' : ''}`}>
                                    <label className={`block text-[10px] uppercase font-black tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Nombre Comercial
                                    </label>
                                    <input
                                        type="text"
                                        value={data.display_name}
                                        onChange={e => setData('display_name', e.target.value)}
                                        placeholder="ej: Cajero / Mostrador"
                                        className={`w-full rounded-xl border px-3 py-2 text-sm font-medium transition-all focus:ring-2 focus:outline-none ${
                                            isDark 
                                                ? 'bg-[#1E293B] border-slate-700 text-white focus:border-blue-500' 
                                                : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                                        }`}
                                    />
                                    {errors.display_name && <p className="text-[10px] text-red-500 font-bold">{errors.display_name}</p>}
                                </div>
                                <div className={`space-y-1 ${editingRole ? 'md:col-span-2' : 'md:col-span-1'}`}>
                                    <label className={`block text-[10px] uppercase font-black tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Descripción
                                    </label>
                                    <input
                                        type="text"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="ej: Cobro en caja y emisión de comprobantes..."
                                        className={`w-full rounded-xl border px-3 py-2 text-sm font-medium transition-all focus:ring-2 focus:outline-none ${
                                            isDark 
                                                ? 'bg-[#1E293B] border-slate-700 text-white focus:border-blue-500' 
                                                : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'
                                        }`}
                                    />
                                </div>
                            </div>

                            {/* Quick Presets Bar */}
                            {editingRole?.name !== 'Super Admin' && (
                                <div className={`p-4 rounded-xl border space-y-3 ${
                                    isDark ? 'bg-slate-800/20 border-slate-800' : 'bg-blue-50/40 border-blue-100'
                                }`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5">
                                            <Sparkles size={14} className="text-blue-500" />
                                            <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                                Plantillas Rápidas (Un Clic para Cargar)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setData('permissions', [])}
                                            className={`text-[11px] flex items-center gap-1 font-semibold transition-colors ${
                                                isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-600'
                                            }`}
                                        >
                                            <RotateCcw size={12} />
                                            Limpiar selección
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                                        {PRESETS.map(preset => {
                                            const Icon = preset.Icon;
                                            return (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    onClick={() => applyPreset(preset.permissions)}
                                                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 ${preset.color}`}
                                                >
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <Icon size={14} />
                                                        <span className="text-xs font-bold">{preset.name}</span>
                                                    </div>
                                                    <span className="text-[10px] opacity-80 line-clamp-1">
                                                        {preset.desc}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Matrix Toolbar (Search & Bulk Selection) */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                                <div className="relative w-full sm:w-80">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchFilter}
                                        onChange={e => setSearchFilter(e.target.value)}
                                        placeholder="Buscar permiso (ej: ventas, caja, stock)..."
                                        className={`w-full pl-9 pr-8 py-2 rounded-xl text-xs border transition-all focus:ring-2 focus:outline-none ${
                                            isDark 
                                                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500' 
                                                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                                        }`}
                                    />
                                    {searchFilter && (
                                        <button 
                                            type="button" 
                                            onClick={() => setSearchFilter('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>

                                {editingRole?.name !== 'Super Admin' && (
                                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                        <button
                                            type="button"
                                            onClick={selectAllVisible}
                                            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                                                isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <CheckCheck size={14} className="text-teal-500" />
                                            Marcar visibles
                                        </button>
                                        <button
                                            type="button"
                                            onClick={deselectAllVisible}
                                            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold flex items-center gap-1 transition-colors ${
                                                isDark ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            <X size={14} className="text-red-500" />
                                            Desmarcar visibles
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Permissions Matrix by Group */}
                            <div className="space-y-6">
                                {filteredGroups.map((group, gIdx) => (
                                    <div key={gIdx} className={`rounded-2xl border overflow-hidden ${
                                        isDark ? 'bg-black/20 border-slate-800' : 'bg-slate-50 border-slate-200'
                                    }`}>
                                        {/* Group Header */}
                                        <div className={`px-4 py-2.5 border-b font-black text-xs uppercase tracking-wider ${
                                            isDark ? 'bg-slate-850 border-slate-800 text-teal-400' : 'bg-slate-100 border-slate-200 text-teal-700'
                                        }`}>
                                            {group.category}
                                        </div>

                                        <div className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {group.modules.map(mod => {
                                                const isLocked = editingRole?.name === 'Super Admin';
                                                const modPerms = mod.actions
                                                    .map(a => `${mod.key}.${a.key}`)
                                                    .filter(p => all_permissions.includes(p));
                                                const activeCount = modPerms.filter(p => data.permissions.includes(p)).length;
                                                const allChecked = modPerms.length > 0 && activeCount === modPerms.length;

                                                return (
                                                    <div 
                                                        key={mod.key} 
                                                        className={`p-4 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                                                            isDark ? 'hover:bg-slate-850/40' : 'hover:bg-white'
                                                        }`}
                                                    >
                                                        {/* Module Info & Row Select */}
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                                                    {mod.name}
                                                                </span>
                                                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-500/10 text-slate-400">
                                                                    {mod.key}
                                                                </span>
                                                                {!isLocked && modPerms.length > 0 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => toggleModuleAll(mod)}
                                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${
                                                                            allChecked 
                                                                                ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30' 
                                                                                : isDark ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-600 hover:text-slate-900'
                                                                        }`}
                                                                    >
                                                                        {allChecked ? 'Tildado todo' : 'Tildar módulo'}
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                {mod.description}
                                                            </p>
                                                        </div>

                                                        {/* Action Buttons for this Module */}
                                                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                                                            {mod.actions.map(action => {
                                                                const permName = `${mod.key}.${action.key}`;
                                                                const isAvailable = all_permissions.includes(permName);
                                                                const isActive = data.permissions.includes(permName);

                                                                if (!isAvailable) return null;

                                                                return (
                                                                    <button
                                                                        key={action.key}
                                                                        type="button"
                                                                        disabled={isLocked}
                                                                        onClick={() => togglePermission(permName)}
                                                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                                                                            isActive
                                                                                ? action.special 
                                                                                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/30' 
                                                                                    : 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/30'
                                                                                : isDark 
                                                                                    ? 'bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-white hover:border-slate-600' 
                                                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                                        } ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 active:scale-95'}`}
                                                                        title={action.special ? 'Acción Especial de Alta Importancia' : undefined}
                                                                    >
                                                                        {isActive ? (
                                                                            <CheckCircle2 size={13} className="shrink-0" />
                                                                        ) : (
                                                                            <div className="w-2 h-2 rounded-full border border-current opacity-40 shrink-0" />
                                                                        )}
                                                                        <span>{action.label}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}

                                {filteredGroups.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-sm font-semibold text-slate-400">
                                            No se encontraron módulos con el término "{searchFilter}"
                                        </p>
                                    </div>
                                )}
                            </div>

                            {editingRole?.name === 'Super Admin' && (
                                <div className="flex items-center gap-2 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                                    <Lock size={16} className="text-amber-500" />
                                    <p className="text-xs text-amber-500 font-bold">
                                        Los privilegios del Super Administrador son fijos y universales en toda la plataforma.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <DialogFooter className={`p-5 border-t ${isDark ? 'bg-black/20 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2.5 h-2.5 rounded-full ${data.permissions.length > 0 ? 'bg-teal-500' : 'bg-slate-400'} animate-pulse`} />
                                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {data.permissions.length} de {all_permissions.length} permisos seleccionados
                                    </span>
                                </div>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <Button 
                                        type="button"
                                        variant="ghost" 
                                        onClick={() => {
                                            setIsCreateModalOpen(false);
                                            setEditingRole(null);
                                            reset();
                                        }}
                                        className={`flex-1 sm:flex-none font-bold rounded-xl ${isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button 
                                        type="submit"
                                        disabled={processing || editingRole?.name === 'Super Admin'}
                                        style={{ background: B.blue }}
                                        className="flex-1 sm:flex-none text-white font-black rounded-xl gap-2 px-8 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                                    >
                                        {processing ? 'Guardando...' : (
                                            <>
                                                <Save size={16} />
                                                {editingRole ? 'Guardar Cambios' : 'Crear Perfil'}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AuthenticatedLayout>
    );
}

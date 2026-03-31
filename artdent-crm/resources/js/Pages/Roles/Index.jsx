import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { 
    Shield, Plus, Edit2, Trash2, CheckCircle2, 
    XCircle, Lock, ChevronRight, Save
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { 
    Dialog, DialogContent, DialogHeader, 
    DialogTitle, DialogDescription, DialogFooter 
} from '@/Components/ui/dialog';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

export default function Index({ auth, roles, all_permissions }) {
    const { isDark } = useTheme();
    const { flash } = usePage().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
        name: '',
        display_name: '',
        description: '',
        permissions: []
    });

    const openCreateModal = () => {
        reset();
        setIsCreateModalOpen(true);
    };

    const canCreate = auth.user.is_super_admin || auth.user.permissions.includes('roles.create');
    const canEdit = auth.user.is_super_admin || auth.user.permissions.includes('roles.edit');
    const canDelete = auth.user.is_super_admin || auth.user.permissions.includes('roles.delete');

    const handleEdit = (role) => {
        if (!canEdit) return;
        setEditingRole(role);
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
                onSuccess: () => setEditingRole(null),
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
        if (confirm(`¿Estás seguro de eliminar el rol "${role.display_name}"?`)) {
            destroy(route('roles.destroy', role.id));
        }
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
                    {roles.map(role => (
                        <div key={role.id} className={cardClass}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                                    isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-500'
                                }`}>
                                    ID: {role.name}
                                </div>
                                <div className="flex gap-1">
                                    {(canEdit || role.name === 'Super Admin') && (
                                        <button 
                                            onClick={() => handleEdit(role)}
                                            disabled={role.name === 'Super Admin' || !canEdit}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                role.name === 'Super Admin' || !canEdit
                                                    ? 'opacity-20 cursor-not-allowed'
                                                    : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'
                                            }`}
                                            title={role.name === 'Super Admin' ? "Protegido" : "Editar"}
                                        >
                                            <Edit2 size={15} />
                                        </button>
                                    )}
                                    
                                    {canDelete && role.name !== 'Super Admin' && (
                                        <button 
                                            onClick={() => handleDelete(role)}
                                            className={`p-1.5 rounded-lg transition-colors ${
                                                isDark ? 'hover:bg-red-500/10 text-slate-400 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'
                                            }`}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {role.display_name}
                            </h3>
                            <p className={`text-xs mb-6 line-clamp-2 h-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {role.description ?? 'Sin descripción.'}
                            </p>

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
                    ))}
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
                <DialogContent className={`max-w-4xl max-h-[90vh] border-none p-0 overflow-hidden rounded-2xl flex flex-col ${
                    isDark ? 'bg-slate-900 shadow-2xl shadow-black/50' : 'bg-white shadow-xl'
                }`}>
                    <form onSubmit={handleSave} className="flex flex-col h-full overflow-hidden">
                        {/* Modal Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <DialogHeader className="mb-8">
                                <DialogTitle className={`text-2xl font-black tracking-tight flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                    {editingRole ? 'Editar Perfil de Acceso' : 'Crear Nuevo Perfil'}
                                    {editingRole?.name === 'Super Admin' && (
                                        <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider border border-amber-500/20">
                                            <Lock size={12} /> Protegido
                                        </div>
                                    )}
                                </DialogTitle>
                                <DialogDescription className={`text-sm mt-1 mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Definí las facultades y el alcance de este rol dentro de la plataforma.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                {/* Left Column: Info */}
                                <div className="space-y-6">
                                    {!editingRole && (
                                        <div className="space-y-1.5">
                                            <label className={`block text-[10px] uppercase font-black tracking-widest pl-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                Identificador (Slug)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                placeholder="ej: facturacion_vip"
                                                className={`w-full rounded-2xl border px-4 py-3.5 text-sm transition-all focus:ring-4 focus:outline-none font-medium ${
                                                    isDark 
                                                        ? 'bg-[#1E293B] border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/10' 
                                                        : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10'
                                                }`}
                                            />
                                            {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase pl-1">{errors.name}</p>}
                                        </div>
                                    )}
                                    <div className="space-y-1.5">
                                        <label className={`block text-[10px] uppercase font-black tracking-widest pl-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Nombre Comercial
                                        </label>
                                        <input
                                            type="text"
                                            value={data.display_name}
                                            onChange={e => setData('display_name', e.target.value)}
                                            placeholder="ej: Administrador Senior"
                                            className={`w-full rounded-2xl border px-4 py-3.5 text-sm transition-all focus:ring-4 focus:outline-none font-medium ${
                                                isDark 
                                                    ? 'bg-[#1E293B] border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/10' 
                                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10'
                                            }`}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className={`block text-[10px] uppercase font-black tracking-widest pl-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                            Descripción del Rol
                                        </label>
                                        <textarea
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            rows={3}
                                            placeholder="Describí brevemente las responsabilidades de este perfil..."
                                            className={`w-full rounded-2xl border px-4 py-3.5 text-sm transition-all focus:ring-4 focus:outline-none resize-none font-medium ${
                                                isDark 
                                                    ? 'bg-[#1E293B] border-slate-700 text-white focus:border-blue-500 focus:ring-blue-500/10' 
                                                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500/10'
                                            }`}
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Permissions Matrix */}
                                <div className="flex flex-col h-full col-span-1 md:col-span-2">
                                    <label className={`block text-[10px] uppercase font-black tracking-widest mb-4 pl-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                        Matriz de Permisos (Acciones por Módulo)
                                    </label>
                                    
                                    <div className={`flex-1 rounded-2xl border overflow-hidden ${
                                        isDark ? 'bg-black/20 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-inner'
                                    }`}>
                                        <div className="overflow-x-auto overflow-y-visible custom-scrollbar">
                                            <table className="w-full text-left border-collapse">
                                                <thead className={`sticky top-0 z-10 ${isDark ? 'bg-slate-850' : 'bg-slate-100'}`}>
                                                    <tr>
                                                        <th className={`px-4 py-3 text-[10px] uppercase font-black tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Módulo</th>
                                                        {['view', 'create', 'edit', 'delete'].map(action => (
                                                            <th key={action} className={`px-4 py-3 text-[10px] uppercase font-black tracking-wider text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                                                {action === 'view' ? 'Ver' : action === 'create' ? 'Crear' : action === 'edit' ? 'Editar' : 'Eliminar'}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/50">
                                                    {Object.entries({
                                                        'users': 'Usuarios',
                                                        'roles': 'Roles y Permisos',
                                                        'settings': 'Configuración',
                                                        'customers': 'Clientes',
                                                        'products': 'Productos e Inventario',
                                                        'orders': 'Órdenes (Lab)',
                                                        'ecommerce': 'Ventas / Shop',
                                                        'reports': 'Reportes',
                                                        'branches': 'Sucursales',
                                                        'staff': 'Personal y RRHH',
                                                    }).map(([moduleKey, moduleLabel]) => {
                                                        const isLocked = editingRole?.name === 'Super Admin';
                                                        
                                                        return (
                                                            <tr key={moduleKey} className={`group transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-white'}`}>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex flex-col text-sm">
                                                                        <span className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{moduleLabel}</span>
                                                                        <span className={`text-[9px] uppercase font-bold tracking-tight opacity-40`}>{moduleKey}</span>
                                                                    </div>
                                                                </td>
                                                                {['view', 'create', 'edit', 'delete'].map(action => {
                                                                    const permName = `${moduleKey}.${action}`;
                                                                    const isActive = data.permissions.includes(permName);
                                                                    
                                                                    return (
                                                                        <td key={action} className="px-4 py-3 text-center">
                                                                            <button
                                                                                type="button"
                                                                                disabled={isLocked}
                                                                                onClick={() => togglePermission(permName)}
                                                                                className={`w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                                                                    isActive 
                                                                                        ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-600 text-white shadow-sm shadow-blue-500/20')
                                                                                        : (isDark ? 'bg-slate-800 text-slate-600 hover:text-slate-400' : 'bg-slate-100 text-slate-300 hover:text-slate-400')
                                                                                } ${isLocked ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 active:scale-95'}`}
                                                                            >
                                                                                {isActive ? <CheckCircle2 size={16} /> : <div className="w-1.5 h-1.5 rounded-full bg-current opacity-20" />}
                                                                            </button>
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    {editingRole?.name === 'Super Admin' && (
                                        <div className="mt-3 flex items-center gap-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl">
                                            <Lock size={14} className="text-amber-500" />
                                            <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-wide">
                                                Los privilegios del Super Administrador son fijos y universales. No pueden ser modificados.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <DialogFooter className={`p-6 border-t ${isDark ? 'bg-black/20 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${data.permissions.length > 0 ? 'bg-blue-500' : 'bg-slate-400'} animate-pulse`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {data.permissions.length} privilegios concedidos
                                    </span>
                                </div>
                                <div className="flex gap-4 w-full sm:w-auto">
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
                                        className="flex-1 sm:flex-none text-white font-black rounded-xl gap-2 px-10 shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
                                    >
                                        {processing ? 'Guardando...' : (
                                            <>
                                                <Save size={18} />
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

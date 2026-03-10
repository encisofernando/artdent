import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useTheme } from '@/Contexts/ThemeContext';
import { Key, Plus, Trash2, Copy, Check, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/Components/ui/button';

const B = { blue: '#397B9C', green: '#5AAD9C', teal: '#49949C' };

export default function ApiTokens({ auth, tokens = [] }) {
    const { isDark } = useTheme();
    const { flash } = usePage().props;
    const [copied, setCopied] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({ name: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('admin.api-tokens.store'), { onSuccess: () => reset() });
    };

    const revoke = (id) => {
        if (!confirm('¿Revocar este token? No podrá usarse más.')) return;
        router.delete(route('admin.api-tokens.destroy', id), { preserveScroll: true });
    };

    const copyToken = (token) => {
        navigator.clipboard.writeText(token);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const card = isDark
        ? 'bg-slate-900 border-slate-700/60'
        : 'bg-white border-slate-200/60';

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Tokens de API" />

            <div className="flex flex-col gap-6 max-w-3xl">
                {/* Header */}
                <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        Tokens de API
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Generá tokens para conectar el <strong>Panel de Asignación</strong> u otras aplicaciones externas.
                    </p>
                </div>

                {/* Token recién creado — se muestra UNA SOLA VEZ */}
                {flash?.new_token && (
                    <div className={`rounded-2xl border p-5 ${isDark ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex items-center gap-2 mb-3">
                            <ShieldCheck size={18} style={{ color: B.green }} />
                            <span className={`font-bold text-sm ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                ¡Token creado! Copialo ahora — no se vuelve a mostrar.
                            </span>
                        </div>
                        <div className={`flex items-center gap-2 rounded-xl px-4 py-3 border font-mono text-xs break-all
                            ${isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <span className="flex-1 select-all">{flash.new_token}</span>
                            <button
                                onClick={() => copyToken(flash.new_token)}
                                className={`shrink-0 p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                                title="Copiar token"
                            >
                                {copied
                                    ? <Check size={15} style={{ color: B.green }} />
                                    : <Copy size={15} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                                }
                            </button>
                        </div>
                    </div>
                )}

                {/* Crear nuevo token */}
                <div className={`rounded-2xl border p-6 shadow-sm ${card}`}>
                    <h2 className={`text-xs font-bold mb-4 uppercase tracking-widest ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Nuevo Token
                    </h2>
                    <form onSubmit={submit} className="flex gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Ej: Panel de Asignación"
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-colors
                                    ${isDark
                                        ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-slate-500'
                                        : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-slate-400'
                                    }`}
                            />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="text-white border-none rounded-xl shadow-md whitespace-nowrap"
                            style={{ background: `linear-gradient(135deg, ${B.blue}, ${B.teal})` }}
                        >
                            <Plus size={16} className="mr-1.5" />
                            Generar
                        </Button>
                    </form>
                </div>

                {/* Lista de tokens activos */}
                <div className={`rounded-2xl border shadow-sm overflow-hidden ${card}`}>
                    <div className={`px-6 py-4 border-b flex items-center gap-2
                        ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
                        <Key size={15} style={{ color: B.blue }} />
                        <h2 className={`text-sm font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Tokens activos ({tokens.length})
                        </h2>
                    </div>

                    {tokens.length === 0 ? (
                        <div className={`flex flex-col items-center gap-2 py-12 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            <Key size={32} className="opacity-40" />
                            <p className="text-sm">Aún no hay tokens. Generá uno arriba.</p>
                        </div>
                    ) : (
                        <ul className={`divide-y ${isDark ? 'divide-slate-700/30' : 'divide-slate-100'}`}>
                            {tokens.map(t => (
                                <li
                                    key={t.id}
                                    className={`flex items-center justify-between px-6 py-4 gap-4 transition-colors
                                        ${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
                                            ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                            <Key size={14} style={{ color: B.teal }} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className={`font-semibold text-sm truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                                {t.name}
                                            </p>
                                            <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                                Creado: {t.created_at}
                                                {t.last_used_at && ` · Usado: ${t.last_used_at}`}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => revoke(t.id)}
                                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors
                                            ${isDark ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                                    >
                                        <Trash2 size={12} />
                                        Revocar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Instrucciones */}
                <div className={`rounded-2xl border p-5 ${isDark ? 'bg-slate-900/50 border-slate-700/40' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={16} style={{ color: B.blue }} className="shrink-0 mt-0.5" />
                        <div>
                            <p className={`text-xs font-bold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                ¿Cómo usar el token en el Panel de Asignación?
                            </p>
                            <ol className={`text-xs space-y-1 list-decimal list-inside ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                <li>Abrí el archivo <code className={`font-mono px-1 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>artdent-panel/index.html</code> en el navegador.</li>
                                <li>Hacé clic en <strong>⚙ Configurar</strong> en el panel.</li>
                                <li>Ingresá la URL del servidor: <code className={`font-mono px-1 rounded ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>http://127.0.0.1:8000</code></li>
                                <li>Pegá el token generado en el campo <em>Token de acceso</em>.</li>
                                <li>Guardá — el panel se conectará automáticamente.</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

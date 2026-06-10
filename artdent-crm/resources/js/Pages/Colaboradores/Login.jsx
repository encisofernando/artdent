import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { User, Delete } from 'lucide-react';

const AD = { blue: '#397B9C', teal: '#5AAD9C', mint: '#ACD6CE' };

export default function ColaboradoresLogin({ collaborators }) {
    const [selected, setSelected] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        collaborator_id: '',
        pin: '',
    });

    const handleSelect = (collab) => {
        setSelected(collab);
        setData({ collaborator_id: collab.id, pin: '' });
    };

    const handlePin = (digit) => {
        if (data.pin.length < 6) {
            setData('pin', data.pin + digit);
        }
    };

    const handleDelete = () => setData('pin', data.pin.slice(0, -1));

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('colaboradores.login.post'));
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <Head title="Portal Colaboradores" />

            {/* Logo */}
            <div className="mb-8 text-center">
                <img src="/assets/logo-artdent-blanco.png" alt="ArtDent" className="h-10 mx-auto mb-3 object-contain" />
                <p className="text-slate-400 text-sm font-medium tracking-widest uppercase">Portal de Colaboradores</p>
            </div>

            <div className="w-full max-w-md">
                {!selected ? (
                    /* Selector de colaborador */
                    <div>
                        <h2 className="text-white text-center text-lg font-bold mb-4">¿Quién sos?</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {collaborators.map((c) => (
                                <button
                                    key={c.id}
                                    onClick={() => handleSelect(c)}
                                    className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700/80 transition-all text-center"
                                >
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                                        style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-white text-sm font-semibold leading-tight">{c.name}</span>
                                    {c.specialty && <span className="text-slate-400 text-xs">{c.specialty}</span>}
                                </button>
                            ))}
                        </div>
                        {collaborators.length === 0 && (
                            <p className="text-slate-500 text-center text-sm mt-8">No hay colaboradores con PIN configurado.</p>
                        )}
                    </div>
                ) : (
                    /* Teclado PIN */
                    <form onSubmit={handleSubmit}>
                        {/* Header colaborador */}
                        <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0"
                                style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                                {selected.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate">{selected.name}</p>
                                {selected.specialty && <p className="text-slate-400 text-xs">{selected.specialty}</p>}
                            </div>
                            <button type="button" onClick={() => { setSelected(null); reset(); }}
                                className="text-slate-500 hover:text-slate-300 text-xs">
                                Cambiar
                            </button>
                        </div>

                        {/* Display PIN */}
                        <div className="flex justify-center gap-3 mb-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all ${
                                    i < data.pin.length
                                        ? 'border-emerald-500 bg-emerald-500/20'
                                        : 'border-slate-700 bg-slate-800/40'
                                }`}>
                                    {i < data.pin.length && <div className="w-3 h-3 rounded-full bg-emerald-400" />}
                                </div>
                            ))}
                        </div>

                        {errors.pin && (
                            <p className="text-red-400 text-sm text-center mb-4">{errors.pin}</p>
                        )}

                        {/* Teclado numérico */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                                <button key={n} type="button" onClick={() => handlePin(String(n))}
                                    className="h-14 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xl font-bold hover:bg-slate-700 active:scale-95 transition-all">
                                    {n}
                                </button>
                            ))}
                            <button type="button" onClick={handleDelete}
                                className="h-14 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 active:scale-95 transition-all flex items-center justify-center">
                                <Delete size={20} />
                            </button>
                            <button type="button" onClick={() => handlePin('0')}
                                className="h-14 rounded-2xl bg-slate-800 border border-slate-700 text-white text-xl font-bold hover:bg-slate-700 active:scale-95 transition-all">
                                0
                            </button>
                            <button
                                type="submit"
                                disabled={processing || data.pin.length < 4}
                                className="h-14 rounded-2xl text-white text-sm font-bold active:scale-95 transition-all disabled:opacity-40"
                                style={{ background: `linear-gradient(135deg, ${AD.blue}, ${AD.teal})` }}>
                                {processing ? '...' : 'OK'}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            <p className="mt-8 text-slate-600 text-xs">© {new Date().getFullYear()} ArtDent</p>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { addProgressEntry } from './actions';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function AddProgressForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const response = await addProgressEntry(formData);
            if (response && !response.success) {
                toast.error(response.error);
            } else {
                toast.success("Evolução registrada!");
                setIsOpen(false);
            }
        } catch (error) {
            toast.error('Erro ao salvar medidas');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors font-bold shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2">
                <Plus size={18} /> Registrar Evolução
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-sm relative my-8 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-6">Nova Atualização</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Peso de hoje (kg)</label>
                                <input type="number" step="0.1" name="weight" required placeholder="Ex: 75.5" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Anotações / Medidas adicionais</label>
                                <textarea name="notes" rows={3} placeholder="Ex: Cintura: 80cm, Quadril: 100cm..." className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none"></textarea>
                            </div>

                            <div className="flex flex-col gap-3 mt-8 pt-5 border-t border-neutral-800">
                                <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl disabled:opacity-50 font-bold transition-all shadow-md">
                                    {loading ? 'Salvando...' : 'Salvar Registro'}
                                </button>
                                <button type="button" onClick={() => setIsOpen(false)} className="w-full py-3 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl font-medium transition-colors">
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

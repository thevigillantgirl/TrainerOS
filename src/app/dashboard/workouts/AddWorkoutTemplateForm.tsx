'use client';

import { useState } from 'react';
import { addWorkoutTemplate } from './actions';
import { toast } from 'sonner';

export default function AddWorkoutTemplateForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        try {
            const response = await addWorkoutTemplate(formData);
            if (response && !response.success) {
                toast.error(response.error);
            } else {
                toast.success("Treino criado com sucesso!");
                setIsOpen(false);
            }
        } catch (error) {
            toast.error('Erro ao criar treino');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium">
                + Novo Treino
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-md relative">
                        <h2 className="text-xl font-bold text-white mb-4">Criar Novo Treino</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Nome da Ficha</label>
                                <input name="name" required placeholder="Ex: Treino A - Peito e Tríceps" className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Objetivo (Opcional)</label>
                                <input name="objective" placeholder="Ex: Hipertrofia, Emagrecimento..." className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Divisão / Grupo Muscular (Opcional)</label>
                                <input name="split" placeholder="Ex: Peito, Costas, FullBody..." className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Observações Gerais</label>
                                <textarea name="description" rows={3} className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Opcional"></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-neutral-400 hover:text-white font-medium">Cancelar</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 font-medium transition-colors">
                                    {loading ? 'Salvando...' : 'Criar Ficha'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

'use client';

import { useState } from 'react';
import { addExercise } from './actions';
import { toast } from 'sonner';

export default function AddExerciseForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        try {
            const response = await addExercise(formData);
            if (response && !response.success) {
                toast.error(response.error);
            } else {
                toast.success("Exercício adicionado com sucesso!");
                setIsOpen(false);
            }
        } catch (error) {
            toast.error('Erro ao adicionar exercício');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium">
                + Novo Exercício
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-lg relative my-8">
                        <h2 className="text-xl font-bold text-white mb-4">Adicionar Exercício à Biblioteca</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Nome do Exercício *</label>
                                <input name="name" required placeholder="Ex: Supino Reto com Barra" className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Grupo Muscular</label>
                                    <input name="targetMuscle" placeholder="Ex: Peitoral" className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm text-neutral-400 mb-1">Equipamento</label>
                                    <input name="equipment" placeholder="Ex: Barra Livre" className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Vídeo Demonstrativo (Link do YouTube)</label>
                                <input name="videoUrl" type="url" placeholder="Ex: https://youtube.com/watch?v=..." className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                                <p className="text-xs text-neutral-500 mt-1">Links do YouTube geram a thumbnail automaticamente.</p>
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Instruções Práticas / Dicas</label>
                                <textarea name="instructions" rows={3} className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" placeholder="Detalhes da execução correta, erros comuns, etc."></textarea>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-neutral-800">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-neutral-400 hover:text-white font-medium">Cancelar</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 font-medium transition-colors">
                                    {loading ? 'Salvando...' : 'Adicionar ao Banco'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

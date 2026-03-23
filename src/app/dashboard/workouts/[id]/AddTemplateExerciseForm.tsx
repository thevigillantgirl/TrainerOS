'use client';

import { useState } from 'react';
import { addTemplateExercise } from './actions';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

export default function AddTemplateExerciseForm({ templateId, availableExercises, currentOrderCount }: { templateId: string, availableExercises: any[], currentOrderCount: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('templateId', templateId);
        formData.append('order', (currentOrderCount + 1).toString());

        try {
            const response = await addTemplateExercise(formData);
            if (response && !response.success) {
                toast.error(response.error);
            } else {
                toast.success("Exercício adicionado à ficha!");
                setIsOpen(false);
            }
        } catch (error) {
            toast.error('Erro ao adicionar');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2">
                <Plus size={18} /> Adicionar Exercício
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-lg relative my-8 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-6">Configurar Exercício na Ficha</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-2">Selecione o Exercício *</label>
                                <select name="exerciseId" required className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                                    <option value="">Buscar exercício no banco...</option>
                                    {availableExercises.map(ex => (
                                        <option key={ex.id} value={ex.id}>{ex.name} {ex.targetMuscle ? `(${ex.targetMuscle})` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Séries *</label>
                                    <input type="number" name="sets" required min="1" placeholder="Ex: 3" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Repetições *</label>
                                    <input name="reps" required placeholder="Ex: 10-12 ou Falha" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Carga Estimada</label>
                                    <input name="load" placeholder="Opcional. Ex: 20kg" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-1">Descanso (segundos)</label>
                                    <input type="number" name="restTime" placeholder="Opcional. Ex: 90" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Observações Específicas p/ o Aluno</label>
                                <textarea name="notes" rows={2} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Ex: Focar na contração de pico..."></textarea>
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-neutral-800">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-neutral-400 hover:text-white font-medium transition-colors">Cancelar</button>
                                <button type="submit" disabled={loading} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 font-bold transition-all shadow-md">
                                    {loading ? 'Adicionando...' : 'Adicionar à Ficha'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

'use client';

import { useState } from 'react';
import { assignWorkout } from './actions';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

export default function AssignWorkoutForm({ studentId, availableTemplates }: { studentId: string, availableTemplates: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        formData.append('studentId', studentId);

        try {
            const response = await assignWorkout(formData);
            if (response && !response.success) {
                toast.error(response.error);
            } else {
                toast.success("Treino atribuído com sucesso! O aluno já pode acessá-lo.");
                setIsOpen(false);
            }
        } catch (error) {
            toast.error('Erro ao atribuir treino');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-bold shadow-md shadow-emerald-900/20 flex items-center gap-2">
                <Send size={18} /> Atribuir Treino
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-md relative shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-6">Enviar Ficha para o Aluno</h2>

                        {availableTemplates.length === 0 ? (
                            <div className="text-center p-4">
                                <p className="text-neutral-400 mb-4">Você ainda não tem nenhuma ficha de treino criada.</p>
                                <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-neutral-800 text-white rounded">Voltar</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 mb-2">Selecione a Ficha *</label>
                                    <select name="templateId" required className="w-full bg-neutral-800 border border-neutral-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none">
                                        <option value="">Escolha um treino...</option>
                                        {availableTemplates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} {t.split ? `- ${t.split}` : ''}</option>
                                        ))}
                                    </select>
                                </div>

                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    Uma cópia independente desta ficha será criada e enviada para o aplicativo do aluno. Alterações futuras na ficha original não afetarão o treino já enviado.
                                </p>

                                <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-neutral-800">
                                    <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2.5 text-neutral-400 hover:text-white font-medium transition-colors">Cancelar</button>
                                    <button type="submit" disabled={loading} className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 font-bold transition-all shadow-md">
                                        {loading ? 'Enviando...' : 'Atribuir'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

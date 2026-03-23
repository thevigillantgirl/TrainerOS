'use client';

import { useState } from 'react';
import { addStudent } from './actions';
import { toast } from 'sonner';

export default function AddStudentForm() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.currentTarget);
        try {
            const response = await addStudent(formData);

            if (response && !response.success) {
                toast.error(response.error);
            } else {
                toast.success("Aluno cadastrado com sucesso!");
                setIsOpen(false);
            }
        } catch (error) {
            toast.error('Erro de conexão ao adicionar aluno. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium">
                + Novo Aluno
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl w-full max-w-md relative">
                        <h2 className="text-xl font-bold text-white mb-4">Adicionar Aluno</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Nome Completo</label>
                                <input name="name" required className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Email</label>
                                <input name="email" type="email" required className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm text-neutral-400 mb-1">Senha Inicial</label>
                                <input name="password" type="password" required className="w-full bg-neutral-800 border border-neutral-700 rounded-md p-2 text-white focus:ring-1 focus:ring-emerald-500 outline-none" />
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button type="button" disabled={loading} onClick={() => setIsOpen(false)} className="px-4 py-2 text-neutral-400 hover:text-white font-medium disabled:opacity-50">Cancelar</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg disabled:opacity-50 font-medium transition-colors">
                                    {loading ? 'Salvando...' : 'Salvar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

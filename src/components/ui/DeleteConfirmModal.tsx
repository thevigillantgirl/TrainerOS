'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';

interface DeleteConfirmModalProps {
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
    buttonText?: string;
    icon?: React.ReactNode;
    variant?: 'danger' | 'warning';
}

export default function DeleteConfirmModal({
    title,
    description,
    onConfirm,
    buttonText = "Excluir",
    icon = <Trash2 size={16} />,
    variant = 'danger'
}: DeleteConfirmModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const colors = {
        danger: {
            bg: 'bg-red-600 hover:bg-red-500',
            text: 'text-red-500',
            border: 'border-red-500/50',
            iconBg: 'bg-red-900/30 text-red-500 border border-red-500/20'
        },
        warning: {
            bg: 'bg-amber-600 hover:bg-amber-500',
            text: 'text-amber-500',
            border: 'border-amber-500/50',
            iconBg: 'bg-amber-900/30 text-amber-500 border border-amber-500/20'
        }
    };

    const theme = colors[variant];

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            setIsOpen(false);
        } catch (error) {
            toast.error("Ocorreu um erro ao processar a requisição.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsOpen(true); }}
                className={`p-2 rounded-lg hover:bg-neutral-800 transition-colors ${theme.text}`}
                title={buttonText}
            >
                {icon}
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                    <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl w-full max-w-sm relative shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-neutral-500 hover:text-white">
                            <X size={20} />
                        </button>

                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 ${theme.iconBg}`}>
                            <AlertTriangle size={24} />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
                        <p className="text-neutral-400 text-sm leading-relaxed mb-8">{description}</p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="flex-1 py-2.5 text-neutral-300 font-medium hover:bg-neutral-800 rounded-xl transition-colors"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className={`flex-1 py-2.5 text-white font-bold rounded-xl transition-all shadow-md flex justify-center items-center ${theme.bg} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Processando...' : buttonText}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

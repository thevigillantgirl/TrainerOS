import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Activity, TrendingDown, TrendingUp } from 'lucide-react';
import AddProgressForm from './AddProgressForm';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';

export default async function ProgressPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await decrypt(token);
    if (!session || session.role !== 'STUDENT') return null;

    const entries = await prisma.progressEntry.findMany({
        where: { studentId: session.userId },
        orderBy: { date: 'desc' }
    });

    const profile = await prisma.studentProfile.findUnique({
        where: { userId: session.userId }
    });

    let weightDiff = 0;
    if (entries.length >= 2) {
        weightDiff = (entries[0].weight || 0) - (entries[1].weight || 0);
    }

    return (
        <div className="space-y-6 pb-24">
            <Link href="/app" className="flex items-center text-emerald-500 hover:text-emerald-400 font-medium mb-4">
                <ArrowLeft size={16} className="mr-2" /> Voltar para Início
            </Link>

            <div>
                <h1 className="text-3xl font-black text-white leading-tight">Minha Evolução</h1>
                <p className="text-neutral-400 mt-2">Acompanhe seu progresso físico ao longo do tempo.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-sm text-center">
                    <span className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">Peso Atual</span>
                    <span className="text-3xl font-black text-white">{profile?.weight ? profile.weight : '--'}<span className="text-base font-medium text-neutral-500 ml-1">kg</span></span>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-sm flex flex-col justify-center items-center">
                    <span className="block text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">Última Variação</span>
                    {weightDiff === 0 ? (
                        <span className="text-lg font-bold text-neutral-400">---</span>
                    ) : weightDiff > 0 ? (
                        <span className="flex items-center text-lg font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full"><TrendingUp size={16} className="mr-1.5" /> +{weightDiff.toFixed(1)}kg</span>
                    ) : (
                        <span className="flex items-center text-lg font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full"><TrendingDown size={16} className="mr-1.5" /> {weightDiff.toFixed(1)}kg</span>
                    )}
                </div>
            </div>

            <AddProgressForm />

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Activity size={20} className="mr-2 text-emerald-500" /> Histórico
                </h3>

                {entries.filter(e => !e.deletedAt).length === 0 ? (
                    <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl text-center shadow-sm">
                        <p className="text-neutral-500">Nenhum registro encontrado.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {entries.filter(e => !e.deletedAt).map((entry) => (
                            <div key={entry.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl shadow-sm relative group">
                                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DeleteConfirmModal
                                        title="Apagar Registro"
                                        description="Deseja excluir este registro de peso? O gráfico será atualizado."
                                        buttonText="Excluir"
                                        variant="danger"
                                        onConfirm={async () => {
                                            'use server';
                                            const { deleteProgressEntry } = await import('./actions');
                                            await deleteProgressEntry(entry.id);
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-white font-bold text-lg">{entry.weight} kg</span>
                                    <span className="text-sm font-medium text-neutral-500 mr-8">{entry.date.toLocaleDateString('pt-BR')}</span>
                                </div>
                                {entry.notes && (
                                    <p className="text-sm text-neutral-400 mt-2 bg-neutral-950 p-3 rounded-lg border border-neutral-800/50">{entry.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

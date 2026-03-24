import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import AddExerciseForm from './AddExerciseForm';
import { PlayCircle, Dumbbell, Tag } from 'lucide-react';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';

export default async function ExercisesPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await decrypt(token);
    if (!session || session.role !== 'ADMIN') return null;

    // Busca exercícios globais (tenantId = null) e exercícios próprios deste personal
    const exercises = await prisma.exercise.findMany({
        where: {
            OR: [
                { tenantId: null },
                { tenantId: session.tenantId }
            ]
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                <div>
                    <h1 className="text-3xl font-bold text-white">Biblioteca de Exercícios</h1>
                    <p className="text-neutral-400 mt-1">Gerencie seu banco de exercícios e os vídeos associados a eles.</p>
                </div>
                <AddExerciseForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {exercises.filter(e => !e.deletedAt).length === 0 ? (
                    <div className="col-span-full p-12 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-neutral-500 shadow-sm">
                        <p className="text-lg mb-2">Nenhum exercício encontrado.</p>
                        <p className="text-sm">Clique em "Novo Exercício" para adicionar ao banco.</p>
                    </div>
                ) : (
                    exercises.filter(e => !e.deletedAt).map((exercise) => (
                        <div key={exercise.id} className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-emerald-500/50 transition-colors group flex flex-col shadow-sm relative">
                            {exercise.tenantId !== null && (
                                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DeleteConfirmModal
                                        title="Excluir Exercício"
                                        description={`Deseja realmente apagar o exercício "${exercise.name}"? Ele será removido do seu banco de dados.`}
                                        buttonText="Excluir"
                                        variant="danger"
                                        onConfirm={async () => {
                                            'use server';
                                            const { deleteExercise } = await import('./actions');
                                            await deleteExercise(exercise.id);
                                        }}
                                    />
                                </div>
                            )}
                            <div className="h-40 bg-neutral-800 relative flex items-center justify-center">
                                {exercise.thumbnailUrl ? (
                                    <img src={exercise.thumbnailUrl} alt={exercise.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="text-neutral-600 flex flex-col items-center">
                                        <PlayCircle size={40} className="mb-2 opacity-50" />
                                        <span className="text-xs uppercase tracking-wider font-semibold">Sem Vídeo</span>
                                    </div>
                                )}
                                {exercise.videoUrl && (
                                    <a href={exercise.videoUrl} target="_blank" rel="noreferrer" className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-emerald-600 text-white rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                                            <PlayCircle size={28} />
                                        </div>
                                    </a>
                                )}
                            </div>

                            <div className="p-5 flex-1 flex flex-col">
                                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{exercise.name}</h3>

                                <div className="space-y-2 mb-4 flex-1">
                                    {exercise.targetMuscle && (
                                        <div className="flex items-center text-sm text-neutral-400">
                                            <Tag size={14} className="mr-2 text-emerald-500/70" />
                                            Músculo: <span className="text-neutral-300 ml-1 font-medium">{exercise.targetMuscle}</span>
                                        </div>
                                    )}
                                    {exercise.equipment && (
                                        <div className="flex items-center text-sm text-neutral-400">
                                            <Dumbbell size={14} className="mr-2 text-emerald-500/70" />
                                            Equipamento: <span className="text-neutral-300 ml-1">{exercise.equipment}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-xs">
                                    {exercise.tenantId === null ? (
                                        <span className="px-2 py-1 bg-neutral-800 text-neutral-400 font-medium rounded">Global</span>
                                    ) : (
                                        <span className="px-2 py-1 bg-emerald-900/40 text-emerald-400 font-medium rounded border border-emerald-800/50">Personalizado</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

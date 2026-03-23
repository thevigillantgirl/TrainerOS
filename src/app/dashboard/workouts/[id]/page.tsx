import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Target, Filter, Plus, GripVertical, Trash2 } from 'lucide-react';
import AddTemplateExerciseForm from './AddTemplateExerciseForm';
import { removeTemplateExercise } from './actions';

export default async function WorkoutTemplateDetail({ params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await decrypt(token);
    if (!session || session.role !== 'ADMIN') return null;

    const template = await prisma.workoutTemplate.findUnique({
        where: { id: params.id, tenantId: session.tenantId },
        include: {
            exercises: {
                orderBy: { order: 'asc' },
                include: { exercise: true } // Fetches the actual Exercise details
            }
        }
    });

    if (!template) return <div className="p-8 text-neutral-400">Treino não encontrado.</div>;

    const availableExercises = await prisma.exercise.findMany({
        where: {
            OR: [
                { tenantId: null },
                { tenantId: session.tenantId }
            ]
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <Link href="/dashboard/workouts" className="flex items-center text-emerald-500 hover:text-emerald-400 font-medium mb-4">
                <ArrowLeft size={16} className="mr-2" /> Voltar para Fichas
            </Link>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-white leading-tight">{template.name}</h1>
                    <div className="flex flex-wrap gap-4 mt-3">
                        {template.split && (
                            <span className="flex items-center text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                <Filter size={14} className="mr-1.5" /> {template.split}
                            </span>
                        )}
                        {template.objective && (
                            <span className="flex items-center text-sm font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-500/20">
                                <Target size={14} className="mr-1.5" /> {template.objective}
                            </span>
                        )}
                    </div>
                    {template.description && <p className="text-neutral-400 mt-4 text-sm">{template.description}</p>}
                </div>
                <AddTemplateExerciseForm templateId={template.id} availableExercises={availableExercises} currentOrderCount={template.exercises.length} />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-neutral-800 bg-neutral-950 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-white flex items-center">
                        Exercícios <span className="ml-2 px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-md text-xs">{template.exercises.length}</span>
                    </h2>
                </div>

                {template.exercises.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500">
                        <p className="mb-2">Nenhum exercício adicionado a esta ficha.</p>
                        <p className="text-sm">Use o botão principal para começar a montar o treino do seu aluno.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-neutral-800">
                        {template.exercises.map((te, index) => (
                            <li key={te.id} className="p-4 hover:bg-neutral-800/30 transition-colors flex items-center gap-4 group">
                                <div className="text-neutral-600 cursor-move hover:text-white transition-colors">
                                    <GripVertical size={20} />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-emerald-900/40 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-800/50 shrink-0">
                                    {index + 1}
                                </div>
                                {te.exercise.thumbnailUrl ? (
                                    <img src={te.exercise.thumbnailUrl} alt={te.exercise.name} className="w-16 h-12 object-cover rounded border border-neutral-700 shadow-sm shrink-0" />
                                ) : (
                                    <div className="w-16 h-12 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-500 shrink-0 border border-neutral-700">Sem Vídeo</div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold text-base truncate">{te.exercise.name}</h4>
                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-neutral-400">
                                        <span className="bg-neutral-800/50 px-2 py-0.5 rounded text-xs"><strong className="text-neutral-300">{te.sets}</strong> séries</span>
                                        <span className="bg-neutral-800/50 px-2 py-0.5 rounded text-xs"><strong className="text-neutral-300">{te.reps}</strong> reps</span>
                                        {te.load && <span className="bg-neutral-800/50 px-2 py-0.5 rounded text-xs">Carga: <strong className="text-neutral-300">{te.load}</strong></span>}
                                        {te.restTime && <span className="bg-neutral-800/50 px-2 py-0.5 rounded text-xs">Descanso: <strong className="text-neutral-300">{te.restTime}s</strong></span>}
                                    </div>
                                    {te.notes && <p className="text-xs text-neutral-500 mt-2 truncate max-w-xl">Obs: {te.notes}</p>}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-2 shrink-0">
                                    <form action={removeTemplateExercise}>
                                        <input type="hidden" name="templateExerciseId" value={te.id} />
                                        <input type="hidden" name="templateId" value={template.id} />
                                        <button type="submit" className="text-neutral-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </form>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

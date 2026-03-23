import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Target, Trophy, Clock, CheckCircle } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import { finishWorkout } from './actions';

export default async function StudentWorkoutExecution({ params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await decrypt(token);
    if (!session || session.role !== 'STUDENT') return null;

    const workout = await prisma.workout.findUnique({
        where: { id: params.id, studentId: session.userId },
        include: {
            exercises: {
                orderBy: { order: 'asc' },
                include: { exercise: true }
            }
        }
    });

    if (!workout) return <div className="p-8 text-neutral-400">Treino não encontrado ou já indisponível.</div>;

    const totalExercises = workout.exercises.length;
    const completedExercises = workout.exercises.filter(ex => ex.isCompleted).length;
    const progressPercentage = totalExercises === 0 ? 0 : Math.round((completedExercises / totalExercises) * 100);

    return (
        <div className="space-y-6 pb-24"> {/* pb-24 for bottom navigation space */}
            <Link href="/app" className="flex items-center text-emerald-500 hover:text-emerald-400 font-medium mb-2">
                <ArrowLeft size={16} className="mr-2" /> Início
            </Link>

            <div>
                <h1 className="text-3xl font-black text-white leading-tight">{workout.name}</h1>
                {workout.objective && (
                    <p className="flex items-center text-sm text-neutral-400 mt-2 font-medium">
                        <Target size={14} className="mr-1.5 text-emerald-500" /> Foco: {workout.objective}
                    </p>
                )}
            </div>

            {/* Progress Bar */}
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl shadow-sm">
                <div className="flex justify-between items-end mb-3">
                    <div>
                        <span className="block text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1">Progresso Atual</span>
                        <span className="text-2xl font-black text-white">{completedExercises} <span className="text-neutral-500 text-base font-medium">/ {totalExercises}</span></span>
                    </div>
                    <div className="text-emerald-400 font-bold bg-emerald-900/30 px-3 py-1 rounded-full text-sm border border-emerald-800/50">
                        {progressPercentage}%
                    </div>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-3">
                    <div
                        className="bg-emerald-500 h-3 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-4 relative">
                {workout.exercises.map((exercise) => (
                    <ExerciseCard key={exercise.id} exercise={exercise} workoutId={workout.id} />
                ))}
            </div>

            {/* Complete Button */}
            {workout.status !== 'COMPLETED' ? (
                <form action={finishWorkout} className="mt-12 pt-8 border-t border-neutral-800">
                    <input type="hidden" name="workoutId" value={workout.id} />
                    <button
                        type="submit"
                        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${progressPercentage === 100
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 transform hover:-translate-y-1'
                                : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                            }`}
                    >
                        <Trophy size={20} /> Finalizar Treino Hoje
                    </button>
                </form>
            ) : (
                <div className="mt-12 pt-8 border-t border-neutral-800 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-900/30 text-emerald-500 mb-4 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Treino Concluído!</h3>
                    <p className="text-neutral-400">Excelente trabalho.</p>
                </div>
            )}
        </div>
    );
}

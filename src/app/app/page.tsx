import { cookies } from 'next/headers';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import { Play } from 'lucide-react';

export default async function StudentDashboard() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await decrypt(token);
    if (!session || session.role !== 'STUDENT') return null;

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
    });

    const workouts = await prisma.workout.findMany({
        where: { studentId: session.userId },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="pt-2">
                <h2 className="text-2xl font-bold text-white">E aí, {user?.name.split(' ')[0]}! 👋</h2>
                <p className="text-neutral-400 mt-1">Pronto para treinar hoje?</p>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Meus Treinos</h3>

                {workouts.length === 0 ? (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center text-neutral-500 shadow-sm">
                        <p className="mb-2">Seu treinador ainda não enviou nenhum treino para você.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {workouts.map((workout) => (
                            <div key={workout.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-emerald-500/50 transition-all shadow-sm group flex items-center justify-between cursor-pointer">
                                <div>
                                    <h4 className="text-white font-bold">{workout.name}</h4>
                                    <p className="text-xs font-medium mt-1">
                                        Status: <span className={workout.status === 'COMPLETED' ? 'text-emerald-500' : 'text-amber-500'}>{workout.status === 'COMPLETED' ? 'Concluído' : 'Pendente'}</span>
                                    </p>
                                </div>
                                <button className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                    <Play size={20} fill="currentColor" className="ml-1" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Evolução Resumo */}
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Última Atualização</h3>
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 p-5 rounded-xl shadow-sm">
                    <p className="text-neutral-400 text-sm">Nenhum registro de evolução recente.</p>
                    <Link href="/app/progress" className="inline-block mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-sm font-medium transition-colors rounded-lg">
                        Registrar Medidas →
                    </Link>
                </div>
            </div>
        </div>
    );
}

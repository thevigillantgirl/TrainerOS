import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import { Users, Dumbbell, TrendingUp } from 'lucide-react';

async function getDashboardData() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await decrypt(token);
    if (!session || session.role !== 'ADMIN') return null;

    const [tenant, totalStudents, totalTemplates, recentWorkouts] = await Promise.all([
        prisma.tenant.findUnique({ where: { id: session.tenantId } }),
        prisma.user.count({ where: { tenantId: session.tenantId, role: 'STUDENT' } }),
        prisma.workoutTemplate.count({ where: { tenantId: session.tenantId } }),
        prisma.workout.count({ where: { student: { tenantId: session.tenantId }, status: 'COMPLETED' } })
    ]);

    return { tenant, totalStudents, totalTemplates, recentWorkouts };
}

export default async function DashboardPage() {
    const data = await getDashboardData();

    if (!data) {
        return <div>Carregando...</div>;
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Olá, {data.tenant?.name}</h1>
                <p className="text-neutral-400 mt-1">Bem-vindo ao seu painel de controle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400">Total de Alunos</p>
                        <p className="text-2xl font-bold text-white">{data.totalStudents}</p>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-lg">
                        <Dumbbell size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400">Modelos de Treino</p>
                        <p className="text-2xl font-bold text-white">{data.totalTemplates}</p>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex items-center gap-4">
                    <div className="p-3 bg-fuchsia-500/10 text-fuchsia-500 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-neutral-400">Treinos Concluídos</p>
                        <p className="text-2xl font-bold text-white">{data.recentWorkouts}</p>
                    </div>
                </div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 text-white">Atividade Recente</h2>
                {data.recentWorkouts === 0 ? (
                    <p className="text-neutral-500 text-sm">Nenhum treino concluído recentemente.</p>
                ) : (
                    <p className="text-neutral-400 text-sm">Os alunos estão progredindo!</p>
                )}
            </div>
        </div>
    );
}

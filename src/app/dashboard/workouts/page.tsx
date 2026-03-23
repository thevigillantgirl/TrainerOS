import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import AddWorkoutTemplateForm from './AddWorkoutTemplateForm';
import Link from 'next/link';
import { Dumbbell, Target, Filter } from 'lucide-react';

export default async function WorkoutsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await decrypt(token);
    if (!session || session.role !== 'ADMIN') return null;

    const templates = await prisma.workoutTemplate.findMany({
        where: { tenantId: session.tenantId },
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { exercises: true } } }
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                <div>
                    <h1 className="text-3xl font-bold text-white">Fichas de Treino</h1>
                    <p className="text-neutral-400 mt-1">Crie e edite fichas para atribuir aos seus alunos.</p>
                </div>
                <AddWorkoutTemplateForm />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.length === 0 ? (
                    <div className="col-span-full p-12 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-neutral-500 shadow-sm">
                        <p className="text-lg mb-2">Nenhuma ficha criada.</p>
                        <p className="text-sm">Clique em "Novo Treino" para começar.</p>
                    </div>
                ) : (
                    templates.map((template) => (
                        <Link key={template.id} href={`/dashboard/workouts/${template.id}`}>
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 hover:border-emerald-500/50 hover:bg-neutral-800/50 transition-colors cursor-pointer group h-full flex flex-col shadow-sm">
                                <div className="flex justify-between items-start mb-5">
                                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">{template.name}</h3>
                                </div>

                                <div className="space-y-3 mb-6 flex-1 bg-neutral-950 p-4 rounded-lg border border-neutral-800/80">
                                    {template.split && (
                                        <div className="flex items-center text-sm text-neutral-300">
                                            <Filter size={16} className="mr-3 text-emerald-500" />
                                            {template.split}
                                        </div>
                                    )}
                                    {template.objective && (
                                        <div className="flex items-center text-sm text-neutral-300">
                                            <Target size={16} className="mr-3 text-emerald-500" />
                                            {template.objective}
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm text-neutral-300">
                                        <Dumbbell size={16} className="mr-3 text-emerald-500" />
                                        <strong>{template._count.exercises}</strong> &nbsp;exercícios
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-sm mt-auto">
                                    <span className="text-neutral-500 text-xs">Editado em {template.updatedAt.toLocaleDateString('pt-BR')}</span>
                                    <span className="text-emerald-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">Editar Ficha →</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

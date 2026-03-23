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
                {templates.filter(t => !t.deletedAt).length === 0 ? (
                    <div className="col-span-full p-12 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-neutral-500 shadow-sm">
                        <p className="text-lg mb-2">Nenhuma ficha criada ou ativa.</p>
                        <p className="text-sm">Clique em "Novo Treino" para começar.</p>
                    </div>
                ) : (
                    templates.filter(t => !t.deletedAt).map((template) => (
                        <Link key={template.id} href={`/dashboard/workouts/${template.id}`} className="block h-full cursor-default">
                            <div className={`border rounded-xl p-6 transition-colors shadow-sm h-full flex flex-col group
                                ${template.archivedAt ? 'bg-neutral-900/50 border-neutral-800/50 opacity-70' : 'bg-neutral-900 border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-800/50'}`}>
                                <div className="flex justify-between items-start mb-5">
                                    <div>
                                        <h3 className={`text-xl font-bold transition-colors ${template.archivedAt ? 'text-neutral-400' : 'text-white group-hover:text-emerald-400'}`}>
                                            {template.name}
                                        </h3>
                                        {template.archivedAt && <span className="text-xs bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded mt-1 inline-block">Arquivada</span>}
                                    </div>
                                    <div className="flex flex-col gap-1 z-10">
                                        {!template.archivedAt && (
                                            <DeleteConfirmModal
                                                title="Arquivar Ficha"
                                                description={`Arquivar a ficha "${template.name}"? Ela não aparecerá mais para novos alunos, mas quem já a possui não será afetado.`}
                                                buttonText="Arquivar"
                                                variant="warning"
                                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8" /><rect width="22" height="5" x="1" y="3" rx="1" /><line x1="10" x2="14" y1="12" y2="12" /></svg>}
                                                onConfirm={async () => {
                                                    'use server';
                                                    await archiveWorkoutTemplate(template.id);
                                                }}
                                            />
                                        )}
                                        <DeleteConfirmModal
                                            title="Excluir Definitivamente"
                                            description={`Apagar permanentemente a ficha "${template.name}"? Todos os alunos que possuem esta ficha vinculada podem ser afetados.`}
                                            buttonText="Excluir"
                                            variant="danger"
                                            onConfirm={async () => {
                                                'use server';
                                                await deleteWorkoutTemplate(template.id);
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6 flex-1 bg-neutral-950 p-4 rounded-lg border border-neutral-800/80">
                                    {template.split && (
                                        <div className="flex items-center text-sm text-neutral-300">
                                            <Filter size={16} className={`mr-3 ${template.archivedAt ? 'text-neutral-500' : 'text-emerald-500'}`} />
                                            {template.split}
                                        </div>
                                    )}
                                    {template.objective && (
                                        <div className="flex items-center text-sm text-neutral-300">
                                            <Target size={16} className={`mr-3 ${template.archivedAt ? 'text-neutral-500' : 'text-emerald-500'}`} />
                                            {template.objective}
                                        </div>
                                    )}
                                    <div className="flex items-center text-sm text-neutral-300">
                                        <Dumbbell size={16} className={`mr-3 ${template.archivedAt ? 'text-neutral-500' : 'text-emerald-500'}`} />
                                        <strong>{template._count.exercises}</strong> &nbsp;exercícios
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-neutral-800 flex justify-between items-center text-sm mt-auto">
                                    <span className="text-neutral-500 text-xs">Atualizado em {template.updatedAt.toLocaleDateString('pt-BR')}</span>
                                    <span className={`font-medium opacity-0 group-hover:opacity-100 transition-opacity ${template.archivedAt ? 'text-neutral-400' : 'text-emerald-500'}`}>Editar Ficha →</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

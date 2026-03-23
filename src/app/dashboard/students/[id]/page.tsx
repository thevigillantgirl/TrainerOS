import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, User, Calendar, Mail, CheckCircle, Clock } from 'lucide-react';
import AssignWorkoutForm from './AssignWorkoutForm';

export default async function StudentDetailPage({ params }: { params: { id: string } }) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await decrypt(token);
    if (!session || session.role !== 'ADMIN') return null;

    const student = await prisma.user.findUnique({
        where: { id: params.id, tenantId: session.tenantId, role: 'STUDENT' },
        include: {
            profile: true,
            workouts: {
                orderBy: { dateAssigned: 'desc' },
                include: { _count: { select: { exercises: true } } }
            }
        }
    });

    if (!student) return <div className="p-8 text-neutral-400">Aluno não encontrado.</div>;

    const availableTemplates = await prisma.workoutTemplate.findMany({
        where: { tenantId: session.tenantId },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <Link href="/dashboard/students" className="flex items-center text-emerald-500 hover:text-emerald-400 font-medium mb-4">
                <ArrowLeft size={16} className="mr-2" /> Voltar para Alunos
            </Link>

            <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-emerald-900/30 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-2xl shrink-0">
                        {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white leading-tight">{student.name}</h1>
                        <div className="flex flex-wrap gap-4 mt-2">
                            <span className="flex items-center text-sm text-neutral-400">
                                <Mail size={14} className="mr-1.5" /> {student.email}
                            </span>
                            <span className="flex items-center text-sm text-neutral-400">
                                <Calendar size={14} className="mr-1.5" /> Cadastrado em {student.createdAt.toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    </div>
                </div>

                <AssignWorkoutForm studentId={student.id} availableTemplates={availableTemplates} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        Treinos Atribuídos <span className="ml-2 px-2 py-0.5 bg-neutral-800 border border-neutral-700 text-neutral-400 rounded-md text-xs font-normal">{student.workouts.length}</span>
                    </h2>

                    <div className="grid gap-4">
                        {student.workouts.length === 0 ? (
                            <div className="p-8 bg-neutral-900 border border-neutral-800 rounded-xl text-center text-neutral-500">
                                <p>Nenhum treino atribuído para este aluno ainda.</p>
                            </div>
                        ) : (
                            student.workouts.map((workout) => (
                                <div key={workout.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl hover:border-emerald-500/30 transition-colors flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{workout.name}</h3>
                                        <div className="flex items-center gap-3 mt-2">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-md ${workout.status === 'COMPLETED' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' :
                                                    'bg-blue-900/30 text-blue-400 border border-blue-800/50'
                                                }`}>
                                                {workout.status === 'COMPLETED' ? 'CONCLUÍDO' : 'PENDENTE'}
                                            </span>
                                            {workout.dateAssigned && (
                                                <span className="text-sm text-neutral-500 flex items-center">
                                                    <Clock size={14} className="mr-1" />
                                                    Enviado em {workout.dateAssigned.toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-neutral-400 mb-1">{workout._count.exercises} exercícios</p>
                                        {workout.status === 'COMPLETED' && workout.dateCompleted && (
                                            <p className="text-xs text-emerald-500 flex items-center justify-end">
                                                <CheckCircle size={12} className="mr-1" /> Feito em {workout.dateCompleted.toLocaleDateString('pt-BR')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-white">Perfil do Aluno</h2>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
                        <div className="pb-4 border-b border-neutral-800">
                            <span className="block text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Status da Conta</span>
                            <span className="inline-block px-2 py-0.5 bg-emerald-900/30 text-emerald-500 border border-emerald-800/50 rounded text-sm font-bold">ATIVO</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pb-4 border-b border-neutral-800">
                            <div>
                                <span className="block text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Peso Atual</span>
                                <span className="text-white font-medium">{student.profile?.weight ? `${student.profile.weight} kg` : '--'}</span>
                            </div>
                            <div>
                                <span className="block text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Altura</span>
                                <span className="text-white font-medium">{student.profile?.height ? `${student.profile.height} cm` : '--'}</span>
                            </div>
                        </div>

                        <div>
                            <span className="block text-xs text-neutral-500 font-medium mb-1 uppercase tracking-wider">Objetivo</span>
                            <p className="text-neutral-300 text-sm">{student.profile?.goals || 'Não informado.'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

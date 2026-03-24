import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import AddStudentForm from './AddStudentForm';
import Link from 'next/link';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';

export default async function StudentsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await decrypt(token);
    if (!session || session.role !== 'ADMIN') return null;

    const students = await prisma.user.findMany({
        where: { tenantId: session.tenantId, role: 'STUDENT' },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
                <div>
                    <h1 className="text-3xl font-bold text-white">Alunos</h1>
                    <p className="text-neutral-400 mt-1">Gerencie os alunos da sua consultoria.</p>
                </div>
                <AddStudentForm />
            </div>

            <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-neutral-950/50 border-b border-neutral-800 text-neutral-400 text-sm">
                        <tr>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs">Nome</th>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs">Status</th>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs">Data de Cadastro</th>
                            <th className="p-4 font-medium text-right uppercase tracking-wider text-xs">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {students.filter(s => !s.deletedAt).length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-neutral-500">
                                    <p className="text-lg mb-2">Nenhum aluno cadastrado ainda.</p>
                                    <p className="text-sm">Clique em "Novo Aluno" para começar.</p>
                                </td>
                            </tr>
                        ) : (
                            students.filter(s => !s.deletedAt).map((student) => (
                                <tr key={student.id} className="hover:bg-neutral-800/40 transition-colors">
                                    <td className="p-4 text-white font-medium flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase
                                            ${student.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-neutral-500/20 text-neutral-500'}
                                        `}>
                                            {student.name.substring(0, 2)}
                                        </div>
                                        <Link href={`/dashboard/students/${student.id}`} className="hover:underline">
                                            {student.name}
                                        </Link>
                                    </td>
                                    <td className="p-4">
                                        {student.status === 'ACTIVE' ? (
                                            <span className="bg-emerald-500/10 text-emerald-500 px-2.5 py-1 rounded-full text-xs font-medium">Ativo</span>
                                        ) : (
                                            <span className="bg-neutral-500/10 text-neutral-400 px-2.5 py-1 rounded-full text-xs font-medium">Inativo</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-neutral-400 text-sm">{student.createdAt.toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4 text-right flex items-center justify-end gap-2">
                                        <Link href={`/dashboard/students/${student.id}`} className="text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors" title="Ver Perfil">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                        </Link>

                                        {student.status === 'ACTIVE' ? (
                                            <DeleteConfirmModal
                                                title="Desativar Aluno"
                                                description={`O aluno ${student.name} não poderá mais fazer login no sistema, mas todo seu histórico de treinos será mantido.`}
                                                buttonText="Desativar"
                                                variant="warning"
                                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="9" x2="15" y1="9" y2="15" /><line x1="15" x2="9" y1="9" y2="15" /></svg>}
                                                onConfirm={async () => {
                                                    'use server';
                                                    const { deactivateStudent } = await import('./actions');
                                                    await deactivateStudent(student.id);
                                                }}
                                            />
                                        ) : null}

                                        <DeleteConfirmModal
                                            title="Excluir Aluno"
                                            description={`Tem certeza que deseja apagar os dados de ${student.name}? Ele não aparecerá mais nas suas listas.`}
                                            buttonText="Excluir"
                                            variant="danger"
                                            onConfirm={async () => {
                                                'use server';
                                                const { deleteStudent } = await import('./actions');
                                                await deleteStudent(student.id);
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

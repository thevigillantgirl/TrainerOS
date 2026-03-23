import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/auth';
import AddStudentForm from './AddStudentForm';

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
                            <th className="p-4 font-medium uppercase tracking-wider text-xs">Email</th>
                            <th className="p-4 font-medium uppercase tracking-wider text-xs">Data de Cadastro</th>
                            <th className="p-4 font-medium text-right uppercase tracking-wider text-xs">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800">
                        {students.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-12 text-center text-neutral-500">
                                    <p className="text-lg mb-2">Nenhum aluno cadastrado ainda.</p>
                                    <p className="text-sm">Clique em "Novo Aluno" para começar.</p>
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="hover:bg-neutral-800/40 transition-colors">
                                    <td className="p-4 text-white font-medium flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-xs uppercase">
                                            {student.name.substring(0, 2)}
                                        </div>
                                        {student.name}
                                    </td>
                                    <td className="p-4 text-neutral-400">{student.email}</td>
                                    <td className="p-4 text-neutral-400">{student.createdAt.toLocaleDateString('pt-BR')}</td>
                                    <td className="p-4 text-right">
                                        <button className="text-emerald-500 hover:text-emerald-400 text-sm font-medium px-3 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors">Ver Perfil</button>
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

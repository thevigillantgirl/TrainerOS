'use server';

import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function addStudent(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return { success: false, error: 'Sessão expirada. Faça login novamente.' };

        const session = await decrypt(token);
        if (!session || session.role !== 'ADMIN') return { success: false, error: 'Sem permissão.' };

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!name || !email || !password) {
            return { success: false, error: 'Todos os campos são obrigatórios.' };
        }

        // Validação de email duplicado
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: 'STUDENT',
                tenantId: session.tenantId,
                profile: {
                    create: {}
                }
            }
        });

        revalidatePath('/dashboard/students');
        return { success: true };
    } catch (error: any) {
        console.error('Erro no servidor:', error);
        return { success: false, error: 'Ocorreu um erro interno ao salvar o aluno. Tente novamente.' };
    }
}

'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function addWorkoutTemplate(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return { success: false, error: 'Sessão expirada' };
        const session = await decrypt(token);
        if (!session || session.role !== 'ADMIN') return { success: false, error: 'Sem permissão' };

        const name = formData.get('name') as string;
        const objective = formData.get('objective') as string;
        const split = formData.get('split') as string;
        const description = formData.get('description') as string;

        if (!name) return { success: false, error: 'O nome é obrigatório' };

        await prisma.workoutTemplate.create({
            data: {
                name,
                objective,
                split,
                description,
                tenantId: session.tenantId,
            }
        });

        revalidatePath('/dashboard/workouts');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Erro interno ao criar treino' };
    }
}

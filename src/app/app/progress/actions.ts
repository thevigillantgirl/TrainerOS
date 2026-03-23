'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function addProgressEntry(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return { success: false, error: 'Sessão expirada' };

        const session = await decrypt(token);
        if (!session || session.role !== 'STUDENT') return { success: false, error: 'Sem permissão' };

        const weightStr = formData.get('weight') as string;
        const notes = formData.get('notes') as string;

        const weight = weightStr ? parseFloat(weightStr) : null;

        if (!weight) return { success: false, error: 'O peso é obrigatório' };

        // Register Entry
        await prisma.progressEntry.create({
            data: {
                studentId: session.userId,
                weight,
                notes: notes || null,
                date: new Date()
            }
        });

        // Update current physical profile
        await prisma.studentProfile.upsert({
            where: { userId: session.userId },
            update: { weight },
            create: {
                userId: session.userId,
                weight
            }
        });

        revalidatePath('/app/progress');
        revalidatePath('/app');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Erro ao salvar registro.' };
    }
}

'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function addTemplateExercise(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return { success: false, error: 'Sessão expirada' };

        const session = await decrypt(token);
        if (!session || session.role !== 'ADMIN') return { success: false, error: 'Sem permissão' };

        const templateId = formData.get('templateId') as string;
        const exerciseId = formData.get('exerciseId') as string;
        const sets = parseInt(formData.get('sets') as string);
        const reps = formData.get('reps') as string;
        const load = formData.get('load') as string;
        const restTimeStr = formData.get('restTime') as string;
        const restTime = restTimeStr ? parseInt(restTimeStr) : null;
        const notes = formData.get('notes') as string;
        const order = parseInt(formData.get('order') as string);

        if (!templateId || !exerciseId || isNaN(sets) || !reps) {
            return { success: false, error: 'Preencha os campos obrigatórios' };
        }

        await prisma.templateExercise.create({
            data: {
                templateId,
                exerciseId,
                sets,
                reps,
                load: load || null,
                restTime,
                notes: notes || null,
                order
            }
        });

        revalidatePath(`/dashboard/workouts/${templateId}`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Erro interno ao salvar exercício na ficha' };
    }
}

export async function removeTemplateExercise(formData: FormData) {
    try {
        const id = formData.get('templateExerciseId') as string;
        const templateId = formData.get('templateId') as string;

        await prisma.templateExercise.delete({
            where: { id }
        });

        revalidatePath(`/dashboard/workouts/${templateId}`);
    } catch (error) {
        console.error(error);
        // Error handling on server components with form actions is tricky without useActionState
        // For now, we just let it fail silently or log it
    }
}

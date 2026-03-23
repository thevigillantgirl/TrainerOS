'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function assignWorkout(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return { success: false, error: 'Sessão expirada' };

        // Auth Check
        const session = await decrypt(token);
        if (!session || session.role !== 'ADMIN') return { success: false, error: 'Sem permissão' };

        const studentId = formData.get('studentId') as string;
        const templateId = formData.get('templateId') as string;

        if (!studentId || !templateId) {
            return { success: false, error: 'Dados inválidos' };
        }

        // Busca o template completo com seus exercícios
        const template = await prisma.workoutTemplate.findFirst({
            where: { id: templateId, tenantId: session.tenantId },
            include: { exercises: true }
        });

        if (!template) {
            return { success: false, error: 'Ficha não encontrada' };
        }

        if (template.exercises.length === 0) {
            return { success: false, error: 'Esta ficha não tem exercícios. Adicione exercícios a ela primeiro.' };
        }

        // Cria o Workout (instância executável) para o aluno mapeando os exercícios
        await prisma.workout.create({
            data: {
                studentId,
                templateId: template.id,
                name: template.name,
                objective: template.objective,
                split: template.split,
                dateAssigned: new Date(),
                status: 'PENDING',
                exercises: {
                    create: template.exercises.map(ex => ({
                        exerciseId: ex.exerciseId,
                        sets: ex.sets,
                        reps: ex.reps,
                        load: ex.load,
                        restTime: ex.restTime,
                        notes: ex.notes,
                        order: ex.order
                    }))
                }
            }
        });

        revalidatePath(`/dashboard/students/${studentId}`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Erro interno ao atribuir treino' };
    }
}

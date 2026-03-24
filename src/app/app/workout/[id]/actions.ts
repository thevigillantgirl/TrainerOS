'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function toggleExerciseCompletion(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return { success: false, error: 'Sessão expirada' };
        const session = await decrypt(token);
        if (!session || session.role !== 'STUDENT') return { success: false, error: 'Sem permissão' };

        const exerciseId = formData.get('exerciseId') as string;
        const workoutId = formData.get('workoutId') as string;
        const isCompletedStr = formData.get('isCompleted') as string;
        const isCompleted = isCompletedStr === 'true';

        // Verify ownership implicitly
        const workout = await prisma.workout.findUnique({
            where: { id: workoutId, studentId: session.userId }
        });
        if (!workout) return { success: false, error: 'Treino não pertence a você' };

        await prisma.workoutExercise.update({
            where: { id: exerciseId },
            data: { isCompleted: !isCompleted } // toggle
        });

        revalidatePath(`/app/workout/${workoutId}`);
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Erro interno' };
    }
}

export async function finishWorkout(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) throw new Error('Unauthorized');
        const session = await decrypt(token);
        if (!session || session.role !== 'STUDENT') throw new Error('Forbidden');

        const workoutId = formData.get('workoutId') as string;

        const workout = await prisma.workout.findFirst({
            where: { id: workoutId, studentId: session.userId }
        });
        if (!workout) throw new Error('Not found');

        await prisma.workout.update({
            where: { id: workoutId },
            data: {
                status: 'COMPLETED',
                dateCompleted: new Date()
            }
        });

    } catch (error) {
        console.error(error);
    }

    revalidatePath('/app');
    revalidatePath(`/app/workout/${formData.get('workoutId')}`);
    redirect('/app');
}

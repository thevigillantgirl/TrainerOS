'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

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
        if (!token) { /* Handle error or redirect */ }
        const session = await decrypt(token);
        if (!session || session.role !== 'STUDENT') { /* Handle error or redirect */ }

        const workoutId = formData.get('workoutId') as string;

        const workout = await prisma.workout.findUnique({
            where: { id: workoutId, studentId: session.userId }
        });
        if (!workout) { /* Handle error or redirect */ }

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

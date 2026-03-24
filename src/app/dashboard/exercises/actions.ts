'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth';

export async function addExercise(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (!token) return { success: false, error: 'Sessão expirada' };
        const session = await decrypt(token);
        if (!session || session.role !== 'ADMIN') return { success: false, error: 'Sem permissão' };

        const name = formData.get('name') as string;
        const targetMuscle = formData.get('targetMuscle') as string;
        const equipment = formData.get('equipment') as string;
        const instructions = formData.get('instructions') as string;
        const videoUrl = formData.get('videoUrl') as string;

        if (!name) return { success: false, error: 'O nome é obrigatório' };

        // Extrair thumbnail do youtube (simplificado) para dar feedback visual
        let thumbnailUrl = null;
        if (videoUrl && videoUrl.includes('youtube.com/watch?v=')) {
            const videoId = new URL(videoUrl).searchParams.get('v');
            if (videoId) thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        } else if (videoUrl && videoUrl.includes('youtu.be/')) {
            const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            if (videoId) thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }

        await prisma.exercise.create({
            data: {
                name,
                targetMuscle,
                equipment,
                instructions,
                videoUrl: videoUrl || null,
                thumbnailUrl,
                tenantId: session.tenantId, // Exercício personalizado do personal logado
            }
        });

        revalidatePath('/dashboard/exercises');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Erro interno ao criar exercício' };
    }
}

export async function deleteExercise(id: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) throw new Error('Unauthorized');
    const session = await decrypt(token);
    if (!session || session.role !== 'ADMIN') throw new Error('Unauthorized');

    await prisma.exercise.update({
        where: { id, tenantId: session.tenantId },
        data: { deletedAt: new Date() }
    });

    // WIP: Storage Cleanup Integration
    // if (exercise.videoUrl && exercise.videoUrl.includes('s3.amazonaws.com')) {
    //    await deleteFromS3(exercise.videoUrl);
    // }

    revalidatePath('/dashboard/exercises');
}

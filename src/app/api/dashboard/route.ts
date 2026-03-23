import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const tenantId = request.headers.get('x-tenant-id');
        const role = request.headers.get('x-user-role');

        if (!tenantId || role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get metrics
        const [totalStudents, totalTemplates, recentProgress] = await Promise.all([
            prisma.user.count({ where: { tenantId, role: 'STUDENT' } }),
            prisma.workoutTemplate.count({ where: { tenantId } }),
            prisma.progressEntry.findMany({
                where: { student: { tenantId } },
                orderBy: { date: 'desc' },
                take: 5,
                include: { student: { select: { name: true } } }
            })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                totalStudents,
                totalTemplates,
                recentProgress,
            }
        });
    } catch (error) {
        console.error('Dashboard API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

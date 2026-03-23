import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { name, email, password, tenantName } = await request.json();

        if (!name || !email || !password || !tenantName) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Create unique slug for tenant
        const slug = tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 6);
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: tenantName,
                    slug,
                },
            });

            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    name,
                    role: 'ADMIN',
                    tenantId: tenant.id,
                },
            });

            return { tenant, user };
        });

        // Create session token
        const token = await encrypt({
            userId: result.user.id,
            tenantId: result.tenant.id,
            role: result.user.role,
        });

        const response = NextResponse.json({ success: true, user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role } });

        // Set cookie
        response.cookies.set({
            name: 'session',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

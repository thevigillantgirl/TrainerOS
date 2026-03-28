import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/auth';

export async function POST(request: Request) {
    console.log('--- LOGIN ATTEMPT STARTED ---');
    try {
        // 1. Check database connection
        try {
            await prisma.$queryRaw`SELECT 1`;
        } catch (dbError: any) {
            console.error('Database connection error:', dbError);
            return NextResponse.json(
                { error: 'Erro de conexão com o banco de dados.', details: dbError.message },
                { status: 503 }
            );
        }

        // 2. Parse request body
        let body;
        try {
            body = await request.json();
            console.log('Received login body for:', body.email);
        } catch (parseError: any) {
            console.error('Body parse error:', parseError);
            return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
        }

        const { email, password } = body;

        // 3. Validation
        if (!email || !password) {
            console.warn('Missing email or password');
            return NextResponse.json({ error: 'E-mail e senha são obrigatórios.' }, { status: 400 });
        }

        // 4. Find user
        console.log('Searching for user:', email);
        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        if (!user) {
            console.warn('User not found:', email);
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
        }

        // 5. Check password
        console.log('Comparing passwords...');
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            console.warn('Invalid password for user:', email);
            return NextResponse.json({ error: 'Credenciais inválidas.' }, { status: 401 });
        }

        // 6. Create Session
        console.log('Generating session token...');
        const token = await encrypt({
            userId: user.id,
            tenantId: user.tenantId,
            role: user.role,
        });

        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId
            }
        });

        // 7. Set Cookie
        response.cookies.set({
            name: 'session',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
        });

        console.log('--- LOGIN SUCCESSFUL ---');
        return response;

    } catch (error: any) {
        console.error('CRITICAL LOGIN ERROR:', error);
        return NextResponse.json(
            {
                error: 'Erro interno no servidor ao fazer login.',
                details: error.message,
                code: error.code
            },
            { status: 500 }
        );
    }
}

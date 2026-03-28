import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { encrypt } from '@/lib/auth';

export async function POST(request: Request) {
    console.log('--- REGISTER ATTEMPT STARTED ---');
    try {
        // 1. Check database connection
        try {
            await prisma.$queryRaw`SELECT 1`;
        } catch (dbError: any) {
            console.error('Database connection error:', dbError);
            return NextResponse.json(
                { error: 'Erro de conexão com o banco de dados. Verifique a DATABASE_URL.', details: dbError.message },
                { status: 503 }
            );
        }

        // 2. Parse request body
        let body;
        try {
            body = await request.json();
            console.log('Received body:', { ...body, password: '***' });
        } catch (parseError: any) {
            console.error('Body parse error:', parseError);
            return NextResponse.json({ error: 'Corpo da requisição inválido.' }, { status: 400 });
        }

        const { name, email, password, tenantName } = body;

        // 3. Validation
        if (!name || !email || !password || !tenantName) {
            console.warn('Missing fields:', { name: !!name, email: !!email, password: !!password, tenantName: !!tenantName });
            return NextResponse.json({ error: 'Todos os campos são obrigatórios (nome, email, senha, empresa).' }, { status: 400 });
        }

        // 4. Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            console.warn('User already exists:', email);
            return NextResponse.json({ error: 'Este e-mail já está sendo usado.' }, { status: 400 });
        }

        // 5. Hash password
        console.log('Hashing password...');
        const passwordHash = await bcrypt.hash(password, 10);

        // 6. Create Tenant and User in a transaction
        console.log('Creating Tenant and User in transaction...');
        const slug = tenantName.toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 6);

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

        console.log('Transaction successful. User and Tenant created.');

        // 7. Create Session
        console.log('Generating session token...');
        const token = await encrypt({
            userId: result.user.id,
            tenantId: result.tenant.id,
            role: result.user.role,
        });

        const response = NextResponse.json({
            success: true,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role
            }
        });

        // 8. Set Cookie
        response.cookies.set({
            name: 'session',
            value: token,
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
        });

        console.log('--- REGISTER SUCCESSFUL ---');
        return response;

    } catch (error: any) {
        console.error('CRITICAL REGISTRATION ERROR:', error);
        return NextResponse.json(
            {
                error: 'Erro interno no servidor ao registrar.',
                details: error.message,
                code: error.code // Prisma error codes
            },
            { status: 500 }
        );
    }
}

import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'super-secret-key-for-development-only';
const key = new TextEncoder().encode(secretKey);

export interface TokenPayload {
    userId: string;
    tenantId: string;
    role: string;
}

export async function encrypt(payload: TokenPayload) {
    return await new SignJWT(payload as any)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1d')
        .sign(key);
}

export async function decrypt(input: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload as unknown as TokenPayload;
    } catch (error) {
        return null;
    }
}

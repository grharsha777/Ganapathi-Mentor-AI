import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
}
const key = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
    id?: string;
    userId?: string;
    email: string;
    role?: string;
}

export type SignTokenPayload = ({ id: string } | { userId: string }) & {
    email: string;
    role?: string;
};

export async function signToken(payload: SignTokenPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(key);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        const normalizedPayload = payload as unknown as TokenPayload;
        if (normalizedPayload.userId && !normalizedPayload.id) {
            normalizedPayload.id = normalizedPayload.userId;
        }
        if (normalizedPayload.id && !normalizedPayload.userId) {
            normalizedPayload.userId = normalizedPayload.id;
        }
        return normalizedPayload;
    } catch (error) {
        return null;
    }
}

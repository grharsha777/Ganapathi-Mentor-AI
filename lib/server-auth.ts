import { cookies } from 'next/headers';

import { verifyToken, TokenPayload } from '@/lib/auth';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return null;
    }

    const id = payload.id ?? payload.userId;
    if (!id) {
      return null;
    }

    return {
      id,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
import { cookies } from 'next/headers';
import { verifyToken, TokenPayload } from '@/lib/auth';
import mongoose from 'mongoose';

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

    // Validate that the id is a proper MongoDB ObjectId string
    // JWT tokens created from old UUID-based accounts have invalid ObjectIds
    if (!mongoose.isValidObjectId(id)) {
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
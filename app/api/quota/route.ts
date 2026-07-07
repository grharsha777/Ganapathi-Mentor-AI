import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserQuota } from '@/lib/quota';

/**
 * GET /api/quota
 * Returns the authenticated user's current monthly quota across all features.
 * Used by the frontend QuotaBanner component.
 */
export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyToken(token);
        if (!decoded?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const quota = await getUserQuota(decoded.id);
        if (!quota) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ quota });
    } catch (error) {
        console.error('[quota] GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

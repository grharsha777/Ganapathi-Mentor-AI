import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { connectSafe } from '@/lib/mongodb';
import UserContent from '@/models/UserContent';

async function getUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) return null;
        const user = await verifyToken(token) as any;
        return user?.id || user?.email || null;
    } catch {
        return null;
    }
}

/** POST - Save content */
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { feature, key, data, title } = await req.json();
        if (!feature || !key || !data) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const mongo = await connectSafe();
        if (!mongo) {
            // MongoDB not configured — still return success (IndexedDB handles it)
            return NextResponse.json({ ok: true, source: 'local-only' });
        }

        await UserContent.findOneAndUpdate(
            { userId, feature, key },
            { userId, feature, key, title: title || '', data },
            { upsert: true, new: true }
        );

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Content save error:', error);
        return NextResponse.json({ error: 'Save failed' }, { status: 500 });
    }
}

/** GET - Load content (single or list) */
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const feature = searchParams.get('feature');
        const key = searchParams.get('key');

        if (!feature) {
            return NextResponse.json({ error: 'Feature required' }, { status: 400 });
        }

        const mongo = await connectSafe();
        if (!mongo) {
            return NextResponse.json({ items: [], data: null });
        }

        if (key) {
            // Load single item
            const item = await UserContent.findOne({ userId, feature, key }).lean();
            return NextResponse.json({ data: item?.data || null });
        } else {
            // List all items for feature
            const items = await UserContent.find({ userId, feature })
                .sort({ updatedAt: -1 })
                .limit(50)
                .lean();
            return NextResponse.json({
                items: items.map((i: any) => ({
                    key: i.key,
                    title: i.title,
                    data: i.data,
                    feature: i.feature,
                    createdAt: i.createdAt,
                    updatedAt: i.updatedAt,
                }))
            });
        }
    } catch (error: any) {
        console.error('Content load error:', error);
        return NextResponse.json({ error: 'Load failed' }, { status: 500 });
    }
}

/** DELETE - Remove content */
export async function DELETE(req: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const feature = searchParams.get('feature');
        const key = searchParams.get('key');

        if (!feature || !key) {
            return NextResponse.json({ error: 'Feature and key required' }, { status: 400 });
        }

        const mongo = await connectSafe();
        if (mongo) {
            await UserContent.deleteOne({ userId, feature, key });
        }

        return NextResponse.json({ ok: true });
    } catch (error: any) {
        console.error('Content delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

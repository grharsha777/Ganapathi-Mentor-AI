import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import Challenge from '@/models/Challenge';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        const { slug } = await params;
        const challenge = await Challenge.findOne({ slug }).lean();

        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 });
        }

        return NextResponse.json({ challenge });
    } catch (error: any) {
        console.error('Challenge detail error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

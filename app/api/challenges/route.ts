import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import Challenge from '@/models/Challenge';

export async function GET(req: NextRequest) {
    try {
        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        const { searchParams } = new URL(req.url);
        const difficulty = searchParams.get('difficulty');
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const filter: any = {};
        if (difficulty) filter.difficulty = difficulty;
        if (category) filter.category = category;
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
            ];
        }

        const challenges = await Challenge.find(filter)
            .select('title slug difficulty category source tags created_at')
            .sort({ difficulty: 1, title: 1 })
            .lean();

        return NextResponse.json({ challenges });
    } catch (error: any) {
        console.error('Challenge list error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

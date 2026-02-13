import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import UserIntegration from '@/models/UserIntegration';
import { verifyToken } from '@/lib/auth';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const conn = await connectSafe();
        if (conn) {
            const integration = await UserIntegration.findOne({ user_id: decoded.userId });
            if (integration?.github_token) {
                return NextResponse.json({ hasToken: true, source: 'user' });
            }
        }

        return NextResponse.json({
            hasToken: !!GITHUB_TOKEN,
            source: GITHUB_TOKEN ? 'env' : null,
        });
    } catch (error) {
        console.error('GitHub check error:', error);
        return NextResponse.json({ hasToken: !!GITHUB_TOKEN, source: GITHUB_TOKEN ? 'env' : null });
    }
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { token: githubToken } = await req.json();

        if (!githubToken) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Validate token by making a test request to GitHub
        const testResponse = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `Bearer ${githubToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'Ganapathi-Mentor-AI'
            },
        });

        if (!testResponse.ok) {
            return NextResponse.json({ error: 'Invalid GitHub token' }, { status: 400 });
        }

        const githubUser = await testResponse.json();

        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'Database not configured. Add MONGODB_URI to save token.' }, { status: 503 });

        // Upsert the integration
        await UserIntegration.findOneAndUpdate(
            { user_id: decoded.userId },
            {
                github_token: githubToken,
                updated_at: new Date()
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({
            success: true,
            username: githubUser.login,
        });
    } catch (error) {
        console.error('GitHub token save error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

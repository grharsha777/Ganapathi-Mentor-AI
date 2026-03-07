import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { generateText } from '@/lib/ai';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { profile, repos, starred } = await req.json();

        const prompt = `You are Ganapathi Mentor AI, a wise and insightful coding mentor. Analyze this GitHub developer's profile and give them a personalized, encouraging, and actionable developer growth report.

DEVELOPER PROFILE:
- Name: ${profile?.name || profile?.login || 'Unknown'}
- Username: @${profile?.login}
- Bio: ${profile?.bio || 'None'}
- Location: ${profile?.location || 'Unknown'}
- Followers: ${profile?.followers || 0}
- Following: ${profile?.following || 0}
- Public Repos: ${profile?.public_repos || 0}
- Joined: ${profile?.created_at ? new Date(profile.created_at).getFullYear() : 'Unknown'}

TOP REPOSITORIES (by recent activity):
${(repos || []).slice(0, 15).map((r: any) => `- ${r.name}: ${r.language || 'N/A'} | ⭐${r.stars} | ${r.description || 'No desc'} | Updated: ${r.updated_at?.split('T')[0]}`).join('\n')}

LANGUAGES USED: ${[...new Set((repos || []).map((r: any) => r.language).filter(Boolean))].join(', ')}
STARRED REPOS: ${starred?.length || 0}

Give a response in this EXACT JSON format (no markdown, just raw JSON):
{
  "overallGrade": "A letter grade A+ to F based on their activity",
  "title": "A fun RPG-style developer title for them",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "weeklyGoals": ["goal 1", "goal 2", "goal 3"],
  "mentorMessage": "A 2-3 sentence personalized motivational message from Ganapathi Mentor AI",
  "techStack": "A one-line summary of their primary tech stack",
  "riskAreas": ["risk 1 if any"],
  "skillRadar": {"coding": 0-100, "collaboration": 0-100, "documentation": 0-100, "consistency": 0-100, "diversity": 0-100}
}`;

        const { text } = await generateText(prompt);

        // Parse JSON from the response
        let analysis;
        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch {
            analysis = null;
        }

        if (!analysis) {
            return NextResponse.json({
                overallGrade: 'B+',
                title: 'Rising Developer',
                strengths: ['Active on GitHub', 'Multiple languages', 'Consistent updates'],
                improvements: ['Add more README files', 'Contribute to open-source', 'Add licenses'],
                weeklyGoals: ['Push code daily', 'Star 3 interesting repos', 'Write documentation'],
                mentorMessage: 'Keep building and learning! Your journey is just beginning.',
                techStack: 'Full-stack developer',
                riskAreas: ['Some repos lack documentation'],
                skillRadar: { coding: 70, collaboration: 50, documentation: 40, consistency: 60, diversity: 75 }
            });
        }

        return NextResponse.json(analysis);
    } catch (error) {
        console.error('GitHub analysis error:', error);
        return NextResponse.json({
            overallGrade: 'B',
            title: 'Aspiring Builder',
            strengths: ['Growing portfolio'],
            improvements: ['Keep coding daily'],
            weeklyGoals: ['Push to one repo today'],
            mentorMessage: 'Every expert was once a beginner. Keep going!',
            techStack: 'Multi-language developer',
            riskAreas: [],
            skillRadar: { coding: 60, collaboration: 50, documentation: 40, consistency: 50, diversity: 60 }
        });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import { chatCompletion } from '@/lib/ai';
import { verifyToken } from '@/lib/auth';
import Challenge from '@/models/Challenge';

const INTERVIEWER_PROMPT = `You are Ganapathi AI — a world-class senior software engineering interviewer at a top-tier tech company (Google/Meta/Amazon level), built by G R Harsha.

You are conducting a live technical interview. Your role:

1. Assess the candidate's problem-solving approach, not just their final answer
2. Ask clarifying questions about their approach BEFORE they code
3. After they submit code, ask follow-up questions about:
   - Time and space complexity
   - Edge cases they considered
   - Alternative approaches
   - How they would optimize further
4. Be encouraging but thorough — simulate a real FAANG interview
5. Grade them on: Problem Understanding, Approach, Code Quality, Communication, Optimization

Keep responses concise and conversational, like a real interviewer would speak.`;

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const { action, difficulty, category, messages, code, language, challengeId } = await req.json();

        const conn = await connectSafe();
        if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

        // Action: Start a new interview — pick a random challenge
        if (action === 'start') {
            const filter: any = {};
            if (difficulty) filter.difficulty = difficulty;
            if (category) filter.category = category;

            const challenges = await Challenge.find(filter).lean();
            if (challenges.length === 0) {
                return NextResponse.json({ error: 'No challenges found. Please seed problems first.' }, { status: 404 });
            }

            const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

            // Generate the interview opening
            const opening = await chatCompletion(
                [{
                    role: 'user',
                    content: `Start a technical interview for this problem. Introduce yourself briefly, present the problem, and ask the candidate to walk you through their initial approach before coding.

Problem: "${randomChallenge.title}"
Description: ${randomChallenge.description}
Difficulty: ${randomChallenge.difficulty}
Category: ${randomChallenge.category}`
                }],
                INTERVIEWER_PROMPT
            );

            return NextResponse.json({
                challenge: {
                    _id: randomChallenge._id,
                    title: randomChallenge.title,
                    slug: (randomChallenge as any).slug,
                    difficulty: randomChallenge.difficulty,
                    category: randomChallenge.category,
                    description: randomChallenge.description,
                    examples: randomChallenge.examples,
                    constraints: randomChallenge.constraints,
                    starterCode: randomChallenge.starterCode,
                },
                interviewerMessage: opening,
            });
        }

        // Action: Send a message during the interview (conversation)
        if (action === 'chat') {
            if (!messages || messages.length === 0) {
                return NextResponse.json({ error: 'Messages required' }, { status: 400 });
            }

            const response = await chatCompletion(messages, INTERVIEWER_PROMPT);
            return NextResponse.json({ interviewerMessage: response });
        }

        // Action: Submit code for review during interview
        if (action === 'submit_code') {
            if (!code || !language) {
                return NextResponse.json({ error: 'Code and language required' }, { status: 400 });
            }

            const codeReviewMessage = `The candidate has submitted their solution. Review it as an interviewer would — ask about their approach, complexity, and suggest improvements.

Language: ${language}
Code:
\`\`\`${language}
${code}
\`\`\`

Provide interviewer-style feedback and follow-up questions.`;

            const allMessages = [
                ...(messages || []),
                { role: 'user', content: codeReviewMessage }
            ];

            const response = await chatCompletion(allMessages, INTERVIEWER_PROMPT);
            return NextResponse.json({ interviewerMessage: response });
        }

        // Action: Generate final report card
        if (action === 'report') {
            const reportPrompt = `The interview is now complete. Based on the entire conversation, generate a detailed Interview Report Card.

Format it as:

## 📋 Interview Report Card

### Scores (out of 10):
| Category | Score | Notes |
|----------|-------|-------|
| Problem Understanding | X/10 | ... |
| Approach & Strategy | X/10 | ... |
| Code Quality | X/10 | ... |
| Communication | X/10 | ... |
| Optimization Thinking | X/10 | ... |

### Overall Score: X/50

### Strengths:
- ...

### Areas for Improvement:
- ...

### Interviewer's Final Recommendation:
[Hire / Lean Hire / Lean No Hire / No Hire]

Be fair, detailed, and constructive.`;

            const allMessages = [
                ...(messages || []),
                { role: 'user', content: reportPrompt }
            ];

            const report = await chatCompletion(allMessages, INTERVIEWER_PROMPT);
            return NextResponse.json({ report });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Interview API error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

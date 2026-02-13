import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import Question from '@/models/Question';
import { verifyToken } from '@/lib/auth';
import { explainConcept, explainRepo } from '@/lib/ai';

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        await connectToDatabase();
        const body = await req.json();
        const { question, repoId, fileId, sessionId, context, eli5 } = body;

        if (!question) {
            return NextResponse.json({ error: 'Question is required' }, { status: 400 });
        }

        let answerData;
        const finalQuestion = eli5
            ? `${question} (Please explain this like I am 5 years old, using simple analogies)`
            : question;

        try {
            if (repoId || fileId || context) {
                answerData = await explainRepo(context || "No context provided.", finalQuestion);
            } else {
                answerData = await explainConcept(finalQuestion);
            }
        } catch (aiError: any) {
            console.error('AI Generation Error:', aiError);
            return NextResponse.json({
                answer: "I'm having trouble generating a response right now. Please try again in a moment.",
                error: aiError.message,
                timestamp: new Date().toISOString()
            });
        }

        const answer = answerData?.content || "Sorry, I couldn't generate an answer.";

        try {
            await Question.create({
                user_id: decoded.userId,
                session_id: sessionId || null,
                question: question,
                answer: answer,
            });
        } catch (dbError) {
            console.error('Error saving question to DB:', dbError);
        }

        return NextResponse.json({
            answer,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message
        }, { status: 500 });
    }
}

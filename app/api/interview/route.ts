import { NextRequest, NextResponse } from 'next/server';
import { connectSafe } from '@/lib/mongodb';
import { chatCompletion, getAIModel } from '@/lib/ai';
import { verifyToken } from '@/lib/auth';
import { generateObject } from 'ai';
import { z } from 'zod';
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

// Schema for AI-generated questions
const questionsSchema = z.object({
    questions: z.array(z.object({
        question: z.string().describe("The interview question"),
        category: z.string().describe("Category/topic of the question"),
        difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe("Difficulty level"),
        hint: z.string().describe("A helpful hint for the candidate"),
        expectedApproach: z.string().describe("Brief expected approach or key points"),
    }))
});

// Company style prompts
function getCompanyStylePrompt(company: string): string {
    const styles: Record<string, string> = {
        google: "Focus heavily on algorithms, data structures, and system design. Include questions about scalability, distributed systems, and optimal time/space complexity. Google-style interviews emphasize problem decomposition and clean algorithmic thinking.",
        microsoft: "Focus on object-oriented design, problem-solving patterns, and practical coding. Include questions about design patterns, system architecture, and real-world engineering scenarios. Microsoft-style interviews value clear communication and structured thinking.",
        meta: "Focus on frontend engineering, React architecture, scalable systems, and product thinking. Include questions about UI performance, state management, and large-scale web applications. Meta-style interviews emphasize move-fast engineering culture.",
        amazon: "Follow Amazon's Leadership Principles approach. Include system design, scalability patterns, and behavioral aspects in technical questions. Amazon-style interviews focus on customer obsession, ownership, and delivering results at scale.",
        apple: "Focus on performance optimization, user experience engineering, and elegant code design. Include questions about memory management, UI frameworks, and attention to detail. Apple-style interviews value craftsmanship and polish.",
        netflix: "Focus on microservices architecture, data streaming, resilience patterns, and autonomous decision-making. Netflix-style interviews emphasize freedom and responsibility culture with deep technical expertise."
    };
    return styles[company] || "";
}

// Category-specific prompt guidance
function getCategoryPrompt(category: string): string {
    const prompts: Record<string, string> = {
        'React': "Focus on React hooks, component lifecycle, state management, performance optimization, virtual DOM, React patterns like compound components, render props, and HOCs.",
        'Python': "Focus on Python-specific concepts: generators, decorators, list comprehensions, asyncio, type hints, memory management, GIL, and Pythonic coding patterns.",
        'JavaScript': "Focus on JS fundamentals: closures, prototypal inheritance, event loop, promises, async/await, ES6+ features, DOM manipulation, and TypeScript concepts.",
        'Java': "Focus on Java OOP concepts, generics, collections framework, multithreading, JVM internals, design patterns, and Spring framework concepts.",
        'C++': "Focus on C++ concepts: pointers, memory management, RAII, templates, STL containers, move semantics, and low-level optimization.",
        'TypeScript': "Focus on TypeScript type system: generics, conditional types, mapped types, decorators, module systems, and type narrowing.",
        'System Design': "Focus on distributed systems: load balancing, caching strategies, database sharding, microservices, message queues, API design, and CAP theorem.",
        'Data Structures': "Focus on arrays, linked lists, trees, graphs, hash tables, heaps, tries, and their time/space complexity trade-offs.",
        'Algorithms': "Focus on sorting, searching, dynamic programming, graph algorithms, greedy algorithms, backtracking, and complexity analysis.",
        'SQL & Databases': "Focus on SQL queries, joins, indexing, normalization, transactions, ACID properties, NoSQL vs SQL, and query optimization.",
        'Machine Learning': "Focus on supervised/unsupervised learning, neural networks, model evaluation, feature engineering, bias-variance tradeoff, and practical ML system design.",
        'Cloud & DevOps': "Focus on AWS/GCP/Azure services, CI/CD pipelines, containerization, Kubernetes, infrastructure as code, monitoring, and cloud architecture patterns.",
        'Cybersecurity': "Focus on OWASP top 10, authentication/authorization, encryption, network security, secure coding practices, and threat modeling.",
        'Node.js': "Focus on Node.js event loop, streams, cluster module, Express.js, middleware patterns, error handling, and performance optimization.",
        'Aptitude': "Focus on quantitative aptitude: number series, percentages, ratios, time/work/distance problems, probability, permutations/combinations, and logical deduction.",
        'English': "Focus on reading comprehension, grammar, vocabulary, sentence correction, verbal reasoning, and professional communication skills assessment.",
        'Mathematics': "Focus on calculus, linear algebra, probability & statistics, discrete mathematics, number theory, and mathematical problem-solving.",
        'Physics': "Focus on mechanics, thermodynamics, electromagnetism, optics, modern physics, and applied physics problem-solving.",
        'Logical Reasoning': "Focus on syllogisms, blood relations, coding-decoding, direction sense, seating arrangements, puzzles, and analytical reasoning.",
        'General Knowledge': "Focus on current affairs, technology trends, famous computer scientists, landmark innovations, economic concepts, and general awareness about the tech industry.",
    };
    return prompts[category] || `Focus on ${category} concepts and practical interview questions.`;
}

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const decoded = await verifyToken(token) as any;
        if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

        const body = await req.json();
        const { action, difficulty, category, messages, code, language, questionCount, companyStyle, currentQuestion, totalQuestions, answeredCount, timeSpent, company } = body;

        // Action: Generate dynamic interview questions
        if (action === 'generate_questions') {
            const qCount = Math.min(30, Math.max(5, questionCount || 15));
            const categoryName = category || 'General Software Engineering';
            const diffLevel = difficulty || 'Medium';
            const companyPrompt = companyStyle ? getCompanyStylePrompt(companyStyle) : '';
            const categoryPrompt = getCategoryPrompt(categoryName);

            const difficultyInstruction = diffLevel === 'Mixed'
                ? "Generate a mix of Easy (30%), Medium (40%), and Hard (30%) questions."
                : `All questions should be at ${diffLevel} difficulty level.`;

            const prompt = `You are an expert technical interviewer for top-tier companies. Generate exactly ${qCount} interview questions for a ${categoryName} interview.

${companyPrompt ? `Company Style: ${companyPrompt}\n` : ''}
Category Focus: ${categoryPrompt}

Difficulty: ${difficultyInstruction}

Requirements:
- Questions must be practical and commonly asked in real FAANG-level interviews
- Include a mix of conceptual, problem-solving, and application-based questions
- Each question should be unique and progressively challenging
- Include helpful hints that guide without giving away the answer
- Include a brief expected approach for evaluation
- Make questions specific to ${categoryName}
- Questions should feel like a real ${companyStyle ? companyStyle.charAt(0).toUpperCase() + companyStyle.slice(1) : 'top-tier company'} interview
- For coding categories, include both theoretical and coding questions
- For non-coding categories (aptitude, english, maths, physics), format questions appropriately with multiple choice or short answer expectations`;

            try {
                const model = getAIModel();
                const { object } = await generateObject({
                    model: model as any,
                    schema: questionsSchema,
                    prompt: prompt,
                });

                return NextResponse.json({
                    questions: object.questions,
                    totalGenerated: object.questions.length,
                    category: categoryName,
                    difficulty: diffLevel,
                    companyStyle: companyStyle || null,
                });
            } catch (genError: any) {
                console.error('Question generation error:', genError);
                return NextResponse.json({ error: 'Failed to generate questions: ' + genError.message }, { status: 500 });
            }
        }

        // Action: Start a new interview — pick a random challenge (legacy support)
        if (action === 'start') {
            const conn = await connectSafe();
            if (!conn) return NextResponse.json({ error: 'DB not connected' }, { status: 503 });

            const filter: any = {};
            if (difficulty) filter.difficulty = difficulty;
            if (category) filter.category = category;

            const challenges = await Challenge.find(filter).lean();
            if (challenges.length === 0) {
                return NextResponse.json({ error: 'No challenges found. Please seed problems first.' }, { status: 404 });
            }

            const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];

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

            const contextPrompt = currentQuestion
                ? `${INTERVIEWER_PROMPT}\n\nCurrent question being discussed:\nQuestion: ${currentQuestion.question}\nCategory: ${currentQuestion.category}\nDifficulty: ${currentQuestion.difficulty}\nExpected approach: ${currentQuestion.expectedApproach || ''}\n\nEvaluate the candidate's response in context of this specific question. Ask follow-up questions if their answer is incomplete. Be encouraging but maintain interviewer-level rigor.`
                : INTERVIEWER_PROMPT;

            const response = await chatCompletion(messages, contextPrompt);
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

Interview Details:
- Category: ${category || 'General'}
- Company Style: ${company || 'General'}
- Total Questions: ${totalQuestions || 'Unknown'}
- Questions Answered: ${answeredCount || 'Unknown'}
- Time Spent: ${timeSpent ? Math.floor(timeSpent / 60) + ' minutes ' + (timeSpent % 60) + ' seconds' : 'Unknown'}

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

### Question-wise Performance:
Brief summary of performance on each question discussed.

### Interviewer's Final Recommendation:
[Strong Hire / Hire / Lean Hire / Lean No Hire / No Hire]

### Personalized Study Plan:
Based on the performance, suggest 3-5 specific topics or resources to study.

Be fair, detailed, and constructive. This report should help the candidate improve.`;

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

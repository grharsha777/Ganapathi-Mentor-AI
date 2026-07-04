export type RoadmapPhaseType =
    | 'ideation'
    | 'research'
    | 'design'
    | 'build'
    | 'ai_coding'
    | 'deployment'
    | 'presentation'
    | 'marketing'
    | 'demo'
    | 'docs';

export interface RoadmapPhase {
    id: string;
    type: RoadmapPhaseType;
    title: string;
    description: string;
    tools: string[]; // Tool IDs mapping to data.ts tools or custom ones if not found
    checklist: string[];
    goldenPrompt?: string;
    templates?: { title: string, url: string }[];
}

export interface RoadmapTemplate {
    id: string;
    title: string;
    useCase: string;
    shortLabel: string;
    icon: string;
    timeframe: string;
    description: string;
    phases: RoadmapPhase[];
}

export const ROADMAP_TEMPLATES: RoadmapTemplate[] = [
    {
        id: 'hackathon',
        title: 'Hackathon Edition',
        useCase: 'Hackathons',
        shortLabel: 'Hackathon',
        icon: '🏆',
        timeframe: '~48h',
        description: 'Complete end-to-end roadmap for winning hackathons — from ideation to final pitch.',
        phases: [
            {
                id: 'h1', type: 'ideation', title: 'Ideation', description: 'Brainstorm and refine your idea into a winner.', tools: ['chatgpt', 'perplexity', 'notebook-lm'],
                checklist: ['Define the problem statement', 'Validate the target audience', 'Brainstorm 3 unique features'],
                goldenPrompt: 'Act as an expert hackathon judge. My team is building an app in the [X] space for a [Y] hour hackathon. Suggest 3 highly innovative, technically complex yet achievable features that will wow the judges.',
                templates: [{ title: 'Problem Statement Format', url: '#' }]
            },
            {
                id: 'h2', type: 'research', title: 'Market Research', description: 'Validate the technical feasibility and existing solutions.', tools: ['consensus', 'perplexity'],
                checklist: ['Identify top 2 competitors', 'List missing features in competitors', 'Confirm APIs/SDKs are available'],
                goldenPrompt: 'Conduct a quick competitive analysis on apps that solve [Problem]. What are they missing that I can build using a combination of AI APIs (like OpenAI) and modern web tech in 48 hours?',
                templates: [{ title: 'Competitive Analysis', url: '#' }]
            },
            {
                id: 'h3', type: 'design', title: 'UI / UX Design', description: 'Wireframe and design visually stunning interfaces.', tools: ['figma', 'v0-dev', 'bolt'],
                checklist: ['Create a moody/dark color palette', 'Generate UI components in v0.dev', 'Design logo/branding'],
                goldenPrompt: 'Act as a Lead UI Engineer. Define a clean, implementable design system for a Hackathon project. Recommend a specific React component library (e.g. Shadcn), a primary color hex code, and list the 4 essential screens to build.',
                templates: [{ title: 'Color Palette Guide', url: '#' }, { title: 'Wireframe Template', url: '#' }]
            },
            {
                id: 'h4', type: 'build', title: 'Website / App Build', description: 'Set up the boilerplate and core logic.', tools: ['replit', 'supabase', 'vercel'],
                checklist: ['Init Next.js / React app', 'Set up Supabase tables/auth', 'Build responsive landing page'],
                goldenPrompt: 'Write the SQL required to initialize a Supabase database for my [App Type]. I need a users table, and a [Core Feature] table. Include Row Level Security (RLS) policies.',
            },
            {
                id: 'h5', type: 'ai_coding', title: 'AI Coding ()', description: 'Implement complex features fast with AI.', tools: ['cursor', 'bolt', 'replit'],
                checklist: ['Integrate LLM API', 'Write core application routing', 'Fix major bugs'],
                goldenPrompt: 'Write a robust Next.js API route that accepts a user prompt, calls the OpenAI GPT-4o API using the new structured outputs format, and streams the response back to the client natively.',
            },
            {
                id: 'h6', type: 'deployment', title: 'Git & Deployment', description: 'Ship it to a live URL.', tools: ['github-pages', 'vercel', 'railway'],
                checklist: ['Push code to GitHub', 'Connect repo to Vercel/Railway', 'Verify live URL works'],
                goldenPrompt: 'Write a comprehensive but concise README.md for my hackathon project. Include an "Inspiration", "How we built it", "Challenges we ran into", and "What\'s next" section.',
            },
            {
                id: 'h7', type: 'presentation', title: 'PPT / Pitch Deck', description: 'Create a compelling presentation.', tools: ['gamma', 'canva-slides'],
                checklist: ['Generate slides using Gamma', 'Include a team slide', 'Outline the business model'],
                goldenPrompt: 'Write a compelling script for a 3-minute hackathon pitch. Hook the audience in the first 10 seconds, explain the problem, demo the solution, and end with the impact.',
            },
            {
                id: 'h8', type: 'demo', title: 'Demo & Submission', description: 'Record walkthrough and submit on Devpost.', tools: ['loom', 'capcut', 'devpost'],
                checklist: ['Record 2-min Loom demo', 'Edit out mistakes', 'Submit to Devpost/Hackathon platform'],
                goldenPrompt: 'Review my Devpost submission description. Edit it to sound more punchy, highlighting the technical stack and the real-world impact of the project.',
            }
        ]
    },
    {
        id: 'research-paper',
        title: 'Research Paper Sprint',
        useCase: 'Research',
        shortLabel: 'Research',
        icon: '📚',
        timeframe: '~50m',
        description: 'Find papers, summarize evidence, and write a literature review in record time.',
        phases: [
            {
                id: 'r1', type: 'research', title: 'Literature Search', description: 'Find relevant academic papers quickly.', tools: ['consensus', 'perplexity', 'elicit'],
                checklist: ['Search core thesis', 'Save top 5 papers', 'Extract key claims'],
                goldenPrompt: 'Summarize the current academic consensus on [Topic] based on papers published in the last 3 years. Highlight key disagreements or gaps in the literature.'
            },
            {
                id: 'r2', type: 'ideation', title: 'Analysis & Synthesis', description: 'Chat with your PDFs to extract insights.', tools: ['notebook-lm', 'chatgpt'],
                checklist: ['Upload PDFs to NotebookLM', 'Generate summarization audio/notes', 'Outline literature review'],
                goldenPrompt: 'Act as a peer reviewer. Based on the attached methodology, point out 3 potential flaws or confounding variables that I should address in the discussion section.'
            },
            {
                id: 'r3', type: 'docs', title: 'Writing & Formatting', description: 'Draft the paper in standard academic format.', tools: ['overleaf', 'latex'],
                checklist: ['Draft intro', 'Write methodology', 'Format citations automatically'],
                goldenPrompt: 'Convert the following bullet points of research findings into a cohesive, academically toned paragraph suitable for an IEEE/ACM journal literature review section.'
            }
        ]
    },
    {
        id: 'mvp-launch',
        title: 'MVP Launch in 2 Hours',
        useCase: 'Startup / MVP',
        shortLabel: 'MVP',
        icon: '🚀',
        timeframe: '~2h',
        description: 'Go from idea to deployed app with landing page in under 2 hours.',
        phases: [
            {
                id: 'm1', type: 'ideation', title: 'Core Mechanics', description: 'Define the absolute minimum viable product.', tools: ['chatgpt', 'figma'],
                checklist: ['List exactly 1 core feature', 'Draft landing page copy', 'Buy domain name'],
                goldenPrompt: 'I want to build a startup that does [X]. Tell me what the absolute Minimum Viable Product (MVP) should be. Strip away all nice-to-have features so I can launch today.'
            },
            {
                id: 'm2', type: 'build', title: 'Generate UI & Code', description: 'Use AI to generate the entire React app.', tools: ['v0-dev', 'bolt', 'replit'],
                checklist: ['Generate UI in v0', 'Export React code', 'Attach Supabase auth'],
                goldenPrompt: 'Generate a sleek, modern landing page UI for a SaaS product. Include a hero section with a compelling headline, a features grid, and an email waitlist signup form. Use Tailwind CSS and dark mode.'
            },
            {
                id: 'm3', type: 'deployment', title: 'Deploy to Cloud', description: 'Push to Vercel and go live.', tools: ['vercel', 'github-pages'],
                checklist: ['Deploy via Vercel', 'Test auth flow', 'Post on Twitter/X'],
                goldenPrompt: 'I am getting a build error on Vercel: [Paste Error]. How do I fix this dependency issue in Next.js?'
            }
        ]
    },
    {
        id: 'presentation',
        title: 'PPT + Video Presentation',
        useCase: 'Presentations',
        shortLabel: 'Presentation',
        icon: '🎬',
        timeframe: '~50m',
        description: 'Create professional slides and a polished video walkthrough.',
        phases: [
            {
                id: 'p1', type: 'design', title: 'Slide Generation', description: 'Auto-generate slides with AI.', tools: ['gamma', 'canva-slides'],
                checklist: ['Enter prompt in Gamma', 'Edit theme/colors', 'Export to PDF'],
                goldenPrompt: 'Create a 10-slide outline for a presentation about [Topic]. Each slide should have a title, 3 bullet points, and a suggestion for a compelling visual graphic.'
            },
            {
                id: 'p2', type: 'demo', title: 'Video Recording', description: 'Record voiceover and screen.', tools: ['loom', 'elevenlabs'],
                checklist: ['Write script', 'Record screen with Loom', 'Generate AI voiceover (optional)'],
                goldenPrompt: 'Turn my bullet points into a conversational, engaging script for a 3-minute video presentation.'
            },
            {
                id: 'p3', type: 'presentation', title: 'Editing & Polish', description: 'Add music and captions.', tools: ['capcut'],
                checklist: ['Auto-generate captions', 'Add subtle background music', 'Export 1080p video'],
            }
        ]
    },
    {
        id: 'portfolio',
        title: 'Student Portfolio in 1 Hour',
        useCase: 'Portfolio',
        shortLabel: 'Portfolio',
        icon: '💼',
        timeframe: '~1h',
        description: 'Build and deploy a stunning personal portfolio website.',
        phases: [
            {
                id: 'pf1', type: 'design', title: 'Template Setup', description: 'Generate a portfolio template.', tools: ['v0-dev', 'bolt'],
                checklist: ['Generate hero section', 'Add projects grid', 'Update resume link'],
                goldenPrompt: 'Generate a highly aesthetic, minimalistic developer portfolio UI using Tailwind CSS. Include sections for: Hero (with animated greeting), Selected Projects (cards with image placeholders), and Contact.'
            },
            {
                id: 'pf2', type: 'marketing', title: 'Content & Screenshots', description: 'Make your projects look good.', tools: ['shots', 'unsplash'],
                checklist: ['Capture project screenshots', 'Wrap in browser mockups (Shots)', 'Write case studies'],
                goldenPrompt: 'Write a 3-sentence summary highlighting the technical challenges and outcome of a project built with React and Node.js.'
            },
            {
                id: 'pf3', type: 'deployment', title: 'Host Free', description: 'Deploy to GitHub Pages.', tools: ['github-pages', 'vercel'],
                checklist: ['Push to GitHub', 'Enable Pages', 'Add custom domain'],
            }
        ]
    },
    {
        id: 'marketing',
        title: 'Social Media Content Blitz',
        useCase: 'Marketing',
        shortLabel: 'Marketing',
        icon: '📱',
        timeframe: '~50m',
        description: 'Create posts, reels, and graphics for your project launch.',
        phases: [
            {
                id: 'sm1', type: 'ideation', title: 'Copywriting', description: 'Generate viral hooks and posts.', tools: ['chatgpt', 'claude'],
                checklist: ['Write Twitter thread', 'Write LinkedIn post', 'Generate relevant tags'],
                goldenPrompt: 'Write a viral LinkedIn launch post for an AI project. Start with a compelling hook about a common problem, introduce the tool as the solution, and end with a strong Call to Action. Limit emojis.'
            },
            {
                id: 'sm2', type: 'design', title: 'Graphics & Code Snips', description: 'Create visually appealing launch assets.', tools: ['canva-slides', 'carbon'],
                checklist: ['Create 1080x1080 graphic', 'Generate code snippet image (Carbon)', 'Export PNGs'],
            },
            {
                id: 'sm3', type: 'demo', title: 'Short Form Video', description: 'Create a Reel/TikTok.', tools: ['capcut', 'invideo', 'suno'],
                checklist: ['Generate AI voice script', 'Add stock B-roll', 'Export 9:16 vertical video'],
            }
        ]
    },
    {
        id: 'academics',
        title: 'Academic Project Submission',
        useCase: 'Academics',
        shortLabel: 'Academics',
        icon: '🎓',
        timeframe: '~3h',
        description: 'Complete your semester project — code, docs, and presentation.',
        phases: [
            {
                id: 'ac1', type: 'build', title: 'Finalize Code', description: 'Clean up code and comments.', tools: ['cursor', 'replit'],
                checklist: ['Refactor core logic', 'Format code', 'Add detailed inline comments'],
                goldenPrompt: 'Add descriptive JSDoc comments to all functions in this file. Explain the parameters, return types, and potential side effects to make it look professional for grading.'
            },
            {
                id: 'ac2', type: 'docs', title: 'Documentation & Diagrams', description: 'Create UMLs and architecture charts.', tools: ['excalidraw', 'chatgpt'],
                checklist: ['Generate ER diagram', 'Draw system architecture', 'Write API docs'],
                goldenPrompt: 'Generate Mermaid.js syntax for an Entity Relationship (ER) diagram containing exactly 3 tables: Users, Orders, and Products. Show standard relationships.'
            },
            {
                id: 'ac3', type: 'presentation', title: 'Viva / Defense Prep', description: 'Prepare for teacher Q&A.', tools: ['gamma', 'chatgpt'],
                checklist: ['Create 5 defense slides', 'Generate mock questions', 'Practice answers'],
                goldenPrompt: 'Act as a strict Computer Science professor. Ask me 3 challenging questions about my project architecture (a Next.js app using Supabase) to test my understanding.'
            }
        ]
    },
    {
        id: 'ai-app',
        title: 'AI App Prototype',
        useCase: 'AI / ML Projects',
        shortLabel: 'AI Prototype',
        icon: '🤖',
        timeframe: '~2h',
        description: 'Build an AI-powered app prototype for competitions or demos.',
        phases: [
            {
                id: 'ap1', type: 'ideation', title: 'AI Pipeline Design', description: 'Map out the inputs and outputs.', tools: ['chatgpt', 'excalidraw'],
                checklist: ['Define AI API to use', 'Map data flow', 'Design system prompt'],
                goldenPrompt: 'Help me design a multi-step AI pipeline using LangChain. I want to take a user PDF, extract text, summarize it, and generate a quiz. What specific models and steps should I use?'
            },
            {
                id: 'ap2', type: 'build', title: 'App Scaffolding', description: 'Generate UI and hook up models.', tools: ['bolt', 'v0-dev'],
                checklist: ['Build chat/input UI', 'Connect to OpenAI/Anthropic API', 'Handle loading states'],
            },
            {
                id: 'ap3', type: 'deployment', title: 'Host & Demo', description: 'Ship it fast.', tools: ['railway', 'vercel'],
                checklist: ['Deploy backend', 'Deploy frontend', 'Test live API connection'],
            }
        ]
    }
];

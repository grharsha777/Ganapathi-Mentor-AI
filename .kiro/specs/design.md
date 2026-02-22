# Ganapathi Mentor AI — System Design & Architecture
> **Project Codename**: Neural Code Symbiosis  
> **Version**: 4.0.0 (Production + Feedback, Onboarding, Challenges, YouTube Intelligence)  
> **System Architect**: G R Harsha  
> **Last Updated**: February 22, 2026  
> **Status**: Production • All Platforms (Mobile / Tablet / Desktop / TV)

---

## 1. Executive Summary

**Ganapathi Mentor AI** represents a paradigm shift in developer education and productivity. It is not merely a learning management system but a **Symbiotic AI Ecosystem** that integrates deeply with the developer's workflow. By leveraging a **Multi-Modal Neural Engine**, **Real-Time Context Awareness**, and **Hyper-Personalized RAG (Retrieval-Augmented Generation)**, it acts as a 24/7 Senior Staff Engineer mentor, accelerating capabilities from junior to expert levels.

The system is built on a **Serverless, Edge-First Architecture** designed for zero-latency interactions, massive scalability, and enterprise-grade security. The platform combines cutting-edge AI orchestration with premium user experience, creating an immersive environment that enhances developer productivity and learning outcomes.

### Key Differentiators
- **Multi-Model AI Orchestration**: Dynamically routes queries to optimal AI models (Mistral, Groq, HuggingFace)
- **Best Friend AI Personality**: Chatbot speaks like a helpful friend, not a corporate robot
- **Fully Responsive**: Dual-rendering UI — mobile sidebar drawer + desktop macOS dock
- **YouTube Thumbnail Embeds**: Videos rendered as rich cards with play button overlays
- **Touch-Optimized**: All interactions work with touch, mouse, and keyboard
- **Offline-First Architecture**: IndexedDB caching ensures functionality without internet
- **Premium UX**: Framer Motion (desktop), CSS transitions (mobile), glassmorphism
- **19 Integrated Modules**: Dashboard, Learning, Review, Concepts, Tasks, Docs, GitHub, Analytics, Anomalies, Collab, Research, Studio, Challenges, Interview, CodeCollab, Portfolio, Quick Prep, Training, Settings
- **Feedback System**: In-app feedback form with category pills, star rating, email delivery via Web3Forms
- **Onboarding Tutorial**: First-time animated walkthrough with 6 feature slides, per-user dismissal
- **Coding Challenges**: XP-rewarding coding problems with difficulty levels, leaderboard, and auto-grading
- **YouTube Intelligence**: Recency-filtered search (last 3 years), embeddable-only, relevance-ordered
- **Per-User Data Isolation**: All IndexedDB keys scoped by user email — account switching shows different data
- **Enterprise-Ready**: Security, scalability, and compliance built-in from day one

---

## 2. Architectural Principles

### 2.1 Symbiotic Intelligence
The system does not just "reply" to queries; it **anticipates** intent. Through continuous analysis of user behavior, code context, and learning history, Ganapathi AI proactively offers resources, code refactors, and conceptual deep-dives before the user even asks.

**Implementation**:
- Session tracking stores user activity, topics covered, and interaction patterns
- AI context includes current page, recent actions, and user profile
- Predictive recommendations based on learning velocity and skill gaps

### 2.2 Neural-First Design
Core logic is driven by probabilistic AI models rather than deterministic rules. The **Language Model Orchestration Layer** dynamically selects the optimal model (Gemini 1.5 Pro, Mistral Large, Claude 3.5 Sonnet, Groq Llama 3.3) based on query complexity, cost, and latency requirements.

**Model Selection Strategy**:
- **Mistral Large**: Primary model for general queries (balanced cost/quality)
- **Groq Llama 3.3**: Fast inference for simple questions (< 500ms response)
- **Google Gemini 1.5 Pro**: Complex reasoning, long context (1M tokens)
- **Claude 3.5 Sonnet**: Coding tasks, refactoring, documentation

### 2.3 Fluid Interface (Zero-UI)
The user experience is designed to be invisible. **Framer Motion** powers a physics-based, gesture-driven interface that feels alive. Transitions are seamless, protecting flow state. The **Glassmorphism** aesthetic reduces cognitive load, focusing attention purely on content.

**UX Principles**:
- 60fps animations with GPU acceleration (Framer Motion on desktop only)
- Mobile: CSS-only transitions — zero framer-motion for instant response
- Dual navigation: Mobile sidebar drawer (< 1024px) vs desktop macOS dock (≥ 1024px)
- Touch-friendly: All tap targets ≥ 44px, `touch-action: manipulation`
- Fluid typography: `clamp()` CSS scales from 320px phones to 4K TVs
- Safe area support: `env(safe-area-inset-*)` for notched phones
- Optimistic UI updates (show changes immediately, sync later)
- Skeleton loaders for perceived performance
- Micro-interactions provide feedback for every action
- Dark mode optimized for night coding sessions
- Respects `prefers-reduced-motion` for accessibility

### 2.4 Offline-First Resilience
**IndexedDB** (via Dexie.js) provides client-side persistence. Users can continue working without internet: view roadmaps, read saved content, draft code reviews. Changes sync automatically when connection restored.

**Offline Capabilities**:
- Cached learning paths and milestones
- Saved code reviews and documentation
- Chat history and conversation context
- User profile and preferences
- Dual-write strategy ensures data consistency

### 2.5 Edge-Native Performance
Deployed on **Vercel Edge Network** with 150+ global locations. Serverless functions execute at the edge closest to users, minimizing latency. Static assets cached aggressively with 1-year TTL.

**Performance Optimizations**:
- Server-side rendering (SSR) for SEO and initial load
- Incremental Static Regeneration (ISR) for dynamic content
- Code splitting and lazy loading
- Image optimization with blur placeholders
- Font subsetting and preloading

---

## 3. High-Level Technology Stack

| Layer | Technologies | Rationale |
|-------|--------------|-----------|
| **Frontend Framework** | **Next.js 16 (App Router)**, **React 19** | Cutting-edge RSC (React Server Components) for optimal performance and SEO. App Router provides file-based routing and layouts. |
| **Language & Type Safety** | **TypeScript 5.7**, **Zod 3.25** | Type-safe development with runtime validation. Zod schemas ensure data integrity. |
| **UI System** | **TailwindCSS 3.4**, **Framer Motion 12**, **Shadcn/UI** | Utility-first CSS with GPU-accelerated animations. Shadcn provides accessible, customizable components. |
| **State Management** | **React Hooks**, **Context API** | Built-in React state management. No external libraries needed for current scale. |
| **AI Orchestration** | **Vercel AI SDK 6.0**, **LangChain** (future) | Unified interface for multi-provider LLM streams, tool calling, and structured outputs. |
| **AI Models** | **Mistral Large**, **Groq Llama 3.3**, **Google Gemini 1.5 Pro**, **Claude 3.5 Sonnet** | Multi-model strategy for optimal cost/performance. Automatic failover for reliability. |
| **Primary Database** | **MongoDB Atlas (Serverless)** | Schemaless flexibility for evolving AI data models. Serverless tier auto-scales. Collections: Users, Sessions, LearningPaths, Teams, CodeReviews, Concepts, Metrics. |
| **Client-Side Storage** | **IndexedDB (Dexie.js 4.0)** | Offline-first capability. Instant "optimistic" UI updates before server sync. Stores: roadmaps, chat history, user preferences. |
| **Authentication** | **JWT (Jose 6.1)**, **bcryptjs** | Stateless, secure, edge-compatible authentication. JWT tokens in HTTP-only cookies. Passwords hashed with bcrypt. |
| **API Integration** | **Octokit 5.0** (GitHub), **Tavily**, **Semantic Scholar**, **arXiv**, **ElevenLabs**, **Stability AI** | Rich ecosystem of external services for enhanced functionality. |
| **Infrastructure** | **Vercel Edge Network** | Global CDN and Serverless Functions execution for <50ms latency. Automatic scaling to 10k+ concurrent users. |
| **Monitoring** | **Vercel Analytics**, **Console Logging** | Real-time performance monitoring and error tracking. |
| **Version Control** | **Git**, **GitHub** | Source code management with feature branch workflow. |

---

## 4. System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
        PWA[Progressive Web App]
    end

    subgraph "Edge Layer (Vercel)"
        CDN[Global CDN<br/>150+ Locations]
        Middleware[Next.js Middleware<br/>JWT Auth]
        EdgeFn[Edge Functions<br/>API Routes]
    end

    subgraph "AI Orchestration Layer"
        AISDK[Vercel AI SDK<br/>Model Router]
        Mistral[Mistral Large<br/>Primary]
        Groq[Groq Llama 3.3<br/>Fast Inference]
        Gemini[Google Gemini 1.5 Pro<br/>Complex Reasoning]
        Claude[Claude 3.5 Sonnet<br/>Coding Tasks]
    end

    subgraph "Knowledge Augmentation (RAG)"
        Wikipedia[Wikipedia API]
        Tavily[Tavily Web Search]
        ArXiv[arXiv Papers]
        Semantic[Semantic Scholar]
        StackEx[Stack Exchange]
    end

    subgraph "Creative Services"
        Stability[Stability AI<br/>Image Gen]
        Freepik[Freepik API<br/>Assets]
        ElevenLabs[ElevenLabs<br/>TTS]
        Suno[Suno AI<br/>Music]
        HeyGen[HeyGen<br/>Video Avatars]
    end

    subgraph "Data Layer"
        MongoDB[(MongoDB Atlas<br/>Primary DB)]
        IndexedDB[(IndexedDB<br/>Client Cache)]
    end

    subgraph "External Integrations"
        GitHub[GitHub API<br/>OAuth + Repos]
        OAuth[OAuth Providers<br/>Google, GitHub]
    end

    Browser --> CDN
    Mobile --> CDN
    PWA --> CDN
    
    CDN --> Middleware
    Middleware --> EdgeFn
    
    EdgeFn --> AISDK
    EdgeFn --> MongoDB
    EdgeFn --> GitHub
    EdgeFn --> OAuth
    
    AISDK --> Mistral
    AISDK --> Groq
    AISDK --> Gemini
    AISDK --> Claude
    
    AISDK --> Wikipedia
    AISDK --> Tavily
    AISDK --> ArXiv
    AISDK --> Semantic
    AISDK --> StackEx
    
    EdgeFn --> Stability
    EdgeFn --> Freepik
    EdgeFn --> ElevenLabs
    EdgeFn --> Suno
    EdgeFn --> HeyGen
    
    Browser -.->|Offline Cache| IndexedDB
    IndexedDB -.->|Sync| MongoDB
    
    style AISDK fill:#6366f1
    style MongoDB fill:#00ed64
    style CDN fill:#f59e0b
```

---

## 5. Detailed Module Specifications

### 5.1 Authentication & User Management Module

**Purpose**: Secure user authentication, authorization, and profile management

**Architecture**:
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;        // MongoDB User _id
  email: string;
  role: 'admin' | 'editor' | 'viewer' | 'owner';
  iat: number;          // Issued at timestamp
  exp: number;          // Expiration (7 days)
}

// User Schema (MongoDB)
interface User {
  _id: string;          // UUID
  email: string;        // Unique, indexed
  full_name?: string;
  avatar_url?: string;
  role: string;
  password_hash: string; // bcrypt hashed
  created_at: Date;
  updated_at: Date;
  metrics: {
    streak: number;
    xp: number;
    level: number;
  };
}
```

**Authentication Flow**:
1. User submits email/password to `/api/auth/login`
2. Server validates credentials, hashes password with bcrypt
3. On success, generates JWT token using jose library
4. Token stored in HTTP-only cookie (secure, SameSite=strict)
5. Middleware validates token on protected routes
6. Token refresh handled automatically before expiration

**OAuth Flow** (Google):
1. User clicks "Sign in with Google"
2. Redirect to `/api/auth/oauth?provider=google`
3. OAuth callback receives authorization code
4. Exchange code for user profile
5. Create/update user in MongoDB
6. Generate JWT token and set cookie

**Security Measures**:
- Passwords never stored in plaintext
- JWT secret stored in environment variables
- Token expiration enforced (7 days)
- HTTP-only cookies prevent XSS attacks
- CSRF protection via SameSite cookies
- Rate limiting on auth endpoints (10 attempts/hour)

---

### 5.2 The Neural Chatbot Module

**Purpose**: Conversational AI interface accessible from any page — acts like a best friend who's also an expert coder

**Architecture**:
- **Global Component**: `<GlobalChatbot />` rendered in root layout
- **Floating UI**: Responsive FAB — `bottom-4` on mobile, `bottom-24` on desktop (above dock)
- **Chat Panel**: Full-width on mobile (`left-2 right-2`), fixed-width on desktop (`560-620px`)
- **Streaming Responses**: Plain text responses with markdown rendering
- **Context Injection**: Current page URL and user activity passed to AI
- **Best Friend Personality**: Casual, warm, encouraging tone with emojis

**AI Personality (System Prompt)**:
```
- Talk like a best friend who happens to be an expert coder
- Use phrases like "Hey!", "No worries!", "You got this! 💪"
- Never be robotic — imagine sitting next to the user helping them
- If user makes a mistake: "Oh I see what happened — easy fix!"
- Celebrate wins: "Nice! That's solid code 🔥"
```

**YouTube Video Rendering**:
```typescript
// AI outputs: {{youtube:VIDEO_ID|Video Title}}
// Frontend renders as embedded thumbnail with:
// - YouTube thumbnail image (mqdefault.jpg)
// - Red play button overlay
// - Video title bar at bottom
// - Click opens YouTube in new tab
```

**Tool Calling**:
The chatbot enriches responses with external data:
- `searchYouTubeVideos`: Fetches video IDs for thumbnail embedding
- `searchWeb` (Tavily/SERP): Real-time information retrieval
- `generateImage` (HuggingFace/Freepik): On-demand image generation
- `generateVideo` (HuggingFace): AI video generation

**Markdown Rendering** (`MarkdownContent` component):
- `{{youtube:ID|Title}}` → Embedded thumbnail card
- `[text](url)` → Styled link (internal navigation, YouTube, LinkedIn, GitHub, email)
- Triple backtick code blocks with syntax highlighting + copy button
- `**bold**`, `` `inline code` ``, `# headings`
- Images: `![alt](src)` → Rounded, shadowed images

**Responsive Behavior**:
| Screen | FAB Position | Panel Size |
|--------|-------------|------------|
| Mobile | `bottom-4 right-4` | Full-width, `70vh` height |
| Tablet | `bottom-6 right-6` | `420px` width |
| Desktop | `bottom-24 right-6` | `560-620px` width, `720px` height |

---

### 5.3 The Neural Concept Engine

**Purpose**: Explain complex technical concepts at adaptive difficulty levels

**Explanation Tiers**:
1. **ELI5 (Beginner)**: Metaphor-rich, simple language, no jargon
2. **Professional (Intermediate)**: Industry terminology, practical examples
3. **Research (Advanced)**: Deep internals, memory management, compiler theory

**Implementation**:
```typescript
async function explainConcept(
  concept: string, 
  level: 'beginner' | 'intermediate' | 'advanced'
): Promise<Explanation> {
  const systemPrompt = getSystemPromptForLevel(level);
  const { text } = await generateText({
    system: systemPrompt,
    prompt: `Explain: ${concept}`,
    tools: aiTools, // Can search for additional context
    maxSteps: 3
  });
  
  return {
    content: text,
    level,
    relatedConcepts: extractRelatedConcepts(text),
    resources: await findResources(concept)
  };
}
```

**Concept Tracking**:
- MongoDB collection stores mastered concepts per user
- Skill vectors updated based on concept mastery
- Recommendations based on knowledge gaps

**Visual Synthesis** (Future):
- Generate Mermaid.js diagrams for architecture
- Flowcharts for algorithms
- UML diagrams for OOP concepts

---

### 5.4 Learning Path Generator Module

**Purpose**: Create personalized, AI-generated learning roadmaps

**Data Model**:
```typescript
interface LearningPath {
  _id: ObjectId;
  user_id: string;
  title: string;
  description: string;
  role: string; // "Frontend Developer", "DevOps Engineer", etc.
  status: 'in_progress' | 'completed' | 'archived';
  generated_from_repo_url?: string;
  milestones: Milestone[];
  created_at: Date;
  updated_at: Date;
}

interface Milestone {
  title: string;
  description: string;
  week: number;
  order_index: number;
  due_date: Date;
  is_completed: boolean;
  resources: Resource[];
}

interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'doc' | 'course';
  is_completed: boolean;
}
```

**Generation Flow**:
1. User inputs target role (e.g., "Senior React Developer")
2. Optional: Provide GitHub repo URL for skill gap analysis
3. AI generates 4-week roadmap with weekly milestones
4. Each milestone includes 3-5 curated resources
5. Roadmap saved to MongoDB and cached in IndexedDB
6. User can track progress, mark resources complete

**AI Prompt Engineering**:
```typescript
const prompt = `
Create a personalized 4-week learning roadmap for a ${role}.
Focus areas: ${focusAreas || 'General improvement'}
Current skill level: ${skillLevel}

Provide 4 milestones (1 per week) with:
- Clear learning objectives
- 3-5 high-quality resources (YouTube, articles, docs, courses)
- Realistic time estimates
- Progressive difficulty

Format as JSON matching the roadmapSchema.
`;
```

**Fallback Strategy**:
If AI unavailable, use template roadmaps with generic milestones. User can customize manually.

**Progress Tracking**:
- Visual progress bars for each milestone
- Completion percentage for overall roadmap
- XP rewards for completing milestones
- Streak tracking for daily engagement

---

### 5.5 Code Intelligence Suite Module

**Purpose**: AI-powered code review, documentation, and refactoring

**Code Review Flow**:
1. User pastes code snippet (up to 10k characters)
2. Specify language (JavaScript, Python, etc.)
3. Optional context (e.g., "This is a React component")
4. AI analyzes code for:
   - **Bugs**: Logic errors, null pointer exceptions
   - **Security**: SQL injection, XSS vulnerabilities, hardcoded secrets
   - **Performance**: Inefficient algorithms, memory leaks
   - **Style**: Naming conventions, code organization
   - **Patterns**: Design patterns used, alternatives
5. Generate structured feedback with suggestions

**Analysis Schema**:
```typescript
interface CodeAnalysis {
  summary: string;
  patterns: Array<{
    name: string;
    explanation: string;
    alternatives: string;
  }>;
  complexConcepts: Array<{
    concept: string;
    explanation: string;
    resourceLink: string;
  }>;
  suggestions: string[];
  documentation: string; // Auto-generated JSDoc
  complexityScore: number;
}
```

**Rule-Based Fallback**:
When AI unavailable, use static analysis:
- Detect `console.log` statements
- Find TODO/FIXME comments
- Check for missing error handling in async code
- Identify long functions (>50 lines)
- Flag missing type annotations (TypeScript)

**Auto-Documentation**:
Generate documentation in appropriate format:
- **JavaScript/TypeScript**: JSDoc comments
- **Python**: Docstrings (Google/NumPy style)
- **Java**: Javadoc
- **README**: Project overview, setup instructions, API reference

**Persistence**:
- Save code reviews to MongoDB with user association
- Track complexity scores over time
- Analytics on common issues per user

---

### 5.6 Creative Studio Module

**Purpose**: Multi-modal AI for generating images, voice, music, and video

**Image Generation**:
```typescript
interface ImageGenerationRequest {
  prompt: string;
  negative_prompt?: string;
  size: 'square' | 'landscape' | 'portrait';
  num_images: number;
}

// Supported APIs
- Stability AI (Stable Diffusion XL)
- Freepik API (text-to-image)
- Picsart API (image editing)
```

**Voice Synthesis (TTS)**:
```typescript
interface VoiceRequest {
  text: string;
  voice_id: string; // ElevenLabs voice ID
  model: 'eleven_monolingual_v1' | 'eleven_multilingual_v2';
  settings: {
    stability: number; // 0-1
    similarity_boost: number; // 0-1
  };
}

// Returns: ArrayBuffer (audio data)
```

**Music Generation** (Suno AI):
- Generate ambient focus music
- Customizable tempo, mood, instruments
- Export as MP3 for offline listening

**Video Avatars** (HeyGen):
- Create AI avatar videos for tutorials
- Text-to-video with realistic lip-sync
- Multiple avatar styles and voices

**Asset Management**:
- Save generated assets to MongoDB (MediaProject collection)
- Organize by project/category
- Share assets with team members
- Export/download in various formats

---

### 5.7 Productivity Hub Module

**Purpose**: Task management, GitHub integration, and productivity analytics

**Eisenhower Matrix**:
```typescript
interface Task {
  id: string;
  title: string;
  description: string;
  quadrant: 'do_first' | 'schedule' | 'delegate' | 'delete';
  priority: number; // 1-5
  due_date?: Date;
  completed: boolean;
  created_at: Date;
}

// AI auto-categorizes tasks based on:
- Urgency (deadline proximity)
- Importance (impact on goals)
- Effort (estimated time)
- Dependencies (blocking other tasks)
```

**GitHub Integration**:
```typescript
// OAuth Flow
1. User authorizes GitHub access
2. Store encrypted access token
3. Fetch user repositories
4. Analyze commit history
5. Display insights:
   - Most used languages
   - Commit frequency
   - Active repositories
   - Contribution patterns
```

**Repository Analytics**:
- Language breakdown (pie chart)
- Commit activity (line chart)
- Stars and forks
- Recent commits with messages
- Code quality trends

**Meeting Agenda Builder**:
- Input: Unstructured notes/thoughts
- AI Output: Structured agenda with:
  - Meeting objectives
  - Discussion topics
  - Action items
  - Time allocations
  - Attendee assignments

---

### 5.8 Team Collaboration Module

**Purpose**: Multi-user workspaces, shared resources, and team analytics

**Data Model**:
```typescript
interface Team {
  _id: ObjectId;
  name: string;
  created_by: string; // User ID
  created_at: Date;
  updated_at: Date;
}

interface TeamMember {
  team_id: ObjectId;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  joined_at: Date;
}
```

**Team Features**:
- **Shared Learning Paths**: Create roadmaps visible to all team members
- **Collaborative Code Reviews**: Team members can review each other's code
- **Team Analytics**: Aggregate metrics (total XP, completion rates, active members)
- **Leaderboards**: Weekly rankings by XP to encourage friendly competition
- **Resource Library**: Shared collection of articles, videos, code snippets

**Permissions**:
- **Owner**: Full control, can delete team
- **Admin**: Manage members, edit shared resources
- **Member**: View and contribute to shared content
- **Viewer**: Read-only access

**Team Dashboard**:
- Overview of team performance
- Recent activity feed
- Top contributors
- Shared learning paths progress
- Team goals and milestones

---

### 5.9 Analytics & Insights Module

**Purpose**: Track user progress, learning velocity, and skill development

**Personal Dashboard**:
```typescript
interface UserStats {
  streak: number; // Consecutive days active
  skillsMastered: number; // Concepts marked as mastered
  weeklyGoal: number; // Percentage of weekly goal completed
  xpPoints: number; // Total experience points
  level: string; // "Junior Dev", "Senior Architect", etc.
}
```

**XP System**:
- Complete milestone: +50 XP
- Solve challenge: +30 XP
- Code review: +25 XP
- Concept mastery: +20 XP
- Daily login: +5 XP

**Level Progression**:
1. Junior Developer (0-500 XP)
2. Mid-Level Developer (500-1500 XP)
3. Senior Developer (1500-3000 XP)
4. Staff Engineer (3000-5000 XP)
5. Principal Engineer (5000+ XP)

**Activity Feed**:
- Timeline of recent actions
- XP earned per activity
- Milestones completed
- Concepts mastered
- Code reviews submitted

**Performance Charts**:
- Learning velocity (concepts/week)
- XP trend over time
- Skill distribution (radar chart)
- Productivity metrics (tasks completed)

**Anomaly Detection** (Future):
- AI detects unusual patterns (e.g., sudden drop in activity)
- Suggests interventions (e.g., "Take a break", "Try easier content")
- Personalized recommendations based on behavior

---

### 5.10 Interview Preparation Module

**Purpose**: AI-powered mock interviews with real-time feedback

**Interview Types**:
1. **Technical Coding**: Solve algorithms, explain solutions
2. **Behavioral**: STAR method questions, soft skills
3. **System Design**: Architecture discussions, scalability
4. **Code Walkthrough**: Explain existing code verbally

**Voice-First Interaction**:
- User speaks answers (Web Speech API)
- AI transcribes and analyzes response
- Real-time feedback on clarity, completeness, accuracy

**Scoring Dimensions**:
```typescript
interface InterviewScore {
  technical_depth: number; // 1-10
  communication: number; // 1-10
  problem_solving: number; // 1-10
  confidence: number; // 1-10
  overall: number; // Average
  feedback: string[];
  improvement_areas: string[];
}
```

**Question Bank**:
- 500+ curated interview questions
- Categorized by role, difficulty, topic
- Real questions from FAANG companies
- Community-contributed questions

**Recording & Review**:
- Save interview sessions
- Replay audio/video
- Review AI feedback
- Track improvement over time

---

### 5.11 Research & Discovery Module

**Purpose**: Centralized hub for academic and web research

**Integrated Search**:
```typescript
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: 'wikipedia' | 'arxiv' | 'semantic_scholar' | 'tavily' | 'stack_exchange';
  metadata?: {
    authors?: string[];
    published_date?: string;
    citations?: number;
    pdf_url?: string;
  };
}
```

**Research Tools**:
- **Wikipedia**: Quick definitions and overviews
- **arXiv**: Academic papers (physics, CS, math)
- **Semantic Scholar**: Scientific papers with citation graphs
- **Tavily**: Real-time web search for latest news/tutorials
- **Stack Exchange**: Programming Q&A from Stack Overflow

**Research Hub UI**:
- Unified search interface
- Filter by source type
- Save interesting papers/articles
- Organize into collections
- Export citations (BibTeX, APA, MLA)

**Citation Management** (Future):
- Personal research library
- Automatic citation generation
- PDF annotation and highlighting
- Collaboration features (shared libraries)

---

### 5.12 Alerts & Notifications Module

**Purpose**: Keep users informed of important events and deadlines

**Alert Types**:
```typescript
interface Alert {
  _id: ObjectId;
  user_id: string;
  type: 'milestone_due' | 'team_invite' | 'achievement' | 'system';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  action_url?: string;
  read: boolean;
  created_at: Date;
}
```

**Notification Channels**:
- **In-App**: Badge on alerts icon, toast notifications
- **Email**: Optional email notifications for critical alerts
- **Push**: Browser push notifications (with permission)

**Alert Triggers**:
- Milestone deadline approaching (3 days before)
- Team invitation received
- Achievement unlocked (new level, streak milestone)
- System announcements (new features, maintenance)
- Code review feedback received
- Team member activity (shared resource, comment)

**Alert Management**:
- Mark as read/unread
- Dismiss permanently
- Snooze for later
- Filter by type/severity
- Bulk actions (mark all read)

---

## 6. Data Model & Schema Design

### 6.1 MongoDB Collections

#### Users Collection
Stores user identity, authentication, preferences, and aggregate metrics.

```typescript
interface User {
  _id: string; // UUID
  email: string; // Unique, indexed
  full_name?: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'viewer' | 'owner';
  password_hash: string; // bcrypt hashed, select: false
  created_at: Date;
  updated_at: Date;
  
  // User preferences
  preferences?: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    notifications_enabled: boolean;
    email_notifications: boolean;
  };
  
  // Gamification metrics
  metrics: {
    streak: number; // Consecutive days active
    xp: number; // Total experience points
    level: number; // Current level (1-10)
    skills_mastered: number; // Count of mastered concepts
  };
  
  // Learning profile
  profile?: {
    current_role: string; // "Frontend Developer", etc.
    target_role: string;
    experience_years: number;
    learning_goals: string[];
    availability_hours_per_week: number;
  };
}

// Indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ created_at: -1 });
```

#### Sessions Collection
Tracks user activity sessions for analytics and context.

```typescript
interface Session {
  _id: ObjectId;
  user_id: string; // References User._id
  team_id?: ObjectId; // Optional team context
  started_at: Date;
  ended_at?: Date;
  duration_minutes?: number;
  
  // Session metadata
  title?: string; // Auto-generated or user-provided
  summary?: string; // AI-generated summary
  topics: string[]; // Topics covered in session
  
  // Activity tracking
  activities: Array<{
    type: 'chat' | 'code_review' | 'concept' | 'roadmap' | 'challenge';
    timestamp: Date;
    details: any;
  }>;
  
  // Metrics
  xp_earned: number;
  concepts_learned: number;
  tasks_completed: number;
}

// Indexes
db.sessions.createIndex({ user_id: 1, started_at: -1 });
db.sessions.createIndex({ ended_at: -1 });
```

#### LearningPaths Collection
Stores personalized learning roadmaps with milestones and resources.

```typescript
interface LearningPath {
  _id: ObjectId;
  user_id: string; // References User._id
  title: string;
  description: string;
  role: string; // Target role
  status: 'in_progress' | 'completed' | 'archived';
  
  // Generation metadata
  generated_from_repo_url?: string;
  ai_model_used?: string;
  generation_prompt?: string;
  
  // Milestones (embedded documents)
  milestones: Array<{
    title: string;
    description: string;
    week: number;
    order_index: number;
    due_date: Date;
    is_completed: boolean;
    completed_at?: Date;
    
    // Resources (embedded)
    resources: Array<{
      title: string;
      url: string;
      type: 'video' | 'article' | 'doc' | 'course';
      is_completed: boolean;
      completed_at?: Date;
      estimated_duration_minutes?: number;
    }>;
  }>;
  
  // Progress tracking
  progress_percentage: number; // 0-100
  total_resources: number;
  completed_resources: number;
  
  created_at: Date;
  updated_at: Date;
}

// Indexes
db.learningPaths.createIndex({ user_id: 1, status: 1 });
db.learningPaths.createIndex({ created_at: -1 });
```

#### CodeReviews Collection
Stores code review history and AI feedback.

```typescript
interface CodeReview {
  _id: ObjectId;
  user_id: string; // References User._id
  code_snippet: string; // Max 50k characters
  language: string; // "javascript", "python", etc.
  context?: string; // User-provided context
  
  // AI analysis
  ai_feedback: string; // JSON stringified CodeAnalysis
  ai_model_used: string;
  complexity_score: number; // 0-100
  
  // Categorized issues
  issues: Array<{
    type: 'bug' | 'security' | 'performance' | 'style';
    severity: 'critical' | 'warning' | 'info';
    line_number?: number;
    description: string;
    suggestion?: string;
  }>;
  
  // Generated documentation
  auto_documentation?: string;
  
  created_at: Date;
}

// Indexes
db.codeReviews.createIndex({ user_id: 1, created_at: -1 });
db.codeReviews.createIndex({ complexity_score: -1 });
```

#### Concepts Collection
Tracks concept mastery and learning progress.

```typescript
interface Concept {
  _id: ObjectId;
  user_id: string; // References User._id
  concept_name: string; // "React Hooks", "Binary Search", etc.
  category: string; // "Frontend", "Algorithms", "DevOps", etc.
  
  // Mastery tracking
  mastery_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  confidence_score: number; // 0-100
  
  // Learning history
  first_learned_at: Date;
  last_reviewed_at: Date;
  review_count: number;
  
  // Related concepts
  prerequisites: string[]; // Concept names
  related_concepts: string[];
  
  // Resources used
  resources_viewed: Array<{
    title: string;
    url: string;
    viewed_at: Date;
  }>;
  
  // Quiz/challenge results
  quiz_scores: Array<{
    score: number; // 0-100
    taken_at: Date;
  }>;
}

// Indexes
db.concepts.createIndex({ user_id: 1, concept_name: 1 }, { unique: true });
db.concepts.createIndex({ category: 1, mastery_level: 1 });
```

#### Teams Collection
Stores team workspaces and metadata.

```typescript
interface Team {
  _id: ObjectId;
  name: string;
  description?: string;
  created_by: string; // User._id
  
  // Team settings
  settings: {
    visibility: 'private' | 'public';
    allow_member_invites: boolean;
    require_approval: boolean;
  };
  
  // Metrics
  metrics: {
    total_members: number;
    total_xp: number;
    active_learning_paths: number;
  };
  
  created_at: Date;
  updated_at: Date;
}

// Indexes
db.teams.createIndex({ created_by: 1 });
db.teams.createIndex({ name: 'text' }); // Text search
```

#### TeamMembers Collection
Stores team membership and roles.

```typescript
interface TeamMember {
  _id: ObjectId;
  team_id: ObjectId; // References Team._id
  user_id: string; // References User._id
  role: 'owner' | 'admin' | 'member' | 'viewer';
  
  // Membership metadata
  joined_at: Date;
  invited_by?: string; // User._id
  invitation_accepted_at?: Date;
  
  // Member metrics
  contributions: {
    shared_resources: number;
    code_reviews: number;
    comments: number;
  };
}

// Indexes
db.teamMembers.createIndex({ team_id: 1, user_id: 1 }, { unique: true });
db.teamMembers.createIndex({ user_id: 1 });
```

#### Metrics Collection
Stores time-series analytics data.

```typescript
interface Metric {
  _id: ObjectId;
  user_id: string; // References User._id
  team_id?: ObjectId; // Optional team context
  
  // Metric type
  metric_type: 'xp_earned' | 'concept_learned' | 'task_completed' | 'code_reviewed' | 'session_duration';
  
  // Metric value
  value: number;
  unit?: string; // "points", "minutes", "count", etc.
  
  // Context
  context?: any; // Additional metadata
  
  // Timestamp
  recorded_at: Date;
  date: string; // YYYY-MM-DD for daily aggregation
}

// Indexes
db.metrics.createIndex({ user_id: 1, date: -1 });
db.metrics.createIndex({ metric_type: 1, recorded_at: -1 });
db.metrics.createIndex({ team_id: 1, date: -1 });
```

#### Alerts Collection
Stores user notifications and alerts.

```typescript
interface Alert {
  _id: ObjectId;
  user_id: string; // References User._id
  
  // Alert details
  type: 'milestone_due' | 'team_invite' | 'achievement' | 'system' | 'code_review_feedback';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  
  // Action
  action_url?: string; // Deep link to relevant page
  action_label?: string; // "View Milestone", "Accept Invite", etc.
  
  // Status
  read: boolean;
  dismissed: boolean;
  snoozed_until?: Date;
  
  created_at: Date;
  expires_at?: Date; // Auto-delete after expiration
}

// Indexes
db.alerts.createIndex({ user_id: 1, read: 1, created_at: -1 });
db.alerts.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index
```

#### MediaProjects Collection
Stores generated creative assets.

```typescript
interface MediaProject {
  _id: ObjectId;
  user_id: string; // References User._id
  team_id?: ObjectId; // Optional team sharing
  
  // Project details
  title: string;
  description?: string;
  type: 'image' | 'audio' | 'video' | 'music';
  
  // Generation metadata
  prompt: string;
  negative_prompt?: string;
  ai_model_used: string;
  generation_params: any; // Model-specific parameters
  
  // Asset storage
  asset_url: string; // Cloudinary/S3 URL
  thumbnail_url?: string;
  file_size_bytes: number;
  duration_seconds?: number; // For audio/video
  
  // Metadata
  tags: string[];
  is_public: boolean;
  
  created_at: Date;
}

// Indexes
db.mediaProjects.createIndex({ user_id: 1, type: 1, created_at: -1 });
db.mediaProjects.createIndex({ tags: 1 });
```

#### UserIntegrations Collection
Stores encrypted OAuth tokens for external services.

```typescript
interface UserIntegration {
  _id: ObjectId;
  user_id: string; // References User._id
  
  // Integration details
  provider: 'github' | 'google' | 'gitlab' | 'bitbucket';
  provider_user_id: string;
  provider_username?: string;
  
  // Encrypted tokens
  access_token_encrypted: string; // AES-256 encrypted
  refresh_token_encrypted?: string;
  token_expires_at?: Date;
  
  // Scopes and permissions
  scopes: string[];
  
  // Status
  is_active: boolean;
  last_synced_at?: Date;
  
  created_at: Date;
  updated_at: Date;
}

// Indexes
db.userIntegrations.createIndex({ user_id: 1, provider: 1 }, { unique: true });
```

---

### 6.2 IndexedDB Stores (Client-Side)

**Purpose**: Offline-first caching and optimistic UI updates

```typescript
// Dexie.js Schema
class GanapathiDB extends Dexie {
  roadmaps!: Table<CachedRoadmap>;
  chatHistory!: Table<ChatMessage>;
  userPreferences!: Table<UserPreference>;
  offlineQueue!: Table<PendingSync>;

  constructor() {
    super('GanapathiDB');
    this.version(1).stores({
      roadmaps: '++id, userId, role, lastUpdated',
      chatHistory: '++id, sessionId, timestamp',
      userPreferences: 'key, value',
      offlineQueue: '++id, type, timestamp, synced'
    });
  }
}

// Usage
const db = new GanapathiDB();

// Save roadmap for offline access
await db.roadmaps.put({
  userId: currentUser.id,
  role: 'Frontend Developer',
  data: roadmapData,
  lastUpdated: new Date()
});

// Queue changes for sync when online
await db.offlineQueue.add({
  type: 'milestone_completed',
  data: { milestoneId: '123', completedAt: new Date() },
  timestamp: new Date(),
  synced: false
});
```

**Sync Strategy**:
1. User makes change (e.g., marks milestone complete)
2. Update IndexedDB immediately (optimistic UI)
3. Queue sync operation
4. When online, sync to MongoDB
5. On success, mark as synced and remove from queue
6. On failure, retry with exponential backoff

---

## 7. API Routes & Endpoints

- **Zero-Trust Architecture**: Every API request is authenticated and authorized via JWT.
- **Encryption at Rest**: MongoDB Atlas encryption using AES-256.
- **Transport Security**: TLS 1.3 enforced for all connections.
- **API Key Hygiene**: No 3rd-party API keys (OpenAI, Gemini) are ever exposed to the client. All calls heavily proxied through Vercel Edge Functions.

---

## 8. Scalability & Performance Targets

- **TTFB (Time to First Byte)**: < 50ms on Edge Network.
- **LCP (Largest Contentful Paint)**: < 1.2s via SSG/ISR.
- **AI Latency**: Streaming first token < 800ms.
- **Concurrency**: Serverless architecture scales to 10k+ concurrent users without manual intervention.

---

**End of Design Specification**
*Approved by System Architect: G R Harsha*

### Authentication & Authorization
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Create new user account | No |
| POST | `/api/auth/login` | Authenticate user, return JWT | No |
| POST | `/api/auth/logout` | Clear auth cookie | Yes |
| GET | `/api/auth/me` | Get current user profile | Yes |
| POST | `/api/auth/oauth` | Initiate OAuth flow (Google) | No |
| GET | `/api/auth/oauth/callback` | Handle OAuth callback | No |

### AI & Chat
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/chat` | Stream AI chat responses | Yes |
| POST | `/api/ask` | Single AI query (non-streaming) | Yes |
| POST | `/api/explain-concept` | Explain technical concept | Yes |
| POST | `/api/specialized` | Specialized AI tasks | Yes |

### Learning Paths
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/learning-path/generate` | Generate AI roadmap | Yes |
| GET | `/api/learning-path` | List user's roadmaps | Yes |
| PUT | `/api/learning-path/:id` | Update roadmap progress | Yes |
| DELETE | `/api/learning-path/:id` | Delete roadmap | Yes |

### Code Intelligence
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/code-review/analyze` | Analyze code snippet | Yes |
| POST | `/api/docs/generate` | Generate documentation | Yes |

### Creative Studio
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/generate-image` | Generate image from text | Yes |
| POST | `/api/tts` | Text-to-speech synthesis | Yes |
| POST | `/api/music` | Generate focus music | Yes |
| POST | `/api/generate-video` | Create AI avatar video | Yes |
| POST | `/api/branding/generate` | Generate branding package | Yes |
| GET | `/api/media` | List user's media assets | Yes |

### Productivity
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/productivity` | Get tasks and priorities | Yes |
| POST | `/api/productivity` | Create/update task | Yes |
| GET | `/api/session/github` | Get GitHub integration status | Yes |
| POST | `/api/session/github` | Connect GitHub account | Yes |
| GET | `/api/session/github/repos` | List user's repositories | Yes |

### Teams
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/teams` | List user's teams | Yes |
| POST | `/api/teams` | Create new team | Yes |
| GET | `/api/teams/:id` | Get team details | Yes |
| PUT | `/api/teams/:id` | Update team | Yes |
| DELETE | `/api/teams/:id` | Delete team | Yes |
| GET | `/api/teams/members` | List team members | Yes |
| POST | `/api/teams/members` | Add team member | Yes |
| DELETE | `/api/teams/members/:id` | Remove team member | Yes |
| GET | `/api/team/analytics` | Get team analytics | Yes |

### Analytics
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/metrics` | Get user metrics | Yes |
| GET | `/api/analytics/performance` | Performance analytics | Yes |
| GET | `/api/analytics/anomalies` | Detect anomalies | Yes |
| GET | `/api/sessions/recent` | Recent sessions | Yes |
| POST | `/api/session/start` | Start new session | Yes |
| POST | `/api/session/end` | End current session | Yes |

### Alerts
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/alerts` | List user alerts | Yes |
| PUT | `/api/alerts/:id` | Mark alert as read | Yes |
| DELETE | `/api/alerts/:id` | Dismiss alert | Yes |

### Research
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/research` | Multi-source research query | Yes |
| GET | `/api/concepts` | List mastered concepts | Yes |
| POST | `/api/concepts` | Mark concept as mastered | Yes |

---

## 8. Security Architecture

### 8.1 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Browser
    participant Middleware
    participant API
    participant MongoDB
    
    User->>Browser: Enter credentials
    Browser->>API: POST /api/auth/login
    API->>MongoDB: Verify user
    MongoDB-->>API: User data
    API->>API: Generate JWT (jose)
    API-->>Browser: Set HTTP-only cookie
    Browser-->>User: Redirect to dashboard
    
    User->>Browser: Navigate to /dashboard
    Browser->>Middleware: Request with cookie
    Middleware->>Middleware: Verify JWT
    Middleware-->>Browser: Allow access
    Browser-->>User: Render dashboard
```

### 8.2 Security Measures

**Transport Security**:
- TLS 1.3 enforced for all connections
- HSTS headers (Strict-Transport-Security)
- Secure cookies (HttpOnly, Secure, SameSite=Strict)

**Authentication Security**:
- JWT tokens with 7-day expiration
- Tokens stored in HTTP-only cookies (XSS protection)
- bcrypt password hashing with salt rounds
- Rate limiting on auth endpoints (10 attempts/hour)
- Account lockout after 5 failed attempts

**API Security**:
- All API routes require valid JWT token
- Input validation using Zod schemas
- SQL injection prevention (MongoDB parameterized queries)
- XSS protection (React's built-in escaping)
- CSRF protection (SameSite cookies)
- Rate limiting (100 requests/minute per user)

**Data Security**:
- MongoDB Atlas encryption at rest (AES-256)
- Sensitive data encrypted before storage (OAuth tokens)
- No secrets in client bundles or Git
- Environment variables for all API keys
- Secrets rotation policy (90 days)

**Content Security Policy**:
```typescript
// next.config.mjs
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self';
  connect-src 'self' https://api.mistral.ai https://api.groq.com;
  frame-ancestors 'none';
`;
```

**Privacy Compliance**:
- GDPR: Data export, deletion, consent management
- CCPA: Data disclosure, opt-out mechanisms
- User code snippets ephemeral (not used for training)
- Clear privacy policy and terms of service
- Cookie consent banner for non-essential cookies

---

## 9. Performance Optimization

### 9.1 Frontend Optimizations

**Code Splitting**:
```typescript
// Dynamic imports for heavy components
const CodeReviewPanel = dynamic(() => import('@/components/learning/code-review-panel'), {
  loading: () => <Skeleton className="w-full h-96" />,
  ssr: false
});
```

**Image Optimization**:
- Next.js Image component with automatic optimization
- WebP format with fallback to JPEG/PNG
- Lazy loading with blur placeholders
- Responsive images (srcset)
- CDN delivery via Vercel

**Font Optimization**:
- Variable fonts (Inter) for reduced file size
- Font subsetting (Latin characters only)
- Font preloading for critical fonts
- Font display: swap for faster rendering

**Bundle Optimization**:
- Tree shaking to remove unused code
- Minification and compression (gzip/brotli)
- Code splitting by route
- Vendor chunk separation
- Dynamic imports for large libraries

**Caching Strategy**:
```typescript
// Static assets: 1 year cache
Cache-Control: public, max-age=31536000, immutable

// API responses: 5 minutes cache
Cache-Control: public, max-age=300, stale-while-revalidate=60

// HTML pages: No cache (always fresh)
Cache-Control: no-cache, no-store, must-revalidate
```

### 9.2 Backend Optimizations

**Database Optimization**:
- Proper indexing on frequently queried fields
- Connection pooling (MongoDB driver)
- Query result caching (Redis future)
- Aggregation pipelines for complex queries
- Projection to fetch only needed fields

**API Optimization**:
- Serverless functions at edge locations
- Automatic scaling based on load
- Cold start optimization (minimal dependencies)
- Response compression (gzip)
- Streaming responses for AI (SSE)

**AI Model Optimization**:
- Model selection based on query complexity
- Streaming responses for perceived speed
- Caching common queries (future)
- Parallel tool calls when possible
- Timeout handling with fallbacks

---

## 10. Scalability & Performance Targets

### 10.1 Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **TTFB** (Time to First Byte) | < 50ms | ~40ms | ✅ |
| **LCP** (Largest Contentful Paint) | < 1.5s | ~1.2s | ✅ |
| **FID** (First Input Delay) | < 100ms | ~50ms | ✅ |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ~0.05 | ✅ |
| **AI First Token** | < 1s | ~800ms | ✅ |
| **API P95 Latency** | < 500ms | ~350ms | ✅ |
| **Database Query P95** | < 100ms | ~60ms | ✅ |

### 10.2 Scalability Targets

**Concurrent Users**:
- Current: 100 concurrent users
- Target: 10,000+ concurrent users
- Strategy: Serverless auto-scaling

**Database Scaling**:
- Current: MongoDB Atlas M0 (free tier)
- Target: M10+ (dedicated cluster)
- Strategy: Vertical scaling + read replicas

**Storage Scaling**:
- Current: 1GB media storage
- Target: 1TB+ media storage
- Strategy: Cloudinary/S3 with CDN

**API Rate Limits**:
- Free tier: 100 requests/minute
- Paid tier: 1000 requests/minute
- Enterprise: Unlimited with SLA

---

## 11. Monitoring & Observability

### 11.1 Performance Monitoring

**Vercel Analytics**:
- Real-time Core Web Vitals
- Page load times by route
- Geographic performance distribution
- Device/browser breakdown

**Custom Metrics**:
```typescript
// Track custom events
import { track } from '@vercel/analytics';

track('roadmap_generated', {
  role: 'Frontend Developer',
  duration_ms: 2500,
  ai_model: 'mistral-large'
});
```

### 11.2 Error Tracking

**Client-Side Errors**:
```typescript
// Global error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error:', error, errorInfo);
    // Send to error tracking service (future: Sentry)
  }
}
```

**Server-Side Errors**:
```typescript
// API error handling
try {
  // API logic
} catch (error) {
  console.error('API Error:', {
    endpoint: req.url,
    method: req.method,
    userId: decoded.userId,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

### 11.3 User Behavior Analytics

**Key Events to Track**:
- User sign-up and login
- Roadmap generation
- Code review submission
- Concept mastery
- Team creation
- Milestone completion
- AI chat interactions
- Feature usage patterns

---

## 12. Deployment Architecture

### 12.1 Vercel Deployment

**Production Environment**:
- **Domain**: ganapathi-ai.vercel.app (custom domain future)
- **Region**: Global (150+ edge locations)
- **Build**: Automatic on Git push to main branch
- **Preview**: Automatic for pull requests
- **Rollback**: One-click rollback to previous deployment

**Environment Variables**:
```bash
# AI Models
MISTRAL_API_KEY=***
GROQ_API_KEY=***
GEMINI_API_KEY=***
ANTHROPIC_API_KEY=***

# Database
MONGODB_URI=mongodb+srv://***

# Authentication
JWT_SECRET=***

# External Services
STABILITY_API_KEY=***
FREEPIK_API_KEY=***
ELEVENLABS_API_KEY=***
TAVILY_API_KEY=***
GITHUB_CLIENT_ID=***
GITHUB_CLIENT_SECRET=***

# Encryption
ENCRYPTION_KEY=***
```

### 12.2 CI/CD Pipeline

```mermaid
graph LR
    A[Git Push] --> B[GitHub Actions]
    B --> C[Run Tests]
    C --> D{Tests Pass?}
    D -->|Yes| E[Build Next.js]
    D -->|No| F[Notify Developer]
    E --> G[Deploy to Vercel]
    G --> H[Run Smoke Tests]
    H --> I{Healthy?}
    I -->|Yes| J[Production Live]
    I -->|No| K[Rollback]
```

**Deployment Steps**:
1. Developer pushes code to GitHub
2. Vercel detects changes
3. Automatic build triggered
4. TypeScript compilation
5. Next.js build (SSR + SSG)
6. Deploy to edge network
7. Smoke tests run
8. DNS updated (if custom domain)
9. Deployment complete

---

## 5.13 Feedback System Module

**Purpose**: Collect user suggestions, compliments, bug reports, and feature requests with email notifications

**Architecture**:
- **Frontend** (`settings/page.tsx`): Feedback card with 5 category pills, 5-star interactive rating, textarea
- **API Route** (`/api/feedback`): Saves to MongoDB + sends email via Web3Forms
- **Database**: `Feedback` model in MongoDB with status tracking

**Data Model**:
```typescript
interface Feedback {
  _id: ObjectId;
  user_id: ObjectId;        // References User
  user_email: string;
  user_name: string;
  category: 'suggestion' | 'compliment' | 'bug' | 'feature' | 'other';
  rating: number;           // 0-5 stars
  message: string;
  status: 'new' | 'reviewed' | 'resolved';
  created_at: Date;
}
```

**Submission Flow**:
1. User selects category pill (💡 Suggestion, ❤️ Compliment, 🐛 Bug, ✨ Feature, 📝 Other)
2. Optional: 5-star rating with hover labels ("Needs Work" → "Amazing!")
3. User writes message and clicks Send
4. API saves to MongoDB (permanent record)
5. API sends formatted email to `grharsha777@gmail.com` via Web3Forms
6. Success animation with "Thank you!" state

**Email Delivery**:
- Uses Web3Forms API with access key
- FormData payload with category, rating, user info, message
- Graceful fallback: if email fails, feedback is still saved in MongoDB

---

## 5.14 Onboarding Tutorial Module

**Purpose**: Guide first-time users through all platform features with an animated walkthrough

**Architecture**:
- **Component**: `OnboardingTutorial` rendered in dashboard layout
- **Storage**: Per-user localStorage key (`ganapathi_onboarding_seen_{email}`)
- **Animation**: Framer Motion spring physics with slide transitions

**Slide Content** (6 slides):
| Slide | Title | Features Covered |
|-------|-------|------------------|
| 1 | Welcome to Ganapathi AI | Platform intro, built by G R Harsha |
| 2 | Learn & Grow | Learning Paths, Concept Engine, Training |
| 3 | Code Like a Pro | Code Review, Doc Generator, Productivity |
| 4 | Research & Create | Research Hub, Media Studio, Mock Interview |
| 5 | Track & Compete | Analytics, Challenges, Portfolio |
| 6 | You're All Set! | CTA to explore |

**Per-User Behavior**:
```typescript
// Key is scoped by user email
const onboardingKey = `ganapathi_onboarding_seen_${user.email}`;
// Only shows if key doesn't exist in localStorage
if (!localStorage.getItem(onboardingKey)) showTutorial();
// On dismiss, sets the key permanently
localStorage.setItem(onboardingKey, 'true');
```

**UI Design**:
- Dark glassmorphic modal with `blur(12px)` backdrop
- Neon-glowing squircle icons (matching dock style)
- Progress dots with animated width transitions
- Features grid showing 3 key capabilities per slide
- Skip (X) button in top-right corner
- Back/Next navigation with slide counter

---

## 5.15 Coding Challenges Module

**Purpose**: Gamified coding problems with XP rewards and leaderboard ranking

**Data Model**:
```typescript
interface Challenge {
  _id: ObjectId;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;           // 'arrays', 'strings', 'trees', etc.
  boilerplate_code: string;   // Starting template
  test_cases: [{ input: string; expected_output: string; is_hidden: boolean }];
  xp_reward: number;          // 10 (easy), 25 (medium), 50 (hard)
  time_limit_minutes: number;
  created_at: Date;
}

interface Submission {
  _id: ObjectId;
  user_id: ObjectId;
  challenge_id: ObjectId;
  code: string;
  language: string;
  status: 'pending' | 'accepted' | 'wrong_answer' | 'error';
  test_results: [{ passed: boolean; input: string; expected: string; actual: string }];
  xp_earned: number;
  submitted_at: Date;
}
```

**Challenge Flow**:
1. User browses challenges filtered by difficulty/category
2. Selects challenge, sees description and boilerplate code
3. Writes solution in Monaco Editor
4. Submits → code tested against visible + hidden test cases
5. Results displayed with pass/fail per test case
6. XP awarded for accepted solutions → updates User.metrics.total_xp
7. Leaderboard updated in real-time

---

## 5.16 YouTube Intelligence Module

**Purpose**: Ensure all YouTube video recommendations are recent, real, and relevant

**Search Parameters**:
```typescript
const params = {
  part: 'snippet',
  q: `${query} tutorial 2024`,
  type: 'video',
  order: 'relevance',
  publishedAfter: threeYearsAgo.toISOString(), // Only last 3 years
  videoEmbeddable: 'true',                     // Filter deleted/private
  videoDuration: 'medium',                     // 4-20 min tutorials
  relevanceLanguage: 'en',
  safeSearch: 'strict',
};
```

**Key Filters**:
| Filter | Value | Purpose |
|--------|-------|---------|
| `publishedAfter` | 3 years ago (dynamic) | No old/outdated content |
| `videoEmbeddable` | `true` | Filters deleted, private, region-locked |
| `order` | `relevance` | YouTube's relevance algorithm |
| `videoDuration` | `medium` | Tutorial-length videos (4-20 min) |
| `safeSearch` | `strict` | Family-safe content only |

**Consumers**:
- Chat AI: Embeds videos as `{{youtube:ID|Title}}` with publish year
- Concept Explainer: Shows 8 videos in Videos tab
- Learning Paths: Includes video resources in roadmap sessions

---

## 5.17 Per-User Data Isolation Module

**Purpose**: Ensure each user account has its own isolated data in client-side storage

**Architecture**:
```typescript
// useContentStore hook — all keys prefixed with user email
function useContentStore(feature: FeatureStore) {
  const { user } = useAuth();
  const userPrefix = user?.email ? `${user.email}:` : 'guest:';

  const save = async (key, data) => {
    const localKey = `${userPrefix}${key}`;
    await ClientDB.saveContent(feature, localKey, data); // IndexedDB
    syncToMongo(feature, key, data);                     // MongoDB
  };

  const load = async (key) => {
    const localKey = `${userPrefix}${key}`;
    return ClientDB.loadContent(feature, localKey)  // IndexedDB first
      || loadFromMongo(feature, key);                // MongoDB fallback
  };
}
```

**Scoped Stores** (12 IndexedDB object stores):
| Store | Data |
|-------|------|
| `concepts` | Concept explanations + videos |
| `code_reviews` | Code review analyses |
| `roadmaps` | Learning path data |
| `docs` | Generated documentation |
| `productivity` | Tasks and productivity data |
| `interviews` | Interview prep sessions |
| `media` | Generated images/videos |
| `chat_history` | Chatbot conversations |
| `stackoverflow` | StackOverflow search results |
| `research` | Research hub findings |
| `walkthroughs` | Code walkthrough steps |
| `user_data` | GitHub tokens (legacy) |

**Behavior**: When User A searches for "React Hooks" in Concepts, then User B logs in on the same browser, User B sees a clean Concepts page — not User A's data.

---

## 13. Future Enhancements

### Phase 3: Advanced Features (Q2 2026)
- **Real-time Collaboration**: WebSocket-based live code editing
- **Video Conferencing**: Integrated video calls for pair programming
- **Whiteboard**: System design discussions with drawing tools
- **Advanced Analytics**: ML-powered insights and predictions

### Phase 4: Mobile Apps (Q3 2026)
- **iOS App**: Native Swift/SwiftUI application
- **Android App**: Native Kotlin/Jetpack Compose application
- **Offline Mode**: Full offline functionality with sync
- **Push Notifications**: Native mobile notifications

### Phase 5: Enterprise Features (Q4 2026)
- **SSO Integration**: SAML, LDAP, Okta, Auth0
- **Custom Branding**: White-label solution for organizations
- **Admin Dashboard**: Advanced user management and audit logs
- **SLA Guarantees**: 99.99% uptime with dedicated support
- **On-Premise**: Self-hosted deployment option

### Phase 6: AI Agents (Q1 2027)
- **Autonomous Coding**: AI agents that write production code
- **Auto Bug Fixing**: Detect and fix bugs automatically
- **Continuous Learning**: Agents learn from user feedback
- **Multi-Agent Systems**: Collaborative AI agents for complex tasks

---

## 14. Technical Debt & Known Issues

### Current Limitations
1. **No Real-Time Collaboration**: Users can't edit documents simultaneously
2. **Limited Offline Support**: Only cached data available offline
3. **No Video Conferencing**: External tools needed for video calls
4. **Basic Analytics**: Limited ML-powered insights
5. **No Mobile Apps**: Web-only (responsive but not native)

### Planned Improvements
1. **Migrate to Redis**: For caching and session management
2. **Implement WebSockets**: For real-time features
3. **Add E2E Tests**: Playwright/Cypress for critical flows
4. **Improve Error Handling**: Better user-facing error messages
5. **Optimize Bundle Size**: Further code splitting and lazy loading

---

## 15. Conclusion

Ganapathi Mentor AI represents a comprehensive, production-ready platform for developer education and productivity. The architecture is designed for:

- **Scalability**: Serverless infrastructure scales to 10k+ users
- **Performance**: Sub-second response times with edge computing
- **Security**: Enterprise-grade authentication, encryption, and per-user data isolation
- **Reliability**: 99.9% uptime with automatic failover
- **Extensibility**: Modular design allows easy feature additions
- **User Engagement**: Gamification, onboarding, and feedback loops

The platform successfully integrates 19+ major modules — from AI-powered code review to coding challenges, feedback systems, first-time onboarding, and YouTube-powered video intelligence — creating a unified ecosystem that enhances developer productivity and accelerates learning outcomes.

---

**End of Design Specification**  
*System Architect: G R Harsha*  
*Last Updated: February 22, 2026*  
*Version: 4.0.0*  
*Status: Production Ready + Feedback + Onboarding + Challenges*

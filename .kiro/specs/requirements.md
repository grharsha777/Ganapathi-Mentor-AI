# Ganapathi Mentor AI — Product Requirements Specifications (PRS)
> **Product Name**: Ganapathi Mentor AI (Neural Code Symbiosis)  
> **Target Audience**: Developers, Students, Engineering Teams, Tech Educators  
> **Release**: 4.0 (Production + Feedback, Onboarding, Challenges, YouTube Intelligence)  
> **Last Updated**: February 22, 2026  
> **Document Owner**: G R Harsha

---

## 1. Executive Vision Statement

To build the world's most advanced **Symbiotic Intelligence Platform** for software engineering education and productivity. Ganapathi Mentor AI democratizes access to elite-level mentorship, enabling any developer—from junior to senior—to accelerate their growth curve through personalized, AI-driven guidance, real-time code analysis, multi-modal learning resources, and collaborative team features.

The platform transcends traditional learning management systems by integrating deeply into the developer's workflow, acting as a 24/7 Senior Staff Engineer mentor that anticipates needs, proactively offers solutions, and creates an immersive "Flow State" environment through premium UX design.

---

## 2. Core Value Pillars

### 2.1 🧠 Hyper-Personalized Mentorship
Unlike static courses, Ganapathi AI adapts to each user's unique learning style, skill level, and goals. The system:
- Remembers past struggles, completed milestones, and learning velocity
- Tailors every explanation, code review, and recommendation to the user's context
- Tracks skill mastery across multiple domains (frontend, backend, DevOps, etc.)
- Provides adaptive difficulty scaling in challenges and explanations

### 2.2 ⚡ Velocity Multiplier
Integrated productivity tools automate mundane tasks, allowing developers to focus on high-leverage logic and architecture:
- Intelligent Code Review with security vulnerability detection
- Auto-Documentation Generator (JSDoc, README, API docs)
- Smart Agenda Builder using Eisenhower Matrix prioritization
- GitHub Integration for repository analysis and commit insights
- Real-time debugging assistance and error explanation

### 2.3 🎨 Premium Developer Experience (DX)
Developer tools should be beautiful and inspiring. The interface features:
- Premium animations powered by Framer Motion on desktop (60fps, physics-based)
- CSS-only transitions on mobile/tablet for zero-lag performance
- **Dual Navigation System**: Mobile sidebar drawer (hamburger menu) + desktop macOS dock
- Glassmorphism aesthetic with aurora gradient backgrounds
- Dark mode optimized for reduced eye strain during night coding
- **Fully Responsive**: Fluid typography (`clamp()`), safe-area insets for notched phones
- **Touch-Optimized**: All tap targets ≥ 44px, `touch-action: manipulation`
- Responsive from 320px mobile to 4K TV displays
- Accessibility-first: `prefers-reduced-motion` support, WCAG 2.1 AA
- Zero-latency interactions with optimistic UI updates

### 2.4 🤝 Collaborative Intelligence
Team features enable collective learning and knowledge sharing:
- Team workspaces with shared learning paths
- Collaborative code reviews and pair programming sessions
- Team analytics and performance dashboards
- Leaderboards and gamification for motivation
- Shared resource libraries and documentation

---

## 3. Comprehensive Functional Requirements (FR)

### Module 1: Authentication & User Management
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-1.1** | **JWT-Based Authentication** | P0 | Stateless authentication using JWT tokens with 7-day expiration. Tokens stored in HTTP-only cookies. |
| **FR-1.2** | **Email/Password Registration** | P0 | Users can sign up with email and password. Passwords hashed using bcrypt with salt rounds. |
| **FR-1.3** | **OAuth Integration** | P1 | Support Google OAuth for seamless sign-in. Future: GitHub, Microsoft OAuth. |
| **FR-1.4** | **User Profile Management** | P1 | Users can update full name, avatar, role (developer/student/researcher), and learning goals. |
| **FR-1.5** | **Role-Based Access Control** | P1 | Support roles: admin, editor, viewer, owner. Different permissions for team features. |
| **FR-1.6** | **Session Management** | P0 | Track user sessions with start/end times, topics covered, and activity summaries. |
| **FR-1.7** | **Password Reset** | P2 | Email-based password reset flow with secure token generation. |

### Module 2: The Neural Chatbot (Ganapathi AI)
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-2.1** | **Multi-Model Orchestration** | P0 | System dynamically routes queries to optimal AI model: Mistral Large (primary), Groq Llama 3.3 (fast inference), HuggingFace (media generation). Automatic failover between providers. |
| **FR-2.2** | **Contextual RAG** | P0 | Chatbot retrieves answers from multiple sources: YouTube Data API, Tavily Web Search, SERP API. All responses enriched with external data. |
| **FR-2.3** | **Best Friend Personality** | P0 | AI speaks like a helpful friend, not a robot. Uses casual language, emojis, encouragement. Identity: Ganapathi AI by G R Harsha. |
| **FR-2.4** | **YouTube Thumbnail Embeds** | P0 | Videos rendered as rich embedded cards with thumbnail, play button overlay, and title bar. Format: `{{youtube:VIDEO_ID\|Title}}`. |
| **FR-2.5** | **Tool Calling** | P0 | AI invokes tools: `searchYouTubeVideos`, `searchWeb` (Tavily/SERP), `generateImage`, `generateVideo`. |
| **FR-2.6** | **Context Awareness** | P1 | Chatbot understands current page context and user profile for relevant responses. |
| **FR-2.7** | **Rich Markdown** | P0 | Code blocks with copy button, styled links (internal/YouTube/LinkedIn/GitHub/email), bold, headings, images. |
| **FR-2.8** | **Global Accessibility** | P0 | Chatbot accessible from any page via responsive FAB. Full-width panel on mobile, fixed-width on desktop. |
| **FR-2.9** | **Responsive Chatbot** | P0 | FAB: 56px on mobile, 64px on desktop. Panel: full-width + 70vh on mobile, 560-620px + 720px on desktop. |

### Module 3: The Neural Concept Engine
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-3.1** | **Adaptive Explainer** | P0 | Explain any tech concept at 3 complexity levels: ELI5 (Beginner), Professional (Intermediate), Research (Advanced). |
| **FR-3.2** | **Visual Synthesis** | P1 | Generate Mermaid.js diagrams, flowcharts, and architecture visualizations for complex concepts. |
| **FR-3.3** | **Mastery Tracking** | P1 | Track which concepts user has mastered. Update user profile with skill vectors. |
| **FR-3.4** | **Concept Graph** | P2 | Build knowledge graph showing relationships between concepts (prerequisites, related topics). |
| **FR-3.5** | **Interactive Examples** | P1 | Provide runnable code examples with syntax highlighting and copy-to-clipboard functionality. |
| **FR-3.6** | **Resource Recommendations** | P1 | Suggest curated learning resources (videos, articles, courses) for each concept. |

### Module 4: Learning Path Generator
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-4.1** | **Role-Based Roadmaps** | P0 | Generate personalized 4-week learning paths for roles: Frontend Dev, Backend Dev, Full Stack, DevOps, Mobile Dev, Data Engineer, etc. |
| **FR-4.2** | **AI-Powered Curriculum** | P0 | Use AI to create custom milestones with weekly goals, descriptions, and curated resources. |
| **FR-4.3** | **Resource Aggregation** | P1 | Automatically populate milestones with high-quality resources: YouTube videos, articles, documentation, courses. |
| **FR-4.4** | **Progress Tracking** | P0 | Track completion status for each milestone and resource. Visual progress indicators. |
| **FR-4.5** | **GitHub Repository Analysis** | P1 | Analyze user's GitHub repos to detect skill gaps and tailor roadmap accordingly. |
| **FR-4.6** | **Timeline Estimation** | P2 | Estimate realistic completion times based on user availability and learning pace. |
| **FR-4.7** | **Milestone Scheduling** | P1 | Auto-generate due dates for milestones based on weekly cadence. |
| **FR-4.8** | **Roadmap Persistence** | P0 | Save learning paths to MongoDB with user association. Support multiple active roadmaps. |
| **FR-4.9** | **Offline Access** | P1 | Cache roadmaps in IndexedDB for offline viewing and progress updates. |

### Module 5: Code Intelligence Suite
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-5.1** | **Deep Code Review** | P0 | AI-powered code analysis: detect bugs, security vulnerabilities (OWASP Top 10), anti-patterns, performance issues. |
| **FR-5.2** | **Multi-Language Support** | P0 | Support major languages: JavaScript, TypeScript, Python, Java, Go, Rust, C++, PHP, Ruby. |
| **FR-5.3** | **Pattern Recognition** | P0 | Identify design patterns, architectural patterns, and suggest alternatives. |
| **FR-5.4** | **Complexity Analysis** | P1 | Calculate complexity scores based on cyclomatic complexity, nesting depth, function length. |
| **FR-5.5** | **Auto-Documentation** | P1 | Generate JSDoc, Python docstrings, README sections, and API documentation from code. |
| **FR-5.6** | **Refactoring Suggestions** | P1 | Suggest clean code improvements: SOLID principles, DRY, KISS, YAGNI. Provide diff views. |
| **FR-5.7** | **Rule-Based Fallback** | P0 | When AI unavailable, use static analysis: detect console.log, TODO comments, missing error handling, long functions. |
| **FR-5.8** | **Code Review History** | P1 | Save code reviews to MongoDB with timestamps, complexity scores, and AI feedback. |
| **FR-5.9** | **Syntax Highlighting** | P0 | Display code with proper syntax highlighting for all supported languages. |

### Module 6: Creative Studio (Multi-Modal AI)
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-6.1** | **Text-to-Image Generation** | P1 | Generate project assets (logos, UI mockups, diagrams) using Stability AI, Freepik, or Picsart APIs. |
| **FR-6.2** | **Image Customization** | P1 | Support parameters: size (square/landscape/portrait), negative prompts, style presets. |
| **FR-6.3** | **Voice Synthesis (TTS)** | P2 | Convert text to speech using ElevenLabs API. Support multiple voices and languages. |
| **FR-6.4** | **Voice Selection** | P2 | Allow users to choose from 10+ voice profiles with preview functionality. |
| **FR-6.5** | **Music Generation** | P2 | Generate ambient focus music using Suno AI for coding sessions. |
| **FR-6.6** | **Video Avatar Creation** | P2 | Create AI avatar videos using HeyGen for personalized video tutorials. |
| **FR-6.7** | **Asset Library** | P1 | Save generated assets to user's media library with metadata and timestamps. |
| **FR-6.8** | **Branding Generator** | P1 | AI-powered branding package generation: logos, color palettes, typography suggestions. |

### Module 7: Engineering Productivity Hub
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-7.1** | **Eisenhower Matrix** | P1 | AI auto-prioritizes tasks into 4 quadrants: Do First, Schedule, Delegate, Delete. |
| **FR-7.2** | **Smart Task Management** | P1 | Create, update, delete tasks with AI-suggested priorities and deadlines. |
| **FR-7.3** | **GitHub Integration** | P1 | OAuth integration to read user's repositories, analyze commits, and track coding activity. |
| **FR-7.4** | **Repository Analytics** | P1 | Display repo stats: languages used, commit frequency, stars, last updated. |
| **FR-7.5** | **Commit Analysis** | P1 | Analyze recent commits to understand coding patterns and suggest improvements. |
| **FR-7.6** | **Meeting Agenda Builder** | P2 | Convert unstructured notes into structured meeting agendas with action items. |
| **FR-7.7** | **Productivity Metrics** | P1 | Track daily/weekly productivity: tasks completed, code reviewed, concepts learned. |
| **FR-7.8** | **Focus Timer** | P2 | Pomodoro timer with break reminders and session tracking. |

### Module 8: Team Collaboration
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-8.1** | **Team Workspaces** | P1 | Create and manage teams with multiple members. Each team has unique workspace. |
| **FR-8.2** | **Team Roles** | P1 | Support roles: owner, admin, member, viewer. Different permissions for each role. |
| **FR-8.3** | **Shared Learning Paths** | P1 | Teams can create and share learning roadmaps. Track team progress collectively. |
| **FR-8.4** | **Team Analytics** | P1 | Dashboard showing team performance: total XP, active members, completion rates. |
| **FR-8.5** | **Leaderboards** | P1 | Weekly leaderboards showing top performers by XP. Gamification for motivation. |
| **FR-8.6** | **Team Chat** | P2 | Real-time chat within team workspace for collaboration and knowledge sharing. |
| **FR-8.7** | **Shared Resources** | P1 | Team library for sharing code snippets, documentation, and learning resources. |

### Module 9: Analytics & Insights
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-9.1** | **Personal Dashboard** | P0 | Overview of user stats: learning streak, skills mastered, weekly goal progress, XP points. |
| **FR-9.2** | **Learning Streak** | P0 | Track consecutive days of activity. Visual streak counter with fire icon. |
| **FR-9.3** | **XP System** | P0 | Earn XP for activities: completing milestones, code reviews, challenges, concept mastery. |
| **FR-9.4** | **Level Progression** | P1 | Level up system: Junior Dev → Mid-Level → Senior → Staff → Principal. |
| **FR-9.5** | **Activity Feed** | P1 | Recent activity timeline showing completed tasks, earned XP, and achievements. |
| **FR-9.6** | **Performance Metrics** | P1 | Charts showing learning velocity, concept mastery over time, productivity trends. |
| **FR-9.7** | **Anomaly Detection** | P2 | AI detects unusual patterns in learning behavior and suggests interventions. |
| **FR-9.8** | **Goal Setting** | P1 | Set weekly/monthly goals. Track progress with visual indicators. |

### Module 10: Interview Preparation
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-10.1** | **Voice-First Interviews** | P1 | AI-powered mock interviews with voice interaction. Support technical, behavioral, system design rounds. |
| **FR-10.2** | **Real-Time Feedback** | P1 | Instant feedback on answers: clarity, completeness, technical accuracy. |
| **FR-10.3** | **Interview Recording** | P2 | Record interview sessions for later review and improvement. |
| **FR-10.4** | **Question Bank** | P1 | Curated database of common interview questions by role and difficulty. |
| **FR-10.5** | **Code Walkthrough** | P1 | Practice explaining code solutions verbally. AI evaluates communication skills. |
| **FR-10.6** | **Performance Scoring** | P1 | Score interviews on multiple dimensions: technical depth, communication, problem-solving. |

### Module 11: Research & Discovery
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-11.1** | **Academic Paper Search** | P1 | Search arXiv and Semantic Scholar for research papers. Display citations, abstracts, PDFs. |
| **FR-11.2** | **Web Research** | P1 | Real-time web search using Tavily API. Fetch latest tech news, tutorials, documentation. |
| **FR-11.3** | **Wikipedia Integration** | P0 | Quick access to Wikipedia articles for concept definitions and background. |
| **FR-11.4** | **Stack Exchange Search** | P1 | Search Stack Overflow and other Stack Exchange sites for programming solutions. |
| **FR-11.5** | **Research Hub** | P1 | Centralized interface for all research tools. Save and organize research findings. |
| **FR-11.6** | **Citation Management** | P2 | Save papers with proper citations. Export to BibTeX, APA, MLA formats. |

### Module 12: Alerts & Notifications
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-12.1** | **System Alerts** | P1 | Notify users of important events: milestone deadlines, team invites, achievements unlocked. |
| **FR-12.2** | **Alert Prioritization** | P1 | Categorize alerts by severity: critical, warning, info. Visual indicators for each type. |
| **FR-12.3** | **Alert History** | P1 | View past alerts with timestamps and resolution status. |
| **FR-12.4** | **Email Notifications** | P2 | Optional email notifications for critical alerts and weekly summaries. |
| **FR-12.5** | **Push Notifications** | P2 | Browser push notifications for real-time updates (with user permission). |

### Module 13: Feedback System
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-13.1** | **Feedback Form** | P0 | In-app feedback form on Settings page with 5 category pills (Suggestion, Compliment, Bug, Feature, Other), 5-star interactive rating, and free-text message. |
| **FR-13.2** | **Email Delivery** | P0 | Submit feedback to `grharsha777@gmail.com` via Web3Forms API with formatted payload (category, rating, user info, message). |
| **FR-13.3** | **Database Persistence** | P0 | Save all feedback to MongoDB `Feedback` collection with `status` field (new/reviewed/resolved) for admin triage. |
| **FR-13.4** | **Success Confirmation** | P1 | Animated success state after submission with "Send Another" option. |
| **FR-13.5** | **Graceful Fallback** | P1 | If email delivery fails, feedback is still saved to MongoDB. No data loss. |

### Module 14: Onboarding Tutorial
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-14.1** | **First-Time Only** | P0 | Show animated tutorial modal only on first login per user account. Uses localStorage key scoped by user email. |
| **FR-14.2** | **6-Slide Walkthrough** | P0 | Slides: Welcome, Learn & Grow, Code Like a Pro, Research & Create, Track & Compete, You're All Set. Each slide has icon, title, description, feature grid. |
| **FR-14.3** | **Animated UI** | P1 | Framer Motion spring transitions, progress dots, glassmorphic dark modal with neon-glow icons. |
| **FR-14.4** | **Skip & Dismiss** | P0 | X button to skip at any time. Dismissal is permanent (stored in localStorage per user email). |
| **FR-14.5** | **Per-User Scoping** | P0 | Different accounts on same browser each get their own onboarding experience. Key: `ganapathi_onboarding_seen_{email}`. |

### Module 15: Coding Challenges
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-15.1** | **Challenge Library** | P0 | Browse challenges by difficulty (easy/medium/hard) and category (arrays, strings, trees, etc.). |
| **FR-15.2** | **In-Browser Editor** | P0 | Monaco Editor with boilerplate code, syntax highlighting, and language selection. |
| **FR-15.3** | **Auto-Grading** | P0 | Submit code → test against visible + hidden test cases → show pass/fail results. |
| **FR-15.4** | **XP Rewards** | P0 | Earn XP per accepted submission: 10 (easy), 25 (medium), 50 (hard). Updates User.metrics.total_xp. |
| **FR-15.5** | **Leaderboard** | P1 | Global ranking by total XP. Weekly and all-time views. |
| **FR-15.6** | **Submission History** | P1 | View past submissions with code, status, and XP earned per challenge. |

### Module 16: YouTube Intelligence
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-16.1** | **Recency Filter** | P0 | YouTube Data API v3 search uses `publishedAfter` parameter (3 years ago) to exclude outdated videos. |
| **FR-16.2** | **Embeddable Only** | P0 | `videoEmbeddable: true` filters out deleted, private, and region-locked videos. |
| **FR-16.3** | **Relevance Ordering** | P0 | `order: relevance` ensures YouTube’s algorithm prioritizes best matches. |
| **FR-16.4** | **Publish Year Display** | P1 | AI chatbot displays the publish year alongside each video recommendation. |
| **FR-16.5** | **No Hallucinated IDs** | P0 | System prompt instructs AI to never generate fake video IDs. Only IDs from API results are used. |

### Module 17: Per-User Data Isolation
| ID | Requirement | Priority | Implementation Details |
|----|-------------|----------|------------------------|
| **FR-17.1** | **Email-Prefixed Keys** | P0 | All IndexedDB keys prefixed with `{user.email}:` via `useContentStore` hook. |
| **FR-17.2** | **12 Scoped Stores** | P0 | Concepts, code_reviews, roadmaps, docs, productivity, interviews, media, chat_history, stackoverflow, research, walkthroughs, user_data. |
| **FR-17.3** | **Account Switching** | P0 | When a different user logs in on the same browser, they see their own data — not the previous user’s. |
| **FR-17.4** | **Guest Fallback** | P1 | If no user is authenticated, keys use `guest:` prefix. |
| **FR-17.5** | **Dual-Write Sync** | P0 | Data saved to IndexedDB (instant) + synced to MongoDB (durable via `/api/content`). Load prioritizes IndexedDB for speed. |

---

## 4. Non-Functional Requirements (NFR)

### NFR-1: Performance & Latency
- **UI Interaction**: All gestures and clicks must respond in < 16ms (60fps) for smooth animations
- **Page Loads**: Core Web Vitals targets:
  - Largest Contentful Paint (LCP) < 1.5s globally via Edge CDN
  - First Input Delay (FID) < 100ms
  - Cumulative Layout Shift (CLS) < 0.1
- **AI Streaming**: Time-to-first-token < 1s to maintain conversational illusion
- **API Response Time**: P95 latency on API routes < 500ms
- **Database Queries**: MongoDB queries < 100ms for 95th percentile
- **Asset Loading**: Images lazy-loaded with blur placeholders. Code splitting for optimal bundle size

### NFR-2: Reliability & Availability
- **Uptime**: 99.9% availability target for core platform (8.76 hours downtime/year max)
- **Fallback Redundancy**: If primary LLM (Mistral) fails, automatically failover to secondary (Groq) without user error
- **Graceful Degradation**: When AI unavailable, provide rule-based alternatives (code review, roadmap templates)
- **Error Handling**: All API routes have try-catch blocks with meaningful error messages
- **Data Persistence**: Dual-write strategy (MongoDB + IndexedDB) ensures no data loss
- **Backup Strategy**: Daily automated backups of MongoDB Atlas with 30-day retention

### NFR-3: Security & Privacy
- **Data Sovereignty**: User code snippets sent to AI are ephemeral and not used for model training (Enterprise Privacy)
- **Authentication**: Zero-trust stateless auth via JWT with 7-day expiration
- **Password Security**: Bcrypt hashing with salt rounds. No plaintext passwords stored
- **Secrets Management**: All API keys strictly server-side. No secrets in client bundles or Git
- **Transport Security**: TLS 1.3 enforced for all connections
- **Input Validation**: Zod schemas validate all user inputs on server-side
- **XSS Protection**: React's built-in XSS protection. Content Security Policy headers
- **CSRF Protection**: SameSite cookies and CSRF tokens for state-changing operations
- **Rate Limiting**: API rate limits to prevent abuse (100 requests/minute per user)
- **Encryption at Rest**: MongoDB Atlas encryption using AES-256

### NFR-4: Scalability
- **Serverless Architecture**: Vercel Edge Functions scale automatically to 10k+ concurrent users
- **Database Scaling**: MongoDB Atlas serverless tier auto-scales based on load
- **CDN Distribution**: Static assets served from global CDN (150+ edge locations)
- **Horizontal Scaling**: Stateless design allows infinite horizontal scaling
- **Connection Pooling**: MongoDB connection pooling to handle concurrent requests efficiently
- **Caching Strategy**: 
  - Static assets cached for 1 year
  - API responses cached with appropriate TTL
  - IndexedDB for client-side caching

### NFR-5: Accessibility (a11y)
- **WCAG Compliance**: Adherence to WCAG 2.1 AA standards
- **Keyboard Navigation**: Full keyboard accessibility with visible focus indicators
- **Screen Reader Support**: Semantic HTML and ARIA labels for all interactive elements
- **Color Contrast**: Minimum 4.5:1 contrast ratio for normal text, 3:1 for large text
- **Dark Mode**: Native efficient dark mode implementation for reduced eye strain
- **Responsive Design**: Mobile-first design supporting 320px to 4K displays
- **Dual Navigation**: Mobile sidebar drawer (< 1024px) + desktop macOS dock (≥ 1024px)
- **Touch Targets**: All interactive elements ≥ 44px on touch devices
- **Font Scaling**: Fluid typography with `clamp()` respects browser preferences
- **Motion Preferences**: Respects `prefers-reduced-motion` — disables all animations
- **Safe Area**: `env(safe-area-inset-*)` support for notched phones (iPhone, Galaxy)
- **No Horizontal Overflow**: `overflow-x: hidden` on body prevents accidental scrolling

### NFR-6: Maintainability & Code Quality
- **TypeScript**: 100% TypeScript codebase with strict mode enabled
- **Type Safety**: Zod schemas for runtime validation matching TypeScript types
- **Code Organization**: Feature-based folder structure with clear separation of concerns
- **Component Reusability**: Shadcn/UI component library for consistent design system
- **Documentation**: JSDoc comments for all public functions and complex logic
- **Testing**: Unit tests for critical business logic (target 80% coverage)
- **Linting**: ESLint with strict rules. Prettier for code formatting
- **Git Workflow**: Feature branches, pull requests, code reviews before merge

### NFR-7: Observability & Monitoring
- **Analytics**: Vercel Analytics for real-time performance monitoring
- **Error Tracking**: Console error logging with context (user ID, timestamp, stack trace)
- **Performance Monitoring**: Core Web Vitals tracking in production
- **User Behavior**: Track key user actions (sign-ups, roadmap generation, code reviews)
- **API Monitoring**: Log API response times, error rates, and usage patterns
- **Database Monitoring**: MongoDB Atlas monitoring for query performance and resource usage

### NFR-8: Internationalization (Future)
- **Multi-Language Support**: Prepare architecture for i18n (English first, expand to Spanish, Hindi, Chinese)
- **Locale-Aware Formatting**: Dates, numbers, currencies formatted per user locale
- **RTL Support**: Right-to-left language support (Arabic, Hebrew)
- **Translation Management**: Centralized translation files with fallback to English

---

## 5. User Roles & Personas

### 5.1 The Junior Developer ("Seeker")
**Profile**: 0-2 years experience, learning fundamentals, often stuck on basic concepts
**Needs**:
- Simplified explanations (ELI5 mode)
- Structured learning roadmaps with clear milestones
- Immediate help when stuck (chatbot, Stack Exchange search)
- Confidence building through achievements and gamification
- Interview preparation for first job

**Key Features**: Concept Explainer, Learning Paths, Chatbot, Interview Prep

### 5.2 The Mid-Level Developer ("Builder")
**Profile**: 2-5 years experience, building features, wants to level up to senior
**Needs**:
- Code review feedback to improve quality
- System design knowledge
- Best practices and design patterns
- Productivity tools to ship faster
- Career progression guidance

**Key Features**: Code Review, Productivity Hub, Advanced Concepts, Team Collaboration

### 5.3 The Senior Developer ("Architect")
**Profile**: 5+ years experience, designing systems, mentoring juniors
**Needs**:
- Architecture brainstorming and validation
- High-level system design reviews
- Team management and collaboration tools
- Research tools for staying current
- Productivity multipliers to focus on high-leverage work

**Key Features**: Research Hub, Team Analytics, Advanced AI Tools, GitHub Integration

### 5.4 The Student ("Learner")
**Profile**: CS student or bootcamp graduate, preparing for career
**Needs**:
- Structured curriculum aligned with industry needs
- Homework help and concept clarification
- Interview preparation (technical + behavioral)
- Portfolio project ideas and guidance
- Affordable/free access to quality resources

**Key Features**: Learning Paths, Interview Prep, Concept Explainer, Free Tier Access

### 5.5 The Team Lead ("Coordinator")
**Profile**: Managing 3-10 developers, responsible for team growth
**Needs**:
- Team performance analytics
- Shared learning resources and paths
- Onboarding automation for new hires
- Code review standardization
- Team collaboration tools

**Key Features**: Team Workspaces, Team Analytics, Shared Resources, Leaderboards

---

## 6. Success Criteria (KPIs)

### 6.1 Engagement Metrics
- **Daily Active Users (DAU)**: > 20% of install base
- **Weekly Active Users (WAU)**: > 50% of install base
- **Session Duration**: Average > 15 minutes per session
- **Sessions per User**: > 3 sessions per week
- **Feature Adoption**: > 60% of users try at least 3 core features

### 6.2 Retention Metrics
- **Day-1 Retention**: > 60% (users return next day)
- **Day-7 Retention**: > 45% (users return after 1 week)
- **Day-30 Retention**: > 40% (users return after 1 month)
- **Churn Rate**: < 5% monthly churn

### 6.3 Quality Metrics
- **AI Response Quality**: < 5% "Regenerate" rate (first-shot answer quality)
- **User Satisfaction**: > 4.5/5 average rating
- **NPS Score**: > 50 (Net Promoter Score)
- **Bug Reports**: < 10 critical bugs per month
- **Support Tickets**: < 2% of users require support

### 6.4 Performance Metrics
- **Page Load Time**: P95 < 2 seconds
- **API Latency**: P95 < 500ms
- **Error Rate**: < 0.1% of requests fail
- **Uptime**: > 99.9% availability

### 6.5 Growth Metrics
- **User Acquisition**: 1000+ new sign-ups per month
- **Viral Coefficient**: > 0.3 (each user invites 0.3 new users)
- **Conversion Rate**: > 10% of visitors sign up
- **Team Adoption**: > 100 active teams within 6 months

### 6.6 Business Metrics (Future Monetization)
- **Free to Paid Conversion**: > 5% of free users upgrade to paid
- **Monthly Recurring Revenue (MRR)**: Target $10k MRR by month 12
- **Customer Lifetime Value (LTV)**: > $500 per paid user
- **Customer Acquisition Cost (CAC)**: < $50 per user
- **LTV:CAC Ratio**: > 3:1

---

## 7. Technical Constraints & Dependencies

### 7.1 Required External Services
- **AI Models**: At least one of: Mistral API, Groq API, Google Gemini API, Anthropic Claude API
- **Database**: MongoDB Atlas (serverless tier minimum)
- **Hosting**: Vercel (Edge Network required for optimal performance)
- **Authentication**: JWT library (jose) for token management

### 7.2 Optional External Services (Enhanced Features)
- **Image Generation**: Stability AI, Freepik, or Picsart API
- **Voice Synthesis**: ElevenLabs API
- **Music Generation**: Suno AI API
- **Video Avatars**: HeyGen API
- **Web Search**: Tavily API
- **Academic Search**: Semantic Scholar API (free), arXiv API (free)
- **GitHub Integration**: GitHub OAuth + Octokit
- **Analytics**: Vercel Analytics

### 7.3 Browser Requirements
- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: ES2020+ support required
- **IndexedDB**: Required for offline functionality
- **WebSockets**: Required for real-time features (future)

### 7.4 Development Environment
- **Node.js**: v18+ required
- **Package Manager**: npm or pnpm
- **TypeScript**: v5.7+
- **Next.js**: v16.1+
- **React**: v18.2+

---

## 8. Compliance & Legal Requirements

### 8.1 Data Privacy
- **GDPR Compliance**: For European users (data export, deletion, consent)
- **CCPA Compliance**: For California users (data disclosure, opt-out)
- **Privacy Policy**: Clear disclosure of data collection and usage
- **Terms of Service**: User agreement for platform usage
- **Cookie Consent**: Banner for non-essential cookies

### 8.2 Content Licensing
- **User-Generated Content**: Users retain ownership of their code and content
- **AI-Generated Content**: Clear attribution when AI generates content
- **Third-Party Resources**: Proper licensing for external resources (images, videos)
- **Open Source**: Compliance with open-source licenses (MIT, Apache, etc.)

### 8.3 Accessibility Compliance
- **ADA Compliance**: Americans with Disabilities Act requirements
- **Section 508**: US federal accessibility standards
- **WCAG 2.1 AA**: International accessibility guidelines

---

## 9. Future Roadmap (Post-2.0)

### Phase 3: Advanced Collaboration (Q2 2026)
- Real-time collaborative code editing (like Google Docs for code)
- Video conferencing integration for pair programming
- Whiteboard for system design discussions
- Team code challenges and hackathons

### Phase 4: Mobile Apps (Q3 2026)
- Native iOS app (Swift/SwiftUI)
- Native Android app (Kotlin/Jetpack Compose)
- Offline-first architecture with sync
- Push notifications for mobile

### Phase 5: Enterprise Features (Q4 2026)
- SSO integration (SAML, LDAP)
- Custom branding for organizations
- Advanced admin controls and audit logs
- SLA guarantees and dedicated support
- On-premise deployment option

### Phase 6: AI Agents (Q1 2027)
- Autonomous coding agents that write code
- Automated bug fixing and refactoring
- Continuous learning from user feedback
- Multi-agent collaboration for complex tasks

---

**End of Requirements Specification**  
*Document Owner: G R Harsha*  
*Last Updated: February 22, 2026*  
*Version: 4.0.0*

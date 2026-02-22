# 🧠 Ganapathi Mentor AI

> **Your AI-Powered Coding Mentor** — Built by [G R Harsha](https://www.linkedin.com/in/grharsha777/)

An enterprise-grade, full-stack AI coding mentor platform that combines 20+ cutting-edge AI services, real-time collaboration, adaptive learning paths, and gamified challenges into a single, premium dashboard experience.

🌐 **Live Demo**: [ganapathi-mentor-ai.vercel.app](https://ganapathi-mentor-ai.vercel.app)

---

## ✨ Key Features

### 🎓 Learning & Education
| Feature | Description |
|---------|-------------|
| **AI Learning Paths** | AI-generated personalized roadmaps with sessions, resources, and progress tracking |
| **Concept Engine** | Search any tech concept for multi-level explanations (Beginner → Advanced), with YouTube videos, web sources, research papers, and AI-generated visualizations |
| **Last-Minute Prep** | Quick revision sheets, formula banks, flashcards, and practice questions for exam preparation |
| **Specialized Training** | Interview prep modules and code-to-learn tutorials |

### 💻 Developer Tools
| Feature | Description |
|---------|-------------|
| **AI Code Review** | Paste code and get AI-powered quality analysis with best practice recommendations |
| **Documentation Generator** | Auto-generate API docs, README files, and technical documentation from code |
| **Productivity Hub** | Task management with AI-suggested priorities and time tracking |
| **GitHub Integration** | Connect your GitHub for repo analytics, contribution heatmaps, and language breakdowns |

### 🔬 Research & Creation
| Feature | Description |
|---------|-------------|
| **Research Hub** | Multi-source search engine (Web, StackOverflow, Wikipedia, arXiv, Semantic Scholar) with AI synthesis |
| **Media Studio** | AI image generation using Freepik/Stability AI with prompt engineering |
| **AI Video Generation** | Text-to-video using HuggingFace models |
| **Music Generation** | Integration with Suno AI for music/song creation |

### 🏆 Gamification & Social
| Feature | Description |
|---------|-------------|
| **Coding Challenges** | Solve problems, earn XP, climb the leaderboard — with multiple difficulty levels |
| **Mock Interview** | Practice technical interviews with an AI interviewer |
| **CodeCollab** | Real-time collaborative coding rooms with live cursors |
| **Portfolio Generator** | Auto-generated developer portfolio from your activity |
| **Collaboration Intelligence** | Team knowledge silo detection and skill gap recommendations |

### 🤖 AI Assistant
| Feature | Description |
|---------|-------------|
| **Ganapathi AI Chatbot** | Full-featured AI chatbot with web search, YouTube integration, image generation, navigation, and a friendly personality |
| **Text-to-Speech** | Listen to explanations via AI-generated audio |
| **Onboarding Tutorial** | First-time interactive feature walkthrough for new users |

### 📊 Analytics & Monitoring
| Feature | Description |
|---------|-------------|
| **Performance Analytics** | Track learning progress, coding metrics, streaks, and XP |
| **Anomaly Detection** | AI-powered detection of unusual patterns in coding behavior |
| **Smart Alerts** | Configurable notifications for milestones and anomalies |

### ⚙️ Settings & Feedback
| Feature | Description |
|---------|-------------|
| **Feedback System** | In-app feedback form with category selection, star rating — emails delivered to admin |
| **GitHub Token Management** | Encrypted token storage with session-based security |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **Next.js 16** | React framework with App Router, Server & Client Components |
| **React 18** | UI library with hooks, suspense, and concurrent features |
| **TypeScript 5.7** | Type-safe development |
| **Tailwind CSS 3.4** | Utility-first styling |
| **Framer Motion 12** | Animations, page transitions, dock magnification |
| **Radix UI** | 25+ accessible, unstyled primitives (Dialog, Tabs, Tooltip, etc.) |
| **Recharts 2.15** | Data visualization charts |
| **Monaco Editor** | VS Code-quality in-browser code editor |
| **Lucide React** | Modern icon library |
| **Sonner** | Toast notifications |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Next.js API Routes** | 36+ RESTful API endpoints |
| **MongoDB + Mongoose 9** | Primary database with 20 models |
| **IndexedDB (Client)** | Offline-first client-side persistence with per-user scoping |
| **JWT (Jose/jsonwebtoken)** | Token-based authentication |
| **bcryptjs** | Password hashing |
| **Nodemailer** | Transactional email delivery |
| **Zod** | Runtime schema validation |

### AI & ML Services
| Provider | Usage |
|---------|-------|
| **Mistral AI** | Primary chat completion & code analysis |
| **Groq** | Fast inference for real-time interactions |
| **OpenAI** | Advanced reasoning and generation |
| **HuggingFace Inference** | Video generation, fallback chat completion |
| **Freepik AI** | Concept visualization image generation |
| **Stability AI** | Alternative image generation |
| **Sarvam AI** | Indian language TTS |
| **ElevenLabs** | High-quality text-to-speech |
| **Murf AI** | Voice-over generation |

### External APIs & Integrations
| Service | Purpose |
|---------|---------|
| **YouTube Data API v3** | Tutorial video search (filtered to last 3 years, embeddable only) |
| **SerpAPI** | Web search results |
| **StackExchange API** | StackOverflow Q&A search |
| **Wikipedia API** | Encyclopedia lookups |
| **arXiv API** | Research paper search |
| **Semantic Scholar** | Academic citation data |
| **Tavily** | AI-optimized web search |
| **GitHub REST API** | Repository analytics via Octokit |
| **Web3Forms** | Feedback email delivery |
| **Supabase** | Authentication provider |
| **Vercel** | Deployment & analytics |

---

## 🗄️ Database Schema (MongoDB)

### Core Models
| Model | Description |
|-------|-------------|
| `User` | User profiles, metrics (XP, streaks, sessions), roles, avatars |
| `LearningPath` | AI-generated roadmaps with sessions, topics, and progress |
| `Session` | Individual learning sessions within paths |
| `Concept` | Explored concepts with difficulty and mastery tracking |
| `CodeReview` | Saved code review analyses |

### Gamification
| Model | Description |
|-------|-------------|
| `Challenge` | Coding challenge definitions with difficulty, test cases |
| `Submission` | User submissions with code, status, XP earned |
| `Question` | Quiz/assessment questions |

### Collaboration
| Model | Description |
|-------|-------------|
| `Team` | Team definitions for collaboration |
| `TeamMember` | Team membership and roles |
| `Room` | Live collaborative coding rooms |

### Content & Media
| Model | Description |
|-------|-------------|
| `Documentation` | Generated documentation records |
| `MediaProject` | AI-generated images and videos |
| `UserContent` | Generic content persistence (per-feature, per-user) |
| `Interview` | Mock interview sessions and transcripts |

### Analytics & System
| Model | Description |
|-------|-------------|
| `Metric` | Performance metrics snapshots |
| `Anomaly` | Detected behavioral anomalies |
| `Alert` | User notification/alert preferences |
| `Feedback` | User feedback with category, rating, and message |
| `UserIntegration` | Encrypted third-party tokens (GitHub) |

---

## 🔒 Authentication & Security

| Layer | Implementation |
|-------|---------------|
| **Auth Provider** | Supabase Auth (Google OAuth, GitHub OAuth, Email/Password) |
| **Session Tokens** | JWT with `jose` library, stored as HTTP-only cookies |
| **Password Hashing** | bcryptjs with salt rounds |
| **Token Encryption** | AES-256-CBC encryption for stored GitHub tokens |
| **API Protection** | All API routes verify JWT tokens before processing |
| **Data Isolation** | IndexedDB keys prefixed with user email for per-user scoping |
| **Rate Limiting** | Provider-level rate limit handling with graceful fallbacks |
| **Input Validation** | Zod schema validation on all form inputs |

---

## 📱 Responsive Design

| Breakpoint | UI Component |
|-----------|-------------|
| **Desktop (1024px+)** | macOS-style bottom dock with icon magnification physics |
| **Tablet/Mobile (<1024px)** | Slide-out sidebar with hamburger menu |
| **All Sizes** | Responsive grid layouts, adaptive padding, touch-optimized |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- API keys for AI providers

### Installation

```bash
git clone https://github.com/grharsha777/neural-code-symbiosis.git
cd neural-code-symbiosis
npm install
```

### Environment Variables

Create `.env.local` with the following:

```env
# Database
MONGODB_URI=mongodb+srv://...

# Authentication
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ENCRYPTION_KEY=32-character-hex-key

# AI Providers (use at least one)
MISTRAL_API_KEY=your-mistral-key
GROQ_API_KEY=your-groq-key
OPENAI_API_KEY=your-openai-key
HUGGINGFACE_API_KEY=your-hf-key

# Media & Search
FREEPIK_API_KEY=your-freepik-key
YOUTUBE_API_KEY=your-youtube-key
SERPAPI_KEY=your-serpapi-key

# Optional
SARVAM_API_KEY=your-sarvam-key
ELEVENLABS_API_KEY=your-elevenlabs-key
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

```bash
vercel --prod
```

---

## 📂 Project Structure

```
neural-code-symbiosis/
├── app/
│   ├── api/                  # 36+ API routes
│   │   ├── auth/             # Login, register, OAuth callbacks
│   │   ├── chat/             # AI chatbot endpoint
│   │   ├── challenges/       # Challenge CRUD + submissions
│   │   ├── feedback/         # User feedback + email
│   │   ├── youtube/          # YouTube video search
│   │   └── ...               # 30+ more routes
│   ├── auth/                 # Login/Register pages
│   └── dashboard/            # 19+ feature pages
├── components/
│   ├── dashboard/            # Sidebar, Dock, Nav
│   ├── onboarding/           # First-time tutorial
│   ├── learning/             # Concept Explainer, Roadmap
│   ├── challenges/           # Challenge UI
│   ├── chat/                 # Global chatbot
│   ├── media/                # Studio, Video generator
│   ├── research/             # Research Hub
│   └── ui/                   # 50+ Radix-based UI primitives
├── lib/
│   ├── ai.ts                 # Multi-provider AI gateway
│   ├── auth.ts               # JWT verification
│   ├── client-db.ts          # IndexedDB wrapper
│   ├── content-store.ts      # Per-user content persistence hook
│   ├── youtube.ts            # YouTube Data API (filtered)
│   ├── integrations/         # 10 external API clients
│   └── ...                   # 10+ utility modules
├── models/                   # 20 Mongoose schemas
├── hooks/                    # Custom React hooks
└── public/                   # Static assets
```

---

## 👨‍💻 Author

**G R Harsha**
- 🌐 [LinkedIn](https://www.linkedin.com/in/grharsha777/)
- 💻 [GitHub](https://github.com/grharsha777)
- 📧 [grharsha777@gmail.com](mailto:grharsha777@gmail.com)

---

## 📄 License

This project is private and proprietary. All rights reserved © 2026 G R Harsha.

# 📋 Ganapathi Mentor AI — Technical Specifications

> **Version**: 1.0.0  
> **Last Updated**: February 2026  
> **Author**: G R Harsha

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                       │
│  Next.js 16 App Router │ React 18 │ Framer Motion │ Radix  │
│  IndexedDB (per-user)  │ Monaco Editor │ Recharts           │
└───────────────┬─────────────────────────────┬───────────────┘
                │ HTTPS / REST API            │ WebSocket (Collab)
┌───────────────▼─────────────────────────────▼───────────────┐
│                   NEXT.JS API ROUTES (36+)                  │
│  JWT Verification │ Zod Validation │ Rate Limit Handling    │
└──┬──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────┘
   │      │      │      │      │      │      │      │
   ▼      ▼      ▼      ▼      ▼      ▼      ▼      ▼
MongoDB  Mistral Groq  OpenAI  HF   YouTube SERP  Freepik
(Atlas)   AI     AI     API   Inf.  Data v3  API    AI
```

### 1.2 Data Flow

1. **Client → API**: All requests include JWT token (HTTP-only cookie)
2. **API → Auth**: `verifyToken()` validates JWT using `jose` library
3. **API → DB**: Mongoose ODM connects to MongoDB Atlas
4. **API → AI**: Multi-provider gateway selects available provider
5. **API → Client**: JSON responses or text streams
6. **Client → IndexedDB**: Instant local persistence with user-email prefix

---

## 2. Authentication & Authorization

### 2.1 Auth Flow

| Step | Action |
|------|--------|
| 1 | User submits credentials (Email/Password or OAuth via Supabase) |
| 2 | Server validates against MongoDB (`bcryptjs` hash comparison) |
| 3 | Server generates JWT with `{ userId, email, full_name }` payload |
| 4 | JWT stored as HTTP-only cookie named `token` |
| 5 | Every API route calls `verifyToken(token)` before processing |
| 6 | Dashboard layout redirects to `/auth/login` if no valid token |

### 2.2 Security Layers

| Layer | Technology | Details |
|-------|-----------|---------|
| Password Storage | bcryptjs | Salted hash, never stored in plaintext |
| JWT Signing | jose | HS256 algorithm, configurable expiration |
| Cookie Security | HTTP-only | Not accessible to client-side JavaScript |
| Token Encryption | AES-256-CBC | GitHub PATs encrypted at rest in MongoDB |
| Data Isolation | Email Prefix | IndexedDB keys scoped per authenticated user |
| Input Validation | Zod | Server-side schema validation on all inputs |
| OAuth | Supabase Auth | Google & GitHub OAuth2.0 providers |

---

## 3. Database Schema

### 3.1 MongoDB Collections (20 Models)

#### User (`users`)
```
{
  full_name: String,
  email: String (unique),
  password: String (hashed),
  role: 'viewer' | 'admin',
  avatar_url: String,
  metrics: {
    practice_points: Number,
    total_sessions: Number,
    completed_sessions: Number,
    streak_days: Number,
    total_xp: Number,
    challenges_completed: Number
  },
  created_at: Date
}
```

#### LearningPath (`learningpaths`)
```
{
  user_id: ObjectId → User,
  title: String,
  description: String,
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  status: 'active' | 'in_progress' | 'completed',
  topics: [String],
  sessions: [{
    title: String,
    description: String,
    duration_minutes: Number,
    status: 'pending' | 'in_progress' | 'completed',
    resources: [{ title, url, type }]
  }],
  created_at: Date
}
```

#### Challenge (`challenges`)
```
{
  title: String,
  description: String,
  difficulty: 'easy' | 'medium' | 'hard',
  category: String,
  boilerplate_code: String,
  test_cases: [{ input, expected_output, is_hidden }],
  xp_reward: Number,
  time_limit_minutes: Number,
  created_at: Date
}
```

#### Submission (`submissions`)
```
{
  user_id: ObjectId → User,
  challenge_id: ObjectId → Challenge,
  code: String,
  language: String,
  status: 'pending' | 'accepted' | 'wrong_answer' | 'error',
  test_results: [{ passed, input, expected, actual }],
  xp_earned: Number,
  submitted_at: Date
}
```

#### Feedback (`feedbacks`)
```
{
  user_id: ObjectId → User,
  user_email: String,
  user_name: String,
  category: 'suggestion' | 'compliment' | 'bug' | 'feature' | 'other',
  rating: Number (0-5),
  message: String,
  status: 'new' | 'reviewed' | 'resolved',
  created_at: Date
}
```

#### Other Models
| Model | Key Fields |
|-------|-----------|
| `Concept` | user_id, title, difficulty, is_mastered, explanation |
| `CodeReview` | user_id, code, language, analysis |
| `Documentation` | user_id, title, content, code_input |
| `MediaProject` | user_id, prompt, image_url, type |
| `Interview` | user_id, topic, qa_pairs, score |
| `Room` | name, participants, code, language, is_active |
| `Team` | name, members, created_by |
| `TeamMember` | team_id, user_id, role |
| `Metric` | user_id, type, value, timestamp |
| `Anomaly` | user_id, type, severity, description |
| `Alert` | user_id, type, message, is_read |
| `Session` | user_id, path_id, duration, completed |
| `Question` | topic, question, options, answer |
| `UserContent` | user_id, feature, key, data |
| `UserIntegration` | user_id, provider, encrypted_token |

### 3.2 Client-Side Storage (IndexedDB)

| Store | Purpose |
|-------|---------|
| `concepts` | Cached concept explanations |
| `code_reviews` | Saved code review analyses |
| `roadmaps` | Learning path data |
| `docs` | Generated documentation |
| `productivity` | Task/productivity data |
| `interviews` | Interview prep sessions |
| `media` | Generated images/videos |
| `chat_history` | Chatbot conversations |
| `stackoverflow` | StackOverflow search history |
| `research` | Research hub results |

**Per-User Scoping**: All keys prefixed with `{user.email}:` to isolate data between accounts on the same browser.

---

## 4. API Reference

### 4.1 Authentication APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create new account |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/callback` | OAuth callback handler |
| GET | `/api/auth/session` | Get current session |
| POST | `/api/auth/logout` | Destroy session |

### 4.2 AI & Learning APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | AI chatbot (multi-enrichment: YouTube, Search, Image) |
| POST | `/api/explain-concept` | Multi-level concept explanation |
| POST | `/api/learning-path` | Generate/manage learning paths |
| POST | `/api/code-review/analyze` | AI code analysis |
| POST | `/api/docs` | Documentation generation |
| POST | `/api/specialized` | Specialized training content |
| POST | `/api/interview` | Mock interview Q&A |

### 4.3 Media & Search APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/youtube/search` | YouTube video search (3-year filter) |
| POST | `/api/generate-image` | AI image generation (Freepik/Stability) |
| POST | `/api/generate-video` | AI video generation (HuggingFace) |
| POST | `/api/music` | Music generation guidance |
| POST | `/api/tts` | Text-to-speech conversion |
| POST | `/api/studio` | Media studio operations |

### 4.4 Gamification APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/challenges` | List available challenges |
| POST | `/api/challenges/submit` | Submit challenge solution |
| GET | `/api/leaderboard` | Global XP leaderboard |
| GET | `/api/portfolio` | User portfolio data |

### 4.5 Analytics & System APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Performance metrics |
| GET | `/api/metrics` | Detailed metric snapshots |
| GET | `/api/collaboration` | Team/silo analysis |
| POST | `/api/feedback` | Submit user feedback (→ email + MongoDB) |
| GET/POST | `/api/session/github` | GitHub token management |
| POST | `/api/content` | Generic content persistence |
| POST | `/api/alerts` | Alert management |

### 4.6 Collaboration APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/rooms` | Create/list collab rooms |
| GET/POST | `/api/teams` | Team management |
| POST | `/api/execute` | Code execution (Judge0) |

---

## 5. AI Provider Architecture

### 5.1 Multi-Provider Gateway (`lib/ai.ts`)

```
Priority Order:
1. Mistral AI (MISTRAL_API_KEY)
2. Groq (GROQ_API_KEY)
3. OpenAI (OPENAI_API_KEY)
4. HuggingFace (HUGGINGFACE_API_KEY) — fallback
```

The system automatically selects the first available provider with a valid API key. If the primary provider hits rate limits, the error is handled gracefully with a user-friendly message.

### 5.2 Chat Enrichment Pipeline

When a user sends a message to the AI chatbot, the system:

1. **Detects intent** (YouTube, Search, Image, Video, Song, Navigation)
2. **Fetches user context** from MongoDB (name, concepts, learning paths)
3. **Runs enrichment tasks in parallel**:
   - YouTube search (if video intent)
   - Web search via SerpAPI (if search intent)
   - Image generation via Freepik (if image intent)
   - Video generation via HuggingFace (if video intent)
4. **Constructs system prompt** with user context + enrichment data
5. **Sends to AI provider** for final response generation

---

## 6. Frontend Architecture

### 6.1 Navigation System

| View | Component | Trigger |
|------|----------|---------|
| Desktop | Bottom dock with magnification physics | Always visible (≥1024px) |
| Mobile | Slide-out sidebar with hamburger | Button press (<1024px) |
| Desktop Alt | Collapsible left sidebar | Optional toggle |

### 6.2 Design System

- **Color Palette**: Each feature has a unique gradient (19 distinct color mappings)
- **Icon System**: Neon glassmorphic squircle icons with drop-shadow glow
- **Animations**: Framer Motion spring physics for dock, slide transitions
- **Dark Mode**: Full dark theme with glass/blur effects
- **Responsive**: Fluid layouts from 320px to 4K displays

### 6.3 State Management

| Layer | Technology | Scope |
|-------|-----------|-------|
| Server State | Fetch + Cache | API data |
| Client State | React useState/useEffect | Component-local |
| Persistent State | `useContentStore` hook | Per-user IndexedDB + MongoDB sync |
| Auth State | `useAuth` hook | Session/user context |

---

## 7. Deployment

### 7.1 Vercel Configuration

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `next build` |
| Node Version | 18.x |
| Environment Vars | 15+ secrets configured |

### 7.2 External Dependencies

| Service | Required | Free Tier |
|---------|---------|-----------|
| MongoDB Atlas | ✅ Yes | 512MB free |
| Supabase | ✅ Yes | 50K MAU free |
| Mistral/Groq | ✅ At least one | Free tiers available |
| YouTube API | Optional | 10K queries/day |
| SerpAPI | Optional | 100 searches/month |
| Freepik | Optional | Limited free |

---

## 8. Performance Optimizations

| Optimization | Implementation |
|-------------|---------------|
| Client-side caching | IndexedDB for instant data recall |
| Parallel API calls | `Promise.allSettled` for enrichment tasks |
| Lazy loading | Dynamic imports for heavy components |
| Image optimization | Next.js Image component with CDN |
| Bundle splitting | Next.js automatic code splitting per route |
| Memoization | `React.memo` and `useCallback` on dock icons |

---

*Built with ❤️ by G R Harsha — Ganapathi Mentor AI © 2026*

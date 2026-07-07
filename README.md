<div align="center">
  <img src="https://ganapathi-mentor-ai.vercel.app/logo.png" alt="Ganapathi Mentor AI Logo" width="120" height="120" />
  <h1>🧠 Ganapathi Mentor AI</h1>
  <p><strong>The Ultimate AI Knowledge Assistant & Copilot for Developers & Students</strong></p>
  
  <p>
    <a href="https://ganapathi-mentor-ai.vercel.app"><strong>Live Demo</strong></a> · 
    <a href="https://github.com/grharsha777/Ganapathi-Mentor-AI"><strong>Repository</strong></a>
  </p>

  <p>
    <i>Submitted to the <b>TakeOver'26 Hackathon</b></i><br/>
    <b>Theme 2:</b> AI Automation & Intelligent Agents<br/>
    <b>Built by:</b> <a href="https://www.linkedin.com/in/grharsha777/">Anantha Vector</a>  </p>
</div>

---

## 🎯 The Problem

Students and developers waste hours every day because knowledge is scattered across disconnected sources:

- Learning material lives across YouTube, docs, Stack Overflow, arXiv, and PDFs — with no single place to ask a question and get a **synthesized, cited answer**.
- Code review, documentation, and repetitive prep work (revision sheets, interview questions, project docs) are done manually, one tool at a time.
- Interview and career prep is fragmented across mock-interview apps, flashcard tools, and separate portfolio builders.
- There is no single **AI copilot** that follows a learner/developer across the entire journey: understanding a concept → writing and reviewing code → preparing for interviews → tracking progress.

This is exactly the gap **Theme 2 (AI Automation & Intelligent Agents)** calls out: *"Students, employees, and customers struggle to find accurate information quickly due to fragmented knowledge sources,"* and *"Employees spend hours performing repetitive administrative tasks that could be automated using AI assistants."*

---

## 💡 Our Solution: Ganapathi Mentor AI

**Ganapathi Mentor AI** is a unified, multi-agent AI copilot that acts as a single knowledge and productivity layer for developers and students, replacing ten disconnected tools.

The name is deliberate: in Hindu tradition, Ganapathi (Ganesha) is the remover of obstacles and the patron of learning and new beginnings. Our platform is designed around the same idea: **clear the obstacles between a learner and the answer, the code fix, or the interview prep they need.**

### 🔄 How It Works, End-to-End:

1. **Ask Anything:** The platform's multi-model AI gateway automatically routes the query to the best-fit model (Mistral, Groq, GPT-4o, Claude, Gemini) based on task type (fast lookup vs. deep reasoning vs. code analysis).
2. **Research Engine:** Decomposes the query, retrieves in parallel from the Web, Stack Overflow, Wikipedia, arXiv, and Semantic Scholar, deduplicates and ranks sources, then synthesizes a cited answer with confidence scoring.
3. **Code Review Agent:** Runs architecture-level analysis (security, performance, refactoring) via AWS Bedrock's multi-model parallel inference.
4. **Learning Path Agent:** Generates personalized roadmaps and adapts them as the learner progresses.
5. **Interview & Productivity Agents:** Handle mock interviews, task prioritization, and documentation generation—automating repetitive work.
6. **Omnipresent Terminal CLI:** Everything is available both as a web platform and a terminal-native Python CLI, so the copilot follows the developer into their actual workflow.

This turns "search five places and hope" into "ask once, get a synthesized, cited, actionable answer."

---

## 🧩 Why This Fits Theme 2 Perfectly

| Theme 2 Problem Statement | How Ganapathi Mentor AI Addresses It |
| :--- | :--- |
| **AI Knowledge Assistant** | Multi-source Research Engine with cited, synthesized answers across Web, Stack Overflow, Wikipedia, arXiv, and Semantic Scholar. |
| **AI Employee Copilot** | Code review, documentation generation, and task prioritization agents automate repetitive dev/study work. |
| **AI Document Generation** | Auto-generates API docs, README files, and technical documentation directly from codebase analysis. |
| **Autonomous Workflow Agents** | Terminal CLI agent that plans and executes multi-step dev tasks directly in the user's local environment. |
| **AI Personalization Engine** | Adaptive learning paths, custom quota limits, and progress tracking personalized for every user. |

---

## 🛠️ Architecture & Tech Stack

Ganapathi Mentor AI is built for enterprise-grade speed, security, and scalability.

### 🏗️ Core Infrastructure
* **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Radix UI
* **Backend:** Next.js API Routes (REST Edge & Node runtimes)
* **Database:** MongoDB Atlas (Mongoose) with AES-256 encryption at rest
* **Authentication:** Custom JWT (jose) with secure HTTP-only cookies + Supabase Auth
* **Security:** Zod input validation, bcrypt hashing, Server-side API Proxying (Zero client-side secrets)

### 🧠 Multi-Model AI Engine
We don't rely on just one model. Our intelligent routing system dispatches tasks to the best provider:
* **AWS Bedrock:** Multi-model parallel inference for complex architecture analysis
* **Groq (Llama 3 / Mixtral):** Ultra-low latency for instant chat and autocomplete
* **OpenAI (GPT-4o) & Anthropic (Claude 3.5 Sonnet):** Deep reasoning and coding tasks
* **Google (Gemini Pro):** Context-heavy document analysis
* **Mistral Large & HuggingFace:** Specialized task execution

### 🔌 External APIs & Integrations
We pull context from the entire web to ground our AI:
* **Search & Research:** SerpAPI / Tavily (Web Search), StackExchange API, arXiv API, Semantic Scholar API, Wikipedia API
* **Media & Context:** YouTube Data API v3, Unsplash / Pexels API
* **Voice & Generative Media:** Murf, Sarvam, Freepik, Fal.ai
* **Developer Tools:** GitHub API (Repo analysis & OAuth)

---

## ✨ Core Features

| Feature | What It Automates |
| :--- | :--- |
| 🔍 **AI Research Engine** | Multi-source search + citation-aware synthesis (Web, Stack Overflow, arXiv). |
| 💻 **Quantum Code Review** | Security, performance, and refactoring analysis via parallel multi-model inference. |
| 🛤️ **AI Learning Paths** | Personalized, adaptive roadmaps instead of static course content. |
| 📝 **Documentation Generator**| Auto-generates READMEs and API docs from code. |
| 🎙️ **Voice Interview Simulator**| Technical/behavioral/system-design mock interviews using TTS/STT. |
| ⚡ **Terminal Mentor CLI** | Runs the copilot directly in the developer's command line (`ganapathi login`). |
| ⏱️ **Productivity Hub** | Eisenhower-matrix task prioritization, Pomodoro, smart agenda. |

---

## 🚦 Getting Started

### Web Application
```bash
# Clone the repository
git clone https://github.com/grharsha777/Ganapathi-Mentor-AI.git
cd Ganapathi-Mentor-AI

# Install dependencies
npm install

# Setup environment variables (Requires MongoDB URI and API keys)
cp .env.example .env.local

# Run the development server
npm run dev
```

### Python CLI Agent
We've built a robust Python CLI that brings the Mentor AI directly into your terminal.

```bash
# Install the CLI package
pip install -e ./ganapathi-core

# Authenticate with your platform credentials
ganapathi login

# Ask a question or run a task
ganapathi "Explain this codebase architecture"
ganapathi hive-mind
```

---

## 🔒 Security & Performance
* **Zero Client-Side Secrets:** All third-party API keys (Unsplash, Anthropic, Google, etc.) are proxied through secure server-side routes.
* **Rate Limiting & Quotas:** Custom in-memory sliding window rate-limiting and MongoDB-backed monthly quota tracking for every user to prevent abuse.
* **Type Safety:** 100% end-to-end TypeScript with Zod validation.

---

<div align="center">
  <p>Built with ❤️ by <b>G R Harsha</b> for the TakeOver'26 Hackathon</p>
</div>

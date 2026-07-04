# 🐘 Ganapathi CLI v2.0 — Ultimate AI Terminal Mentor

[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

The most powerful AI-powered terminal mentor for developers. Built for hackathons, interviews, and production.

## ⚡ Features

- **🔮 ML Predictions** — Random Forest + GBM ensemble for code quality, bug risk, performance scoring
- **💬 Multi-LLM Chat** — Mistral → Groq → Ollama automatic fallback
- **🤖 AI Agent** — Autonomous task execution with sandboxed tools
- **🔒 Code Audit** — Security scan + ML scoring + AI review
- **🏗 Architecture Explain** — AI-powered project structure analysis
- **🐳 Docker** — Auto-generate Dockerfile, build, and deploy
- **☸️ Kubernetes** — Generate manifests, deploy with kubectl
- **🩺 Doctor** — System diagnostics with 15+ health checks
- **📜 History** — SQLite-backed query history and analytics

## 🚀 Quick Install

```bash
# Clone and install
cd ganapathi-core
pip install -e ".[full]"

# Or one-liner
pip install -e .
```

## 📖 Usage

```bash
# Interactive AI chat
ganapathi chat

# ML code prediction
ganapathi predict --code "def add(a, b): return a + b" --type all
ganapathi predict --file main.py --type bug

# System diagnostic
ganapathi doctor

# Code audit (single file or directory)
ganapathi audit ./src
ganapathi audit main.py

# Architecture analysis
ganapathi explain ./my-project

# Autonomous AI agent
ganapathi agent "debug the failing test in test_auth.py"

# Docker
ganapathi docker build --app my-app
ganapathi docker deploy --app my-app

# Kubernetes
ganapathi k8s generate --app my-app --replicas 3
ganapathi k8s deploy

# ML model management
ganapathi ml train --samples 10000
ganapathi ml info
ganapathi ml benchmark

# Configure API keys
ganapathi setup

# View history
ganapathi history --limit 50
```

## 🧠 ML Prediction Engine

The ensemble uses **Random Forest (1000 trees)** + **Gradient Boosting (500 trees)** trained on 27 code features:

| Feature Category | Metrics |
|---|---|
| Structure | LOC, functions, classes, imports, nesting depth |
| Quality | Comments, docstrings, readability score |
| Complexity | Loops, conditionals, try/except, operators |
| Style | Line length, comprehensions, decorators, entropy |

**Prediction targets**: Bug Risk • Quality Score • Performance Score • Career Fit

## 🔧 Configuration

```bash
# Set API keys
ganapathi setup

# Or use environment variables
export MISTRAL_API_KEY="your-key"
export GROQ_API_KEY="your-key"
```

Config stored at `~/.ganapathi/config.json`

## 📋 Requirements

- Python 3.9+
- pip

## License

MIT © G R Harsha

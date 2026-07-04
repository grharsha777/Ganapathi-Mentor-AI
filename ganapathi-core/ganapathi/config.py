"""
Ganapathi CLI v2.0 - Configuration Management
Handles API keys, user preferences, history, and model metadata.
"""

import os
import json
import sqlite3
import hashlib
from pathlib import Path
from typing import Optional, Dict, Any
from datetime import datetime

# ═══════════════════════════════════════════════════════════════
# Global Constants
# ═══════════════════════════════════════════════════════════════
APP_NAME = "ganapathi"
CONFIG_DIR = Path.home() / ".ganapathi"
CONFIG_FILE = CONFIG_DIR / "config.json"
DB_FILE = CONFIG_DIR / "history.db"
MODELS_DIR = CONFIG_DIR / "models"
CACHE_DIR = CONFIG_DIR / "cache"

# ═══════════════════════════════════════════════════════════════
# API Key Resolution (environment → config file, never hardcoded)
# ═══════════════════════════════════════════════════════════════
EMBEDDED_KEYS = {
    "MISTRAL_API_KEY": os.environ.get("MISTRAL_API_KEY", ""),
    "GROQ_API_KEY": os.environ.get("GROQ_API_KEY", ""),
}


# ═══════════════════════════════════════════════════════════════
# LLM Model Registry
# ═══════════════════════════════════════════════════════════════
LLM_MODELS = {
    "mistral": {
        "name": "Mistral Large",
        "base_url": "https://api.mistral.ai/v1",
        "model": "mistral-large-latest",
        "key_env": "MISTRAL_API_KEY",
        "priority": 1,
    },
    "groq": {
        "name": "Groq Llama 3.3 70B",
        "base_url": "https://api.groq.com/openai/v1",
        "model": "llama-3.3-70b-versatile",
        "key_env": "GROQ_API_KEY",
        "priority": 2,
    },
    "ollama": {
        "name": "Ollama Local",
        "base_url": "http://localhost:11434/v1",
        "model": "llama3.2",
        "key_env": None,
        "priority": 3,
    },
}


def ensure_dirs():
    """Create all required directories."""
    for d in [CONFIG_DIR, MODELS_DIR, CACHE_DIR]:
        d.mkdir(parents=True, exist_ok=True)


def save_config(config: dict):
    """Save configuration to disk."""
    ensure_dirs()
    existing = load_config()
    existing.update({k: v for k, v in config.items() if v})
    with open(CONFIG_FILE, "w") as f:
        json.dump(existing, f, indent=4)


def load_config() -> dict:
    """Load configuration from disk."""
    if not CONFIG_FILE.exists():
        return {}
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}


def get_config_value(key: str, default=None):
    """Get a config value with fallback chain: config.json → env → embedded."""
    val = load_config().get(key)
    if val:
        return val
    val = os.environ.get(key)
    if val:
        return val
    return EMBEDDED_KEYS.get(key, default)


def get_api_key(provider: str) -> Optional[str]:
    """Get API key for a specific provider."""
    model_info = LLM_MODELS.get(provider)
    if not model_info or not model_info["key_env"]:
        return "ollama"  # Local models don't need keys
    return get_config_value(model_info["key_env"])


def get_available_providers() -> list:
    """Return list of available LLM providers sorted by priority."""
    available = []
    for provider_id, info in sorted(LLM_MODELS.items(), key=lambda x: x[1]["priority"]):
        key = get_api_key(provider_id)
        if key:
            available.append({
                "id": provider_id,
                **info,
                "api_key": key,
            })
    return available


# ═══════════════════════════════════════════════════════════════
# SQLite History & Analytics
# ═══════════════════════════════════════════════════════════════
def _get_db() -> sqlite3.Connection:
    """Get SQLite connection with auto-creation."""
    ensure_dirs()
    conn = sqlite3.connect(str(DB_FILE))
    conn.execute("""
        CREATE TABLE IF NOT EXISTS query_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            command TEXT NOT NULL,
            query TEXT,
            response_preview TEXT,
            provider TEXT,
            latency_ms REAL,
            tokens_used INTEGER
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS ml_predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            code_hash TEXT,
            prediction_type TEXT,
            scores TEXT,
            shap_summary TEXT
        )
    """)
    conn.commit()
    return conn


def log_query(command: str, query: str = "", response_preview: str = "",
              provider: str = "", latency_ms: float = 0, tokens_used: int = 0):
    """Log a query to history."""
    try:
        conn = _get_db()
        conn.execute(
            "INSERT INTO query_history (timestamp, command, query, response_preview, provider, latency_ms, tokens_used) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (datetime.now().isoformat(), command, query[:500], response_preview[:200], provider, latency_ms, tokens_used)
        )
        conn.commit()
        conn.close()
    except Exception:
        pass


def log_prediction(code: str, prediction_type: str, scores: dict, shap_summary: str = ""):
    """Log an ML prediction."""
    try:
        conn = _get_db()
        code_hash = hashlib.md5(code.encode()).hexdigest()
        conn.execute(
            "INSERT INTO ml_predictions (timestamp, code_hash, prediction_type, scores, shap_summary) VALUES (?, ?, ?, ?, ?)",
            (datetime.now().isoformat(), code_hash, prediction_type, json.dumps(scores), shap_summary)
        )
        conn.commit()
        conn.close()
    except Exception:
        pass


def get_history(limit: int = 20) -> list:
    """Get recent query history."""
    try:
        conn = _get_db()
        cursor = conn.execute(
            "SELECT timestamp, command, query, provider, latency_ms FROM query_history ORDER BY id DESC LIMIT ?",
            (limit,)
        )
        rows = cursor.fetchall()
        conn.close()
        return rows
    except Exception:
        return []

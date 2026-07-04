"""
Ganapathi CLI v2.0 - Multi-LLM AI Engine
Production-grade AI engine with multi-provider fallback, retries, streaming, and caching.
"""

import os
import time
import json
import hashlib
from typing import Optional, Generator
from pathlib import Path

import openai
from .config import (
    get_available_providers, log_query, CACHE_DIR, ensure_dirs
)

# ═══════════════════════════════════════════════════════════════
# Response Cache
# ═══════════════════════════════════════════════════════════════
class ResponseCache:
    """Disk-based LRU cache for AI responses (offline resilience)."""

    def __init__(self, max_entries: int = 500):
        self.cache_dir = CACHE_DIR / "responses"
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.max_entries = max_entries

    def _key(self, prompt: str, system: str) -> str:
        return hashlib.sha256(f"{system}|||{prompt}".encode()).hexdigest()

    def get(self, prompt: str, system: str) -> Optional[str]:
        key = self._key(prompt, system)
        cache_file = self.cache_dir / f"{key}.json"
        if cache_file.exists():
            try:
                data = json.loads(cache_file.read_text())
                return data.get("response")
            except Exception:
                return None
        return None

    def set(self, prompt: str, system: str, response: str):
        key = self._key(prompt, system)
        cache_file = self.cache_dir / f"{key}.json"
        try:
            cache_file.write_text(json.dumps({
                "prompt": prompt[:200],
                "system": system[:100],
                "response": response,
                "timestamp": time.time()
            }))
        except Exception:
            pass


# ═══════════════════════════════════════════════════════════════
# Main AI Engine
# ═══════════════════════════════════════════════════════════════
class GanapathiAI:
    """
    Multi-LLM AI Engine with:
    - Provider fallback chain (Mistral → Groq → Ollama)
    - Exponential backoff retries
    - Response caching for offline use
    - Token tracking
    """

    SYSTEM_PROMPT = (
        "You are Ganapathi Mentor AI v2.0 — a hyper-advanced, Python-powered AI coding mentor. "
        "YOur are helping students/developers "
        "You provide extremely precise, production-grade advice on algorithms, data structures, "
        "ML/AI, system design, DevOps, and competitive programming. "
        "Always format code with proper syntax, use markdown, and cite sources when possible. "
        "Be concise yet thorough. Include time/space complexity for algorithms."
    )

    MAX_RETRIES = 3
    RETRY_DELAYS = [1, 2, 4]  # seconds

    def __init__(self):
        self.providers = get_available_providers()
        self.cache = ResponseCache()
        self.current_provider = None
        self.total_tokens = 0
        self._init_client()

    def _init_client(self):
        """Initialize the first available LLM client."""
        for provider in self.providers:
            try:
                api_key = provider["api_key"]
                if api_key == "ollama":
                    api_key = "ollama"  # Ollama doesn't need real key

                self.client = openai.OpenAI(
                    base_url=provider["base_url"],
                    api_key=api_key,
                    timeout=30.0,
                )
                self.model = provider["model"]
                self.current_provider = provider["id"]
                return
            except Exception:
                continue

        self.client = None
        self.model = None
        self.current_provider = None

    def is_configured(self) -> bool:
        return self.client is not None

    def get_provider_name(self) -> str:
        if not self.current_provider:
            return "None"
        for p in self.providers:
            if p["id"] == self.current_provider:
                return p["name"]
        return self.current_provider

    def generate(self, prompt: str, system: str = None,
                 temperature: float = 0.7, max_tokens: int = 4096,
                 use_cache: bool = True) -> str:
        """
        Generate AI response with full fallback chain and retries.
        """
        if system is None:
            system = self.SYSTEM_PROMPT

        # Check cache first
        if use_cache:
            cached = self.cache.get(prompt, system)
            if cached:
                return cached

        if not self.is_configured():
            return "⚠️  No AI provider configured. Run `ganapathi setup` or set MISTRAL_API_KEY / GROQ_API_KEY environment variable."

        # Try each provider
        last_error = None
        for provider in self.providers:
            try:
                api_key = provider["api_key"]
                if api_key == "ollama":
                    api_key = "ollama"

                client = openai.OpenAI(
                    base_url=provider["base_url"],
                    api_key=api_key,
                    timeout=30.0,
                )

                response = self._call_with_retry(
                    client, provider["model"], prompt, system,
                    temperature, max_tokens
                )

                if response:
                    self.current_provider = provider["id"]
                    # Cache the response
                    if use_cache:
                        self.cache.set(prompt, system, response)
                    return response

            except Exception as e:
                last_error = e
                continue

        return f"❌ All AI providers failed. Last error: {last_error}"

    def _call_with_retry(self, client, model: str, prompt: str,
                         system: str, temperature: float,
                         max_tokens: int) -> Optional[str]:
        """Call API with exponential backoff retries."""
        for attempt in range(self.MAX_RETRIES):
            try:
                start = time.time()
                response = client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt},
                    ],
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                latency = (time.time() - start) * 1000

                content = response.choices[0].message.content
                tokens = getattr(response.usage, 'total_tokens', 0) if response.usage else 0
                self.total_tokens += tokens

                # Log to history
                log_query(
                    command="generate",
                    query=prompt[:500],
                    response_preview=content[:200] if content else "",
                    provider=model,
                    latency_ms=latency,
                    tokens_used=tokens,
                )

                return content

            except (openai.RateLimitError, openai.APITimeoutError, openai.APIConnectionError) as e:
                if attempt < self.MAX_RETRIES - 1:
                    time.sleep(self.RETRY_DELAYS[attempt])
                else:
                    raise e
            except Exception as e:
                raise e

        return None

    def stream_generate(self, prompt: str, system: str = None,
                        temperature: float = 0.7,
                        max_tokens: int = 4096) -> Generator[str, None, None]:
        """Stream AI response token by token."""
        if system is None:
            system = self.SYSTEM_PROMPT

        if not self.is_configured():
            yield "⚠️  No AI provider configured."
            return

        try:
            stream = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True,
            )
            full_response = []
            for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    text = chunk.choices[0].delta.content
                    full_response.append(text)
                    yield text

            # Cache the full response
            self.cache.set(prompt, system, "".join(full_response))

        except Exception as e:
            yield f"\n❌ Stream error: {e}"

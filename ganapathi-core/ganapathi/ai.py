import os
import sys
from typing import List, Optional, Dict, Any
import openai
from dotenv import load_dotenv
from .config import get_config_value

def load_ai_credentials():
    # 1. Try Global Config (~/.ganapathi/config.json)
    groq_key = get_config_value("GROQ_API_KEY")
    mistral_key = get_config_value("MISTRAL_API_KEY")

    if groq_key or mistral_key:
        return groq_key, mistral_key

    # 2. Try Environment Variables (pre-loaded or local .env)
    # Recursively look for .env.local up to root
    current = os.getcwd()
    while current != os.path.dirname(current):
        env_path = os.path.join(current, ".env.local")
        if os.path.exists(env_path):
            load_dotenv(dotenv_path=env_path)
            break
        current = os.path.dirname(current)

    return os.getenv("GROQ_API_KEY"), os.getenv("MISTRAL_API_KEY")

class GanapathiAI:
    def __init__(self):
        groq_key, mistral_key = load_ai_credentials()
        self.api_key = groq_key or mistral_key
        
        if not self.api_key:
            return

        if groq_key:
            self.client = openai.OpenAI(
                base_url="https://api.groq.com/openai/v1",
                api_key=groq_key
            )
            self.model = "llama-3.3-70b-versatile"
        else:
            self.client = openai.OpenAI(
                base_url="https://api.mistral.ai/v1",
                api_key=mistral_key
            )
            self.model = "mistral-large-latest"

    def is_configured(self) -> bool:
        return hasattr(self, 'client')

    def generate_text(self, prompt: str, system: str = "You are Ganapathi Mentor AI.") -> str:
        if not self.is_configured():
            return "AI model not configured. Run 'ganapathi setup' to configure your API keys globally."

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4096
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error generating text: {str(e)}"

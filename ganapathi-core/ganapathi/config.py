import os
import json
from pathlib import Path

CONFIG_DIR = Path.home() / ".ganapathi"
CONFIG_FILE = CONFIG_DIR / "config.json"

def ensure_config_dir():
    if not CONFIG_DIR.exists():
        CONFIG_DIR.mkdir(parents=True)

def save_config(config: dict):
    ensure_config_dir()
    with open(CONFIG_FILE, "w") as f:
        json.dump(config, f, indent=4)

def load_config() -> dict:
    if not CONFIG_FILE.exists():
        return {}
    try:
        with open(CONFIG_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def get_config_value(key: str, default=None):
    return load_config().get(key, default)

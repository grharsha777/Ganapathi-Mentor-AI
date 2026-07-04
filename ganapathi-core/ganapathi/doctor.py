"""
Ganapathi CLI v2.0 - System Doctor
Comprehensive diagnostic scan: env, deps, APIs, Docker, K8s, ML models, and benchmarks.
"""

import os
import sys
import shutil
import platform
import subprocess
import time
from typing import Dict, List, Any

from rich.console import Console
from .config import get_api_key, get_config_value, MODELS_DIR, CONFIG_DIR


def _check_command(cmd: str) -> bool:
    """Check if a command exists on PATH."""
    return shutil.which(cmd) is not None


def _run_check(name: str, check_fn) -> Dict[str, Any]:
    """Run a single check safely."""
    try:
        ok, detail = check_fn()
        return {"name": name, "ok": ok, "detail": detail}
    except Exception as e:
        return {"name": name, "ok": False, "detail": f"Error: {e}"}


def run_doctor() -> List[Dict[str, Any]]:
    """Run all diagnostic checks and return results."""
    checks = []

    # === Environment ===
    checks.append(_run_check("Python Version", lambda: (
        sys.version_info >= (3, 9),
        f"Python {platform.python_version()} ({'✔ 3.9+' if sys.version_info >= (3, 9) else '✘ Need 3.9+'})"
    )))

    checks.append(_run_check("Operating System", lambda: (
        True,
        f"{platform.system()} {platform.release()} ({platform.machine()})"
    )))

    checks.append(_run_check("Terminal Size", lambda: (
        True,
        f"{shutil.get_terminal_size().columns}x{shutil.get_terminal_size().lines}"
    )))

    # === API Keys ===
    checks.append(_run_check("Mistral API Key", lambda: (
        bool(get_api_key("mistral")),
        "Configured" if get_api_key("mistral") else "Not set → run `ganapathi setup`"
    )))

    checks.append(_run_check("Groq API Key", lambda: (
        bool(get_api_key("groq")),
        "Configured" if get_api_key("groq") else "Not set (optional)"
    )))

    # === ML Models ===
    model_file = MODELS_DIR / "ganapathi_ensemble_v2.joblib"
    checks.append(_run_check("ML Ensemble Model", lambda: (
        model_file.exists(),
        f"Loaded ({model_file.stat().st_size // 1024}KB)" if model_file.exists()
        else "Not trained → run `ganapathi ml train`"
    )))

    # === Dependencies ===
    dep_checks = [
        ("scikit-learn", "sklearn"),
        ("Rich", "rich"),
        ("Typer", "typer"),
        ("OpenAI SDK", "openai"),
        ("NumPy", "numpy"),
        ("joblib", "joblib"),
    ]
    for name, module in dep_checks:
        try:
            __import__(module)
            checks.append({"name": f"Dep: {name}", "ok": True, "detail": "Installed"})
        except ImportError:
            checks.append({"name": f"Dep: {name}", "ok": False, "detail": "Missing → pip install"})

    # === DevOps Tools ===
    tools = [
        ("Docker", "docker"),
        ("kubectl", "kubectl"),
        ("Git", "git"),
        ("Node.js", "node"),
    ]
    for name, cmd in tools:
        has = _check_command(cmd)
        version = ""
        if has:
            try:
                result = subprocess.run([cmd, "--version"], capture_output=True, text=True, timeout=5)
                version = result.stdout.strip().split("\n")[0][:50]
            except Exception:
                version = "installed"
        checks.append({"name": name, "ok": has, "detail": version if has else "Not found"})

    # === Config ===
    checks.append(_run_check("Config Directory", lambda: (
        CONFIG_DIR.exists(),
        str(CONFIG_DIR)
    )))

    # === Network (optional) ===
    try:
        import urllib.request
        start = time.time()
        urllib.request.urlopen("https://api.mistral.ai", timeout=5)
        latency = (time.time() - start) * 1000
        checks.append({"name": "Mistral API Connectivity", "ok": True,
                       "detail": f"Reachable ({latency:.0f}ms)"})
    except Exception:
        checks.append({"name": "Mistral API Connectivity", "ok": False,
                       "detail": "Unreachable (offline mode available)"})

    return checks


def run_benchmark() -> Dict[str, Any]:
    """Run performance benchmarks."""
    results = {}

    # ML prediction speed
    try:
        from .ml_predictor import get_predictor
        predictor = get_predictor()
        code = "def hello(): return 'world'"
        start = time.time()
        for _ in range(100):
            predictor.predict(code, "all")
        elapsed = (time.time() - start) * 1000
        results["ml_prediction_latency"] = f"{elapsed / 100:.1f}ms per prediction"
        results["ml_predictions_per_sec"] = f"{100000 / elapsed:.0f}/sec"
    except Exception as e:
        results["ml_prediction"] = f"Error: {e}"

    return results

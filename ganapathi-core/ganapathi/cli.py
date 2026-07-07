"""
Ganapathi CLI v2.0 - Ultimate AI Terminal Mentor
Main CLI entry point with all commands: chat, predict, doctor, audit, explain, docker, k8s, agent, ml, history.
Built By G R HARSHA
"""

import os
import sys
import time
import webbrowser
from pathlib import Path
from typing import Optional

import typer

from .console_renderer import (
    get_console, print_logo, print_header, print_success, print_error,
    print_warning, print_info, render_code, render_markdown,
    render_ai_response, render_scores_table, render_doctor_table,
    render_history_table, create_progress, LOGO_MINI
)
from .config import (
    save_config, load_config, get_config_value, get_history,
    log_query, ensure_dirs
)

# ═══════════════════════════════════════════════════════════════
# App & Sub-command Groups
# ═══════════════════════════════════════════════════════════════
app = typer.Typer(
    name="ganapathi",
    help="🐘 Ganapathi CLI v2.0 — Ultimate AI Terminal Mentor\n\nML Predictions • Multi-LLM Chat • Code Audit • DevOps • Agent",
    add_completion=True,
    rich_markup_mode="rich",
    pretty_exceptions_enable=True,
    pretty_exceptions_show_locals=False,
)

docker_app = typer.Typer(help="🐳 Docker build & deploy commands")
k8s_app = typer.Typer(help="☸️  Kubernetes manifest generation & deployment")
ml_app = typer.Typer(help="🧠 ML model management: train, benchmark, info")

app.add_typer(docker_app, name="docker")
app.add_typer(k8s_app, name="k8s")
app.add_typer(ml_app, name="ml")

console = get_console()


def _get_ai():
    """Lazy-load AI engine."""
    from .ai_engine import GanapathiAI
    return GanapathiAI()


def require_auth(console):
    """Enforce authentication hook."""
    config = load_config()
    if not config.get("AUTH_TOKEN"):
        print_error(console, "Not authenticated. You must login to use this feature.")
        console.print("  [dim]Run `ganapathi login` to authenticate with your account.[/]\n")
        raise typer.Exit(1)
    return config.get("AUTH_TOKEN")


# ═══════════════════════════════════════════════════════════════
# LOGIN Command
# ═══════════════════════════════════════════════════════════════
@app.command()
def login():
    """🔐 Login to Ganapathi Mentor AI."""
    print_logo(console, mini=True)
    print_header(console, "Authentication", "Securely connect your CLI")

    console.print("  Opening browser for authentication...")
    login_url = "https://ganapathi-mentor-ai.vercel.app/login"
    
    try:
        webbrowser.open(login_url)
        console.print(f"  [dim]If your browser doesn't open, visit: {login_url}[/]\n")
    except Exception:
        console.print(f"  [dim]Please visit: {login_url}[/]\n")
    
    token = console.input("  [bold cyan]Paste your Auth Token ❯ [/]").strip()
    
    if not token:
        print_error(console, "Token cannot be empty.")
        raise typer.Exit(1)
        
    config = {"AUTH_TOKEN": token}
    save_config(config)
    print_success(console, "Successfully authenticated!")
    console.print("  [dim]You can now use all Ganapathi CLI features.[/]\n")


# ═══════════════════════════════════════════════════════════════
# SETUP Command
# ═══════════════════════════════════════════════════════════════
@app.command()
def setup():
    """⚙️  Configure API keys and preferences globally."""
    print_logo(console)
    print_header(console, "Global Configuration", "Set your API keys once, use everywhere")

    current = load_config()

    console.print("  [dim]Press Enter to keep existing value[/]\n")

    mistral_key = console.input(
        f"  [magenta]MISTRAL_API_KEY[/] [dim]({'set ✔' if current.get('MISTRAL_API_KEY') else 'not set'}): [/]"
    )
    groq_key = console.input(
        f"  [magenta]GROQ_API_KEY[/] [dim]({'set ✔' if current.get('GROQ_API_KEY') else 'not set'}): [/]"
    )

    config = {}
    if mistral_key:
        config["MISTRAL_API_KEY"] = mistral_key
    if groq_key:
        config["GROQ_API_KEY"] = groq_key

    if config:
        save_config(config)
        print_success(console, "Configuration saved!")
    else:
        print_info(console, "No changes made")

    console.print(f"  [dim]Config stored at ~/.ganapathi/config.json[/]\n")


# ═══════════════════════════════════════════════════════════════
# CHAT Command
# ═══════════════════════════════════════════════════════════════
@app.command()
def chat():
    """💬 Start an interactive AI mentor session with streaming responses."""
    print_logo(console)
    print_header(console, "AI Mentor Session", "Type 'exit' to end • 'clear' to reset")
    
    require_auth(console)

    ai = _get_ai()
    if not ai.is_configured():
        print_error(console, "No AI provider configured. Run `ganapathi setup` first.")
        raise typer.Exit(1)

    print_info(console, f"Connected to {ai.get_provider_name()}")
    console.print()

    while True:
        try:
            user_input = console.input("[bold cyan]Mentor@Ganapathi ❯ [/]")
        except (KeyboardInterrupt, EOFError):
            console.print("\n[magenta]Keep building! 🚀[/]")
            break

        if not user_input.strip():
            continue
        if user_input.strip().lower() in ("exit", "quit", "bye", "q"):
            console.print("\n[magenta]Keep building the future! Goodbye. 🐘[/]")
            break
        if user_input.strip().lower() == "clear":
            os.system("cls" if os.name == "nt" else "clear")
            print_logo(console, mini=True)
            continue

        # Stream response
        console.print()
        full_response = []
        with console.status(f"[yellow]🧠 {ai.get_provider_name()} thinking...[/]"):
            start = time.time()
            response = ai.generate(user_input)
            latency = (time.time() - start) * 1000

        render_ai_response(console, response, f"{ai.get_provider_name()} ({latency:.0f}ms)")
        console.print()


# ═══════════════════════════════════════════════════════════════
# PREDICT Command
# ═══════════════════════════════════════════════════════════════
@app.command()
def predict(
    code: Optional[str] = typer.Option(None, "--code", "-c", help="Code string to analyze"),
    file: Optional[str] = typer.Option(None, "--file", "-f", help="Path to code file"),
    type: str = typer.Option("all", "--type", "-t",
                             help="Prediction type: bug|perf|quality|career|all"),
):
    """🔮 ML-powered code prediction: bug risk, performance, quality, career fit."""
    print_logo(console, mini=True)
    require_auth(console)

    # Get code
    if file:
        path = Path(file)
        if not path.exists():
            print_error(console, f"File not found: {file}")
            raise typer.Exit(1)
        code_text = path.read_text(encoding="utf-8", errors="ignore")
        print_info(console, f"Analyzing file: {path.name} ({len(code_text)} chars)")
    elif code:
        code_text = code
    else:
        print_error(console, "Provide --code or --file")
        console.print("  [dim]Example: ganapathi predict --code \"def add(a,b): return a+b\" --type bug[/]")
        console.print("  [dim]Example: ganapathi predict --file main.py --type all[/]")
        raise typer.Exit(1)

    # Run prediction
    with console.status("[yellow]🧠 ML ensemble analyzing code...[/]"):
        from .ml_predictor import get_predictor
        predictor = get_predictor()
        result = predictor.predict(code_text, type)

    if "error" in result:
        print_error(console, result["error"])
        raise typer.Exit(1)

    # Display scores
    render_scores_table(console, result["scores"],
                        f"ML Prediction ({type.upper()})")

    # Top factors
    if result.get("top_factors"):
        print_header(console, "Top Contributing Factors")
        for i, factor in enumerate(result["top_factors"][:7], 1):
            bar_len = int(factor["importance"] * 40)
            bar = "█" * bar_len + "░" * (40 - bar_len)
            console.print(f"  {i}. [bold]{factor['feature'].replace('_', ' ').title():25s}[/] "
                          f"[cyan]{bar}[/] {factor['importance']:.1%}")

    # Interpretation
    if result.get("interpretation"):
        console.print()
        render_markdown(console, result["interpretation"], "AI Interpretation")

    # Show code preview
    if len(code_text) < 500:
        render_code(console, code_text, "python", "Analyzed Code")


# ═══════════════════════════════════════════════════════════════
# DOCTOR Command
# ═══════════════════════════════════════════════════════════════
@app.command()
def doctor():
    """🩺 System diagnostic scan: deps, APIs, ML models, DevOps tools."""
    print_logo(console, mini=True)

    with console.status("[yellow]🩺 Running diagnostic scan...[/]"):
        from .doctor import run_doctor, run_benchmark
        checks = run_doctor()

    render_doctor_table(console, checks)

    # Benchmarks
    console.print("[bold cyan]⚡ Running benchmarks...[/]")
    try:
        from .doctor import run_benchmark
        benchmarks = run_benchmark()
        for key, val in benchmarks.items():
            console.print(f"  [bold]{key.replace('_', ' ').title()}:[/] {val}")
    except Exception as e:
        console.print(f"  [dim]Benchmark skipped: {e}[/]")
    console.print()


# ═══════════════════════════════════════════════════════════════
# EXPLAIN Command
# ═══════════════════════════════════════════════════════════════
@app.command()
def explain(
    path: str = typer.Argument(".", help="Directory to analyze"),
):
    """🏗  AI architecture review: explains project structure & patterns."""
    print_logo(console, mini=True)
    require_auth(console)
    from .explain import run_explain
    ai = _get_ai()
    run_explain(console, path, ai if ai.is_configured() else None)


# ═══════════════════════════════════════════════════════════════
# AUDIT Command
# ═══════════════════════════════════════════════════════════════
@app.command()
def audit(
    path: str = typer.Argument(".", help="File or directory to audit"),
):
    """🔒 Deep code audit: security scan + ML scoring + AI review."""
    print_logo(console, mini=True)
    require_auth(console)
    from .audit import run_audit
    ai = _get_ai()
    run_audit(console, path, ai if ai.is_configured() else None)


# ═══════════════════════════════════════════════════════════════
# AGENT Command
# ═══════════════════════════════════════════════════════════════
@app.command()
def agent(
    task: str = typer.Argument(..., help="Task for the AI agent to execute"),
):
    """🤖 Autonomous AI agent: give it a task, watch it work."""
    print_logo(console, mini=True)
    require_auth(console)
    ai = _get_ai()
    if not ai.is_configured():
        print_error(console, "AI not configured. Run `ganapathi setup` first.")
        raise typer.Exit(1)

    from .ai_agent import GanapathiAgent
    agent_instance = GanapathiAgent(ai, console, os.getcwd())
    agent_instance.run(task)


# ═══════════════════════════════════════════════════════════════
# HISTORY Command
# ═══════════════════════════════════════════════════════════════
@app.command()
def history(
    limit: int = typer.Option(20, "--limit", "-n", help="Number of entries"),
):
    """📜 View query history and usage stats."""
    print_logo(console, mini=True)
    rows = get_history(limit)
    if not rows:
        print_info(console, "No history yet. Start chatting!")
        return
    render_history_table(console, rows)


# ═══════════════════════════════════════════════════════════════
# HIVE-MIND Command Group (supports both direct and `start` subcommand)
# ═══════════════════════════════════════════════════════════════
hive_app = typer.Typer(
    help="🐝 Hive Mind Bridge — real-time CLI ↔ Web Dashboard sync",
    invoke_without_command=True,
)
app.add_typer(hive_app, name="hive-mind")


def _run_hive_mind(
    path: str = ".",
    port: int = 8765,
    host: str = "127.0.0.1",
):
    """Shared hive-mind launch logic."""
    print_logo(console, mini=True)
    require_auth(console)
    from .hive_mind import run_hive_mind
    run_hive_mind(console, os.path.abspath(path), port, host)


@hive_app.callback(invoke_without_command=True)
def hive_mind_default(
    ctx: typer.Context,
    path: str = typer.Option(".", "--path", "-p", help="Project directory to serve"),
    port: int = typer.Option(8765, "--port", help="WebSocket server port"),
    host: str = typer.Option("127.0.0.1", "--host", "-H", help="Bind address (use 0.0.0.0 for external access)"),
):
    """🐝 Start the Hive Mind Bridge — real-time CLI ↔ Web Dashboard sync."""
    if ctx.invoked_subcommand is None:
        _run_hive_mind(path, port, host)


@hive_app.command("start")
def hive_mind_start(
    path: str = typer.Option(".", "--path", "-p", help="Project directory to serve"),
    port: int = typer.Option(8765, "--port", help="WebSocket server port"),
    host: str = typer.Option("127.0.0.1", "--host", "-H", help="Bind address (use 0.0.0.0 for external access)"),
):
    """🐝 Start the Hive Mind Bridge (alias for `ganapathi hive-mind`)."""
    _run_hive_mind(path, port, host)


# ═══════════════════════════════════════════════════════════════
# DOCKER Sub-commands
# ═══════════════════════════════════════════════════════════════
@docker_app.command("build")
def docker_build_cmd(
    app_name: str = typer.Option("ganapathi-app", "--app", "-a"),
    path: str = typer.Option(".", "--path", "-p"),
    port: int = typer.Option(8000, "--port"),
):
    """🐳 Auto-generate Dockerfile and build image."""
    print_logo(console, mini=True)
    from .devops import docker_build
    docker_build(console, app_name, path, port)


@docker_app.command("deploy")
def docker_deploy_cmd(
    app_name: str = typer.Option("ganapathi-app", "--app", "-a"),
    path: str = typer.Option(".", "--path", "-p"),
    port: int = typer.Option(8000, "--port"),
):
    """🐳 Deploy with docker-compose."""
    print_logo(console, mini=True)
    from .devops import docker_deploy
    docker_deploy(console, app_name, path, port)


# ═══════════════════════════════════════════════════════════════
# K8S Sub-commands
# ═══════════════════════════════════════════════════════════════
@k8s_app.command("generate")
def k8s_generate_cmd(
    app_name: str = typer.Option("ganapathi-app", "--app", "-a"),
    image: str = typer.Option("", "--image", "-i"),
    port: int = typer.Option(8000, "--port"),
    replicas: int = typer.Option(2, "--replicas", "-r"),
    output: str = typer.Option("k8s", "--output", "-o"),
):
    """☸️  Generate Kubernetes manifests (Deployment + Service + Ingress)."""
    print_logo(console, mini=True)
    from .devops import k8s_generate
    k8s_generate(console, app_name, image, port, replicas, output_dir=output)


@k8s_app.command("deploy")
def k8s_deploy_cmd(
    yaml_dir: str = typer.Option("k8s", "--dir", "-d"),
):
    """☸️  Apply K8s manifests with kubectl."""
    print_logo(console, mini=True)
    from .devops import k8s_deploy
    k8s_deploy(console, yaml_dir)


# ═══════════════════════════════════════════════════════════════
# ML Sub-commands
# ═══════════════════════════════════════════════════════════════
@ml_app.command("train")
def ml_train_cmd(
    samples: int = typer.Option(5000, "--samples", "-n"),
):
    """🧠 Train/retrain the ML ensemble model."""
    print_logo(console, mini=True)
    print_header(console, "ML Model Training")

    with create_progress(console) as progress:
        task = progress.add_task("Training ensemble...", total=100)

        from .ml_predictor import GanapathiPredictor
        progress.update(task, advance=20, description="Generating training data...")

        predictor = GanapathiPredictor.__new__(GanapathiPredictor)
        predictor.extractor = __import__('ganapathi.ml_predictor', fromlist=['CodeFeatureExtractor']).CodeFeatureExtractor()
        predictor.models = {}
        predictor.is_trained = False

        progress.update(task, advance=30, description="Training Random Forest + GBM...")
        predictor.train(n_samples=samples)
        progress.update(task, advance=50, description="Saving models...")

    from .config import MODELS_DIR
    model_file = MODELS_DIR / "ganapathi_ensemble_v2.joblib"
    size = model_file.stat().st_size / 1024 / 1024 if model_file.exists() else 0

    print_success(console, f"Ensemble trained on {samples} samples")
    print_success(console, f"Model saved: {model_file} ({size:.1f}MB)")
    print_info(console, "Targets: bug_risk, quality_score, performance_score, career_fit")
    console.print()


@ml_app.command("info")
def ml_info_cmd():
    """🧠 Show ML model info and stats."""
    print_logo(console, mini=True)
    from .config import MODELS_DIR

    model_file = MODELS_DIR / "ganapathi_ensemble_v2.joblib"
    if not model_file.exists():
        print_warning(console, "No trained model found. Run `ganapathi ml train`")
        return

    import joblib
    data = joblib.load(model_file)

    print_header(console, "ML Model Info")
    console.print(f"  [bold]Version:[/]    {data.get('version', 'unknown')}")
    console.print(f"  [bold]Trained:[/]    {data.get('trained_at', 'unknown')}")
    console.print(f"  [bold]Size:[/]       {model_file.stat().st_size / 1024 / 1024:.1f}MB")
    console.print(f"  [bold]Targets:[/]    {', '.join(data.get('models', {}).keys())}")
    console.print(f"  [bold]Features:[/]   {len(data.get('feature_names', []))} features")

    # Model details
    for target, model in data.get("models", {}).items():
        est_info = []
        if hasattr(model, 'estimators'):
            for name, est in model.estimators:
                if hasattr(est, 'n_estimators'):
                    est_info.append(f"{name}: {est.n_estimators} trees")
        console.print(f"  [bold]{target}:[/] {', '.join(est_info) if est_info else 'ensemble'}")

    console.print()


@ml_app.command("benchmark")
def ml_benchmark_cmd():
    """🧠 Benchmark ML prediction speed."""
    print_logo(console, mini=True)
    print_header(console, "ML Benchmark")

    from .ml_predictor import get_predictor
    predictor = get_predictor()

    test_codes = [
        ("Simple function", "def add(a, b):\n    return a + b"),
        ("Medium complexity", "def sort_list(arr):\n    for i in range(len(arr)):\n        for j in range(i+1, len(arr)):\n            if arr[i] > arr[j]:\n                arr[i], arr[j] = arr[j], arr[i]\n    return arr"),
        ("Complex code", """
class DataProcessor:
    def __init__(self, config):
        self.config = config
        self.cache = {}

    def process(self, data):
        try:
            for item in data:
                if item.get('type') == 'numeric':
                    result = self._transform(item)
                    self.cache[item['id']] = result
                elif item.get('type') == 'text':
                    for word in item['content'].split():
                        if len(word) > 3:
                            self._index(word, item['id'])
        except Exception as e:
            self._log_error(e)
            raise

    def _transform(self, item):
        return {k: v * 2 for k, v in item.items() if isinstance(v, (int, float))}

    def _index(self, word, doc_id):
        if word not in self.cache:
            self.cache[word] = []
        self.cache[word].append(doc_id)

    def _log_error(self, error):
        print(f"Error: {error}")
"""),
    ]

    from rich.table import Table
    table = Table(title="[bold]Benchmark Results[/]", header_style="bold magenta")
    table.add_column("Code Type", min_width=20)
    table.add_column("Predictions/sec", justify="right", min_width=15)
    table.add_column("Avg Latency", justify="right", min_width=12)
    table.add_column("Bug Risk", justify="center", min_width=10)
    table.add_column("Quality", justify="center", min_width=10)

    for name, code in test_codes:
        # Benchmark
        iterations = 100
        start = time.time()
        for _ in range(iterations):
            result = predictor.predict(code, "all")
        elapsed = time.time() - start

        pps = iterations / elapsed
        avg_ms = (elapsed / iterations) * 1000

        scores = result.get("scores", {})
        bug = scores.get("bug_risk", 0)
        qual = scores.get("quality_score", 0)

        table.add_row(
            name,
            f"{pps:.0f}/sec",
            f"{avg_ms:.2f}ms",
            f"{'🟢' if bug < 0.3 else '🟡' if bug < 0.6 else '🔴'} {bug:.1%}",
            f"{'🟢' if qual > 0.7 else '🟡' if qual > 0.4 else '🔴'} {qual:.1%}",
        )

    console.print()
    console.print(table)
    console.print()


# ═══════════════════════════════════════════════════════════════
# VERSION Command
# ═══════════════════════════════════════════════════════════════
@app.command()
def version():
    """📌 Show version and system info."""
    from . import __version__
    print_logo(console, mini=True)
    console.print(f"  [bold]Version:[/]  {__version__}")
    console.print(f"  [bold]Python:[/]   {sys.version.split()[0]}")
    console.print(f"  [bold]Platform:[/] {sys.platform}")
    console.print(f"  [bold]Config:[/]   ~/.ganapathi/")

    ai = _get_ai()
    console.print(f"  [bold]AI:[/]       {ai.get_provider_name() if ai.is_configured() else 'Not configured'}")

    from .config import MODELS_DIR
    model_file = MODELS_DIR / "ganapathi_ensemble_v2.joblib"
    console.print(f"  [bold]ML Model:[/] {'Loaded ✔' if model_file.exists() else 'Not trained'}")
    console.print()


# ═══════════════════════════════════════════════════════════════
# Entry Point
# ═══════════════════════════════════════════════════════════════
def main():
    """Main entry point with global error handling."""
    # Force UTF-8 on Windows to prevent 'charmap' codec errors with emoji
    if os.name == "nt":
        os.environ.setdefault("PYTHONUTF8", "1")
        try:
            if hasattr(sys.stdout, 'reconfigure'):
                sys.stdout.reconfigure(encoding='utf-8', errors='replace')
            if hasattr(sys.stderr, 'reconfigure'):
                sys.stderr.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass

    try:
        app()
    except KeyboardInterrupt:
        console.print("\n[magenta]Interrupted. Goodbye![/]")
        sys.exit(0)
    except Exception as e:
        console.print(f"\n[red bold]Unexpected error: {e}[/]")
        console.print("[dim]Report issues at: github.com/grharsha/ganapathi-cli[/]")
        sys.exit(1)



if __name__ == "__main__":
    main()

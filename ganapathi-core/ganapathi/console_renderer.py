"""
Ganapathi CLI v2.0 - Console Renderer
Rich-powered rendering engine with themes, adaptive layouts, and markdown support.
"""

import os
import shutil
from typing import Optional, List, Dict, Any

from rich.console import Console
from rich.theme import Theme
from rich.panel import Panel
from rich.table import Table
from rich.syntax import Syntax
from rich.markdown import Markdown
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TaskProgressColumn
from rich.columns import Columns
from rich.text import Text
from rich.rule import Rule
from rich.tree import Tree
from rich.live import Live
from rich.layout import Layout

# ═══════════════════════════════════════════════════════════════
# Ganapathi Theme
# ═══════════════════════════════════════════════════════════════
GANAPATHI_THEME = Theme({
    "info": "cyan",
    "warning": "yellow bold",
    "error": "red bold",
    "success": "green bold",
    "accent": "magenta bold",
    "header": "bold cyan",
    "muted": "dim white",
    "score.high": "bold green",
    "score.medium": "bold yellow",
    "score.low": "bold red",
    "brand": "bold magenta",
    "code": "white on grey23",
})

# ═══════════════════════════════════════════════════════════════
# ASCII Logo
# ═══════════════════════════════════════════════════════════════
LOGO = """[bold magenta]
 ██████╗  █████╗ ███╗   ██╗ █████╗ ██████╗  █████╗ ████████╗██╗  ██╗██╗
██╔════╝ ██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔══██╗╚══██╔══╝██║  ██║██║
██║  ███╗███████║██╔██╗ ██║███████║██████╔╝███████║   ██║   ███████║██║
██║   ██║██╔══██║██║╚██╗██║██╔══██║██╔═══╝ ██╔══██║   ██║   ██╔══██║██║
╚██████╔╝██║  ██║██║ ╚████║██║  ██║██║     ██║  ██║   ██║   ██║  ██║██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝[/]
[bold cyan]   ⚡ Ultimate AI Terminal Mentor v2.0 ⚡[/]
[dim]   ML Predictions • Multi-LLM • DevOps • Agent[/]
"""

LOGO_MINI = "[bold magenta]🐘 Ganapathi CLI[/] [dim]v2.0[/]"


def get_console() -> Console:
    """Get a themed Rich console with terminal-size awareness and Windows Unicode safety."""
    import sys
    import io

    # On Windows, force UTF-8 output to prevent 'charmap' codec errors with emoji
    if sys.platform == "win32":
        try:
            if hasattr(sys.stdout, 'reconfigure'):
                sys.stdout.reconfigure(encoding='utf-8', errors='replace')
            if hasattr(sys.stderr, 'reconfigure'):
                sys.stderr.reconfigure(encoding='utf-8', errors='replace')
        except Exception:
            pass

    return Console(
        theme=GANAPATHI_THEME,
        width=min(shutil.get_terminal_size().columns, 140),
        highlight=True,
        markup=True,
    )



def print_logo(console: Console, mini: bool = False):
    """Print the Ganapathi logo."""
    if mini or shutil.get_terminal_size().columns < 80:
        console.print(LOGO_MINI)
    else:
        console.print(LOGO)


def print_header(console: Console, title: str, subtitle: str = ""):
    """Print a section header."""
    console.print()
    console.print(Rule(f"[bold cyan]{title}[/]", style="cyan"))
    if subtitle:
        console.print(f"  [dim]{subtitle}[/]")
    console.print()


def print_success(console: Console, message: str):
    console.print(f"  [success]✔ {message}[/]")


def print_error(console: Console, message: str):
    console.print(f"  [error]✘ {message}[/]")


def print_warning(console: Console, message: str):
    console.print(f"  [warning]⚠ {message}[/]")


def print_info(console: Console, message: str):
    console.print(f"  [info]ℹ {message}[/]")


def render_code(console: Console, code: str, language: str = "python",
                title: str = "Code"):
    """Render syntax-highlighted code in a panel."""
    syntax = Syntax(
        code.strip(),
        language,
        theme="monokai",
        line_numbers=True,
        word_wrap=True,
        tab_size=4,
    )
    console.print(Panel(syntax, title=f"[bold]{title}[/]", border_style="blue",
                        padding=(1, 2)))


def render_markdown(console: Console, text: str, title: str = ""):
    """Render markdown content in a panel."""
    md = Markdown(text)
    if title:
        console.print(Panel(md, title=f"[bold]{title}[/]", border_style="cyan",
                            padding=(1, 2)))
    else:
        console.print(md)


def render_ai_response(console: Console, response: str, provider: str = ""):
    """Render an AI response with proper formatting."""
    provider_tag = f" [dim]via {provider}[/]" if provider else ""
    console.print(Panel(
        Markdown(response),
        title=f"[bold magenta]🐘 Ganapathi{provider_tag}[/]",
        border_style="magenta",
        padding=(1, 2),
    ))


def render_scores_table(console: Console, scores: Dict[str, float],
                        title: str = "Prediction Scores"):
    """Render prediction scores as a styled table."""
    table = Table(
        show_header=True,
        header_style="bold magenta",
        border_style="cyan",
        title=f"[bold]{title}[/]",
        padding=(0, 2),
    )
    table.add_column("Metric", style="bold white", min_width=20)
    table.add_column("Score", justify="center", min_width=10)
    table.add_column("Rating", justify="center", min_width=12)
    table.add_column("Bar", min_width=20)

    for metric, score in scores.items():
        pct = score * 100
        if pct >= 80:
            style = "score.high"
            rating = "🟢 Excellent"
        elif pct >= 60:
            style = "score.medium"
            rating = "🟡 Good"
        elif pct >= 40:
            style = "score.medium"
            rating = "🟠 Fair"
        else:
            style = "score.low"
            rating = "🔴 Needs Work"

        bar_filled = int(pct / 5)
        bar = f"[{style}]{'█' * bar_filled}{'░' * (20 - bar_filled)}[/]"

        table.add_row(
            metric.replace("_", " ").title(),
            f"[{style}]{pct:.1f}%[/]",
            rating,
            bar,
        )

    console.print()
    console.print(table)
    console.print()


def render_doctor_table(console: Console, checks: List[Dict[str, Any]],
                        title: str = "System Health"):
    """Render doctor check results as a table."""
    table = Table(
        show_header=True,
        header_style="bold magenta",
        border_style="cyan",
        title=f"[bold]🩺 {title}[/]",
        padding=(0, 1),
    )
    table.add_column("Component", style="bold white", min_width=25)
    table.add_column("Status", justify="center", min_width=12)
    table.add_column("Details", min_width=30)

    passed = 0
    for check in checks:
        if check["ok"]:
            status = "[success]✔ Healthy[/]"
            passed += 1
        else:
            status = "[error]✘ Issue[/]"
        table.add_row(check["name"], status, check.get("detail", "-"))

    console.print()
    console.print(table)
    total = len(checks)
    pct = (passed / total * 100) if total > 0 else 0
    style = "success" if pct >= 80 else "warning" if pct >= 50 else "error"
    console.print(f"\n  [{style}]Health Score: {passed}/{total} ({pct:.0f}%)[/]\n")


def render_history_table(console: Console, history: list):
    """Render query history as a table."""
    table = Table(
        show_header=True,
        header_style="bold magenta",
        border_style="cyan",
        title="[bold]📜 Query History[/]",
    )
    table.add_column("Time", style="dim", min_width=19)
    table.add_column("Command", style="bold", min_width=10)
    table.add_column("Query", min_width=30)
    table.add_column("Provider", min_width=12)
    table.add_column("Latency", justify="right", min_width=8)

    for row in history:
        ts, cmd, query, provider, latency = row
        ts_short = ts[:19].replace("T", " ")
        lat_str = f"{latency:.0f}ms" if latency else "-"
        table.add_row(ts_short, cmd, (query[:50] + "...") if len(query) > 50 else query,
                      provider or "-", lat_str)

    console.print()
    console.print(table)
    console.print()


def create_progress(console: Console) -> Progress:
    """Create a styled progress bar."""
    return Progress(
        SpinnerColumn(spinner_name="dots"),
        TextColumn("[bold blue]{task.description}"),
        BarColumn(bar_width=30, complete_style="magenta", finished_style="green"),
        TaskProgressColumn(),
        console=console,
    )

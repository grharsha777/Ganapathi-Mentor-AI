"""
Ganapathi CLI v2.0 - Architecture Explainer
AI-powered architecture review with tree visualization and file analysis.
"""

import os
from pathlib import Path
from collections import Counter
from typing import Optional

from rich.console import Console
from rich.tree import Tree
from rich.panel import Panel


def _build_tree(path: Path, tree: Tree, max_depth: int = 3, current_depth: int = 0,
                max_items: int = 30):
    """Recursively build a Rich tree from directory structure."""
    if current_depth >= max_depth:
        tree.add("[dim]...[/]")
        return

    try:
        items = sorted(path.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower()))
        count = 0
        for item in items:
            if item.name.startswith('.') or item.name in ('node_modules', '__pycache__', '.git', 'venv', '.venv', 'dist', 'build'):
                continue
            count += 1
            if count > max_items:
                tree.add(f"[dim]... and {len(items) - max_items} more[/]")
                break

            if item.is_dir():
                subtree = tree.add(f"📁 [bold cyan]{item.name}/[/]")
                _build_tree(item, subtree, max_depth, current_depth + 1, max_items)
            else:
                size = item.stat().st_size
                if size > 1024 * 1024:
                    size_str = f"{size / 1024 / 1024:.1f}MB"
                elif size > 1024:
                    size_str = f"{size / 1024:.1f}KB"
                else:
                    size_str = f"{size}B"

                ext = item.suffix
                icon = _get_file_icon(ext)
                tree.add(f"{icon} {item.name} [dim]({size_str})[/]")
    except PermissionError:
        tree.add("[red]Permission denied[/]")


def _get_file_icon(ext: str) -> str:
    """Get icon for file extension."""
    icons = {
        '.py': '🐍', '.js': '📜', '.ts': '📘', '.tsx': '⚛️',
        '.json': '📋', '.md': '📝', '.yml': '⚙️', '.yaml': '⚙️',
        '.html': '🌐', '.css': '🎨', '.scss': '🎨',
        '.sh': '🖥️', '.bat': '🖥️',
        '.jpg': '🖼️', '.png': '🖼️', '.svg': '🖼️',
        '.txt': '📃', '.env': '🔐', '.lock': '🔒',
        '.toml': '⚙️', '.cfg': '⚙️', '.ini': '⚙️',
        '.sql': '🗄️', '.db': '🗄️',
        '.dockerfile': '🐳', '.dockerignore': '🐳',
    }
    return icons.get(ext.lower(), '📄')


def analyze_directory(path: str) -> dict:
    """Analyze directory structure and return statistics."""
    p = Path(path)
    if not p.is_dir():
        return {"error": f"Not a directory: {path}"}

    stats = {
        "total_files": 0,
        "total_dirs": 0,
        "total_size": 0,
        "extensions": Counter(),
        "largest_files": [],
    }

    skip_dirs = {'node_modules', '__pycache__', '.git', 'venv', '.venv', 'dist', 'build'}

    for root, dirs, files in os.walk(p):
        # Skip common non-essential dirs
        dirs[:] = [d for d in dirs if d not in skip_dirs and not d.startswith('.')]
        stats["total_dirs"] += len(dirs)

        for f in files:
            fp = Path(root) / f
            try:
                size = fp.stat().st_size
                stats["total_files"] += 1
                stats["total_size"] += size
                ext = fp.suffix.lower() or "(no ext)"
                stats["extensions"][ext] += 1
                stats["largest_files"].append((str(fp.relative_to(p)), size))
            except Exception:
                pass

    stats["largest_files"].sort(key=lambda x: x[1], reverse=True)
    stats["largest_files"] = stats["largest_files"][:10]
    stats["top_extensions"] = stats["extensions"].most_common(10)

    return stats


def run_explain(console: Console, path: str, ai=None):
    """Run the architecture explainer."""
    from .console_renderer import print_header, render_ai_response, render_markdown

    p = Path(path).resolve()
    if not p.is_dir():
        console.print(f"[error]✘ Not a directory: {path}[/]")
        return

    print_header(console, f"Architecture Analysis: {p.name}", str(p))

    # Build tree
    tree = Tree(f"📂 [bold]{p.name}/[/]")
    _build_tree(p, tree, max_depth=3)
    console.print(Panel(tree, title="[bold]Directory Structure[/]", border_style="cyan",
                        padding=(1, 2)))

    # Stats
    stats = analyze_directory(str(p))
    console.print(f"\n  📊 [bold]{stats['total_files']}[/] files in "
                  f"[bold]{stats['total_dirs']}[/] directories "
                  f"([bold]{stats['total_size'] / 1024 / 1024:.1f}MB[/] total)")

    if stats.get("top_extensions"):
        ext_str = ", ".join(f"{ext} ({count})" for ext, count in stats["top_extensions"])
        console.print(f"  📦 [dim]Top types: {ext_str}[/]")

    # AI Analysis
    if ai and ai.is_configured():
        items = []
        try:
            for item in sorted(p.iterdir()):
                if item.name not in ('node_modules', '__pycache__', '.git'):
                    items.append(item.name)
        except Exception:
            pass

        prompt = f"""Analyze this project structure and explain its architecture:

Directory: {p.name}
Items: {', '.join(items[:50])}
File count: {stats['total_files']}
Top extensions: {stats.get('top_extensions', [])}

Provide:
1. 🔥 **Core Purpose** (1-2 sentences)
2. 🏗 **Architecture Pattern** (MVC, microservices, monolith, etc.)
3. 📦 **Key Components** (list major modules)
4. 💡 **Recommendations** (how to improve structure)
5. ⚡ **Tech Stack** detected
"""
        with console.status("[yellow]🧠 AI analyzing architecture...[/]"):
            text = ai.generate(prompt, system="You are Ganapathi Architectural Advisor. Give precise technical analysis.")

        render_ai_response(console, text, ai.get_provider_name())

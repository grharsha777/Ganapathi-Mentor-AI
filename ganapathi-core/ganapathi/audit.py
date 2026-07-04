"""
Ganapathi CLI v2.0 - Code Auditor
Deep code analysis with AI review + ML scoring, security checks, and rich reports.
"""

import os
from pathlib import Path
from typing import Optional, List

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn


SKIP_DIRS = {'node_modules', '__pycache__', '.git', 'venv', '.venv', 'dist',
             'build', '.next', 'coverage', '.cache'}

CODE_EXTENSIONS = {'.py', '.js', '.ts', '.tsx', '.jsx', '.java', '.cpp', '.c',
                   '.go', '.rs', '.rb', '.php', '.cs', '.swift', '.kt'}


def _collect_files(path: str, max_files: int = 50) -> List[Path]:
    """Collect code files from path."""
    p = Path(path)
    if p.is_file():
        return [p]

    files = []
    for root, dirs, filenames in os.walk(p):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in filenames:
            fp = Path(root) / f
            if fp.suffix.lower() in CODE_EXTENSIONS:
                files.append(fp)
                if len(files) >= max_files:
                    return files
    return files


def _security_check(code: str) -> List[dict]:
    """Basic security pattern checks."""
    import re
    issues = []

    patterns = [
        (r'eval\s*\(', "eval() usage - potential code injection", "HIGH"),
        (r'exec\s*\(', "exec() usage - potential code injection", "HIGH"),
        (r'subprocess\.(?:call|run|Popen)\s*\(.*shell\s*=\s*True', "Shell injection risk", "HIGH"),
        (r'(?:password|secret|token|api_key)\s*=\s*["\'][^"\']+["\']', "Hardcoded credential", "CRITICAL"),
        (r'os\.system\s*\(', "os.system() - use subprocess instead", "MEDIUM"),
        (r'pickle\.loads?\s*\(', "Unsafe pickle deserialization", "HIGH"),
        (r'yaml\.load\s*\((?!.*Loader)', "Unsafe YAML loading", "MEDIUM"),
        (r'TODO|FIXME|HACK|XXX|TEMP', "Unresolved TODO/FIXME marker", "LOW"),
        (r'print\s*\(', "Debug print statement", "INFO"),
        (r'# type:\s*ignore', "Type checking suppressed", "LOW"),
    ]

    for pattern, msg, severity in patterns:
        matches = re.finditer(pattern, code, re.IGNORECASE)
        for match in matches:
            line_num = code[:match.start()].count('\n') + 1
            issues.append({
                "line": line_num,
                "message": msg,
                "severity": severity,
                "snippet": code.split('\n')[line_num - 1].strip()[:80],
            })

    return issues


def run_audit(console: Console, path: str, ai=None):
    """Run deep code audit."""
    from .console_renderer import (
        print_header, print_error, print_info, print_warning,
        render_ai_response, render_scores_table
    )

    p = Path(path).resolve()
    if not p.exists():
        print_error(console, f"Path not found: {path}")
        return

    print_header(console, f"Code Audit: {p.name}", str(p))

    files = _collect_files(str(p))
    if not files:
        print_warning(console, "No code files found to audit.")
        return

    print_info(console, f"Found {len(files)} code files to audit")

    # Aggregate results
    all_issues = []
    all_scores = {}
    total_loc = 0

    with Progress(
        SpinnerColumn(), TextColumn("[bold blue]{task.description}"),
        console=console
    ) as progress:
        task = progress.add_task("Auditing files...", total=len(files))

        for fp in files:
            try:
                content = fp.read_text(encoding="utf-8", errors="ignore")
                total_loc += content.count('\n') + 1

                # Security check
                issues = _security_check(content)
                for issue in issues:
                    issue["file"] = str(fp.relative_to(p) if p.is_dir() else fp.name)
                all_issues.extend(issues)

                # ML scoring
                try:
                    from .ml_predictor import get_predictor
                    predictor = get_predictor()
                    result = predictor.predict(content, "all")
                    if "scores" in result:
                        for key, val in result["scores"].items():
                            if key not in all_scores:
                                all_scores[key] = []
                            all_scores[key].append(val)
                except Exception:
                    pass

            except Exception:
                pass

            progress.advance(task)

    # === Security Issues Report ===
    if all_issues:
        issue_table = Table(
            title="[bold red]🔒 Security & Quality Issues[/]",
            show_header=True,
            header_style="bold red",
            border_style="red",
        )
        issue_table.add_column("Severity", min_width=10, justify="center")
        issue_table.add_column("File", min_width=20)
        issue_table.add_column("Line", min_width=6, justify="center")
        issue_table.add_column("Issue", min_width=30)

        severity_styles = {
            "CRITICAL": "bold red",
            "HIGH": "red",
            "MEDIUM": "yellow",
            "LOW": "dim white",
            "INFO": "dim cyan",
        }

        # Sort by severity
        severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "INFO": 4}
        all_issues.sort(key=lambda x: severity_order.get(x["severity"], 5))

        for issue in all_issues[:30]:  # Top 30
            style = severity_styles.get(issue["severity"], "white")
            issue_table.add_row(
                f"[{style}]{issue['severity']}[/]",
                issue.get("file", "-"),
                str(issue["line"]),
                issue["message"],
            )

        console.print()
        console.print(issue_table)

        if len(all_issues) > 30:
            print_info(console, f"Showing 30 of {len(all_issues)} total issues")
    else:
        console.print("\n  [success]✔ No security issues found![/]")

    # === ML Scores (Averaged) ===
    if all_scores:
        import numpy as np
        avg_scores = {k: float(np.mean(v)) for k, v in all_scores.items()}
        render_scores_table(console, avg_scores, f"ML Analysis ({len(files)} files, {total_loc} LOC)")

    # === AI Deep Review (single file or summary) ===
    if ai and ai.is_configured():
        # For single file, do full review
        if len(files) == 1:
            content = files[0].read_text(encoding="utf-8", errors="ignore")
            prompt = f"""Perform a strict code review:
File: {files[0].name}
Code:
```
{content[:8000]}
```

Include: 🚀 Summary, ❌ Bugs & Risks, 💡 Improvements, ⚡ Performance, 📊 Rating (1-10)"""

            with console.status("[yellow]🧠 AI deep review...[/]"):
                text = ai.generate(prompt, system="You are Ganapathi Code Auditor. Be strict and precise.")
            render_ai_response(console, text, ai.get_provider_name())
        else:
            # For multi-file, summarize
            issues_summary = f"{len(all_issues)} issues found" if all_issues else "No issues"
            prompt = f"""Summarize this codebase audit:
- {len(files)} files scanned, {total_loc} total LOC
- Security scan: {issues_summary}
- Top issue types: {', '.join(set(i['message'] for i in all_issues[:10]))}

Give: 🚀 Overall Assessment, 🎯 Top 3 Priorities, 💡 Action Items"""

            with console.status("[yellow]🧠 AI summarizing audit...[/]"):
                text = ai.generate(prompt, system="You are Ganapathi Code Auditor.")
            render_ai_response(console, text, ai.get_provider_name())

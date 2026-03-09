import os
from rich.console import Console
from rich.panel import Panel
from .ai import GanapathiAI

def run_audit(console: Console, path: str):
    if os.path.isdir(path):
        console.print(f"[blue]Deep-auditing directory: [/][white bold]{path}...[/]")
        # For simplicity, we'll just audit the dir as a whole or list files. 
        # In a real app, this would iterate.
        return run_dir_audit(console, path)
    
    console.print(f"[blue]Deep-auditing file: [/][white bold]{path}...[/]")
    
    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        prompt = f"""
        Analyze the following code for quality, performance, and security issues.
        Perform a strict neural code review.
        File: {os.path.basename(path)}

        Code:
        ```
        {content[:10000]}
        ```

        Include sections for: 🚀 Summary, ❌ Bugs & Risks, 💡 Suggestions.
        """

        ai = GanapathiAI()
        with console.status("[yellow]Neural audit in progress...[/]"):
            text = ai.generate_text(prompt, system="You are the Ganapathi Neural Auditor.")
        
        console.print(Panel(text, title=f"Audit Report: {os.path.basename(path)}", border_style="green"))
    except Exception as e:
        console.print(f"[red]Audit failed: {str(e)}[/]")

def run_dir_audit(console: Console, path: str):
    # Logic to aggregate or list files
    console.print("[yellow]Note: Multi-file audit is in neural training. Auditing folder structure instead.[/]")
    from .explain import run_explain
    run_explain(console, path)

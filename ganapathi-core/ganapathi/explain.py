import os
from rich.console import Console
from rich.panel import Panel
from .ai import GanapathiAI

def run_explain(console: Console, path: str):
    console.print(f"\n[blue]Analyzing architecture: [/][white bold]{path}...[/]")
    
    if not os.path.isdir(path):
        console.print("[red]Error: Target must be a directory.[/]")
        return

    try:
        items = os.listdir(path)
        folder_structure = ", ".join(items[:50])
        
        prompt = f"""
        Analyze the following folder structure and explain its purpose within a Next.js / TypeScript project.
        Target Directory: {path}
        Items: {folder_structure}

        Output format:
        - 🔥 Core Purpose: [1-2 sentences]
        - 🏗 Architecture: [Major patterns seen]
        - 💡 Recommendation: [How to grow this part of the app]
        """

        ai = GanapathiAI()
        with console.status("[yellow]Developing architectural insights...[/]"):
            text = ai.generate_text(prompt, system="You are the Ganapathi Architectural Advisor.")
        
        console.print(Panel(text, title=f"Architecture Insight: {path}", border_style="blue"))
    except Exception as e:
        console.print(f"[red]Explanation failed: {str(e)}[/]")

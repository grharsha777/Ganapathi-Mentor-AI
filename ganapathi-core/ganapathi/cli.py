import typer
from rich.console import Console
from .ai import GanapathiAI
from .doctor import run_doctor
from .explain import run_explain
from .audit import run_audit
from .config import save_config, load_config

app = typer.Typer(help="Ganapathi Neural CLI - The Most Powerful AI Mentor")
console = Console()

LOGO = """
[cyan bold]
   ____                               _   _     _ 
  / ___| __ _ _ __   __ _ _ __   __ _| |_| |__ (_)
 | |  _ / _' | '_ \\ / _' | '_ \\ / _' | __| '_ \\| |
 | |_| | (_| | | | | (_| | |_) | (_| | |_| | | | |
  \\____|\\__,_|_| |_|\\__,_| .__/ \\__,_|\\__|_| |_|_|
                         |_|                       
[/][magenta bold]   Ganapathi Neural CLI Core v2.0.0[/]
[blue]   Production Ready | Worldwide Access[/]
"""

@app.command()
def setup():
    """Global configuration: set your API keys once to use Ganapathi anywhere"""
    console.print(LOGO)
    console.print("[yellow bold]Starting Global Neural Configuration...[/]")
    
    current_config = load_config()
    
    groq_key = console.input(f"[magenta]Enter GROQ_API_KEY[/] [dim]({current_config.get('GROQ_API_KEY', 'not set')}): [/]")
    mistral_key = console.input(f"[magenta]Enter MISTRAL_API_KEY[/] [dim]({current_config.get('MISTRAL_API_KEY', 'not set')}): [/]")
    
    config = {
        "GROQ_API_KEY": groq_key if groq_key else current_config.get("GROQ_API_KEY"),
        "MISTRAL_API_KEY": mistral_key if mistral_key else current_config.get("MISTRAL_API_KEY")
    }
    
    save_config(config)
    console.print("\n[green bold]✔ Configuration saved successfully![/]")
    console.print("[dim]Global settings stored in ~/.ganapathi/config.json[/]")

@app.command()
def doctor():
    """Pulse check: scan project health, configuration & errors"""
    console.print(LOGO)
    run_doctor(console)

@app.command()
def explain(path: str = "."):
    """AI architecture review: explains folder structure & purpose"""
    console.print(LOGO)
    run_explain(console, path)

@app.command()
def audit(path: str):
    """Deep deep-dive: audit code for bugs and security risks"""
    console.print(LOGO)
    run_audit(console, path)

@app.command()
def chat():
    """Mentor session: start an interactive AI brainstorm session"""
    console.print(LOGO)
    console.print("[green]Starting neural interactive session...[/]")
    console.print("[white]Type 'exit' or 'quit' to end session.[/]\n")
    
    ai = GanapathiAI()
    if not ai.is_configured():
        console.print("[red]Error: AI model not configured.[/]")
        return

    while True:
        user_input = console.input("[cyan bold]Mentor@Ganapathi > [/]")
        if user_input.lower() in ["exit", "quit", "bye", "stop"]:
            console.print("\n[magenta]Keep building the future! Goodbye.[/]")
            break
        
        with console.status("[yellow]Synchronizing neurons...[/]"):
            response = ai.generate_text(user_input, system="You are Ganapathi Mentor AI v2.0. You are a Python-powered high-performance coding agent.")
        
        console.print(f"\n{response}\n")

if __name__ == "__main__":
    app()

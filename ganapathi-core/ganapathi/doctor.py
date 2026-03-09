import os
from rich.console import Console
from rich.table import Table

def run_doctor(console: Console):
    console.print("\n[yellow]🩺 Running Ganapathi Diagnostic Scan...[/]\n")

    checks = [
        ("Environment Configuration", lambda: bool(os.getenv("GROQ_API_KEY") or os.getenv("MISTRAL_API_KEY"))),
        ("Supabase URL Config", lambda: bool(os.getenv("NEXT_PUBLIC_SUPABASE_URL"))),
        ("MongoDB URI Config", lambda: bool(os.getenv("MONGODB_URI"))),
        ("Node Modules Installation", lambda: os.path.exists("node_modules")),
        ("Tailwind Configuration", lambda: os.path.exists("tailwind.config.ts")),
        ("Python Environment", lambda: True) # If it's running, it's True
    ]

    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Neural Component", style="dim")
    table.add_column("Status")
    table.add_column("Action Required")

    passed = 0
    for name, check_fn in checks:
        try:
            ok = check_fn()
            if ok:
                table.add_row(name, "[green]✔ Healthy[/]", "-")
                passed += 1
            else:
                table.add_row(name, "[red]✘ Not Aligned[/]", "[yellow]Please check config[/]")
        except Exception as e:
            table.add_row(name, "[red]Error[/]", str(e))

    console.print(table)
    console.print(f"\n[bold]Neural Health Score: {passed}/{len(checks)}[/]")

    if passed < len(checks):
        console.print("\n[yellow]Advice: Synchronize your neurons by updating '.env.local'.[/]")
    else:
        console.print("\n[green]All systems are balanced. You are ready to build at lightspeed.[/]")

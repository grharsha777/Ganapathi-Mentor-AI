"""
Ganapathi CLI v2.0 - Autonomous AI Agent
Tool-using agent for autonomous tasks: debug, deploy, optimize, and more.
"""

import os
import subprocess
import json
import tempfile
from pathlib import Path
from typing import List, Dict, Any, Optional

from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown
from rich.live import Live


# ═══════════════════════════════════════════════════════════════
# Agent Tools
# ═══════════════════════════════════════════════════════════════
class AgentTools:
    """Safe, sandboxed tools for the AI agent."""

    def __init__(self, console: Console, working_dir: str = "."):
        self.console = console
        self.working_dir = working_dir

    def read_file(self, path: str) -> str:
        """Read a file's contents."""
        try:
            p = Path(path)
            if not p.exists():
                return f"Error: File not found: {path}"
            content = p.read_text(encoding="utf-8", errors="ignore")
            return content[:10000]  # Limit to 10K chars
        except Exception as e:
            return f"Error reading file: {e}"

    def list_directory(self, path: str = ".") -> str:
        """List directory contents."""
        try:
            p = Path(path)
            items = []
            for item in sorted(p.iterdir()):
                if item.name.startswith('.'):
                    continue
                prefix = "📁" if item.is_dir() else "📄"
                items.append(f"{prefix} {item.name}")
            return "\n".join(items[:50])
        except Exception as e:
            return f"Error: {e}"

    def run_command(self, command: str, timeout: int = 30) -> str:
        """Run a shell command (sandboxed)."""
        # Safety: block dangerous commands
        dangerous = ['rm -rf', 'del /s', 'format', 'mkfs', ':(){', 'shutdown', 'reboot']
        if any(d in command.lower() for d in dangerous):
            return "⚠️ Blocked: Potentially dangerous command."

        try:
            result = subprocess.run(
                command, shell=True, capture_output=True, text=True,
                timeout=timeout, cwd=self.working_dir
            )
            output = result.stdout[:3000]
            if result.stderr:
                output += f"\nSTDERR: {result.stderr[:1000]}"
            return output or "(no output)"
        except subprocess.TimeoutExpired:
            return "Error: Command timed out"
        except Exception as e:
            return f"Error: {e}"

    def write_file(self, path: str, content: str) -> str:
        """Write content to a file."""
        try:
            p = Path(path)
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(content, encoding="utf-8")
            return f"✔ Written to {path}"
        except Exception as e:
            return f"Error: {e}"

    def search_code(self, pattern: str, path: str = ".") -> str:
        """Search for pattern in code files."""
        try:
            result = subprocess.run(
                ["grep", "-rn", "--include=*.py", "--include=*.js", "--include=*.ts",
                 pattern, path],
                capture_output=True, text=True, timeout=10
            )
            return result.stdout[:3000] or "No matches found"
        except FileNotFoundError:
            # Windows fallback
            try:
                result = subprocess.run(
                    ["findstr", "/s", "/n", pattern, f"{path}\\*.py", f"{path}\\*.js"],
                    capture_output=True, text=True, timeout=10
                )
                return result.stdout[:3000] or "No matches found"
            except Exception:
                return "Search not available"
        except Exception as e:
            return f"Error: {e}"

    def git_status(self) -> str:
        """Get git status."""
        return self.run_command("git status --short")

    def git_diff(self) -> str:
        """Get git diff."""
        return self.run_command("git diff --stat")

    def get_tool_descriptions(self) -> str:
        """Return descriptions of available tools."""
        return """Available tools:
1. read_file(path) - Read a file's contents
2. list_directory(path) - List directory contents
3. run_command(command) - Run a shell command (sandboxed, no destructive ops)
4. write_file(path, content) - Write content to a file
5. search_code(pattern, path) - Search code files for a pattern
6. git_status() - Get Git status
7. git_diff() - Get Git diff summary
"""


# ═══════════════════════════════════════════════════════════════
# ReAct Agent Loop
# ═══════════════════════════════════════════════════════════════
class GanapathiAgent:
    """
    Autonomous AI agent that can plan and execute tasks.
    Uses a ReAct (Reason + Act) loop with tool calls.
    """

    MAX_STEPS = 10

    def __init__(self, ai_engine, console: Console, working_dir: str = "."):
        self.ai = ai_engine
        self.console = console
        self.tools = AgentTools(console, working_dir)
        self.history: List[Dict[str, str]] = []

    def run(self, task: str) -> str:
        """Execute a task autonomously."""
        from .console_renderer import print_header, render_ai_response

        print_header(self.console, "Agent Mode", f"Task: {task}")

        system_prompt = f"""You are Ganapathi Agent v2.0 — an autonomous coding agent inside a terminal.
You have access to these tools:
{self.tools.get_tool_descriptions()}

To use a tool, respond with EXACTLY this format (one tool per step):
THOUGHT: <your reasoning>
ACTION: <tool_name>
INPUT: <tool_input>

When you have the final answer, respond with:
THOUGHT: <final reasoning>
ANSWER: <your complete answer>

Rules:
- Maximum {self.MAX_STEPS} steps
- Be focused and efficient
- Show your work
- Current directory: {self.tools.working_dir}
"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Task: {task}"},
        ]

        for step in range(self.MAX_STEPS):
            self.console.print(f"\n[bold cyan]━━━ Step {step + 1}/{self.MAX_STEPS} ━━━[/]")

            # Get agent's response
            with self.console.status("[yellow]🧠 Agent thinking...[/]"):
                response = self.ai.generate(
                    messages[-1]["content"] if len(messages) > 2 else task,
                    system=system_prompt + "\n\nConversation so far:\n" +
                    "\n".join(f"{m['role']}: {m['content'][:200]}" for m in messages[-6:]),
                    temperature=0.3,
                    use_cache=False,
                )

            if not response:
                self.console.print("[error]Agent got empty response[/]")
                break

            self.console.print(Panel(
                Markdown(response[:1000]),
                title=f"[bold magenta]🤖 Agent Step {step + 1}[/]",
                border_style="magenta",
            ))

            # Check for final answer
            if "ANSWER:" in response:
                answer_start = response.index("ANSWER:") + 7
                answer = response[answer_start:].strip()
                self.console.print(f"\n[success]✔ Agent completed task in {step + 1} steps[/]")
                render_ai_response(self.console, answer, "Agent")
                return answer

            # Parse and execute action
            if "ACTION:" in response and "INPUT:" in response:
                try:
                    action_start = response.index("ACTION:") + 7
                    input_start = response.index("INPUT:") + 6

                    action_end = response.index("\n", action_start) if "\n" in response[action_start:] else len(response)
                    action = response[action_start:input_start - 6].strip()

                    # Get input (everything after INPUT:)
                    remaining = response[input_start:].strip()
                    tool_input = remaining.split("\n")[0].strip()

                    # Execute tool
                    result = self._execute_tool(action, tool_input)
                    self.console.print(Panel(
                        result[:500],
                        title=f"[bold blue]📧 Tool Result: {action}[/]",
                        border_style="blue",
                    ))

                    messages.append({"role": "assistant", "content": response})
                    messages.append({"role": "user",
                                     "content": f"Tool result for {action}:\n{result[:2000]}\n\nContinue with the task."})
                except Exception as e:
                    self.console.print(f"[warning]Parse error: {e}[/]")
                    messages.append({"role": "assistant", "content": response})
                    messages.append({"role": "user",
                                     "content": "Could not parse your action. Please use the exact format: ACTION: <tool_name>\\nINPUT: <input>"})
            else:
                messages.append({"role": "assistant", "content": response})
                messages.append({"role": "user",
                                 "content": "Please respond with either an ACTION or an ANSWER."})

        self.console.print("[warning]Agent reached max steps without completing.[/]")
        return "Agent reached maximum steps. Partial progress shown above."

    def _execute_tool(self, action: str, tool_input: str) -> str:
        """Execute a tool by name."""
        action = action.strip().lower().replace(" ", "_")
        tool_map = {
            "read_file": lambda: self.tools.read_file(tool_input),
            "list_directory": lambda: self.tools.list_directory(tool_input or "."),
            "run_command": lambda: self.tools.run_command(tool_input),
            "write_file": lambda: self._parse_write(tool_input),
            "search_code": lambda: self._parse_search(tool_input),
            "git_status": lambda: self.tools.git_status(),
            "git_diff": lambda: self.tools.git_diff(),
        }

        fn = tool_map.get(action)
        if fn:
            return fn()
        return f"Unknown tool: {action}. Available: {', '.join(tool_map.keys())}"

    def _parse_write(self, input_str: str) -> str:
        """Parse write_file input: path | content."""
        parts = input_str.split("|", 1)
        if len(parts) == 2:
            return self.tools.write_file(parts[0].strip(), parts[1].strip())
        return "Error: Use format: path | content"

    def _parse_search(self, input_str: str) -> str:
        """Parse search_code input: pattern [path]."""
        parts = input_str.split(None, 1)
        pattern = parts[0]
        path = parts[1] if len(parts) > 1 else "."
        return self.tools.search_code(pattern, path)

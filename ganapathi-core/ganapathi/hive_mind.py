"""
Ganapathi Hive Mind Bridge v1.0
Real-time WebSocket server that syncs CLI ↔ Web Dashboard.

Architecture:
  CLI (Python) ─── WebSocket Server (localhost:8765) ─── Web Dashboard (Next.js)

Features:
  • Real-time file watching (chokidar-like via watchdog)
  • VS Code open file detection
  • Secure JWT auth with ephemeral tokens
  • Project tree browsing
  • File content streaming
  • ML prediction integration
"""

import asyncio
import json
import logging
import os
import hashlib
import platform
import secrets
import signal
import subprocess
import time
import threading
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional, Dict, Set, List, Any

# ═══════════════════════════════════════════════════════════════
# Structured Logger
# ═══════════════════════════════════════════════════════════════
logger = logging.getLogger("ganapathi.hive_mind")


try:
    import websockets
    import websockets.server
    HAS_WEBSOCKETS = True
except ImportError:
    HAS_WEBSOCKETS = False

try:
    from watchdog.observers import Observer
    from watchdog.events import FileSystemEventHandler
    HAS_WATCHDOG = True
except ImportError:
    HAS_WATCHDOG = False

from .config import CONFIG_DIR, get_config_value

# ═══════════════════════════════════════════════════════════════
# Constants
# ═══════════════════════════════════════════════════════════════
HIVE_PORT = 8765
HIVE_TOKEN_FILE = CONFIG_DIR / "hive_token.json"
MAX_FILE_SIZE = 1_048_576  # 1MB
ALLOWED_EXTENSIONS = {
    '.py', '.js', '.ts', '.tsx', '.jsx', '.json', '.html', '.css',
    '.md', '.yml', '.yaml', '.toml', '.cfg', '.env', '.sh', '.bat',
    '.java', '.cpp', '.c', '.h', '.go', '.rs', '.rb', '.php',
    '.sql', '.graphql', '.prisma', '.dockerfile', '.xml', '.csv',
}
IGNORED_DIRS = {
    'node_modules', '.git', '__pycache__', '.next', '.venv', 'venv',
    'dist', 'build', '.cache', '.turbo', 'coverage', '.idea', '.vscode',
    'target', 'out', 'bin', 'obj', '.tox', 'eggs', '.eggs', '.mypy_cache',
}
RATE_LIMIT_WINDOW = 60  # seconds
RATE_LIMIT_MAX = 120     # max requests per window


# ═══════════════════════════════════════════════════════════════
# Security: JWT Token Manager
# ═══════════════════════════════════════════════════════════════
class TokenManager:
    """Generates and validates ephemeral JWT-like tokens for WS auth."""

    def __init__(self):
        self.secret = secrets.token_hex(32)
        self.created_at = time.time()
        self.device_id = hashlib.sha256(
            f"{os.getlogin()}@{platform.node()}-{self.secret[:8]}".encode()
        ).hexdigest()[:16]

    def generate_token(self, expires_hours: int = 24) -> dict:
        """Generate a connection token."""
        token_data = {
            "token": hashlib.sha256(f"{self.secret}:{time.time()}".encode()).hexdigest(),
            "device_id": self.device_id,
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(hours=expires_hours)).isoformat(),
            "secret": self.secret,
        }
        # Save to disk so web dashboard can retrieve it
        HIVE_TOKEN_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(HIVE_TOKEN_FILE, 'w') as f:
            json.dump(token_data, f, indent=2)
        return token_data

    def validate_token(self, token: str) -> bool:
        """Validate a connection token."""
        try:
            if not HIVE_TOKEN_FILE.exists():
                return False
            with open(HIVE_TOKEN_FILE) as f:
                stored = json.load(f)
            if stored.get("token") != token:
                return False
            expires = datetime.fromisoformat(stored["expires_at"])
            if datetime.now() > expires:
                return False
            return True
        except Exception:
            return False


# ═══════════════════════════════════════════════════════════════
# Rate Limiter
# ═══════════════════════════════════════════════════════════════
class RateLimiter:
    """Simple sliding window rate limiter per client."""

    def __init__(self):
        self.requests: Dict[str, List[float]] = {}

    def check(self, client_id: str) -> bool:
        now = time.time()
        if client_id not in self.requests:
            self.requests[client_id] = []
        # Clean old entries
        self.requests[client_id] = [t for t in self.requests[client_id] if now - t < RATE_LIMIT_WINDOW]
        if len(self.requests[client_id]) >= RATE_LIMIT_MAX:
            return False
        self.requests[client_id].append(now)
        return True


# ═══════════════════════════════════════════════════════════════
# File System Scanner
# ═══════════════════════════════════════════════════════════════
class ProjectScanner:
    """Scans and watches local project files (Cached for High Performance)."""

    def __init__(self, root: str):
        self.root = Path(root).resolve()
        self._tree_cache = None
        self._tree_last_scan = 0
        self._scan_cooldown = 2.0  # seconds

    def invalidate_cache(self):
        """Force the next get_tree() to rescan."""
        self._tree_cache = None

    def get_tree(self, max_depth: int = 5) -> dict:
        """Get project file tree as nested dict (Cached)."""
        now = time.time()
        if self._tree_cache and (now - self._tree_last_scan) < self._scan_cooldown:
            return self._tree_cache

        self._tree_cache = self._scan_dir(self.root, depth=0, max_depth=max_depth)
        self._tree_last_scan = now
        return self._tree_cache

    def _scan_dir(self, path: Path, depth: int, max_depth: int) -> dict:
        node = {
            "name": path.name,
            "path": str(path.relative_to(self.root)) if path != self.root else ".",
            "type": "directory",
            "children": [],
        }
        if depth >= max_depth:
            return node

        try:
            entries = sorted(path.iterdir(), key=lambda e: (not e.is_dir(), e.name.lower()))
            for entry in entries:
                if entry.name.startswith('.') and entry.name not in ('.env', '.env.local'):
                    continue
                if entry.is_dir():
                    if entry.name in IGNORED_DIRS:
                        continue
                    child = self._scan_dir(entry, depth + 1, max_depth)
                    if child["children"] or depth < 2:
                        node["children"].append(child)
                elif entry.is_file():
                    ext = entry.suffix.lower()
                    if ext in ALLOWED_EXTENSIONS:
                        try:
                            size = entry.stat().st_size
                        except OSError:
                            size = 0
                        node["children"].append({
                            "name": entry.name,
                            "path": str(entry.relative_to(self.root)),
                            "type": "file",
                            "size": size,
                            "extension": ext,
                            "modified": datetime.fromtimestamp(entry.stat().st_mtime).isoformat() if size > 0 else None,
                        })
        except PermissionError:
            pass
        return node

    def read_file(self, relative_path: str) -> Optional[dict]:
        """Read a file's content safely."""
        try:
            full_path = (self.root / relative_path).resolve()
            # Security: ensure path is within project root
            if not str(full_path).startswith(str(self.root)):
                return {"error": "Path traversal blocked"}
            if not full_path.exists():
                return {"error": "File not found"}
            if full_path.stat().st_size > MAX_FILE_SIZE:
                return {"error": f"File too large (max {MAX_FILE_SIZE // 1024}KB)"}
            if full_path.suffix.lower() not in ALLOWED_EXTENSIONS:
                return {"error": f"File type not allowed: {full_path.suffix}"}

            content = full_path.read_text(encoding='utf-8', errors='replace')
            return {
                "path": relative_path,
                "name": full_path.name,
                "content": content,
                "size": len(content),
                "extension": full_path.suffix,
                "modified": datetime.fromtimestamp(full_path.stat().st_mtime).isoformat(),
                "lines": content.count('\n') + 1,
            }
        except Exception as e:
            return {"error": str(e)}

    def get_stats(self) -> dict:
        """Get project statistics."""
        stats = {"total_files": 0, "total_size": 0, "by_extension": {}, "project_name": self.root.name}
        try:
            for f in self.root.rglob("*"):
                if f.is_file() and f.suffix.lower() in ALLOWED_EXTENSIONS:
                    skip = False
                    for part in f.parts:
                        if part in IGNORED_DIRS:
                            skip = True
                            break
                    if skip:
                        continue
                    stats["total_files"] += 1
                    size = f.stat().st_size
                    stats["total_size"] += size
                    ext = f.suffix.lower()
                    if ext not in stats["by_extension"]:
                        stats["by_extension"][ext] = 0
                    stats["by_extension"][ext] += 1
        except Exception:
            pass
        return stats


# ═══════════════════════════════════════════════════════════════
# VS Code Integration
# ═══════════════════════════════════════════════════════════════
class VSCodeDetector:
    """Detects open VS Code windows and files."""

    @staticmethod
    def get_open_files() -> List[dict]:
        """Try to detect VS Code open files."""
        files = []
        try:
            # Windows: query VS Code recently opened files via storage.json
            if os.name == 'nt':
                vscode_storage = Path.home() / "AppData" / "Roaming" / "Code" / "User" / "globalStorage" / "storage.json"
                if vscode_storage.exists():
                    data = json.loads(vscode_storage.read_text(errors='ignore'))
                    # Extract recent files
                    for key in ['openedPathsList', 'lastKnownMenubarData']:
                        if key in data:
                            entries = data[key]
                            if isinstance(entries, dict) and 'entries' in entries:
                                for entry in entries['entries'][:10]:
                                    if isinstance(entry, str) and os.path.isfile(entry):
                                        files.append({
                                            "path": entry,
                                            "name": os.path.basename(entry),
                                            "extension": os.path.splitext(entry)[1],
                                        })
        except Exception:
            pass

        # Fallback: try `code --status` if available
        try:
            result = subprocess.run(
                ['code', '--list-extensions'],
                capture_output=True, text=True, timeout=3,
            )
            if result.returncode == 0:
                # VS Code is installed
                pass
        except Exception:
            pass

        return files

    @staticmethod
    def get_workspace_folders() -> List[str]:
        """Detect VS Code workspace folders from recent."""
        folders = []
        try:
            if os.name == 'nt':
                recent_path = Path.home() / "AppData" / "Roaming" / "Code" / "User" / "globalStorage" / "state.vscdb"
                # Alternative: check CWD or parent dirs for .vscode folder
                cwd = Path.cwd()
                if (cwd / '.vscode').exists():
                    folders.append(str(cwd))
                for parent in cwd.parents:
                    if (parent / '.vscode').exists():
                        folders.append(str(parent))
                        break
        except Exception:
            pass
        return folders


# ═══════════════════════════════════════════════════════════════
# File Watcher (Watchdog)
# ═══════════════════════════════════════════════════════════════
class FileChangeHandler(FileSystemEventHandler if HAS_WATCHDOG else object):
    """Tracks file changes and notifies WebSocket clients."""

    def __init__(self):
        self.changes: List[dict] = []
        self.max_changes = 100

    def on_modified(self, event):
        if not event.is_directory:
            self._record("modified", event.src_path)

    def on_created(self, event):
        if not event.is_directory:
            self._record("created", event.src_path)

    def on_deleted(self, event):
        if not event.is_directory:
            self._record("deleted", event.src_path)

    def _record(self, action: str, path: str):
        p = Path(path)
        if p.suffix.lower() not in ALLOWED_EXTENSIONS:
            return
        for part in p.parts:
            if part in IGNORED_DIRS:
                return
        self.changes.append({
            "action": action,
            "path": path,
            "name": p.name,
            "extension": p.suffix,
            "timestamp": datetime.now().isoformat(),
        })
        if len(self.changes) > self.max_changes:
            self.changes = self.changes[-50:]

    def get_changes(self, since: Optional[str] = None) -> List[dict]:
        if since:
            return [c for c in self.changes if c["timestamp"] > since]
        return self.changes[-20:]

    def clear(self):
        self.changes = []


# ═══════════════════════════════════════════════════════════════
# WebSocket Server (Core of Hive Mind)
# ═══════════════════════════════════════════════════════════════
class HiveMindServer:
    """
    Production WebSocket server for CLI ↔ Web Dashboard sync.

    Endpoints (via JSON messages):
      { "action": "auth", "token": "..." }
      { "action": "status" }
      { "action": "tree" }
      { "action": "read", "path": "relative/path" }
      { "action": "stats" }
      { "action": "changes", "since": "ISO timestamp" }
      { "action": "vscode" }
      { "action": "predict", "path": "relative/path" }
      { "action": "search", "query": "search term" }
    """

    def __init__(self, project_dir: str, port: int = HIVE_PORT):
        self.project_dir = Path(project_dir).resolve()
        self.port = port
        self.token_manager = TokenManager()
        self.rate_limiter = RateLimiter()
        self.scanner = ProjectScanner(str(self.project_dir))
        self.vscode = VSCodeDetector()
        self.change_handler = FileChangeHandler()
        self.observer = None
        self.connected_clients: Set = set()
        self.authenticated_clients: Set = set()
        self.server = None
        self._running = False

    def _start_watcher(self):
        """Start file watcher in background."""
        if not HAS_WATCHDOG:
            return
        try:
            self.observer = Observer()
            self.observer.schedule(self.change_handler, str(self.project_dir), recursive=True)
            self.observer.daemon = True
            self.observer.start()
        except Exception:
            pass

    def _stop_watcher(self):
        if self.observer:
            try:
                self.observer.stop()
                self.observer.join(timeout=2)
            except Exception:
                pass

    async def _handler(self, websocket):
        """Handle a single WebSocket connection."""
        client_id = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
        self.connected_clients.add(client_id)
        is_authed = False

        try:
            async for raw_message in websocket:
                # Rate limit
                if not self.rate_limiter.check(client_id):
                    await websocket.send(json.dumps({"error": "Rate limit exceeded", "code": 429}))
                    continue

                try:
                    msg = json.loads(raw_message)
                except json.JSONDecodeError:
                    await websocket.send(json.dumps({"error": "Invalid JSON"}))
                    continue

                action = msg.get("action", "")

                # Auth (must be first message)
                if action == "auth":
                    token = msg.get("token", "")
                    if self.token_manager.validate_token(token):
                        is_authed = True
                        self.authenticated_clients.add(client_id)
                        await websocket.send(json.dumps({
                            "action": "auth_ok",
                            "device_id": self.token_manager.device_id,
                            "project": self.project_dir.name,
                            "project_path": str(self.project_dir),
                        }))
                    else:
                        await websocket.send(json.dumps({"error": "Invalid token", "code": 401}))
                    continue

                # All other actions require auth
                if not is_authed:
                    await websocket.send(json.dumps({"error": "Not authenticated. Send auth first.", "code": 401}))
                    continue

                # Route actions
                response = await self._handle_action(action, msg)
                await websocket.send(json.dumps(response))

        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.connected_clients.discard(client_id)
            self.authenticated_clients.discard(client_id)

    async def _handle_action(self, action: str, msg: dict) -> dict:
        """Route and handle authenticated actions."""
        if action == "status":
            return {
                "action": "status",
                "project": self.project_dir.name,
                "project_path": str(self.project_dir),
                "connected_clients": len(self.authenticated_clients),
                "watching": self.observer is not None and self.observer.is_alive() if self.observer else False,
                "uptime": time.time() - self.token_manager.created_at,
                "device_id": self.token_manager.device_id,
            }

        elif action == "tree":
            max_depth = msg.get("max_depth", 4)
            return {"action": "tree", "tree": self.scanner.get_tree(max_depth)}

        elif action == "read":
            path = msg.get("path", "")
            if not path:
                return {"error": "Missing 'path' parameter"}
            result = self.scanner.read_file(path)
            return {"action": "read", **result}

        elif action == "stats":
            return {"action": "stats", **self.scanner.get_stats()}

        elif action == "changes":
            since = msg.get("since")
            changes = self.change_handler.get_changes(since)
            return {"action": "changes", "changes": changes}

        elif action == "vscode":
            files = self.vscode.get_open_files()
            folders = self.vscode.get_workspace_folders()
            return {"action": "vscode", "files": files, "folders": folders}

        elif action == "predict":
            path = msg.get("path", "")
            if not path:
                return {"error": "Missing 'path' parameter"}
            file_data = self.scanner.read_file(path)
            if "error" in file_data:
                return file_data
            try:
                from .ml_predictor import get_predictor
                predictor = get_predictor()
                prediction = predictor.predict(file_data["content"], "all")
                return {"action": "predict", "path": path, "prediction": prediction}
            except Exception as e:
                return {"action": "predict", "path": path, "error": str(e)}

        elif action == "search":
            query = msg.get("query", "").lower()
            if not query or len(query) < 2:
                return {"error": "Query must be >= 2 characters"}
            results = []
            try:
                for f in self.project_dir.rglob("*"):
                    if not f.is_file() or f.suffix.lower() not in ALLOWED_EXTENSIONS:
                        continue
                    skip = False
                    for part in f.parts:
                        if part in IGNORED_DIRS:
                            skip = True
                            break
                    if skip:
                        continue
                    if query in f.name.lower():
                        results.append({
                            "path": str(f.relative_to(self.project_dir)),
                            "name": f.name,
                            "match_type": "filename",
                        })
                    if len(results) >= 50:
                        break
            except Exception:
                pass
            return {"action": "search", "query": query, "results": results}

        elif action == "write":
            path = msg.get("path", "")
            content = msg.get("content", "")
            if not path:
                return {"error": "Missing 'path' parameter"}
            try:
                full_path = (self.project_dir / path).resolve()
                if not str(full_path).startswith(str(self.project_dir)):
                    return {"error": "Path traversal blocked"}
                if full_path.suffix.lower() not in ALLOWED_EXTENSIONS:
                    return {"error": f"File type not allowed: {full_path.suffix}"}
                if len(content) > MAX_FILE_SIZE:
                    return {"error": f"Content too large (max {MAX_FILE_SIZE // 1024}KB)"}
                full_path.parent.mkdir(parents=True, exist_ok=True)
                full_path.write_text(content, encoding='utf-8')
                return {
                    "action": "write",
                    "path": path,
                    "success": True,
                    "size": len(content),
                    "timestamp": datetime.now().isoformat(),
                }
            except Exception as e:
                return {"action": "write", "error": str(e)}

        elif action == "exec":
            command = msg.get("command", "")
            if not command:
                return {"error": "Missing 'command' parameter"}
            # Block destructive commands
            dangerous = ['rm -rf /', 'format c:', 'del /f /s /q', 'mkfs', ':(){:|:&};:']
            cmd_lower = command.lower().strip()
            for d in dangerous:
                if d in cmd_lower:
                    return {"action": "exec", "error": f"Blocked dangerous command: {d}"}
            try:
                # Use powershell on Windows to avoid 'ls is not recognized' etc.
                exec_cmd = command
                if os.name == 'nt' and not command.lower().strip().startswith("powershell"):
                    exec_cmd = f'powershell -NoProfile -Command "{command}"'
                
                result = subprocess.run(
                    exec_cmd, shell=True, capture_output=True, text=True,
                    timeout=30, cwd=str(self.project_dir),
                )
                return {
                    "action": "exec",
                    "command": command,
                    "stdout": result.stdout[-8000:] if result.stdout else "",
                    "stderr": result.stderr[-4000:] if result.stderr else "",
                    "returncode": result.returncode,
                    "success": result.returncode == 0,
                }
            except subprocess.TimeoutExpired:
                return {"action": "exec", "error": "Command timed out (30s limit)"}
            except Exception as e:
                return {"action": "exec", "error": str(e)}

        elif action == "git":
            sub = msg.get("sub", "status")
            try:
                if sub == "status":
                    r = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True, cwd=str(self.project_dir), timeout=10)
                    r2 = subprocess.run(['git', 'branch', '--show-current'], capture_output=True, text=True, cwd=str(self.project_dir), timeout=5)
                    r3 = subprocess.run(['git', 'log', '--oneline', '-5'], capture_output=True, text=True, cwd=str(self.project_dir), timeout=5)
                    files = []
                    for line in r.stdout.strip().split('\n'):
                        if line.strip():
                            status_code = line[:2].strip()
                            fname = line[3:].strip()
                            files.append({"status": status_code, "file": fname})
                    return {
                        "action": "git", "sub": "status",
                        "branch": r2.stdout.strip(),
                        "files": files,
                        "recent_commits": r3.stdout.strip().split('\n') if r3.stdout.strip() else [],
                        "clean": len(files) == 0,
                    }
                elif sub == "commit":
                    message = msg.get("message", "Update from Ganapathi Hive Mind")
                    subprocess.run(['git', 'add', '-A'], capture_output=True, cwd=str(self.project_dir), timeout=10)
                    r = subprocess.run(['git', 'commit', '-m', message], capture_output=True, text=True, cwd=str(self.project_dir), timeout=15)
                    return {"action": "git", "sub": "commit", "success": r.returncode == 0, "output": r.stdout + r.stderr}
                elif sub == "push":
                    r = subprocess.run(['git', 'push'], capture_output=True, text=True, cwd=str(self.project_dir), timeout=30)
                    return {"action": "git", "sub": "push", "success": r.returncode == 0, "output": r.stdout + r.stderr}
                elif sub == "pull":
                    r = subprocess.run(['git', 'pull'], capture_output=True, text=True, cwd=str(self.project_dir), timeout=30)
                    return {"action": "git", "sub": "pull", "success": r.returncode == 0, "output": r.stdout + r.stderr}
                elif sub == "log":
                    count = msg.get("count", 20)
                    r = subprocess.run(['git', 'log', f'--oneline', f'-{count}', '--format=%h|%an|%ar|%s'], capture_output=True, text=True, cwd=str(self.project_dir), timeout=10)
                    commits = []
                    for line in r.stdout.strip().split('\n'):
                        if '|' in line:
                            parts = line.split('|', 3)
                            commits.append({"hash": parts[0], "author": parts[1], "time": parts[2], "message": parts[3] if len(parts) > 3 else ""})
                    return {"action": "git", "sub": "log", "commits": commits}
                elif sub == "diff":
                    r = subprocess.run(['git', 'diff', '--stat'], capture_output=True, text=True, cwd=str(self.project_dir), timeout=10)
                    return {"action": "git", "sub": "diff", "diff": r.stdout[-8000:]}
                else:
                    return {"error": f"Unknown git sub-action: {sub}"}
            except subprocess.TimeoutExpired:
                return {"action": "git", "error": "Git command timed out"}
            except FileNotFoundError:
                return {"action": "git", "error": "Git is not installed"}
            except Exception as e:
                return {"action": "git", "error": str(e)}

        elif action == "ping":
            return {"action": "pong", "timestamp": datetime.now().isoformat()}

        else:
            return {"error": f"Unknown action: {action}"}

    async def start(self, host: str = "127.0.0.1"):
        """Start the Hive Mind WebSocket server."""
        if not HAS_WEBSOCKETS:
            raise RuntimeError("Install websockets: pip install websockets")

        token_data = self.token_manager.generate_token()
        self._start_watcher()
        self._running = True

        self.server = await websockets.server.serve(
            self._handler,
            host,
            self.port,
            max_size=MAX_FILE_SIZE * 2,
            ping_interval=30,
            ping_timeout=10,
        )

        logger.info(f"Hive Mind server started on ws://{host}:{self.port}")
        return token_data

    def stop(self):
        """Stop the server."""
        self._running = False
        self._stop_watcher()
        if self.server:
            self.server.close()
        logger.info("Hive Mind server stopped")


# ═══════════════════════════════════════════════════════════════
# CLI Integration
# ═══════════════════════════════════════════════════════════════
def run_hive_mind(console, project_dir: str, port: int = HIVE_PORT, host: str = "127.0.0.1"):
    """Launch the Hive Mind server from the CLI."""
    from .console_renderer import print_logo, print_header, print_success, print_info, print_error

    # Configure logging
    log_level = os.environ.get("GANAPATHI_LOG_LEVEL", "INFO").upper()
    logging.basicConfig(
        level=getattr(logging, log_level, logging.INFO),
        format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    print_logo(console, mini=True)
    print_header(console, "Hive Mind Bridge", "Real-time CLI ↔ Web Dashboard sync")

    if not HAS_WEBSOCKETS:
        print_error(console, "Missing dependency: pip install websockets watchdog")
        print_info(console, "Run: pip install ganapathi-mentor-ai")
        return

    server = HiveMindServer(project_dir, port)

    async def _run():
        token_data = await server.start(host)

        console.print()
        print_success(console, f"🐝 Hive Mind server running on ws://{host}:{port}")
        console.print()
        console.print(f"  [bold]Device ID:[/]      [cyan]{token_data['device_id']}[/]")
        console.print(f"  [bold]Connection Key:[/] [yellow]{token_data['token'][:16]}...[/]")
        console.print(f"  [bold]Project:[/]        [green]{server.project_dir}[/]")
        console.print(f"  [bold]Expires:[/]        {token_data['expires_at']}")
        console.print(f"  [bold]File Watch:[/]     {'✔ Active' if HAS_WATCHDOG else '✘ Install watchdog'}")
        console.print()

        # Connection info for the web dashboard
        console.print("  [bold magenta]━━━ Connect from Web Dashboard ━━━[/]")
        console.print(f"  URL: [cyan]ws://{host}:{port}[/]")
        console.print(f"  Key: [yellow]{token_data['token']}[/]")
        console.print()
        console.print("  [dim]Paste the Connection Key in your Ganapathi Web Dashboard → Hive Mind page[/]")
        console.print("  [dim]Press Ctrl+C to stop the server[/]")
        console.print()

        # Keep alive with graceful shutdown
        stop_event = asyncio.Event()

        def _signal_handler():
            stop_event.set()

        loop = asyncio.get_running_loop()
        # Register signal handlers (Unix-like only, skip on Windows if unavailable)
        for sig_name in ("SIGINT", "SIGTERM"):
            sig = getattr(signal, sig_name, None)
            if sig is not None:
                try:
                    loop.add_signal_handler(sig, _signal_handler)
                except NotImplementedError:
                    # Windows doesn't support add_signal_handler for all signals
                    pass

        try:
            await stop_event.wait()
        except asyncio.CancelledError:
            pass
        finally:
            server.stop()
            print_info(console, "Hive Mind server stopped")

    try:
        asyncio.run(_run())
    except KeyboardInterrupt:
        server.stop()
        console.print("\n[magenta]Hive Mind disconnected. 🐝[/]")


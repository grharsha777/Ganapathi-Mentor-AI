"""
Ganapathi CLI v2.0 - DevOps Integration
Docker & Kubernetes build/deploy commands with auto-generation.
"""

import os
import subprocess
from pathlib import Path
from typing import Optional, Dict

from rich.console import Console
from rich.panel import Panel
from rich.syntax import Syntax


# ═══════════════════════════════════════════════════════════════
# Dockerfile Templates
# ═══════════════════════════════════════════════════════════════
DOCKERFILE_PYTHON = '''FROM python:3.12-slim AS builder

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

FROM python:3.12-slim
WORKDIR /app

COPY --from=builder /root/.local /root/.local
COPY . .

ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
'''

DOCKERFILE_NODE = '''FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server.js"]
'''

DOCKER_COMPOSE = '''version: "3.9"

services:
  {app_name}:
    build: .
    container_name: {app_name}
    ports:
      - "{port}:{port}"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:{port}/health"]
      interval: 30s
      timeout: 10s
      retries: 3
'''

# ═══════════════════════════════════════════════════════════════
# Kubernetes Templates
# ═══════════════════════════════════════════════════════════════
K8S_DEPLOYMENT = '''apiVersion: apps/v1
kind: Deployment
metadata:
  name: {app_name}
  labels:
    app: {app_name}
spec:
  replicas: {replicas}
  selector:
    matchLabels:
      app: {app_name}
  template:
    metadata:
      labels:
        app: {app_name}
    spec:
      containers:
      - name: {app_name}
        image: {image}
        ports:
        - containerPort: {port}
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: {port}
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: {port}
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: {app_name}-svc
spec:
  selector:
    app: {app_name}
  ports:
  - protocol: TCP
    port: 80
    targetPort: {port}
  type: ClusterIP
'''

K8S_INGRESS = '''apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {app_name}-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: {host}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: {app_name}-svc
            port:
              number: 80
'''


def _detect_stack(path: str) -> str:
    """Auto-detect project stack."""
    p = Path(path)
    if (p / "requirements.txt").exists() or (p / "setup.py").exists() or (p / "pyproject.toml").exists():
        return "python"
    if (p / "package.json").exists():
        return "node"
    return "python"  # default


def _run_cmd(cmd: list, console: Console, cwd: str = ".") -> bool:
    """Run a subprocess command with output."""
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, cwd=cwd, timeout=300
        )
        if result.stdout:
            console.print(f"[dim]{result.stdout[:500]}[/]")
        if result.returncode != 0:
            console.print(f"[error]Command failed: {result.stderr[:300]}[/]")
            return False
        return True
    except FileNotFoundError:
        console.print(f"[error]Command not found: {cmd[0]}[/]")
        return False
    except subprocess.TimeoutExpired:
        console.print("[error]Command timed out[/]")
        return False


def docker_build(console: Console, app_name: str = "ganapathi-app",
                 path: str = ".", port: int = 8000):
    """Generate Dockerfile and build Docker image."""
    from .console_renderer import print_header, print_success, print_error, print_info

    print_header(console, "Docker Build", f"Building {app_name}")

    p = Path(path).resolve()
    stack = _detect_stack(str(p))
    print_info(console, f"Detected stack: {stack}")

    # Generate Dockerfile if missing
    dockerfile = p / "Dockerfile"
    if not dockerfile.exists():
        template = DOCKERFILE_PYTHON if stack == "python" else DOCKERFILE_NODE
        dockerfile.write_text(template)
        print_success(console, f"Generated Dockerfile ({stack})")

        # Show generated file
        syntax = Syntax(template, "dockerfile", theme="monokai", line_numbers=True)
        console.print(Panel(syntax, title="[bold]Generated Dockerfile[/]", border_style="blue"))
    else:
        print_info(console, "Dockerfile already exists")

    # Generate docker-compose if missing
    compose_file = p / "docker-compose.yml"
    if not compose_file.exists():
        compose = DOCKER_COMPOSE.format(app_name=app_name, port=port)
        compose_file.write_text(compose)
        print_success(console, "Generated docker-compose.yml")

    # Build
    print_info(console, "Building Docker image...")
    success = _run_cmd(
        ["docker", "build", "-t", f"{app_name}:latest", "."],
        console, cwd=str(p)
    )

    if success:
        print_success(console, f"Image '{app_name}:latest' built successfully!")
    else:
        print_error(console, "Docker build failed. Is Docker running?")

    return success


def docker_deploy(console: Console, app_name: str = "ganapathi-app",
                  path: str = ".", port: int = 8000):
    """Deploy with docker-compose."""
    from .console_renderer import print_header, print_success, print_error, print_info

    print_header(console, "Docker Deploy", f"Deploying {app_name}")

    p = Path(path).resolve()

    # Ensure compose file exists
    compose_file = p / "docker-compose.yml"
    if not compose_file.exists():
        docker_build(console, app_name, path, port)

    success = _run_cmd(
        ["docker", "compose", "up", "-d", "--build"],
        console, cwd=str(p)
    )

    if success:
        print_success(console, f"Deployed! Access at http://localhost:{port}")
    else:
        print_error(console, "Deployment failed")

    return success


def k8s_generate(console: Console, app_name: str = "ganapathi-app",
                 image: str = "", port: int = 8000, replicas: int = 2,
                 host: str = "ganapathi.local", output_dir: str = "k8s"):
    """Generate Kubernetes manifests."""
    from .console_renderer import print_header, print_success, print_info

    print_header(console, "K8s Manifest Generation", app_name)

    if not image:
        image = f"{app_name}:latest"

    out = Path(output_dir)
    out.mkdir(exist_ok=True)

    # Deployment + Service
    dep_yaml = K8S_DEPLOYMENT.format(
        app_name=app_name, image=image, port=port, replicas=replicas
    )
    (out / "deployment.yaml").write_text(dep_yaml)
    print_success(console, "Generated deployment.yaml + service")

    # Ingress
    ing_yaml = K8S_INGRESS.format(app_name=app_name, host=host)
    (out / "ingress.yaml").write_text(ing_yaml)
    print_success(console, "Generated ingress.yaml")

    # Show
    syntax = Syntax(dep_yaml, "yaml", theme="monokai", line_numbers=True)
    console.print(Panel(syntax, title="[bold]deployment.yaml[/]", border_style="green"))

    print_info(console, f"Apply with: kubectl apply -f {output_dir}/")
    return True


def k8s_deploy(console: Console, yaml_dir: str = "k8s"):
    """Apply K8s manifests with kubectl."""
    from .console_renderer import print_header, print_success, print_error

    print_header(console, "K8s Deploy", f"Applying {yaml_dir}/")

    success = _run_cmd(
        ["kubectl", "apply", "-f", yaml_dir, "--recursive"],
        console
    )

    if success:
        print_success(console, "Kubernetes resources applied!")
        _run_cmd(["kubectl", "get", "pods", "-l", f"app=ganapathi-app"], console)
    else:
        print_error(console, "kubectl apply failed. Is kubectl configured?")

    return success

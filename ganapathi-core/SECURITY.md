# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.0.x   | ✅ Yes    |
| < 2.0   | ❌ No     |

## Reporting a Vulnerability

If you discover a security vulnerability in Ganapathi CLI, please report it responsibly:

1. **Do NOT** open a public GitHub issue.
2. **Email**: Send details to `grharsha@example.com` with subject line `[SECURITY] Ganapathi CLI`.
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Response Timeline

- **Acknowledgment**: Within 48 hours
- **Assessment**: Within 7 days
- **Fix & Release**: Within 30 days for critical issues

## Security Practices

- API keys are stored in `~/.ganapathi/config.json` (user-level permissions)
- The AI agent's `run_command` tool blocks destructive commands (`rm -rf`, `format`, etc.)
- Code execution in the agent is sandboxed with timeouts
- No telemetry or data collection
- All network calls use HTTPS with timeouts

## Disclosure Policy

We follow responsible disclosure. We will credit reporters in the release notes (unless anonymity is requested).

# Contributing to Ganapathi CLI

Thank you for your interest in contributing to Ganapathi CLI! This guide will help you get started.

## Development Setup

```bash
git clone https://github.com/grharsha/ganapathi-cli.git
cd ganapathi-core
pip install -e ".[dev,full]"
ganapathi ml train --samples 5000
ganapathi doctor
```

## Pull Request Guidelines

1. **Fork** the repository and create your branch from `main`.
2. **Write clear commit messages** following conventional commits (`feat:`, `fix:`, `docs:`, `test:`).
3. **Add tests** for any new functionality.
4. **Run the test suite** before submitting: `pytest --cov=ganapathi`.
5. **Update documentation** if your changes affect CLI commands or config.

## Code Style

- Python 3.9+ with type hints
- Format with `black` (line length 100)
- Lint with `ruff`
- All modules must have docstrings

## Reporting Issues

Use GitHub Issues with one of these templates:
- **Bug Report**: Include CLI version (`ganapathi version`), OS, Python version, and steps to reproduce.
- **Feature Request**: Describe the use case and proposed solution.

## Areas to Contribute

- New prediction targets for the ML engine
- Additional code feature extractors
- CI/CD pipeline templates
- Documentation improvements
- Performance optimizations

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

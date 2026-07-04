"""
Ganapathi CLI v2.0 — Ultimate AI Terminal Mentor
Legacy setup.py for backwards compatibility. Primary config is in pyproject.toml.
"""

from setuptools import setup, find_packages

setup(
    name="ganapathi-mentor-ai",
    version="2.0.0",
    description="Ganapathi CLI v2.0 — Ultimate AI Terminal Mentor with ML Predictions, Multi-LLM, DevOps, and Autonomous Agent",
    long_description=open("README.md", encoding="utf-8").read() if __import__("os").path.exists("README.md") else "",
    long_description_content_type="text/markdown",
    author="G R Harsha",
    author_email="grharsha@example.com",
    url="https://github.com/grharsha/ganapathi-cli",
    license="MIT",
    packages=find_packages(),
    include_package_data=True,
    python_requires=">=3.9",
    install_requires=[
        "typer[all]>=0.9.0",
        "rich>=13.0.0",
        "openai>=1.0.0",
        "python-dotenv>=1.0.0",
        "pydantic>=2.0.0",
        "requests>=2.28.0",
        "numpy>=1.24.0",
        "scikit-learn>=1.3.0",
        "joblib>=1.3.0",
        "websockets>=12.0",
        "watchdog>=4.0.0",
    ],
    extras_require={
        "full": [
            "xgboost>=2.0.0",
            "lightgbm>=4.0.0",
            "shap>=0.43.0",
            "pandas>=2.0.0",
        ],
        "dev": [
            "pytest>=7.0.0",
            "pytest-cov>=4.0.0",
            "black>=23.0.0",
            "ruff>=0.1.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "ganapathi=ganapathi.cli:main",
        ],
    },
    classifiers=[
        "Development Status :: 4 - Beta",
        "Environment :: Console",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Build Tools",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
    ],
)

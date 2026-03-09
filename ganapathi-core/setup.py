from setuptools import setup, find_packages

setup(
    name="ganapathi-mentor-ai",
    version="2.0.0",
    packages=find_packages(),
    include_package_data=True,
    install_requires=[
        "typer[all]",
        "rich",
        "openai",
        "python-dotenv",
        "pydantic",
        "requests",
    ],
    entry_points={
        "console_scripts": [
            "ganapathi=ganapathi.cli:app",
        ],
    },
)

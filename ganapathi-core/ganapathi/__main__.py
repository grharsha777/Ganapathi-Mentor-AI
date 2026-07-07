import sys
import os

from ganapathi.cli import main

if __name__ == "__main__":
    # Ensure package resolution works when run via `python -m ganapathi`
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    main()

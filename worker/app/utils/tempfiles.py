import tempfile
import shutil
import os
from pathlib import Path


class TempDir:
    """Context manager for a request-scoped temp directory."""

    def __init__(self):
        self.path: Path | None = None

    def __enter__(self) -> Path:
        self.path = Path(tempfile.mkdtemp(prefix="prismpdf_"))
        return self.path

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.path and self.path.exists():
            shutil.rmtree(self.path, ignore_errors=True)

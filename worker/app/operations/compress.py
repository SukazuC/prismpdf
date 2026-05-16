import logging
from pathlib import Path
import shutil
import subprocess
from typing import TypedDict


logger = logging.getLogger(__name__)


class CompressionResult(TypedDict):
    original_size: int
    output_size: int
    method: str
    status: str


def _valid_size(path: Path) -> int | None:
    if not path.exists():
        return None

    size = path.stat().st_size
    return size if size > 0 else None


async def compress_pdf(
    input_path: Path,
    output_path: Path,
    level: str = "balanced",
) -> CompressionResult:
    """Compress a PDF using qpdf and Ghostscript strategy."""
    original_size = input_path.stat().st_size
    candidates: list[tuple[str, Path, int]] = []

    # Step 1: Use qpdf for safe structural optimization first.
    # Ghostscript reads qpdf output when available; otherwise it falls back to the original input.
    qpdf_output = input_path.parent / "qpdf_output.pdf"
    ghostscript_input = input_path
    try:
        subprocess.run(
            [
                "qpdf",
                "--object-streams=generate",
                "--stream-data=compress",
                str(input_path),
                str(qpdf_output),
            ],
            check=True,
            capture_output=True,
            timeout=60,
        )
        qpdf_size = _valid_size(qpdf_output)
        if qpdf_size is not None:
            candidates.append(("qpdf", qpdf_output, qpdf_size))
            ghostscript_input = qpdf_output
    except subprocess.CalledProcessError as e:
        logger.warning("qpdf failed with exit code %s", e.returncode)
    except subprocess.TimeoutExpired:
        logger.warning("qpdf timed out")

    # Step 2: Choose Ghostscript PDF settings based on level
    gs_settings = {
        "low": "/printer",
        "balanced": "/ebook",
        "strong": "/screen",
    }.get(level, "/ebook")

    gs_output = input_path.parent / "gs_output.pdf"

    try:
        subprocess.run(
            [
                "gs",
                "-dNOPAUSE",
                "-dBATCH",
                "-dSAFER",
                f"-dPDFSETTINGS={gs_settings}",
                "-sDEVICE=pdfwrite",
                "-dCompatibilityLevel=1.7",
                "-dEmbedAllFonts=true",
                "-dSubsetFonts=true",
                "-dDetectDuplicateImages=true",
                "-dFastWebView=false",
                f"-sOutputFile={gs_output}",
                str(ghostscript_input),
            ],
            check=True,
            capture_output=True,
            timeout=120,
        )
        gs_size = _valid_size(gs_output)
        if gs_size is not None:
            candidates.append(("ghostscript", gs_output, gs_size))
    except subprocess.CalledProcessError as e:
        logger.warning("Ghostscript failed with exit code %s", e.returncode)
    except subprocess.TimeoutExpired:
        logger.warning("Ghostscript timed out")

    smaller_candidates = [candidate for candidate in candidates if candidate[2] < original_size]
    if not smaller_candidates:
        shutil.copy2(input_path, output_path)
        return {
            "original_size": original_size,
            "output_size": original_size,
            "method": "original",
            "status": "no-savings",
        }

    method, path, output_size = min(smaller_candidates, key=lambda candidate: candidate[2])
    shutil.copy2(path, output_path)
    return {
        "original_size": original_size,
        "output_size": output_size,
        "method": method,
        "status": "compressed",
    }

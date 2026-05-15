import logging
from pathlib import Path
import subprocess


logger = logging.getLogger(__name__)


async def compress_pdf(
    input_path: Path,
    output_path: Path,
    level: str = "balanced",
):
    """Compress a PDF using qpdf and Ghostscript strategy."""

    # Step 1: Use qpdf for safe structural optimization first
    qpdf_output = input_path.parent / "qpdf_output.pdf"
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
    except subprocess.CalledProcessError as e:
        logger.warning("qpdf failed: %s, falling back to original file", e.stderr.decode())
        qpdf_output = input_path

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
                str(qpdf_output),
            ],
            check=True,
            capture_output=True,
            timeout=120,
        )
    except subprocess.CalledProcessError as e:
        logger.warning("Ghostscript failed: %s, falling back to qpdf output", e.stderr.decode())
        # Use qpdf output if Ghostscript fails
        import shutil
        shutil.copy2(qpdf_output, output_path)
        return

    # Step 3: Choose the smallest valid output
    qpdf_size = qpdf_output.stat().st_size if qpdf_output.exists() else float("inf")
    gs_size = gs_output.stat().st_size if gs_output.exists() else float("inf")

    if gs_size < qpdf_size:
        import shutil
        shutil.copy2(gs_output, output_path)
    else:
        import shutil
        shutil.copy2(qpdf_output, output_path)

    # Step 4: If output is larger than input, use the original with a rebuilt structure
    output_size = output_path.stat().st_size
    if output_size > input_path.stat().st_size:
        logger.info("Compression produced larger file, returning re-structured original")
        import shutil
        shutil.copy2(qpdf_output, output_path)

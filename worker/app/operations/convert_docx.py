import logging
from pathlib import Path


logger = logging.getLogger(__name__)


def convert_to_docx(input_path: Path, output_path: Path):
    """
    Convert PDF to DOCX using pdf2docx.
    Produces best-effort layout and text extraction.
    """
    try:
        from pdf2docx import Converter

        cv = Converter(str(input_path))
        cv.convert(str(output_path), start=0, end=None)
        cv.close()

        if not output_path.exists() or output_path.stat().st_size == 0:
            raise RuntimeError("pdf2docx produced empty output")

        logger.info(
            "DOCX conversion successful: %s -> %s (%d bytes)",
            input_path.name,
            output_path.name,
            output_path.stat().st_size,
        )

    except Exception as e:
        logger.error("pdf2docx conversion failed: %s", str(e))
        raise

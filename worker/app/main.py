import logging
import time
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import Response

from app.operations.compress import compress_pdf
from app.operations.convert_docx import convert_to_docx
from app.operations.convert_pptx import convert_to_pptx
from app.utils.tempfiles import TempDir

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PrismPDF Worker",
    description="Server-side PDF processing for compression and Office conversions",
    version="0.1.0",
)

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@app.get("/health")
async def health():
    return {"status": "ok", "service": "prismpdf-worker"}


@app.post("/compress")
async def compress_endpoint(
    file: UploadFile = File(...),
    level: str = "balanced",
):
    """
    Compress a PDF file using qpdf and/or Ghostscript.
    
    - level: "low", "balanced", "strong"
    - Returns compressed PDF with metadata headers.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(413, f"File exceeds maximum size of {MAX_FILE_SIZE // 1024 // 1024} MB")

    start_time = time.time()
    temp = TempDir()

    try:
        with temp as tmp:
            input_path = tmp / "input.pdf"
            output_path = tmp / "output.pdf"

            input_path.write_bytes(contents)

            await compress_pdf(input_path, output_path, level)

            if not output_path.exists():
                raise HTTPException(500, "Compression produced no output")

            output_bytes = output_path.read_bytes()
            original_size = len(contents)
            elapsed = time.time() - start_time

            logger.info(
                "Compressed %s: %d -> %d bytes (%.1f%%) in %.2fs",
                file.filename, original_size, len(output_bytes),
                (1 - len(output_bytes) / original_size) * 100 if original_size else 0,
                elapsed,
            )

            return Response(
                content=output_bytes,
                media_type="application/pdf",
                headers={
                    "X-Original-Size": str(original_size),
                    "X-Output-Size": str(len(output_bytes)),
                    "X-Compression-Method": level,
                    "X-Processing-Time": f"{elapsed:.2f}",
                },
            )
    except Exception as e:
        logger.error("Compression failed: %s", str(e))
        raise HTTPException(500, f"Compression failed: {str(e)}")


@app.post("/convert/docx")
async def convert_docx_endpoint(
    file: UploadFile = File(...),
):
    """
    Convert a PDF to DOCX using pdf2docx.
    Best-effort layout and text extraction.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(413, f"File exceeds maximum size of {MAX_FILE_SIZE // 1024 // 1024} MB")

    temp = TempDir()
    try:
        with temp as tmp:
            input_path = tmp / "input.pdf"
            output_path = tmp / "output.docx"

            input_path.write_bytes(contents)

            convert_to_docx(input_path, output_path)

            if not output_path.exists():
                raise HTTPException(500, "DOCX conversion produced no output")

            output_bytes = output_path.read_bytes()

            return Response(
                content=output_bytes,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={
                    "X-Original-Size": str(len(contents)),
                    "X-Output-Size": str(len(output_bytes)),
                },
            )
    except Exception as e:
        logger.error("DOCX conversion failed: %s", str(e))
        raise HTTPException(500, f"DOCX conversion failed: {str(e)}")


@app.post("/convert/pptx")
async def convert_pptx_endpoint(
    file: UploadFile = File(...),
):
    """
    Convert a PDF to PPTX with each page as a slide image.
    Uses PyMuPDF to render pages + python-pptx to create slides.
    Produces visual slide decks (not editable text).
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are accepted")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(413, f"File exceeds maximum size of {MAX_FILE_SIZE // 1024 // 1024} MB")

    temp = TempDir()
    try:
        with temp as tmp:
            input_path = tmp / "input.pdf"
            output_path = tmp / "output.pptx"

            input_path.write_bytes(contents)

            convert_to_pptx(input_path, output_path)

            if not output_path.exists():
                raise HTTPException(500, "PPTX conversion produced no output")

            output_bytes = output_path.read_bytes()

            return Response(
                content=output_bytes,
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                headers={
                    "X-Original-Size": str(len(contents)),
                    "X-Output-Size": str(len(output_bytes)),
                },
            )
    except Exception as e:
        logger.error("PPTX conversion failed: %s", str(e))
        raise HTTPException(500, f"PPTX conversion failed: {str(e)}")

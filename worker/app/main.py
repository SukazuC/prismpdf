import logging
import os
import time

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

from app.operations.compress import compress_pdf
from app.operations.convert_docx import convert_to_docx
from app.operations.convert_pptx import convert_to_pptx
from app.utils.filenames import output_filename
from app.utils.tempfiles import TempDir

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="PrismPDF Worker",
    description="Server-side PDF processing for compression and Office conversions",
    version="0.1.0",
)

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,https://prispdf.vercel.app"
)
allowed_origins = [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Length", "Content-Type",
                     "X-Original-Size", "X-Output-Size", "X-Compression-Method",
                     "X-Compression-Status", "X-Processing-Time"],
)


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

            result = await compress_pdf(input_path, output_path, level)

            if not output_path.exists():
                raise HTTPException(500, "Compression produced no output")

            output_bytes = output_path.read_bytes()
            elapsed = time.time() - start_time

            logger.info(
                "endpoint=/compress original_size=%d output_size=%d status=%s method=%s elapsed=%.2fs",
                result["original_size"], len(output_bytes), result["status"], result["method"],
                elapsed,
            )
            response_name = output_filename(file.filename, "pdf", prefix="compressed-")

            return Response(
                content=output_bytes,
                media_type="application/pdf",
                headers={
                    "Content-Disposition": f'attachment; filename="{response_name}"',
                    "X-Original-Size": str(result["original_size"]),
                    "X-Output-Size": str(len(output_bytes)),
                    "X-Compression-Method": result["method"],
                    "X-Compression-Status": result["status"],
                    "X-Processing-Time": f"{elapsed:.2f}",
                },
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(
            "endpoint=/compress original_size=%d output_size=0 status=failed method=none elapsed=%.2fs",
            len(contents), time.time() - start_time,
        )
        raise HTTPException(500, "Compression failed. Please try another PDF or compression level.") from e


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

    start_time = time.time()
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
            elapsed = time.time() - start_time
            logger.info(
                "endpoint=/convert/docx original_size=%d output_size=%d status=converted method=pdf2docx elapsed=%.2fs",
                len(contents), len(output_bytes), elapsed,
            )
            response_name = output_filename(file.filename, "docx")

            return Response(
                content=output_bytes,
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={
                    "Content-Disposition": f'attachment; filename="{response_name}"',
                    "X-Original-Size": str(len(contents)),
                    "X-Output-Size": str(len(output_bytes)),
                },
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(
            "endpoint=/convert/docx original_size=%d output_size=0 status=failed method=pdf2docx elapsed=%.2fs",
            len(contents), time.time() - start_time,
        )
        raise HTTPException(500, "DOCX conversion failed. Please try another PDF.") from e


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

    start_time = time.time()
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
            elapsed = time.time() - start_time
            logger.info(
                "endpoint=/convert/pptx original_size=%d output_size=%d status=converted method=pymupdf-pptx elapsed=%.2fs",
                len(contents), len(output_bytes), elapsed,
            )
            response_name = output_filename(file.filename, "pptx")

            return Response(
                content=output_bytes,
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                headers={
                    "Content-Disposition": f'attachment; filename="{response_name}"',
                    "X-Original-Size": str(len(contents)),
                    "X-Output-Size": str(len(output_bytes)),
                },
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(
            "endpoint=/convert/pptx original_size=%d output_size=0 status=failed method=pymupdf-pptx elapsed=%.2fs",
            len(contents), time.time() - start_time,
        )
        raise HTTPException(500, "PPTX conversion failed. Please try another PDF.") from e

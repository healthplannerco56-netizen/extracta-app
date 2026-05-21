"""Extract raw text and metadata from a PDF binary."""
import io
from typing import List

try:
    import pdfplumber
    _BACKEND = "pdfplumber"
except ImportError:
    _BACKEND = "none"


def extract_text(pdf_bytes: bytes) -> List[str]:
    """Return a list of text strings, one per page."""
    if _BACKEND == "pdfplumber":
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            return [page.extract_text() or "" for page in pdf.pages]
    return []


def extract_metadata(pdf_bytes: bytes) -> dict:
    if _BACKEND == "pdfplumber":
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            return pdf.metadata or {}
    return {}

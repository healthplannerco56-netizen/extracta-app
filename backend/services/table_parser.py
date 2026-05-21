"""Extract tables from PDF pages."""
import io
from typing import List

try:
    import pdfplumber
    _HAS_PLUMBER = True
except ImportError:
    _HAS_PLUMBER = False


def extract_tables(pdf_bytes: bytes) -> List[List[List[str]]]:
    """Return all tables found across all pages."""
    if not _HAS_PLUMBER:
        return []
    tables = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            for table in page.extract_tables():
                tables.append([[cell or "" for cell in row] for row in table])
    return tables

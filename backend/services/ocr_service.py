"""OCR fallback for scanned / image-only PDFs."""
from typing import List


def ocr_pdf(pdf_bytes: bytes) -> List[str]:
    """Return OCR text per page. Requires pytesseract + pdf2image."""
    try:
        from pdf2image import convert_from_bytes
        import pytesseract

        images = convert_from_bytes(pdf_bytes)
        return [pytesseract.image_to_string(img) for img in images]
    except ImportError:
        return []

"""Orchestrates the full extraction pipeline for a single study."""
import json
from services.pdf_parser import extract_text
from services.table_parser import extract_tables
from services.ocr_service import ocr_pdf
from services.chunker import chunk_pages
from services.claude_client import extract_fields
from services.validator import validate_fields
from pathlib import Path


def load_prompt(name: str) -> str:
    path = Path(__file__).parent.parent / "prompts" / f"{name}.txt"
    return path.read_text()


async def run_extraction(pdf_bytes: bytes, study_id: str) -> dict:
    pages = extract_text(pdf_bytes)

    # Fallback to OCR if no text extracted
    if not any(pages):
        pages = ocr_pdf(pdf_bytes)

    chunks = chunk_pages(pages)
    prompt = load_prompt("extraction_prompt")

    raw_fields: list = []
    for chunk in chunks:
        raw = extract_fields(chunk, prompt)
        try:
            parsed = json.loads(raw)
            raw_fields.extend(parsed if isinstance(parsed, list) else [parsed])
        except json.JSONDecodeError:
            pass

    tables = extract_tables(pdf_bytes)
    validated = validate_fields(raw_fields)

    return {
        "studyId": study_id,
        "fields": validated,
        "tableCount": len(tables),
    }

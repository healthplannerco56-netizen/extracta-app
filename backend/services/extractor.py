"""Orchestrates the extraction pipeline for a single PDF."""
import json
from pathlib import Path

from services.chunker import chunk_pages
from services.claude_client import extract_fields
from services.pdf_parser import extract_text
from services.validator import validate_fields

PROMPTS_DIR = Path(__file__).parent.parent / "prompts"


def load_prompt(name: str) -> str:
    return (PROMPTS_DIR / f"{name}.txt").read_text()


def run_extraction(pdf_path: Path) -> dict:
    """Extract structured fields from a PDF file on disk."""
    pages = extract_text(pdf_path.read_bytes())
    chunks = chunk_pages(pages)
    prompt = load_prompt("extraction")

    raw_fields: list = []
    for chunk in chunks:
        raw = extract_fields(chunk, prompt)
        try:
            parsed = json.loads(raw)
            if isinstance(parsed, list):
                raw_fields.extend(parsed)
            elif isinstance(parsed, dict):
                raw_fields.append(parsed)
        except json.JSONDecodeError:
            continue

    return {
        "fields": validate_fields(raw_fields),
        "chunkCount": len(chunks),
        "pageCount": len(pages),
    }

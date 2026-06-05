"""Async extraction job. Result is written to the in-process store via callback."""
import json
import traceback
from pathlib import Path
from typing import Callable

from services.extractor import run_extraction


def run_extraction_job(
    job_id: str,
    study_id: str,
    pdf_path: Path,
    on_update: Callable[[str, dict], None] | None = None,
    on_result: Callable[[str, dict], None] | None = None,
) -> None:
    """Run the pipeline for a single PDF. Notifies via callbacks at each stage."""
    def update(payload: dict) -> None:
        if on_update:
            on_update(job_id, payload)

    def save_result(payload: dict) -> None:
        if on_result:
            on_result(study_id, payload)

    update({"status": "running", "progress": 10})
    try:
        result = run_extraction(pdf_path)
        result["studyId"] = study_id
        save_result(result)
        update({"status": "done", "progress": 100, "studyId": study_id})
    except Exception as exc:
        update({"status": "failed", "error": str(exc), "trace": traceback.format_exc()})

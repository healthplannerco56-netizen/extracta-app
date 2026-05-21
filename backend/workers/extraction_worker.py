"""Background extraction job runner."""
import uuid
from workers.queue import set_job
from services.extractor import run_extraction
import asyncio


async def run_extraction_job(job_id: str, pdf_bytes: bytes, filename: str) -> None:
    set_job(job_id, {"status": "running", "progress": 0})
    try:
        study_id = str(uuid.uuid4())
        result = await run_extraction(pdf_bytes, study_id)
        set_job(job_id, {"status": "done", "progress": 100, "studyId": study_id, **result})
    except Exception as exc:
        set_job(job_id, {"status": "failed", "error": str(exc)})

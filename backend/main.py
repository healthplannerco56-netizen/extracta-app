from contextlib import asynccontextmanager
import json
import os
import uuid
from pathlib import Path

from fastapi import BackgroundTasks, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

from schemas.extraction_schema import ExtractionResult
from workers.extraction_worker import run_extraction_job

STORAGE_ROOT = Path(__file__).parent / "storage"
UPLOADS_DIR = STORAGE_ROOT / "uploads"
EXPORTS_DIR = STORAGE_ROOT / "exports"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
EXPORTS_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="Extracta API", version="0.1.0", lifespan=lifespan)

cors_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization"],
)

# In-memory job store. Swap for Redis/Postgres in production.
_jobs: dict[str, dict] = {}
_results: dict[str, dict] = {}


def _update_job(job_id: str, payload: dict) -> None:
    _jobs[job_id] = {**_jobs.get(job_id, {}), **payload}


def _save_result(study_id: str, payload: dict) -> None:
    _results[study_id] = payload


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(400, "Only PDF files are accepted")

    job_id = str(uuid.uuid4())
    study_id = str(uuid.uuid4())
    upload_path = UPLOADS_DIR / f"{study_id}.pdf"
    contents = await file.read()
    upload_path.write_bytes(contents)

    _jobs[job_id] = {"status": "queued", "studyId": study_id, "filename": file.filename}
    background_tasks.add_task(
        run_extraction_job,
        job_id=job_id,
        study_id=study_id,
        pdf_path=upload_path,
        on_update=_update_job,
        on_result=_save_result,
    )

    return {"jobId": job_id, "studyId": study_id, "status": "queued"}


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: str):
    job = _jobs.get(job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job


@app.get("/api/extractions/{study_id}")
async def get_extraction(study_id: str):
    result = _results.get(study_id)
    if not result:
        raise HTTPException(404, "Extraction not found")
    return result


@app.get("/api/extractions/{study_id}/export")
async def export_extraction(study_id: str):
    result = _results.get(study_id)
    if not result:
        raise HTTPException(404, "Extraction not found")
    export_path = EXPORTS_DIR / f"{study_id}.json"
    export_path.write_text(json.dumps(result, indent=2))
    return FileResponse(
        export_path,
        media_type="application/json",
        filename=f"{study_id}.json",
    )

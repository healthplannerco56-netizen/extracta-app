from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from workers.extraction_worker import run_extraction_job
import uuid

router = APIRouter()

@router.post("")
async def upload_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    job_id = str(uuid.uuid4())
    contents = await file.read()
    background_tasks.add_task(run_extraction_job, job_id, contents, file.filename)
    return {"jobId": job_id, "status": "queued"}

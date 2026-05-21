from pydantic import BaseModel
from typing import Optional


class UploadResponse(BaseModel):
    job_id: str
    status: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: Optional[int] = None
    study_id: Optional[str] = None
    error: Optional[str] = None

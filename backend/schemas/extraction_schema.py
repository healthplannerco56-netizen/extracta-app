from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum


class FieldStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class ExtractionField(BaseModel):
    key: str
    label: str
    value: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    status: FieldStatus = FieldStatus.pending
    source: Optional[str] = "text"
    page_number: Optional[int] = None


class ExtractionResult(BaseModel):
    study_id: str
    project_id: Optional[str] = None
    pdf_url: Optional[str] = None
    fields: List[ExtractionField] = []
    extracted_at: str
    validated_at: Optional[str] = None

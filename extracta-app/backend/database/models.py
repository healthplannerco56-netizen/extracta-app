"""SQLAlchemy / SQLModel ORM models (for production PostgreSQL)."""

# Uncomment when switching to a real DB:
# from sqlmodel import Field, SQLModel
# from typing import Optional
# from datetime import datetime

# class Extraction(SQLModel, table=True):
#     id: Optional[int] = Field(default=None, primary_key=True)
#     study_id: str = Field(index=True, unique=True)
#     project_id: Optional[str] = None
#     fields_json: str             # JSON blob of ExtractionField list
#     extracted_at: datetime
#     validated_at: Optional[datetime] = None

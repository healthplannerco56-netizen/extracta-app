from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from database.db import get_extraction
from services.exporter import export_to_csv
import io

router = APIRouter()

@router.get("/{study_id}")
async def get_extraction_route(study_id: str):
    extraction = await get_extraction(study_id)
    if not extraction:
        raise HTTPException(404, "Extraction not found")
    return extraction

@router.get("/{study_id}/export")
async def export_csv(study_id: str):
    extraction = await get_extraction(study_id)
    if not extraction:
        raise HTTPException(404, "Extraction not found")
    csv_content = export_to_csv(extraction)
    return StreamingResponse(
        io.StringIO(csv_content),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={study_id}.csv"}
    )

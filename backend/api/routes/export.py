from fastapi import APIRouter
router = APIRouter()

@router.get("/{study_id}/csv")
async def export_study_csv(study_id: str):
    return {"message": f"Exporting {study_id}"}

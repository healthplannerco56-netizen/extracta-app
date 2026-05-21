from pydantic import BaseModel


class ValidationResult(BaseModel):
    is_valid: bool
    confidence: float
    reason: str

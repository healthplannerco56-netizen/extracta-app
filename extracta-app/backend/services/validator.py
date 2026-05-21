"""Post-process and score extracted fields."""
from typing import List


def validate_fields(raw_fields: list) -> List[dict]:
    validated = []
    for f in raw_fields:
        if not isinstance(f, dict):
            continue
        key = f.get("key", "")
        value = f.get("value")
        confidence = float(f.get("confidence", 0.5))
        validated.append({
            "key": key,
            "label": f.get("label", key.replace("_", " ").title()),
            "value": value,
            "confidence": min(max(confidence, 0.0), 1.0),
            "status": "pending",
            "source": f.get("source", "text"),
            "pageNumber": f.get("pageNumber"),
        })
    return validated

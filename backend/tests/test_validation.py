from services.validator import validate_fields


def test_validate_fields_basic():
    raw = [{"key": "sample_size", "label": "Sample Size", "value": "120", "confidence": 0.9}]
    result = validate_fields(raw)
    assert len(result) == 1
    assert result[0]["status"] == "pending"
    assert result[0]["confidence"] == 0.9


def test_validate_fields_clamps_confidence():
    raw = [{"key": "p_value", "value": "0.05", "confidence": 1.5}]
    result = validate_fields(raw)
    assert result[0]["confidence"] == 1.0

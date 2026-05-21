import pytest
from services.extractor import run_extraction


@pytest.mark.asyncio
async def test_run_extraction_empty_pdf():
    result = await run_extraction(b"", study_id="test-001")
    assert "fields" in result
    assert isinstance(result["fields"], list)

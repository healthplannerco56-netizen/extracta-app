from services.chunker import chunk_pages


def test_chunk_pages_single():
    pages = ["page one content"]
    chunks = chunk_pages(pages)
    assert len(chunks) == 1


def test_chunk_pages_splits_large():
    pages = ["x" * 5000, "y" * 5000]
    chunks = chunk_pages(pages, max_chars=8000)
    assert len(chunks) == 2


def test_chunk_pages_merges_small():
    pages = ["short"] * 10
    chunks = chunk_pages(pages, max_chars=8000)
    assert len(chunks) == 1

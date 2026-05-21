"""Split extracted text into chunks suitable for Claude context window."""
from typing import List


def chunk_pages(pages: List[str], max_chars: int = 8000) -> List[str]:
    """Merge pages into chunks ≤ max_chars characters."""
    chunks: List[str] = []
    current = ""
    for page in pages:
        if len(current) + len(page) + 1 > max_chars:
            if current:
                chunks.append(current.strip())
            current = page
        else:
            current = f"{current}\n{page}" if current else page
    if current:
        chunks.append(current.strip())
    return chunks

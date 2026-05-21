"""Retry failed chunks with exponential back-off."""
import asyncio
from typing import Callable, Any


async def retry(fn: Callable, *args, retries: int = 3, delay: float = 2.0, **kwargs) -> Any:
    for attempt in range(retries):
        try:
            return await fn(*args, **kwargs)
        except Exception as exc:
            if attempt == retries - 1:
                raise
            await asyncio.sleep(delay * (2 ** attempt))

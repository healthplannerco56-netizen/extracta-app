"""Database connection + simple async helpers (SQLite via aiosqlite for dev)."""
import os
import json
from pathlib import Path

# In-memory store for dev — swap for PostgreSQL (asyncpg) in production
_store: dict = {}


async def init_db():
    """Called on startup. Runs migrations in production."""
    pass


async def save_extraction(study_id: str, data: dict) -> None:
    _store[study_id] = data


async def get_extraction(study_id: str) -> dict | None:
    return _store.get(study_id)

"""
Job queue setup.
Default: in-memory dict for dev. Swap for Redis + RQ or Celery in production.
"""
from typing import Dict, Any

_jobs: Dict[str, Any] = {}


def set_job(job_id: str, data: dict) -> None:
    _jobs[job_id] = data


def get_job(job_id: str) -> dict | None:
    return _jobs.get(job_id)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from api.routes import auth, upload, extraction, projects, export
from database.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="Extracta API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/auth",        tags=["auth"])
app.include_router(upload.router,     prefix="/api/upload",      tags=["upload"])
app.include_router(extraction.router, prefix="/api/extractions", tags=["extraction"])
app.include_router(projects.router,   prefix="/api/projects",    tags=["projects"])
app.include_router(export.router,     prefix="/api/export",      tags=["export"])


@app.get("/health")
async def health():
    return {"status": "ok"}

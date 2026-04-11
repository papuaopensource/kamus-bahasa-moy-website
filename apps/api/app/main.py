from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.routers import dictionary, songs
from app.database import Base, engine, get_db

from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Kamus Bahasa Moy API",
    description="API untuk kamus dan lirik lagu Bahasa Moy",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(dictionary.router)
app.include_router(songs.router)


@app.get("/")
async def root():
    return {"message": "Kamus Bahasa Moy API is running"}


@app.get("/health")
async def health(db: Session = Depends(get_db)):
    try:
        # Check database connection
        db.execute(text("SELECT 1"))
        return {"status": "ok", "database_status": "up"}
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={"status": "error", "database_status": "down", "message": str(e)},
        )

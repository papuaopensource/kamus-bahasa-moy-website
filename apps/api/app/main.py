from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.database import engine, Base
from app.routers import dictionary, songs

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Kamus Bahasa Moy API",
    description="API untuk kamus dan lirik lagu Bahasa Moy",
    version="0.1.0",
)

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:4321").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(dictionary.router)
app.include_router(songs.router)


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

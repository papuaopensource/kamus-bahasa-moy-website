from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routers import dictionary, songs

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


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}

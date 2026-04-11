from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.song import Song
from app.schemas.song import SongDetail, SongSummary

router = APIRouter(prefix="/songs", tags=["songs"])


@router.get("", response_model=list[SongSummary])
def list_songs(db: Session = Depends(get_db)):
    return db.query(Song).order_by(Song.title).all()


@router.get("/{song_id}", response_model=SongDetail)
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(Song).filter(Song.id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Lagu tidak ditemukan")
    return song

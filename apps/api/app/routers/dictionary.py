from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.dictionary import Word
from app.schemas.dictionary import WordSummary, WordDetail

router = APIRouter(prefix="/dictionary", tags=["dictionary"])


@router.get("", response_model=list[WordSummary])
def list_words(
    q: str | None = Query(None, description="Cari kata"),
    word_class_id: int | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(Word)
    if q:
        query = query.filter(Word.text.ilike(f"%{q}%"))
    if word_class_id:
        query = query.filter(Word.word_class_id == word_class_id)
    return query.order_by(Word.text).offset(skip).limit(limit).all()


@router.get("/{word_id}", response_model=WordDetail)
def get_word(word_id: int, db: Session = Depends(get_db)):
    word = db.query(Word).filter(Word.id == word_id).first()
    if not word:
        raise HTTPException(status_code=404, detail="Kata tidak ditemukan")
    return word

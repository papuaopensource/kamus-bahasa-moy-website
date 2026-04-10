from sqlalchemy import Column, Integer, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class Song(Base):
    __tablename__ = "songs"

    id = Column(Integer, primary_key=True)
    title = Column(String, nullable=False)
    composer = Column(String, nullable=True)
    description = Column(String, nullable=True)

    verses = relationship("Verse", back_populates="song", cascade="all, delete-orphan", order_by="Verse.order")


class Verse(Base):
    __tablename__ = "verses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    song_id = Column(Integer, ForeignKey("songs.id"), nullable=False)
    type = Column(String, nullable=False)
    content = Column(JSON, nullable=False)
    order = Column(Integer, nullable=False)

    song = relationship("Song", back_populates="verses")

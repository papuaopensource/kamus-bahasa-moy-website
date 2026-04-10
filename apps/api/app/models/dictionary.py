from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base

word_related = Table(
    "word_related",
    Base.metadata,
    Column("word_id", Integer, ForeignKey("words.id"), primary_key=True),
    Column("related_word_id", Integer, ForeignKey("words.id"), primary_key=True),
)


class WordClass(Base):
    __tablename__ = "word_classes"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    abbreviation = Column(String, nullable=False)

    words = relationship("Word", back_populates="word_class")


class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)

    words = relationship("Word", back_populates="language")


class Meaning(Base):
    __tablename__ = "meanings"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=False)

    word = relationship("Word", back_populates="meanings")


class Word(Base):
    __tablename__ = "words"

    id = Column(Integer, primary_key=True)
    text = Column(String, nullable=False, index=True)
    pronunciation = Column(String)
    definition = Column(String)
    example_original = Column(String)
    example_translation = Column(String)
    word_class_id = Column(Integer, ForeignKey("word_classes.id"))
    language_id = Column(Integer, ForeignKey("languages.id"))

    word_class = relationship("WordClass", back_populates="words")
    language = relationship("Language", back_populates="words")
    meanings = relationship("Meaning", back_populates="word", cascade="all, delete-orphan")
    related_words = relationship(
        "Word",
        secondary=word_related,
        primaryjoin=id == word_related.c.word_id,
        secondaryjoin=id == word_related.c.related_word_id,
    )

"""
Seed script: baca dictionary.json dan songs.json, lalu isi database SQLite.
Jalankan dari direktori apps/api:

    uv run python scripts/seed.py
"""

import json
import os
import sys
from pathlib import Path

# Ensure apps/api root is in sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv

load_dotenv()

from app.database import SessionLocal, engine, Base
from app.models.dictionary import Language, WordClass, Word, Meaning, word_related
from app.models.song import Song, Verse

BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"

DICTIONARY_PATH = DATA_DIR / "dictionary.json"
SONGS_PATH = DATA_DIR / "songs.json"


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        print("Membersihkan data lama...")
        db.execute(word_related.delete())
        db.query(Verse).delete()
        db.query(Song).delete()
        db.query(Meaning).delete()
        db.query(Word).delete()
        db.query(WordClass).delete()
        db.query(Language).delete()
        db.commit()

        # --- Dictionary ---
        print(f"Membaca {DICTIONARY_PATH}...")
        with open(DICTIONARY_PATH, encoding="utf-8") as f:
            words_data = json.load(f)

        # Collect unique WordClass and Language entries
        word_classes: dict[int, WordClass] = {}
        languages: dict[int, Language] = {}

        for entry in words_data:
            wc = entry.get("word_class_id")
            if wc and wc["id"] not in word_classes:
                word_classes[wc["id"]] = WordClass(
                    id=wc["id"],
                    name=wc["name"],
                    abbreviation=wc["abbreviation"],
                )

            lang = entry.get("language_id")
            if lang and lang["id"] not in languages:
                languages[lang["id"]] = Language(id=lang["id"], name=lang["name"])

        db.add_all(word_classes.values())
        db.add_all(languages.values())
        db.flush()

        print(f"Menyimpan {len(words_data)} kata...")
        words_by_id: dict[int, Word] = {}
        for entry in words_data:
            wc = entry.get("word_class_id")
            lang = entry.get("language_id")
            word = Word(
                id=entry["id"],
                text=entry["text"],
                pronunciation=entry.get("pronunciation"),
                definition=entry.get("definition"),
                example_original=entry.get("example_original"),
                example_translation=entry.get("example_translation"),
                word_class_id=wc["id"] if wc else None,
                language_id=lang["id"] if lang else None,
            )
            db.add(word)
            words_by_id[word.id] = word

            for m in entry.get("meanings", []):
                db.add(Meaning(name=m.get("name") or None, word_id=word.id))

        db.flush()

        # Insert related_words associations
        seen_pairs: set[tuple[int, int]] = set()
        for entry in words_data:
            for related_id in entry.get("related_words", []):
                if related_id not in words_by_id:
                    continue
                pair = (entry["id"], related_id)
                if pair not in seen_pairs:
                    seen_pairs.add(pair)
                    db.execute(
                        word_related.insert().values(
                            word_id=entry["id"], related_word_id=related_id
                        )
                    )

        db.commit()
        print(f"  → {len(words_data)} kata, {len(seen_pairs)} relasi kata terkait disimpan.")

        # --- Songs ---
        print(f"Membaca {SONGS_PATH}...")
        with open(SONGS_PATH, encoding="utf-8") as f:
            songs_data = json.load(f)["songs"]

        print(f"Menyimpan {len(songs_data)} lagu...")
        for song_entry in songs_data:
            song = Song(
                id=song_entry["id"],
                title=song_entry["title"],
                composer=song_entry.get("composer"),
                description=song_entry.get("description"),
            )
            db.add(song)
            db.flush()

            for order, lyric in enumerate(song_entry.get("lyrics", [])):
                db.add(
                    Verse(
                        song_id=song.id,
                        type=lyric["type"],
                        content=lyric["content"],
                        order=order,
                    )
                )

        db.commit()
        print(f"  → {len(songs_data)} lagu disimpan.")
        print("Selesai.")

    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()

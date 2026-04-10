from pydantic import BaseModel


class VerseOut(BaseModel):
    type: str
    content: list[str]
    order: int

    model_config = {"from_attributes": True}


class SongSummary(BaseModel):
    id: int
    title: str
    composer: str | None
    description: str | None

    model_config = {"from_attributes": True}


class SongDetail(SongSummary):
    verses: list[VerseOut]

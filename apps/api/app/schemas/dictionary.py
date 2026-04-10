from pydantic import BaseModel


class MeaningOut(BaseModel):
    id: int
    name: str | None

    model_config = {"from_attributes": True}


class WordClassOut(BaseModel):
    id: int
    name: str
    abbreviation: str

    model_config = {"from_attributes": True}


class LanguageOut(BaseModel):
    id: int
    name: str

    model_config = {"from_attributes": True}


class WordSummary(BaseModel):
    id: int
    text: str
    pronunciation: str | None
    meanings: list[MeaningOut]
    word_class: WordClassOut | None
    language: LanguageOut | None

    model_config = {"from_attributes": True}


class WordDetail(WordSummary):
    definition: str | None
    example_original: str | None
    example_translation: str | None
    related_words: list[WordSummary]

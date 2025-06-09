from pydantic import BaseModel, Field, EmailStr, HttpUrl, ConfigDict
from typing import List, Optional
from datetime import datetime

class Location(BaseModel):
    country: str = Field(..., max_length=50)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)

class Genre(BaseModel):
    genre_id: str = Field(..., max_length=50)
    name: str = Field(..., max_length=100)
    model_config = ConfigDict(from_attributes=True) # Enables ORM mode for seamless conversion

class AnimeSmallResponse(BaseModel):
    anime_id: str
    anime_name: str
    image_url: Optional[HttpUrl] = None
    model_config = ConfigDict(from_attributes=True)

class AnimeCreate(BaseModel):
    anime_name: str = Field(..., max_length=255)
    genre_ids: List[str] = Field([])
    is_adult_rated: bool = False
    is_running: bool = True
    release_date: datetime
    description: Optional[str] = Field(None, max_length=500)
    image_url: Optional[HttpUrl] = None
    trailer_url: Optional[HttpUrl] = None
    studio: Optional[str] = Field(None, max_length=255)

class AnimeResponse(BaseModel):
    anime_id: str
    anime_name: str
    genres: List[Genre] = Field([])
    is_adult_rated: bool
    is_running: bool
    release_date: datetime
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    trailer_url: Optional[HttpUrl] = None
    studio: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class UserCreate(BaseModel):
    user_id: str = Field(..., max_length=32)
    email: EmailStr
    password: str = Field(..., min_length=8)
    location: Location

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserTinyResponse(BaseModel):
    user_id: str
    email: EmailStr
    model_config = ConfigDict(from_attributes=True)

class UserResponse(BaseModel):
    user_id: str
    email: EmailStr
    location: Location
    watched_anime: List[AnimeSmallResponse] = Field([])
    watching_anime: List[AnimeSmallResponse] = Field([])
    model_config = ConfigDict(from_attributes=True)

class RatingCreate(BaseModel):
    user_id: str
    anime_id: str
    score: int = Field(..., ge=1, le=10)
    review_text: Optional[str] = Field(None, max_length=1000)

class RatingResponse(BaseModel):
    rating_id: str
    user: UserTinyResponse
    anime: AnimeSmallResponse
    score: int
    review_text: Optional[str] = None
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)
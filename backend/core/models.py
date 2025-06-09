from pydantic import BaseModel, Field, EmailStr, HttpUrl, ConfigDict
from typing import List, Optional
from datetime import datetime

#Parent models
class LocationTable(BaseModel):
    locationId: int
    country: str = Field(..., max_length=50)
    city: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    model_config = ConfigDict(from_attributes=True)

class GenreTable(BaseModel):
    genreId: int
    name: str = Field(..., max_length=100)
    model_config = ConfigDict(from_attributes=True) 


class AnimeCreate(BaseModel):
    animeName: str = Field(..., max_length=255)
    genreIds: List[str] = Field([])
    is_adult_rated: bool = False
    is_running: bool = True
    release_date: datetime
    description: Optional[str] = Field(None, max_length=500)
    image_url: Optional[HttpUrl] = None
    trailer_url: Optional[HttpUrl] = None
    studio: Optional[str] = Field(None, max_length=255)


#Derived Models
class AnimeListForUser(BaseModel):
    animeId: int
    animeName: str
    model_config = ConfigDict(from_attributes=True)

#The anime Table
class AnimeTable(BaseModel):
    animeId: int
    animeName: str
    genres: List[GenreTable] = Field([])
    is_adult_rated: bool
    is_running: bool
    release_date: datetime
    description: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    trailer_url: Optional[HttpUrl] = None
    studio: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class UserBasicCreate(BaseModel):
    user_id: int
    email: EmailStr
    password: str = Field(..., min_length=8)
    location: str

#UserRefined to be used in Dashboard for abstraction
class UsersTable(BaseModel):
    userCredentials: UserBasicCreate
    location: LocationTable
    watched_anime: List[str] = Field(None)
    watching_anime: List[str] = Field(None)
    model_config = ConfigDict(from_attributes=True)

class UserDashBoard(BaseModel):
    user: UsersTable
    location: LocationTable
    watched_anime: List[AnimeListForUser] = Field([])
    watching_anime: List[AnimeListForUser] = Field([])
    model_config = ConfigDict(from_attributes=True)

#A rating created by the user
class RatingCreateModel(BaseModel):
    userId: int
    animeId: int
    score: int = Field(..., ge=1, le=10)
    review_text: Optional[str] = Field(None, max_length=1000)

class RatingsTable(BaseModel):
    ratingId: int
    user: UsersTable
    anime: AnimeListForUser
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
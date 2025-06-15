from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, ARRAY, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.schema import PrimaryKeyConstraint # For composite primary keys
from datetime import datetime
from .database import Base

# --- Database Models (SQLAlchemy ORM) ---

class Location(Base):
    __tablename__ = "locations"
    locationId = Column(Integer, primary_key=True, index=True)
    country = Column(String(50), nullable=False)
    city = Column(String(100))
    state = Column(String(100))

class Genre(Base):
    __tablename__ = "genres"
    genreId = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)

class Season(Base):
    __tablename__ = "seasons"
    animeId = Column(Integer, ForeignKey("anime.animeId"), nullable=False)
    seasonNumber = Column(Integer, nullable=False) # The sequential season number
    seasonName = Column(String(255))
    seasonInfo = Column(String(255))
    seasonTrailer = Column(String) # Storing HttpUrl as String in DB
    seasonImage = Column(String)   # Storing HttpUrl as String in DB

    # Define composite primary key using PrimaryKeyConstraint
    __table_args__ = (
        PrimaryKeyConstraint('animeId', 'seasonNumber', name='pk_season'),
    )

    # Relationship to Anime model
    anime = relationship("Anime", back_populates="seasons_data")

class Anime(Base):
    __tablename__ = "anime"
    animeId = Column(Integer, primary_key=True, index=True)
    animeName = Column(String, nullable=False, unique=True)
    genres = Column(ARRAY(Integer)) 
    is_adult_rated = Column(Boolean, default=False)
    is_running = Column(Boolean, default=True)
    releaseDate = Column(DateTime, nullable=False)
    seasons = Column(ARRAY(Integer)) 
    description = Column(String(500))
    image_url_base_anime = Column(String) 
    trailer_url_base_anime = Column(String) 
    studio = Column(String)

    # Relationship to Season model (to fetch actual Season objects)
    seasons_data = relationship("Season", back_populates="anime")

    # Relationship to Rating model (to fetch ratings for this anime)
    ratings = relationship("Rating", back_populates="anime_data")

class Rating(Base):
    __tablename__ = "ratings"
    ratingId = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("users.userId"), nullable=False)
    animeId = Column(Integer, ForeignKey("anime.animeId"), nullable=False)
    score = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.now) 
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now) 
    review_text = Column(String(1000))

    # Relationships to User and Anime models
    user_data = relationship("User", back_populates="ratings")
    anime_data = relationship("Anime", back_populates="ratings")

class User(Base):
    __tablename__ = "users"
    userId = Column(Integer, primary_key=True, index=True)
    userName = Column(String(32), nullable=False, unique=True)
    email = Column(String, nullable=False, unique=True)
    hashedPassword = Column(String, nullable=False) # Store hashed passwords, not plain text!
    profilePicture = Column(String) # Store HttpUrl as String
    watchedAnime = Column(ARRAY(Integer)) # PostgreSQL ARRAY for list of anime IDs
    watchingAnime = Column(ARRAY(Integer)) # PostgreSQL ARRAY for list of anime IDs
    anime_watched_count = Column(Integer, default=0)
    anime_watching_count = Column(Integer, default=0)
    locationId = Column(Integer, ForeignKey("locations.locationId"), nullable=False) 

    # Relationship to Location model
    location = relationship("Location")

    # Relationship to Rating model (to fetch ratings made by this user)
    ratings = relationship("Rating", back_populates="user_data")
from fastapi import FastAPI, Query, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from .database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import *
from .models import *
from .schemas import *

#Testing if application is working
app = FastAPI(

    title="Anime_Recommender",
    description="Centralised API for managing anime, users, ratings, genres, locations",
    version="1.0.0",
)

#For CORS

origins = [

    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(

    CORSMiddleware,
    allow_origins=origins,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

#Writing the core 5-6 API's and connecting them to frontend as well

@app.get("/")
def root():
    return {"message": "Welcome to Anime Recommendation system by Sarvesh. Pls login or sign up if ur a new user"}

#Return user info
@app.get("/u/{user_id}", response_model=UserInfo, status_code=status.HTTP_200_OK)
async def get_user_info(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).filter(User.userId == user_id))
    user = result.scalars().first()

    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id: {user_id} does not exist")
    
    watched_ids = user.watchedAnime
    watching_ids = user.watchingAnime

    watched_anime_list = await db.execute(select(Anime).where(Anime.animeId.in_(watched_ids))).scalars().all()
    watching_anime_list = await db.execute(select(Anime).where(Anime.animeId.in_(watching_ids))).scalars().all()
    

    userInfobj = UserInfo(

        userName = user.userName ,
        watchedAnime = watched_anime_list,  
        watchingAnime = watching_anime_list , 
        anime_watched_count = len(watched_anime_list), 
        anime_watching_count = len(watching_anime_list),
    )

    return userInfobj
    

#Return specific anime Info
@app.get("/anime/{anime_name}", response_model=AnimeGet, status_code=status.HTTP_200_OK)
async def get_anime_info(anime_name: str, db: AsyncSession = Depends(get_db)):
    
    proc = await db.execute(select(Anime).where(Anime.animeName == anime_name))
    query_result = proc.scalars().first()
    
    if query_result is None: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anime {anime_name} not found")

    genre_ids = query_result.genres
    genre_list = await db.execute(select(Genre.name).where(Genre.id.in_(genre_ids)))
    genre_list = genre_list.scalars().all()

    season_nos = query_result.seasons
    season_list = await db.execute(select(Season).where(Season.seasonNumber.in_(season_nos)))
    season_list = season_list.scalars().all()

    animeGetObj = AnimeGet(

        animeId = query_result.animeId,
        animeName = query_result.animeName,
        genres = genre_list,
        is_adult_rated = query_result.is_adult_rated,
        is_running = query_result.is_running,
        releaseDate = query_result.releaseDate,
        seasons = season_list,
        description = query_result.description,
        image_url_base_anime = query_result.image_url_base_anime,
        trailer_url_base_anime = query_result.trailer_url_base_anime,
        studio = query_result.studio,
    )

    return animeGetObj

#Return the newest 5 animes as default
@app.get("/anime/newest-5")
def get_top5(newest: int = 5):
    pass

#Return the newest n animes as default
@app.get("/anime/newest/{count}")
def get_topn(count: int):
    pass

#Returns the top rated anime
@app.get("/anime/top-rated")
def get_user_info(userId: int ):
    pass

#Return user info
@app.get("/{userId}")
def get_user_info(userId: int ):
    pass


#For admin side ApiS

#Recommendation model APIs
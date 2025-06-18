from fastapi import FastAPI, Query, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from .database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import *
from .models import *
from .schemas import *
from utils import password_verifier, argon2_pwd_hasher

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
@app.get("/anime/top-rated", status_code=status.HTTP_200_OK)
async def get_top_rated(db: AsyncSession = Depends(get_db)) -> dict:
    
    """ The top rated anime would be decided by a custom rating system
    built on the ratings flagged as positive and not positive

    The Rating system would work on the ratio of positive to the total scores
    where positive score > 5

    Hencee the anime having this ratio as highest, would be flagged as top rated
    """

    sql_query_text = "SELECT animeId, animeName, COUNT(CASE WHEN score > 5 THEN 1 ELSE NULL END) * 100.0 / COUNT(score) AS ratio from anime join ratings using(animeId) group by animeId having count(score) > 0 order by ratio desc limit 1;"

    proc = await db.execute(text(sql_query_text))
    result = proc.scalars().first()

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anime not found")
    

    dict = {

        "animeName" : result.animeName,
        "releaseDate": result.releaseDate,
        "image_url_base_anime": result.image_url_base_anime,
        "Positivity Percentage": result.ratio
    }

    return dict

#Adding a new user on the site
@app.post("/signup", status_code=status.HTTP_200_OK)
async def get_user_info(user: UserBasicCreate, db: AsyncSession = Depends(get_db)):
    
    #After filling the form the user details from frontend are sent here
    if await db.execute(select(User).where(user.userName == User.userName)).scalars.first() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{user.userName} already exists so please create a different user name")
    
    if await db.execute(select(User).where(user.email == User.email)).scalars.first() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{user.email} is already tied to a username so use a different email for signup")
    
    hashed_password = argon2_pwd_hasher(user.password)

    user = User(

        userId = "",
        userName = user.userName, 
        email = "", 
        locationId = "",
        watchedAnime = [],
        watchingAnime = [],
        anime_watched_count = 0,
        anime_watching_count = 0,
        profilePicture = ""
    )

    try:
        db.add(user)
        await db.commit()
        await db.refresh(user)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Due to error: {e} caused hence the new user was not created hence please try again")
    
    return {"message": f"User {user.userName} created successfully and welcome to this Anime Recommendation system"}

#For admin side APIs

#Recommendation model APIs
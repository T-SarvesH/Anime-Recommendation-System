from fastapi import FastAPI, Query, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from .database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import *
from .models import *
from .schemas import *
from .utils import password_verifier, argon2_pwd_hasher, generate_uuid
from dotenv import load_dotenv
import os
import json
from recommendation_model.main_ml_model import main_recommendation_model

#Testing if application is working
app = FastAPI(

    title="Anime_Recommender",
    description="Centralised API for managing anime, users, ratings, genres, locations",
    version="1.0.0",
)

#For CORS
#Defined origins from where req would be sent / recieved

origins = [

    "https://localhost",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(

    CORSMiddleware,
    allow_origins=origins,
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

load_dotenv()
ADMIN_ID = os.environ.get("ADMIN_ID")

"""User APIs are declared here """

@app.get("/")
def root():
    return {"message": "Welcome to Anime Recommendation system by Sarvesh. Pls login or sign up if ur a new user"}

#Return user info
@app.get("/user/{user_id}", response_model=UserInfo, status_code=status.HTTP_200_OK)
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
    
""" Anime APIs are declared here """

#Return the newest 5 animes as default
@app.get("/newest-5-anime")
async def get_top_5(db: AsyncSession = Depends(get_db)):
    
    query = "SELECT * FROM anime ORDER BY releaseDate DESC LIMIT 5"
    result = await db.execute(text(query))

    return result.scalars().all()

#Return the newest n animes as default
@app.get("/anime/newest/{count}")
async def get_topn(count: int, db: AsyncSession = Depends(get_db)):
    
    query = await db.execute(select(Anime).order_by(Anime.releaseDate.desc()).limit(count))
    result = query.scalars().all()

    return result

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

#Get all anime
@app.get("/anime/all", status_code=status.HTTP_200_OK)
async def get_all_anime(db: AsyncSession = Depends(get_db)):

    query = await db.execute(select(Anime))
    results = query.scalars().all()

    print(results)
    if results is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No Anime found")
    list_of_animes = []
    
    for result in results:
        list_of_animes.append(

            browseAnime(
                animeName=result.animeName,
                image_url_base_anime=result.image_url_base_anime,
                animeId=result.animeId,
            )
        )
    return list_of_animes

#Get specific anime Info
@app.get("/anime/{anime_name}", response_model=AnimeGet, status_code=status.HTTP_200_OK)
async def get_anime_info(anime_name: str, db: AsyncSession = Depends(get_db)):
    
    proc = await db.execute(select(Anime).where(Anime.animeName == anime_name))
    query_result = proc.scalars().first()
    
    if query_result is None: 
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anime {anime_name} not found")

    genre_ids = query_result.genres
    genre_list = await db.execute(select(Genre.name).where(Genre.genreId.in_(genre_ids)))
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
        #seasons = season_list,
        description = query_result.description,
        image_url_base_anime = query_result.image_url_base_anime,
        trailer_url_base_anime = query_result.trailer_url_base_anime,
        studio = query_result.studio,
    )

    return animeGetObj

#Adding a new user on the site
@app.post("/signup", status_code=status.HTTP_200_OK)
async def get_user_info(user: UserBasicCreate, db: AsyncSession = Depends(get_db)):
    
    hashed_password = argon2_pwd_hasher(user.password)
    
    query = await db.execute(select(Location).where(Location.city == user.city).where(Location.state == user.state).where(Location.country == user.country))
    result = query.scalars().first()

    query2 = await db.execute(select(User.userId))
    result2 = query2.scalars().all()

    id_uuid = generate_uuid(result2)

    user = User(

        userId = id_uuid,
        userName = user.userName, 
        hashedPassword = hashed_password,
        email = user.email, 
        locationId = result.locationId,
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

#For user login
@app.post("/login", response_model=loginSuccess)
async def login(credentials: userLogin, db: AsyncSession = Depends(get_db)):

    user_query = await db.execute(select(User).filter((User.userName == credentials.userName_or_email) | (User.email == credentials.userName_or_email)))

    user = user_query.scalars().first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or email", headers={"WWW-Authenticate": "Bearer"},)

    if not password_verifier(credentials.password, user.hashedPassword):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password", headers={"WWW-Authenticate": "Bearer"},)

    return loginSuccess(userId=user.userId, userName=user.userName, email=user.email)

#Recommendation model output to be displayed on the recommendation dashboard
@app.get("/get_recommendations/{user_id}", status_code=status.HTTP_200_OK)
async def recommendations(user_id: int, db: AsyncSession = Depends(get_db)):
    
    recommendation_list = main_recommendation_model(user_id)
    animeSet = set()

    for recommendation in recommendation_list:
        for item in recommendation:
            animeSet.add(item)

    animeSet = list(animeSet)
    animeList = []

    for item in animeSet:

        query = await db.execute(select(Anime).where(Anime.animeId == item))
        result = query.scalars().first()
        animeList.append(result)

    #For ratings distribution
    query2 = await db.execute(select(Rating.score, func.count(Rating.score).label("ratingCount")).group_by(Rating.score).order_by(Rating.score))
    result2 = query2.all()

    ratings_distrib = {}

    for ratingScore, ratingCount in result2:
        ratings_distrib[ratingScore] = ratingCount
    
    for key , values in ratings_distrib.items():
        print(f"{key} ----> {values}")
    
    print()
    #For genre_anime_distribution
    query3 = await db.execute(select(Anime.genres))
    result3 = query3.scalars().all()

    genre_anime_distribution = {}

    for result in result3:
        
        for id in result:

            if id in genre_anime_distribution:
                genre_anime_distribution[id] += 1
            else:
                genre_anime_distribution[id] = 1

    genre_anime_distributionList = []
    for id, count in genre_anime_distribution.items():
        newQuery = await db.execute(select(Genre.name).where(Genre.genreId == id))
        result = newQuery.scalars().all()

        for name in result:
            genre_anime_distributionList.append({name: count})
    
    sql_query_text = "SELECT \"animeId\", \"animeName\", \"releaseDate\", COUNT(CASE WHEN score > 5 THEN 1 ELSE NULL END) * 100.0 / COUNT(score) AS \"ratio\", \"image_url_base_anime\" from anime join ratings using(\"animeId\") group by \"animeId\" having count(score) > 0 order by ratio desc limit 1;"

    proc = await db.execute(text(sql_query_text))
    result = proc.all()

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Anime not found")
    

    dict = {

        "animeName" : result[0][1],
        "releaseDate": result[0][2],
        "image_url_base_anime": result[0][4],
        "Positivity Percentage": result[0][3],
    }

    return {"recommendations": animeList, "ratings_distribution": ratings_distrib, "Genre_anime_distrib": genre_anime_distributionList, "most_popular_anime": dict, "message": f"Great Recommendations are generated for {user_id}"}

#For admin side APIs where ADMIN_ID is fetched from env to prevent unauthorized access
@app.post("/add_season", status_code=status.HTTP_200_OK)
async def add_season(seasonData: SeasonsCreate, db: AsyncSession = Depends(get_db)):

    seasonObj = Season(

        animeId = seasonData.animeId,
        seasonNumber = seasonData.seasonNumber,
        seasonName = seasonData.seasonName,
        seasonInfo = seasonData.seasonInfo,
        seasonTrailer = seasonData.seasonTrailer,
        seasonImage = seasonData.seasonImage,
    )

    try:
        db.add(seasonObj)
        await db.commit()
        await db.refresh(seasonObj)

    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Season couldn't be added")
    
    return {'message': f"Season for {seasonData.animeName} added successfully"}
    

#To add new genres
@app.post("/add_genre", status_code=status.HTTP_200_OK)
async def add_anime(genre: genreCreate, user_id: int = 8, db: AsyncSession = Depends(get_db)):
    
    if user_id != ADMIN_ID:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,detail=f"User is prohibited from doing this action")

    pass

#To get all genres
@app.get('/genres/all')
async def get_all_genres(db: AsyncSession = Depends(get_db)):

    query = await db.execute(select(Genre))
    result = query.scalars().all()

    return result

#To get all seasons
@app.get('/seasons/all')
async def get_all_genres(db: AsyncSession = Depends(get_db)):

    query = await db.execute(select(Season))
    result = query.scalars().all()

    return result


@app.get('/get_cities/{stateName}')
async def get_cities(stateName: str, db: AsyncSession = Depends(get_db)):

    query = await db.execute(select(distinct(Location.city)).where(Location.state == stateName).order_by(Location.city))
    results = query.scalars().all()

    return results

@app.get('/get_states/{countryName}')
async def get_states(countryName: str, db: AsyncSession = Depends(get_db)):
    
    result = await db.execute(
            select(distinct(Location.state))
            .filter(Location.country.ilike(countryName)) # Safe, parameterized query
            .order_by(Location.state) # Good for consistent dropdown order
        )
    states = result.scalars().all() # .scalars() extracts the first column of each row (the state name)

    if not states:
            
        print(f"No states found for country: {countryName}")
        return [] 

    print(f"Found states for {countryName}: {states}")
    return states

@app.get('/get_countries')
async def get_states(db: AsyncSession = Depends(get_db)):

    return ["India"]


#APIs for watching and watched anime

@app.patch("/add-to-watched-list/", status_code=status.HTTP_200_OK)
async def add_to_watched_list(animeListUpdate: AnimeListUpdate, db: AsyncSession = Depends(get_db)):

    query = await db.execute(select(User).where(User.userId == animeListUpdate.userId))
    results = query.scalars().first()

    # watchedList = results.watchedAnime if results.watchedAnime is not None else []
    # watchingList = results.watchingAnime if results.watchingAnime is not None else []

    #If anime already in watchedList
    if animeListUpdate.animeId in results.watchedAnime:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime already in watched list")
    
    #If anime in watchingList, we are basically removing from watchingList and adding to watchedList
    if animeListUpdate.animeId in results.watchingAnime:
        results.watchingAnime.remove(animeListUpdate.animeId)

    results.watchedAnime.append(animeListUpdate.animeId)
    # results.watchedAnime = watchedList

    try:
        db.add(results)
        await db.commit()
        await db.refresh(results)

    except Exception as e:
        print(f"Error adding to watched list for user: {e}") # Log error for debugging
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime couldn't be added to watchedlist")
    
    return {'message': "Anime added successfully to watch List"}

@app.patch("/add-to-watching-list/", status_code=status.HTTP_200_OK)
async def add_to_watching_list(animeListUpdate: AnimeListUpdate, db: AsyncSession = Depends(get_db)):

    query = await db.execute(select(User).where(User.userId == animeListUpdate.userId))
    results = query.scalars().first()

    # watchedList = results.watchedAnime if results.watchedAnime is not None else []
    # watchingList = results.watchingAnime if results.watchingAnime is not None else []

    #If anime already in watchedList
    if animeListUpdate.animeId in results.watchingAnime:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime already in watching list")
    
    #If anime in watchingList, we are basically removing from watchingList and adding to watchedList
    if animeListUpdate.animeId in results.watchedAnime:
        results.watchedAnime.remove(animeListUpdate.animeId)

    results.watchingAnime.append(animeListUpdate.animeId)
    # results.watchingAnime = watchingList

    try:
        db.add(results)
        await db.commit()
        await db.refresh(results)

    except Exception as e:
        print(f"Error adding to watching list for user {animeListUpdate.userId}: {e}") # Log error for debugging
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime couldn't be added to watching list")
    
    return {'message': "Anime added successfully to watching List"}


@app.patch("/remove-from-watched-list/", status_code=status.HTTP_200_OK)
async def remove_from_watched_list(animeListUpdate: AnimeListUpdate, db: AsyncSession = Depends(get_db)):

    query = await db.execute(select(User).where(User.userId == animeListUpdate.userId))
    results = query.scalars().first()

    # watchedList = results.watchedAnime if results.watchedAnime is not None else []

    #If anime already in watchedList
    if animeListUpdate.animeId in results.watchedAnime:
        results.watchedAnime.remove(animeListUpdate.animeId)
        # results.watchedAnime = watchedList
    
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime not in watched list")

    try:
        db.add(results)
        await db.commit()
        await db.refresh(results)

    except Exception as e:
        print(f"Error adding to watching list for user {animeListUpdate.userId}: {e}") # Log error for debugging
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime couldn't be removed to watching list")
    
    return {'message': "Anime removed successfully from watched List"}


@app.patch("/remove-from-watching-list/", status_code=status.HTTP_200_OK)
async def remove_from_watching_list(animeListUpdate: AnimeListUpdate, db: AsyncSession = Depends(get_db)):

    query = await db.execute(select(User).where(User.userId == animeListUpdate.userId))
    results = query.scalars().first()

    # watchingList = results.watchingAnime if results.watchingAnime is not None else []

    #If anime already in watchedList
    if animeListUpdate.animeId in results.watchingAnime:
       results.watchingAnime.remove(animeListUpdate.animeId)
    
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime not in watching list")

    try:
        db.add(results)
        await db.commit()
        await db.refresh(results)

    except Exception as e:
        print(f"Error adding to watching list for user {animeListUpdate.userId}: {e}") # Log error for debugging
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Anime couldn't be removed to watching list")
    
    return {'message': "Anime removed successfully from watching List"}


#User Profile API
@app.get('/profile/{user_id}', status_code=status.HTTP_200_OK)
async def user_profile(user_id: int, db: AsyncSession = Depends(get_db)):

    query = await db.execute(select(User).where(User.userId == user_id))
    result = query.scalars().first()

    if result is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User not found")
    

    query2 = await db.execute(select(Anime).where(Anime.animeId.in_(result.watchedAnime)))
    result2 = query2.scalars().all()

    watchedList = []

    for item in result2:

        watchedList.append(

            AnimesForUserProfile(

                animeId=item.animeId,
                animeName=item.animeName,
                image_url_base_anime=item.image_url_base_anime,
            )
        )

    query3 = await db.execute(select(Anime).where(Anime.animeId.in_(result.watchingAnime)))
    result3 = query3.scalars().all()

    watchingList = []
    for item in result3:
        watchingList.append(

            AnimesForUserProfile(

                animeId=item.animeId,
                animeName=item.animeName,
                image_url_base_anime=item.image_url_base_anime,
            )
        )

    userProfileObj = UserProfile(

        userId = result.userId,
        userName = result.userName,
        email = result.email,
        profilePicture=result.profilePicture,
        watchedAnime=watchedList,
        watchingAnime=watchingList,
    )

    return {"UserProfile": userProfileObj, "message": "User profile fetched successfully"}
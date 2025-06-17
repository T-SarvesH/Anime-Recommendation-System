#The main recommendation model

import django
import pandas as pd
import os
import numpy as np

from core.database import postgres_sync_engine

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') # <--- REMEMBER TO REPLACE 'your_project_name'
django.setup()


def load_data():
    
    try:
        print("Loading ratings data")

        Ratings = pd.read_sql("SELECT * from ratings", con=postgres_sync_engine)
        print(f"Ratings loaded having a total of {len(Ratings)} rows")
        print(Ratings.head())

        print("Loading anime data")
        
        Anime = pd.read_sql("SELECT * from anime", con=postgres_sync_engine)
        print(f"Animes loaded having a total of {len(Anime)} rows")
        print(Anime.head())

        print("Loading user data")
        
        Users = pd.read_sql("SELECT * from ratings", con=postgres_sync_engine)
        print(f"Ratings loaded having a total of {len(Users)} rows")
        print(Users.head())


        print("Loading location data")
        
        Locations = pd.read_sql("SELECT * from locations", con=postgres_sync_engine)
        print(f"Ratings loaded having a total of {len(Locations)} rows")
        print(Locations.head())


        print("Loading genre data")
        
        Genres = pd.read_sql("SELECT * from genres", con=postgres_sync_engine)
        print(f"Ratings loaded having a total of {len(Genres)} rows")
        print(Genres.head())


        print("Loading seasons data")
        
        Seasons = pd.read_sql("SELECT * from seasons", con=postgres_sync_engine)
        print(f"Ratings loaded having a total of {len(Seasons)} rows")
        print(Seasons.head())

        return Ratings, Anime, Users, Locations, Genres, Seasons
    
    except Exception as e:
        raise ValueError(f"{e}")
        return None, None, None, None, None, None

def process_data(ratings_df, anime_df, users_df, locations_df, genres_df, seasons_df):

    #Initial Table joins
    print("Performing the initial table joins \n")

    users_with_locations_df = pd.merge(users_df, locations_df, how='left', on='locationId')
if __name__ == "__main__":

    ratings, anime, users, locations, genres, seasons = load_data()

    if ratings is not None:
        print("Ratings imported successfully")

    if anime is not None:
        print("Anime imported successfully")
    
    if users is not None:
        print("Users imported successfully")
    
    if locations is not None:
        print("Locations imported successfully")

    if genres is not None:
        print("Genres imported successfully")

    if locations is not None:
        print("Locations imported successfully")
    
import django
import pandas as pd
import os
import numpy as np
import sys 
from engine import sync_engine

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def load_data():
    
    try:
        print("Loading ratings data")

        Ratings = pd.read_sql("SELECT * from ratings", con=sync_engine)
        print(f"Ratings loaded having a total of {len(Ratings)} rows")
        print(Ratings.head())

        print("Loading anime data")
        
        Anime = pd.read_sql("SELECT * from anime", con=sync_engine)
        print(f"Animes loaded having a total of {len(Anime)} rows")
        print(Anime.head())

        print("Loading user data")
        
        Users = pd.read_sql("SELECT * from users", con=sync_engine)
        print(f"Ratings loaded having a total of {len(Users)} rows")
        print(Users.head())


        print("Loading location data")
        
        Locations = pd.read_sql("SELECT * from locations", con=sync_engine)
        print(f"Ratings loaded having a total of {len(Locations)} rows")
        print(Locations.head())


        print("Loading genre data")
        
        Genres = pd.read_sql("SELECT * from genres", con=sync_engine)
        print(f"Ratings loaded having a total of {len(Genres)} rows")
        print(Genres.head())


        print("Loading seasons data")
        
        Seasons = pd.read_sql("SELECT * from seasons", con=sync_engine)
        print(f"Ratings loaded having a total of {len(Seasons)} rows")
        print(Seasons.head())

        return Ratings, Anime, Users, Locations, Genres, Seasons
    
    except Exception as e:
        raise ValueError(f"{e}")
    
        return None, None, None, None, None, None
import django
import pandas as pd
import os
import numpy as np
import sys 
from .engine import sync_engine

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def load_data():
    
    try:
    
        Ratings = pd.read_sql("SELECT * from ratings", con=sync_engine)
        Anime = pd.read_sql("SELECT * from anime", con=sync_engine)
        Users = pd.read_sql("SELECT * from users", con=sync_engine)
        Locations = pd.read_sql("SELECT * from locations", con=sync_engine)
        Genres = pd.read_sql("SELECT * from genres", con=sync_engine)
        Seasons = pd.read_sql("SELECT * from seasons", con=sync_engine)
        
        return Ratings, Anime, Users, Locations, Genres, Seasons
    
    except Exception as e:
        
        raise ValueError(f"{e}")
        return None, None, None, None, None, None
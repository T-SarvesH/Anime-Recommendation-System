#The main recommendation model
import os, pandas as pd, numpy as np
import scipy

#Import all ML training methods from other modules
from load_data import load_data
from process_data import process_data


""" Start of the main ML Model """

if __name__ == "__main__":

    ratings, anime, users, locations, genres, seasons = load_data()
    
    #If none of the dframes are empty then preprocess the data
    if all([df is not None for df in [ratings, anime, users, locations, genres, seasons]]):

        preprocessed_df, processed_anime_df, processed_users_df, processed_genres_df, processed_seasons_df = process_data(ratings, anime, users, locations, genres, seasons)

        print(f"{preprocessed_df.info()}")
        print(f"{preprocessed_df.shape}")


#The main recommendation model
import os, pandas as pd, numpy as np
import scipy

#Import all ML training methods from other modules
from load_data import load_data
from process_data import process_data
from Recommendation1 import collaborative_recommender
from Reccomendation2 import association_recommender
from Recommendation3 import content_based_recommender

""" Start of the main ML Model """

if __name__ == "__main__":

    ratings, anime, users, locations, genres, seasons = load_data()
    
    #If none of the dframes are empty then preprocess the data
    if all([df is not None for df in [ratings, anime, users, locations, genres, seasons]]):

        preprocessed_df, processed_anime_df, processed_users_df, processed_genres_df, processed_seasons_df = process_data(ratings, anime, users, locations, genres, seasons)

        print(f"{preprocessed_df.info()}")
        print(f"{preprocessed_df.shape}")
    
    #get the recommendation o/p
    user_id = 1
    recom1 = collaborative_recommender(user_id, ratings, processed_anime_df, 5)
    recom2 = association_recommender(user_id, processed_users_df, processed_anime_df, 5)
    recom3 = content_based_recommender()




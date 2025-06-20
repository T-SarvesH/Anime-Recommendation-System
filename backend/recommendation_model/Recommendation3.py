""" Recommender 3 using Content based filtering on Anime Genre and which animes are adult rated """
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

import numpy as np
import os, django, ast, sys

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(PROJECT_ROOT)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

def content_based_recommender(user_id, ratings_df, anime_df, number_of_recommendations):
    
    anime_df['genre'] = anime_df['genre'].fillna('')

    tfid_vector = TfidfVectorizer(stop_words='english', token_pattern=r'(?u)\b\w+\b')
    anime_genre_matrix = tfid_vector.fit_transform(anime_df['genre'])

    anime_genre_df = pd.DataFrame(anime_genre_matrix.toarray(), index=anime_df['animeId'], columns = tfid_vector.get_feature_names_out())

    user_ratings = ratings_df[ratings_df['userId']==user_id]
 
    if user_ratings is None:
        print(f"User has not given any ratings yet")
        return []

    liked_anime_ids = user_ratings[user_ratings['score'] > 6]

    if liked_anime_ids is None:
        print(f"User has not rated any animes above 6 yet")
        return []

    existing_liked_anime_ids = [aid for aid in liked_anime_ids if aid in anime_genre_df.index]

    if existing_liked_anime_ids is None:
        print(f"None of the anime user rated are in the anime genre matrix")
        return []

    liked_anime_genres = anime_genre_df.loc[existing_liked_anime_ids]

    user_profile = liked_anime_genres.mean(axis=0)

    if user_profile.sum() == 0:
        print(f"Cannot generate recommendation")
        return []


    user_profile_reshaped = user_profile.values.reshape(1, -1)
    similarities = cosine_similarity(user_profile_reshaped, anime_genre_df)[0]

    anime_similarity_scores = pd.Series(similarities, index=anime_genre_df.index)

    user_watched_anime_ids = user_ratings['animeId'].tolist()

    unwatched_anime_scores = anime_similarity_scores[~anime_similarity_scores.index.isin(user_watched_anime_ids)]

    recommendations_sorted = unwatched_anime_scores.sort_values(ascending=False)

    top_n_recommended_anime_ids = recommendations_sorted.head(number_of_recommendations).index.tolist()

    return top_n_recommended_anime_ids

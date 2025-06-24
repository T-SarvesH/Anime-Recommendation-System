// my-anime-recs-frontend/src/pages/BrowseAnimePage.js

import React, { useEffect, useState } from 'react';
import { getAllAnime } from '../api';
import { Link } from 'react-router-dom';

function BrowseAnimePage() {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnime = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAllAnime();
        setAnimeList(data);
      } catch (err) {
        setError(err.message || 'Failed to load anime.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-anime-accent text-xl">Loading all anime...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-anime-error text-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <h2 className="text-4xl font-bold text-anime-accent text-center mb-10">
        Browse All Anime
      </h2>

      {animeList.length === 0 ? (
        <p className="text-anime-text-dark text-center text-xl">
          No anime found in the database.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {animeList.map((anime) => (
            // *** UPDATED: Using anime.animeName for the link ***
            <Link to={`/anime/details/${encodeURIComponent(anime.animeName)}`} key={anime.animeId} className="block">
              <div className="bg-anime-card rounded-lg shadow-xl overflow-hidden
                            transform hover:scale-105 transition duration-300 ease-in-out
                            border border-anime-border h-full flex flex-col">
                <img
                  src={anime.image_url_base_anime || 'https://placehold.co/200x280/16213E/E94560?text=No+Image'}
                  alt={anime.animeName}
                  className="w-full h-72 object-cover object-center flex-shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/200x280/16213E/E94560?text=Image+Missing';
                  }}
                />
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <h3 className="text-xl font-semibold text-anime-accent mb-2 truncate">
                    {anime.animeName}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrowseAnimePage;
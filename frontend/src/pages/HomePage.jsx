import React, { useEffect, useState, useCallback } from 'react';
import { getAnimeWithFilters, getAllGenres } from '../api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function HomePage() {
  const { userId } = useAuth();
  const [animeList, setAnimeList] = useState([]);
  const [allGenres, setAllGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dashboard filter state
  const [selectedGenre, setSelectedGenre] = useState(''); // "" for all genres

  // useCallback to memoize the fetch function to prevent unnecessary re-renders
  const fetchAnime = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // UPDATED: Only pass userId and selectedGenre
      const data = await getAnimeWithFilters({
        userId: userId,
        genreId: selectedGenre,
      });
      setAnimeList(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch anime.');
    } finally {
      setLoading(false);
    }
  }, [userId, selectedGenre]); // Dependencies for useCallback

  useEffect(() => {
    // Fetch genres once when component mounts
    const fetchGenres = async () => {
      try {
        const data = await getAllGenres();
        setAllGenres(data);
      } catch (err) {
        console.error("Failed to fetch genres:", err);
      }
    };
    fetchGenres();
  }, []);

  // Fetch anime whenever filter parameters or userId change
  useEffect(() => {
    fetchAnime();
  }, [fetchAnime]); // Dependency on fetchAnime callback

  const handleClearFilters = () => {
    setSelectedGenre('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-anime-accent text-xl">Loading anime dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 text-anime-error text-xl">
        {error}
        {!userId && (
          <p className="mt-2">
            Consider <Link to="/signup" className="text-anime-accent hover:underline">signing up</Link> or{' '}
            <Link to="/login" className="text-anime-accent hover:underline">logging in</Link> for personalized recommendations!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="py-8">
      <h2 className="text-4xl font-bold text-anime-accent text-center mb-10">
        {userId ? 'Your Personalized Anime Dashboard' : 'Explore Anime'}
      </h2>

      {/* Interactive Controls */}
      <div className="bg-anime-card p-6 rounded-lg shadow-xl mb-8 flex flex-wrap justify-center items-center gap-4 border border-anime-border">
        {/* Genre Filter */}
        <select
          value={selectedGenre}
          onChange={(e) => setSelectedGenre(e.target.value)}
          className="p-2 rounded-md bg-anime-bg border border-anime-border text-anime-text-light focus:outline-none focus:ring-2 focus:ring-anime-accent"
        >
          <option value="">All Genres</option>
          {allGenres.map((genre) => (
            <option key={genre.genreId} value={genre.genreId}>
              {genre.name}
            </option>
          ))}
        </select>

        {/* Clear Filters Button */}
        <button
          onClick={handleClearFilters}
          className="bg-anime-border hover:bg-anime-accent-dark text-anime-text-light font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md"
        >
          Clear Filter
        </button>
      </div>

      {/* Anime Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {animeList.length > 0 ? (
          animeList.map((anime) => (
            <Link to={`/anime/details/${anime.title}`} key={anime.animeId} className="block">
              <div className="bg-anime-card rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out border border-anime-border h-full flex flex-col">
                <img
                  src={anime.image_url || 'https://via.placeholder.com/200x280?text=No+Image'}
                  alt={anime.title}
                  className="w-full h-72 object-cover object-center flex-shrink-0"
                />
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-anime-accent mb-2 truncate">
                      {anime.title}
                    </h3>
                    <p className="text-anime-text-light text-sm">
                      Genre: {anime.genre?.name || 'N/A'}
                    </p>
                    <p className="text-anime-text-light text-sm">
                      Episodes: {anime.episodes}
                    </p>
                    <p className="text-anime-text-light text-sm">
                      Year: {anime.year}
                    </p>
                  </div>
                  <div className="mt-2 text-anime-text-light text-sm">
                    Rating: {anime.rating ? `${anime.rating.toFixed(1)}/5` : 'N/A'}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-anime-text-dark text-center text-xl col-span-full">
            No anime found matching your criteria.
          </p>
        )}
      </div>
    </div>
  );
}

export default HomePage;
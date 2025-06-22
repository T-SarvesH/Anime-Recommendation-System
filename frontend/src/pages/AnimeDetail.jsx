import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAnimeDetails, rateAnime } from '../api';
import { useAuth } from '../context/AuthContext';

function AnimeDetailPage() {
  const { animeName } = useParams();
  const { userId } = useAuth();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rating, setRating] = useState('');
  const [ratingMessage, setRatingMessage] = useState('');
  const [ratingError, setRatingError] = useState('');

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true);
        const data = await getAnimeDetails(animeName);
        setAnime(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch anime details.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, [animeName]);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    setRatingMessage('');
    setRatingError('');

    if (!userId) {
      setRatingError('Please log in to rate anime.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setRatingError('Rating must be between 1 and 5.');
      return;
    }
    if (!anime?.animeId) {
      setRatingError('Anime data not available for rating.');
      return;
    }

    try {
      const response = await rateAnime({
        userId: userId,
        animeId: anime.animeId,
        score: parseInt(rating),
      });
      setRatingMessage(`Rated ${response.score}/5 successfully!`);
      // Optionally update anime's average rating in state if API returns it
    } catch (err) {
      setRatingError(err.message || 'Failed to submit rating.');
    } finally {
      setRating('');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-anime-accent text-xl">Loading anime details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-4 text-anime-error text-xl">{error}</div>;
  }

  if (!anime) {
    return <div className="text-center p-4 text-anime-text-dark text-xl">Anime not found.</div>;
  }

  return (
    <div className="bg-anime-card p-8 rounded-lg shadow-xl max-w-4xl mx-auto border border-anime-border">
      <div className="md:flex md:space-x-8">
        <div className="md:w-1/3 flex-shrink-0">
          <img
            src={anime.image_url || 'https://via.placeholder.com/300x400?text=No+Image'}
            alt={anime.title}
            className="w-full h-auto rounded-lg shadow-lg object-cover"
          />
        </div>
        <div className="md:w-2/3 mt-6 md:mt-0">
          <h2 className="text-4xl font-bold text-anime-accent mb-4">{anime.title}</h2>
          <p className="text-anime-text-light text-lg mb-2">
            <strong className="text-anime-accent">Genre:</strong> {anime.genre?.name || 'N/A'}
          </p>
          <p className="text-anime-text-light text-lg mb-2">
            <strong className="text-anime-accent">Season:</strong> {anime.season?.name || 'N/A'}
          </p>
          <p className="text-anime-text-light text-lg mb-2">
            <strong className="text-anime-accent">Origin:</strong> {anime.location?.city}, {anime.location?.state}, {anime.location?.country}
          </p>
          <p className="text-anime-text-light text-lg mb-2">
            <strong className="text-anime-accent">Year:</strong> {anime.year}
          </p>
          <p className="text-anime-text-light text-lg mb-2">
            <strong className="text-anime-accent">Episodes:</strong> {anime.episodes}
          </p>
          <p className="text-anime-text-light text-lg mb-4">
            <strong className="text-anime-accent">Average Rating:</strong> {anime.rating ? `${anime.rating}/5` : 'Not yet rated'}
          </p>
          <p className="text-anime-text-dark leading-relaxed">
            {anime.description || 'No description available.'}
          </p>

          <div className="mt-8 pt-4 border-t border-anime-border">
            <h3 className="text-2xl font-bold text-anime-accent mb-4">Rate this Anime</h3>
            {ratingMessage && <p className="text-anime-success mb-2">{ratingMessage}</p>}
            {ratingError && <p className="text-anime-error mb-2">{ratingError}</p>}
            {userId ? (
              <form onSubmit={handleRatingSubmit} className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  placeholder="1-5"
                  className="w-24 px-3 py-2 rounded border border-anime-border bg-anime-bg text-anime-text-light focus:outline-none focus:ring-2 focus:ring-anime-accent"
                  required
                />
                <button
                  type="submit"
                  className="bg-anime-accent hover:bg-anime-accent-dark text-anime-bg font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md hover:shadow-anime-glow"
                >
                  Submit Rating
                </button>
              </form>
            ) : (
              <p className="text-anime-text-dark">Please log in to rate this anime.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnimeDetailPage;
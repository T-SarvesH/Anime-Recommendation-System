import React, { useState, useEffect, useCallback } from 'react';
import { getRecommendations } from '../api'; 
import { useAuth } from '../context/AuthContext'; 

const RecommendationPage = () => {
  const { userId, username } = useAuth(); // Get userId and username from AuthContext
  const [recommendedAnimeDetails, setRecommendedAnimeDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetches anime recommendations for the authenticated user.
   * This function now directly uses the 'userId' from the AuthContext.
   */
  const fetchRecommendations = useCallback(async () => {
    if (!userId) { // If no user is logged in, do not attempt to fetch
      setRecommendedAnimeDetails([]); // Clear any previous recommendations
      setError("Please log in to view your personalized recommendations.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use the 'userId' from AuthContext directly for the API call
      const response = await getRecommendations(userId); 
      
      const recommendationsData = response.recommendations || [];
      
      setRecommendedAnimeDetails(recommendationsData.filter(Boolean)); 

    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError("Failed to fetch recommendations. Please ensure the backend is running and data exists for your user. " + (err.response?.data?.detail || err.message));
      setRecommendedAnimeDetails([]); 
    } finally {
      setLoading(false); 
    }
  }, [userId]); // Dependency array now only includes userId. The callback re-creates if userId changes.

  // Effect hook to trigger fetching recommendations when the component mounts or userId changes.
  useEffect(() => {
    fetchRecommendations(); // Call the memoized function without parameters.
  }, [fetchRecommendations]); // Dependency: re-run if fetchRecommendations (which depends on userId) changes.

  return (
    <div className="bg-anime-card p-8 rounded-lg shadow-xl border border-anime-border max-w-7xl mx-auto my-8 font-inter">
      <h2 className="text-4xl font-bold text-anime-accent text-center mb-8">Anime Recommendations</h2>

      {/* Conditional rendering for logged-in vs. logged-out users */}
      {!userId ? (
        <div className="text-center p-6 bg-anime-bg rounded-lg border border-anime-border mb-8">
          <p className="text-anime-text-light text-xl">
            {error || "Log in to see your personalized anime recommendations!"}
          </p>
        </div>
      ) : (
        <>
          <div className="text-center p-6 bg-anime-bg rounded-lg border border-anime-border mb-8">
            <h3 className="text-2xl font-bold text-anime-accent mb-4">
              Recommendations for {username || `User ID: ${userId}`}
            </h3>
            <p className="text-anime-text-light">
              Here are anime recommendations tailored for you.
            </p>
            {error && <p className="text-anime-error mt-4">{error}</p>}
          </div>

          <div className="mb-8">
            <h3 className="text-2xl font-bold text-anime-accent mb-4">Your Recommendations</h3>
            {loading && <p className="text-anime-text-light text-center">Loading recommendations...</p>}
            {!loading && recommendedAnimeDetails.length === 0 && !error && (
              <p className="text-anime-text-light text-center">No recommendations found for you. Try rating more anime or ensure data is available.</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recommendedAnimeDetails.map((anime, index) => (
                anime ? (
                  <div 
                    key={anime.animeId || index} 
                    className="bg-anime-bg p-4 rounded-lg border border-anime-border shadow-md flex flex-col items-center text-center 
                               transform hover:scale-105 transition duration-300 ease-in-out"
                  >
                    <img
                      src={anime.image_url_base_anime || `https://placehold.co/150x200/4a5568/edf2f7?text=No+Image`}
                      alt={anime.animeName || 'Anime Image'}
                      onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/150x200/4a5568/edf2f7?text=No+Image"; }}
                      className="w-36 h-48 object-cover rounded-lg mb-3 shadow-lg"
                    />
                    <h4 className="text-xl font-semibold text-anime-text-dark mb-1 truncate w-full px-2">{anime.animeName || 'Unknown Anime'}</h4>
                    <p className="text-anime-text-light text-sm italic">{anime.studio || 'N/A'}</p>
                    <p className="text-anime-text-light text-sm line-clamp-3 overflow-hidden text-ellipsis px-2">
                      {anime.description ? `${anime.description.substring(0, 150)}${anime.description.length > 150 ? '...' : ''}` : 'No description available.'}
                    </p>
                    <div className="mt-2 text-sm text-anime-text-light">
                      <p><strong>Genre(s):</strong> {anime.genres && anime.genres.length > 0 ? anime.genres.join(', ') : 'N/A'}</p>
                      <p><strong>Release:</strong> {anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    key={`placeholder-${index}`} 
                    className="bg-anime-bg p-4 rounded-lg border border-anime-border shadow-md flex flex-col items-center justify-center text-center text-anime-text-light min-h-[200px]"
                  >
                    <p>No recommendation available at this slot.</p>
                  </div>
                )
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecommendationPage;
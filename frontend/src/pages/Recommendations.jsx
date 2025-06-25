import React, { useState, useEffect, useCallback } from 'react';
import { getRecommendations } from '../api'; 
import { useAuth } from '../context/AuthContext'; 

const RecommendationPage = () => {
  const { userId, username } = useAuth(); 
  const [recommendedAnimeDetails, setRecommendedAnimeDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecommendations = useCallback(async () => {
    if (!userId) { 
      setRecommendedAnimeDetails([]); 
      setError("Please log in to view your personalized recommendations.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
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
  }, [userId]); 

  useEffect(() => {
    fetchRecommendations(); 
  }, [fetchRecommendations]); 

  return (
    // Main container div: Consistent with previous, but ensuring less overall height if content allows.
    <div className="bg-anime-card p-8 rounded-lg shadow-2xl border border-anime-border max-w-7xl mx-auto my-10 font-inter">
      <h2 className="text-5xl font-extrabold text-anime-accent text-center mb-10 tracking-wider">
        Your Anime Nexus
      </h2>

      {!userId ? (
        <div className="text-center p-8 bg-anime-bg rounded-lg border border-anime-border shadow-inner mb-10">
          <p className="text-anime-text-light text-2xl font-semibold">
            {error || "Log in to unlock your personalized anime recommendations!"}
          </p>
        </div>
      ) : (
        <>
          <div className="text-center p-8 bg-anime-bg rounded-lg border border-anime-border shadow-inner mb-10">
            <h3 className="text-3xl font-bold text-anime-accent mb-3">
              Recommendations for <span className="text-anime-text-light">{username || `User ID: ${userId}`}</span>
            </h3>
            <p className="text-anime-text-dark text-lg">
              Dive into a world of anime tailored just for you.
            </p>
            {error && <p className="text-anime-error mt-6 text-lg">{error}</p>}
          </div>

          <div className="mb-8">
            <h3 className="text-3xl font-bold text-anime-accent mb-6 text-center">Your Curated Picks</h3>
            {loading && <p className="text-anime-text-light text-center text-xl animate-pulse">Loading amazing recommendations...</p>}
            {!loading && recommendedAnimeDetails.length === 0 && !error && (
              <p className="text-anime-text-light text-center text-xl">
                No recommendations found for you yet. Rate more anime to help us understand your tastes!
              </p>
            )}
            {/* Grid layout for anime recommendation cards - adjusted card rounding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {recommendedAnimeDetails.map((anime, index) => (
                anime ? (
                  <div 
                    key={anime.animeId || index} 
                    className="bg-anime-bg p-4 rounded-lg border border-anime-border shadow-lg flex flex-col items-center text-center 
                               transform hover:scale-105 hover:shadow-xl hover:border-anime-accent-dark transition duration-300 ease-in-out cursor-pointer"
                  >
                    {/* Image container to enforce a square aspect ratio for the image area */}
                    <div className="relative w-44 h-44 flex-shrink-0 mb-4 rounded-md shadow-md border border-anime-border overflow-hidden">
                      <img
                        src={anime.image_url_base_anime || `https://placehold.co/176x176/16213E/E94560?text=No+Image`}
                        alt={anime.animeName || 'Anime Image'}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          // Placeholder image with square dimensions
                          e.target.src=`https://placehold.co/176x176/16213E/E94560?text=Image+Unavailable`; 
                        }}
                        className="absolute inset-0 w-full h-full object-cover" // Image fills and covers the square container
                      />
                    </div>

                    <h4 className="text-2xl font-bold text-anime-accent mb-2 truncate w-full px-2">{anime.animeName || 'Unknown Anime'}</h4>
                    <p className="text-anime-text-light text-sm italic mb-2">{anime.studio || 'N/A'}</p>
                    <p className="text-anime-text-light text-sm line-clamp-3 overflow-hidden text-ellipsis px-2 mb-3">
                      {anime.description ? `${anime.description.substring(0, 120)}${anime.description.length > 120 ? '...' : ''}` : 'No description available.'}
                    </p>
                    <div className="mt-auto text-sm text-anime-text-dark w-full">
                      <p className="bg-anime-border rounded-sm px-3 py-1 mb-1 inline-block"> 
                        <strong>Genres:</strong> {anime.genres && anime.genres.length > 0 ? anime.genres.map(g => `G${g}`).join(', ') : 'N/A'}
                      </p>
                      <p className="bg-anime-border rounded-sm px-3 py-1 inline-block ml-2"> 
                        <strong>Release:</strong> {anime.releaseDate ? new Date(anime.releaseDate).getFullYear() : 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  // Placeholder card for any null entries, maintaining grid integrity
                  <div 
                    key={`placeholder-${index}`} 
                    className="bg-anime-bg p-4 rounded-lg border border-anime-border shadow-md flex flex-col items-center justify-center text-center text-anime-text-light min-h-[300px]"
                  >
                    {/* Placeholder image will also be square now */}
                    <div className="relative w-44 h-44 flex-shrink-0 mb-4 rounded-md shadow-md border border-anime-border overflow-hidden flex items-center justify-center">
                        <span className="text-anime-text-dark text-center">No Image</span>
                    </div>
                    <p className="text-lg opacity-70">No recommendation available at this slot.</p>
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
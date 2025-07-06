import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile } from '../api';

function UserProfilePage() {
  const { userId } = useParams();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(''); 
        const response = await getUserProfile(userId);
        setUserProfile(response.UserProfile); 
      } catch (err) {
        setError(err.message || 'Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) { 
      fetchUserProfile();
    }

  }, [userId]); 

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-anime-background text-anime-accent text-2xl">
        Loading user profile...
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-8 bg-anime-background text-anime-error text-xl h-screen flex items-center justify-center">{error}</div>;
  }

  if (!userProfile) {
    return <div className="text-center p-8 bg-anime-background text-anime-text-dark text-xl h-screen flex items-center justify-center">User not found.</div>;
  }

  // Fallback for profile picture
  const profilePicSrc = userProfile.profilePicture || 
                        `https://ui-avatars.com/api/?name=${userProfile.userName}&background=E94560&color=1a1a2e&size=128`;

  // Component for rendering an individual anime card in the lists
  const AnimeCard = ({ anime }) => (
    <Link 
      key={anime.animeId} 
      to={`/anime/${encodeURIComponent(anime.animeName)}`} 
      className="block group flex-shrink-0 w-36 sm:w-40 md:w-44 lg:w-48 xl:w-52 transform transition-transform duration-300 hover:scale-105"
    >
      <div className="bg-anime-sub-card rounded-lg shadow-md overflow-hidden border border-anime-border flex flex-col h-full">
        <div className="relative w-full h-48 bg-gray-800 flex items-center justify-center overflow-hidden">
          {anime.image_url_base_anime ? (
            <img
              src={anime.image_url_base_anime}
              alt={anime.animeName}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={(e) => {e.target.onerror = null; e.target.src='https://placehold.co/150x200/16213E/E94560?text=No+Image';}}
            />
          ) : (
            <div className="text-gray-500 text-sm flex flex-col items-center justify-center p-4 text-center">
              <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>Image Unavailable</span>
            </div>
          )}
        </div>
        <div className="p-3 flex-grow flex flex-col justify-between">
          <p className="text-anime-text-light group-hover:text-anime-accent text-base font-semibold line-clamp-2">
            {anime.animeName}
          </p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="bg-anime-background min-h-screen py-10 font-inter">
      <div className="container mx-auto px-4">
        <div className="bg-anime-card rounded-xl shadow-2xl p-8 md:p-12 border border-anime-border relative overflow-hidden">
          {/* Background Gradient/Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-anime-card via-anime-card to-anime-border opacity-70 rounded-xl"></div>
          <div className="absolute inset-0 bg-pattern-dots opacity-5"></div> {/* Optional: Add a subtle pattern */}

          <div className="relative z-10"> {/* Ensure content is above background effects */}
            {/* Profile Header Section */}
            <div className="flex flex-col md:flex-row items-center md:justify-between mb-8 md:mb-12">
              <div className="flex flex-col md:flex-row items-center text-center md:text-left">
                <img
                  src={profilePicSrc}
                  alt={`${userProfile.userName}'s profile`}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-anime-accent shadow-lg mb-4 md:mb-0 md:mr-6 transform transition-transform duration-300 hover:scale-105"
                />
                <div>
                  <h2 className="text-4xl md:text-5xl font-extrabold text-anime-accent leading-tight">
                    {userProfile.userName}'s Profile
                  </h2>
                  <p className="text-anime-text-light text-lg mt-2">{userProfile.email}</p>
                </div>
              </div>
              {/* Optional: Add an edit profile button here */}
              {/* <button className="mt-6 md:mt-0 px-6 py-2 bg-anime-accent text-white rounded-lg font-semibold hover:bg-anime-accent-dark transition duration-300">
                Edit Profile
              </button> */}
            </div>

            {/* User Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-lg bg-anime-sub-card p-6 rounded-lg border border-anime-border shadow-inner mb-12">
              {/* Note: Location is removed as per your Pydantic model, add back if needed */}
              <div className="flex items-center">
                <span className="font-semibold text-anime-accent mr-2">Anime Watched:</span>
                <span className="text-anime-text-light font-bold text-xl">{userProfile.anime_watched_count}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold text-anime-accent mr-2">Anime Watching:</span>
                <span className="text-anime-text-light font-bold text-xl">{userProfile.anime_watching_count}</span>
              </div>
            </div>

            {/* Watched Anime Section */}
            <div className="mb-12">
              <h3 className="text-3xl font-bold text-anime-accent mb-6">Watched Anime:</h3>
              {userProfile.watchedAnime && userProfile.watchedAnime.length > 0 ? (
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-anime-accent scrollbar-track-anime-sub-card">
                  {userProfile.watchedAnime.map((anime) => (
                    <AnimeCard key={anime.animeId} anime={anime} />
                  ))}
                </div>
              ) : (
                <p className="text-anime-text-dark text-lg">No watched anime yet. Start exploring!</p>
              )}
            </div>

            {/* Watching Anime Section */}
            <div>
              <h3 className="text-3xl font-bold text-anime-accent mb-6">Watching Anime:</h3>
              {userProfile.watchingAnime && userProfile.watchingAnime.length > 0 ? (
                <div className="flex overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-anime-accent scrollbar-track-anime-sub-card">
                  {userProfile.watchingAnime.map((anime) => (
                    <AnimeCard key={anime.animeId} anime={anime} />
                  ))}
                </div>
              ) : (
                <p className="text-anime-text-dark text-lg">Not watching any anime currently. Find your next obsession!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;
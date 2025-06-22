import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
        const data = await getUserProfile(userId);
        setUserProfile(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-anime-accent text-xl">Loading user profile...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-4 text-anime-error text-xl">{error}</div>;
  }

  if (!userProfile) {
    return <div className="text-center p-4 text-anime-text-dark text-xl">User not found.</div>;
  }

  return (
    <div className="bg-anime-card p-8 rounded-lg shadow-xl max-w-3xl mx-auto border border-anime-border">
      <h2 className="text-3xl font-bold text-anime-accent text-center mb-6">
        {userProfile.userName}'s Profile
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
        <div className="text-anime-text-light">
          <p><strong>User ID:</strong> {userProfile.userId}</p>
          <p><strong>Email:</strong> {userProfile.email}</p>
          <p><strong>Location:</strong> {userProfile.location?.city}, {userProfile.location?.state}, {userProfile.location?.country}</p>
          <p><strong>Anime Watched:</strong> {userProfile.anime_watched_count}</p>
          <p><strong>Anime Watching:</strong> {userProfile.anime_watching_count}</p>
        </div>
        <div className="flex justify-center items-center">
          <img
            src={userProfile.profilePicture || `https://ui-avatars.com/api/?name=${userProfile.userName}&background=E94560&color=1a1a2e&size=128`}
            alt={`${userProfile.userName}'s profile`}
            className="w-32 h-32 rounded-full object-cover border-4 border-anime-accent shadow-lg"
          />
        </div>
      </div>
      <div className="mt-8">
        <h3 className="text-2xl font-bold text-anime-accent mb-4">Watched Anime IDs:</h3>
        {userProfile.watchedAnime.length > 0 ? (
          <ul className="list-disc list-inside text-anime-text-light">
            {userProfile.watchedAnime.map((animeId, index) => (
              <li key={index}>Anime ID: {animeId}</li>
            ))}
          </ul>
        ) : (
          <p className="text-anime-text-dark">No watched anime yet.</p>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-anime-accent mb-4">Watching Anime IDs:</h3>
        {userProfile.watchingAnime.length > 0 ? (
          <ul className="list-disc list-inside text-anime-text-light">
            {userProfile.watchingAnime.map((animeId, index) => (
              <li key={index}>Anime ID: {animeId}</li>
            ))}
          </ul>
        ) : (
          <p className="text-anime-text-dark">Not watching any anime currently.</p>
        )}
      </div>
    </div>
  );
}

export default UserProfilePage;
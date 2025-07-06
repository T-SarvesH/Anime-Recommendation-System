import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import { getUserProfile } from '../api'; 

function Navbar() {
  const { isAuthenticated, userId, logout, loadingAuth } = useAuth(); 
  const [navUserProfile, setNavUserProfile] = useState(null); 
  const [loadingNavProfile, setLoadingNavProfile] = useState(true); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNavProfile = async () => {
      if (isAuthenticated && userId) {
        setLoadingNavProfile(true);
        try {
          const response = await getUserProfile(userId);
          setNavUserProfile(response.UserProfile); 
        } catch (err) {
          console.error("Failed to fetch user profile for Navbar:", err);
          setNavUserProfile(null); 
        } finally {
          setLoadingNavProfile(false);
        }
      } else {
        setNavUserProfile(null); 
        setLoadingNavProfile(false);
      }
    };

    fetchNavProfile();
  }, [isAuthenticated, userId]); 

  const handleProfileClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <nav className="bg-anime-navbar p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo/Home Link */}
        <Link to="/" className="text-anime-accent text-2xl font-bold hover:text-anime-accent-dark transition duration-300">
          AnimeNexus
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link to="/get_recommendations" className="text-anime-text-dark hover:text-anime-accent transition duration-300">
            Recommendations
          </Link>
          {/* NEW: Browse Anime Link */}
          <Link to="/all-anime" className="text-anime-text-dark hover:text-anime-accent transition duration-300">
            Browse Anime
          </Link>
          {/* Add other navigation links here as needed */}

          {/* User Authentication / Profile Section */}
          {!loadingAuth && ( 
            <>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {loadingNavProfile ? (
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm animate-pulse">
                      ...
                    </div>
                  ) : (
                    navUserProfile && navUserProfile.profilePicture ? (
                      <img
                        src={navUserProfile.profilePicture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-anime-accent hover:border-anime-accent-dark transition duration-300"
                        onClick={handleProfileClick}
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = `https://ui-avatars.com/api/?name=${navUserProfile.userName}&background=E94560&color=1a1a2e&size=128`; 
                        }}
                      />
                    ) : navUserProfile && navUserProfile.userName ? ( 
                      <img
                        src={`https://ui-avatars.com/api/?name=${navUserProfile.userName}&background=E94560&color=1a1a2e&size=128`}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-anime-accent hover:border-anime-accent-dark transition duration-300"
                        onClick={handleProfileClick}
                      />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white text-lg cursor-pointer border-2 border-anime-accent" 
                        onClick={handleProfileClick}
                        title="View Profile"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                          </svg>
                      </div>
                    )
                  )}
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-anime-accent text-white rounded-md hover:bg-anime-accent-dark transition duration-300"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="px-4 py-2 bg-anime-accent text-white rounded-md hover:bg-anime-accent-dark transition duration-300">
                    Login
                  </Link>
                  <Link to="/signup" className="px-4 py-2 border border-anime-accent text-anime-accent rounded-md hover:bg-anime-accent hover:text-white transition duration-300">
                    Sign Up
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
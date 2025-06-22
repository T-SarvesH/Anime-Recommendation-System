import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { userId, username, isAdmin, logout } = useAuth();

  return (
    <nav className="bg-anime-card p-4 shadow-lg sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center flex-wrap">
        <Link to="/" className="text-anime-accent text-2xl font-bold tracking-wide flex-shrink-0 mr-4">
          Anime Nexus
        </Link>
        <div className="flex-grow flex justify-end space-x-4 mt-2 md:mt-0">
          <Link to="/" className="text-anime-text-light hover:text-anime-accent-dark transition duration-200">
            Recommendations
          </Link>
          <Link to="/browse" className="text-anime-text-light hover:text-anime-accent-dark transition duration-200">
            Browse Anime
          </Link>
          {isAdmin && (
             <Link to="/admin" className="text-anime-text-light hover:text-anime-accent-dark transition duration-200">
               Admin
             </Link>
          )}
          {userId ? (
            <>
              <Link to={`/user/${userId}`} className="text-anime-text-light hover:text-anime-accent-dark transition duration-200">
                {username}
              </Link>
              <button onClick={logout} className="text-anime-text-light hover:text-anime-accent-dark transition duration-200 bg-transparent border-none cursor-pointer">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className="text-anime-text-light hover:text-anime-accent-dark transition duration-200">
                Sign Up
              </Link>
              <Link to="/login" className="text-anime-text-light hover:text-anime-accent-dark transition duration-200">
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
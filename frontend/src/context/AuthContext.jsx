import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const adminId = -2147483648
  // Load user data from localStorage on initial load
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUsername = localStorage.getItem('userName');
    const storedIsAdmin = localStorage.getItem('isAdmin') === 'true'; // Stored as string

    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10)); // Convert back to number
    }
    if (storedUsername) {
      setUsername(storedUsername);
    }
    setIsAdmin(storedIsAdmin);
  }, []);

  const login = (id, name) => {
    setUserId(id);
    setUsername(name);
    localStorage.setItem('userId', id);
    localStorage.setItem('username', name);
    // Assuming admin user ID is 1. Adjust as needed.
    if (id == adminId) { 
      setIsAdmin(true);
      localStorage.setItem('isAdmin', 'true');
    } else {
      setIsAdmin(false);
      localStorage.setItem('isAdmin', 'false');
    }
  };

  const logout = () => {
    setUserId(null);
    setUsername(null);
    setIsAdmin(false);
    localStorage.clear(); // Clear all auth related storage
  };

  return (
    <AuthContext.Provider value={{ userId, username, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
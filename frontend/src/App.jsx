// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Make sure you import all your page components
import Header from './components/Header';
import Footer from './components/Footer';
// import Navbar from './components/Navbar';
// import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';      // <--- IMPORTANT: Ensure this import is here
// import LoginPage from './pages/LoginPage';        // <--- IMPORTANT: Ensure this import is here
// import UserProfilePage from './pages/UserProfilePage';
// import AnimeDetailPage from './pages/AnimeDetailPage';
// import BrowseAnimePage from './pages/BrowseAnimePage';
// import AdminPage from './pages/AdminPage';


function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-anime-bg">
        <Navbar /> {/* This renders on all pages */}
        <Header /> {/* This renders on all pages */}
        
        <Routes>
          {/* Define your specific routes here */}
          <Route path="/" element={<HomePage />} />
          <Route path="/signup" element={<SignupPage />} />       {/* <--- VERIFY THIS LINE */}
          <Route path="/login" element={<LoginPage />} />         {/* <--- VERIFY THIS LINE */}
          <Route path="/user/:userId" element={<UserProfilePage />} />
          <Route path="/anime/details/:animeName" element={<AnimeDetailPage />} />
          <Route path="/browse" element={<BrowseAnimePage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          {/* IMPORTANT: The catch-all route should always be last */}
          <Route path="*" element={<p className="text-center text-anime-error text-2xl my-12">404: Page Not Found</p>} />
        </Routes>
        
        <Footer /> {/* This renders on all pages */}
      </div>
    </Router>
  );
}

export default App;
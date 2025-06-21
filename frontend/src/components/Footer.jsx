import React from "react";

function Footer(){

    const currentYear = new Date().getFullYear();
    return(
    
        <footer className="bg-anime-card py-4 mt-12 text-center text-anime-text-dark text-sm">
      <div className="container mx-auto px-4">
        <p>&copy; {currentYear} Anime Nexus. All rights reserved.</p>
        <p className="mt-1">Built with passion for anime lovers.</p>
      </div>
    </footer>

    )
}

export default Footer
import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
// Import all necessary API functions for list management
import { 
  getAnimeDetails, 
  rateAnime, 
  getUserProfile, // Assuming getUserProfile returns watchedAnime and watchingAnime
  addTowatchedList, 
  addTowatchingList, 
  removeFromWatched, 
  removeFromWatching 
} from '../api'; 
import { useAuth } from '../context/AuthContext';

// Helper function to convert YouTube watch URL to embed URL
const getEmbedUrl = (url) => {
    if (!url) return null;

    if (url.includes('embed/') || url.includes('player.vimeo.com/video/')) {
        return url;
    }

    const youtubeMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/);
    if (youtubeMatch && youtubeMatch[1]) {
        return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&modestbranding=1&rel=0`;
    }

    console.warn("Trailer URL not recognized as embeddable:", url);
    return null;
};

function AnimeDetailPage() {
    const { animeName } = useParams();
    const { userId } = useAuth();
    const [anime, setAnime] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rating, setRating] = useState('');
    const [ratingMessage, setRatingMessage] = useState('');
    const [ratingError, setRatingError] = useState('');
    
    // State for anime list status: 'none', 'watching', 'watched'
    const [animeStatus, setAnimeStatus] = useState('none'); 
    const [listActionMessage, setListActionMessage] = useState(''); 
    const [processingListAction, setProcessingListAction] = useState(false); 

    // Fetch anime details
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setLoading(true);
                const decodedAnimeName = decodeURIComponent(animeName);
                const data = await getAnimeDetails(decodedAnimeName);
                setAnime(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch anime details.');
            } finally {
                setLoading(false);
            }
        };
        if (animeName) {
            fetchDetails();
        }
    }, [animeName]);

    // Fetch user's anime lists and update status when user or anime data changes
    useEffect(() => {
        const fetchUserAnimeLists = async () => {
            if (!userId || !anime?.animeId) {
                setAnimeStatus('none'); 
                return;
            }
            try {
                const userProfile = await getUserProfile(userId); 
                const watched = userProfile.watchedAnime || [];
                const watching = userProfile.watchingAnime || [];

                if (watched.includes(anime.animeId)) {
                    setAnimeStatus('watched');
                } else if (watching.includes(anime.animeId)) {
                    setAnimeStatus('watching');
                } else {
                    setAnimeStatus('none');
                }
            } catch (err) {
                console.error("Failed to fetch user lists from profile:", err);
            }
        };
        fetchUserAnimeLists();
    }, [userId, anime?.animeId]); 

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        setRatingMessage('');
        setRatingError('');

        if (!userId) {
            setRatingError('Please log in to rate anime.');
            return;
        }
        const score = parseInt(rating);

        if (isNaN(score) || score < 1 || score > 10) { 
            setRatingError('Rating must be between 1 and 10.');
            return;
        }
        if (!anime?.animeId) {
            setRatingError('Anime data not available for rating. Please refresh.');
            return;
        }

        try {
            const response = await rateAnime({
                userId: userId,
                animeId: anime.animeId,
                score: score,
                review_text: "User rated via Anime Nexus" 
            });
            setRatingMessage(`Rated ${response.score}/10 successfully!`); 
            setRating(''); 
        } catch (err) {
            console.error('Rating submission error:', err);
            setRatingError(err.message || 'Failed to submit rating.');
        }
    };

    // --- Simplified List Management Handlers ---

    // This handler will now be called for both initial adds and "moves"
    const handleAddToList = async (listType) => {
        setProcessingListAction(true);
        setListActionMessage('');
        try {
            if (listType === 'watching') {
                await addTowatchingList({ userId, animeId: anime.animeId });
            } else if (listType === 'watched') {
                await addTowatchedList({ userId, animeId: anime.animeId });
            }
            setAnimeStatus(listType); // Update UI state to the new list
            setListActionMessage(`Anime added to ${listType} list!`);
        } catch (err) {
            setListActionMessage(`Failed to add: ${err.message}`);
        } finally {
            setProcessingListAction(false);
        }
    };

    const handleRemoveFromList = async (listType) => {
        setProcessingListAction(true);
        setListActionMessage('');
        try {
            if (listType === 'watching') {
                await removeFromWatching({ userId, animeId: anime.animeId });
            } else if (listType === 'watched') {
                await removeFromWatched({ userId, animeId: anime.animeId });
            }
            setAnimeStatus('none'); // Update UI state to 'none'
            setListActionMessage(`Anime removed from ${listType} list.`);
        } catch (err) {
            setListActionMessage(`Failed to remove: ${err.message}`);
        } finally {
            setProcessingListAction(false);
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

    const trailerEmbedUrl = getEmbedUrl(anime.trailer_url_base_anime);

    return (
        <div className="py-8 px-4 bg-anime-background text-anime-text-dark min-h-screen">
            <div className="max-w-6xl mx-auto bg-anime-card rounded-lg shadow-xl p-8 border border-anime-border">
                <h1 className="text-4xl font-bold text-anime-accent text-center mb-8">
                    {anime.animeName}
                </h1>

                <div className="md:flex gap-10">
                    {/* Left Column: Image, Trailer, and Info */}
                    <div className="md:w-2/3">
                        {/* Main Image */}
                        <div className="mb-8">
                            <img
                                src={
                                    anime.image_url_base_anime ||
                                    'https://placehold.co/400x560/16213E/E94560?text=No+Image'
                                }
                                alt={anime.animeName}
                                className="w-full max-w-sm mx-auto rounded-lg shadow-lg object-cover md:max-w-md"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                        'https://placehold.co/400x560/16213E/E94560?text=Image+Missing';
                                }}
                            />
                        </div>

                        {/* Trailer Display (Conditional) */}
                        {trailerEmbedUrl && (
                            <div className="mb-8">
                                <h3 className="text-2xl font-semibold text-anime-accent mb-3">Trailer</h3>
                                <div className="relative w-full" style={{ paddingBottom: '56.25%' /* 16:9 Aspect Ratio */ }}>
                                    <iframe
                                        src={trailerEmbedUrl}
                                        title={`${anime.animeName} Trailer`}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        className="absolute top-0 left-0 w-full h-full rounded-lg shadow-md"
                                    ></iframe>
                                </div>
                            </div>
                        )}

                        {/* Text Information - Now in a sleek grid format */}
                        <div className="mt-8 mb-8 p-6 bg-anime-sub-card rounded-lg border border-anime-border"> 
                            <h3 className="text-2xl font-semibold text-anime-accent mb-4">Details</h3> 
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-lg"> 
                                <div className="flex items-start"> 
                                    <span className="font-semibold text-anime-accent mr-2 min-w-[100px]">Genre:</span> 
                                    <span className="flex-grow">
                                        {anime.genres && anime.genres.length > 0
                                            ? anime.genres.map((g) => g.name).join(', ')
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-semibold text-anime-accent mr-2 min-w-[100px]">Origin:</span>
                                    <span className="flex-grow">N/A</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-semibold text-anime-accent mr-2 min-w-[100px]">Release Date:</span>
                                    <span className="flex-grow">
                                        {anime.releaseDate
                                            ? new Date(anime.releaseDate).toLocaleDateString()
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-semibold text-anime-accent mr-2 min-w-[100px]">Studio:</span>
                                    <span className="flex-grow">{anime.studio || 'N/A'}</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-semibold text-anime-accent mr-2 min-w-[100px]">Episodes:</span>
                                    <span className="flex-grow">N/A</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-semibold text-anime-accent mr-2 min-w-[100px]">Status:</span>
                                    <span className="flex-grow">
                                        {typeof anime.is_running === 'boolean'
                                            ? anime.is_running
                                                ? 'Currently Airing'
                                                : 'Finished Airing'
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-semibold text-anime-accent mr-2 min-w-[100px]">Adult Rated:</span>
                                    <span className="flex-grow">
                                        {typeof anime.is_adult_rated === 'boolean'
                                            ? anime.is_adult_rated
                                                ? 'Yes'
                                                : 'No'
                                            : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-semibold text-anime-accent mr-2 min-w-[100px]">Average Rating:</span>
                                    <span className="flex-grow">Not yet rated</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mt-8"> 
                            <h3 className="text-2xl font-semibold text-anime-accent mb-2">
                                Description
                            </h3>
                            <p className="text-anime-text-light leading-relaxed">
                                {anime.description || 'No description available.'}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: List Management & Rating */}
                    <div className="md:w-1/3 flex flex-col justify-start">
                        {/* List Management Section */}
                        {userId && ( // Only show if user is logged in
                            <div className="bg-anime-sub-card p-6 rounded-lg border border-anime-border shadow-inner mb-6">
                                <h3 className="text-xl font-semibold text-anime-accent mb-4 text-center">Manage My List</h3>
                                <div className="flex flex-wrap justify-center gap-3 mb-4">
                                    {/* Conditionally render buttons based on animeStatus */}
                                    {animeStatus === 'none' && (
                                        <>
                                            <button
                                                onClick={() => handleAddToList('watching')}
                                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={processingListAction}
                                            >
                                                {processingListAction ? 'Adding...' : 'Add to Watching'}
                                            </button>
                                            <button
                                                onClick={() => handleAddToList('watched')}
                                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={processingListAction}
                                            >
                                                {processingListAction ? 'Adding...' : 'Add to Watched'}
                                            </button>
                                        </>
                                    )}

                                    {/* Buttons for 'watching' status */}
                                    {animeStatus === 'watching' && (
                                        <>
                                            <button
                                                onClick={() => handleAddToList('watched')} // Backend handles moving from watching to watched
                                                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={processingListAction}
                                            >
                                                {processingListAction ? 'Moving...' : 'Mark as Watched'}
                                            </button>
                                            <button
                                                onClick={() => handleRemoveFromList('watching')}
                                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={processingListAction}
                                            >
                                                {processingListAction ? 'Removing...' : 'Remove from Watching'}
                                            </button>
                                        </>
                                    )}

                                    {/* Buttons for 'watched' status */}
                                    {animeStatus === 'watched' && (
                                        <>
                                            <button
                                                onClick={() => handleAddToList('watching')} // Backend handles moving from watched to watching
                                                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={processingListAction}
                                            >
                                                {processingListAction ? 'Moving...' : 'Move to Watching'}
                                            </button>
                                            <button
                                                onClick={() => handleRemoveFromList('watched')}
                                                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled={processingListAction}
                                            >
                                                {processingListAction ? 'Removing...' : 'Remove from Watched'}
                                            </button>
                                        </>
                                    )}
                                </div>
                                {listActionMessage && (
                                    <p className={`text-center text-sm mt-2 ${listActionMessage.includes('Failed') ? 'text-anime-error' : 'text-green-400'}`}>
                                        {listActionMessage}
                                    </p>
                                )}
                                <p className="text-anime-text-light text-sm text-center mt-3">
                                    Current Status: <span className="font-semibold capitalize">{animeStatus}</span>
                                </p>
                            </div>
                        )}


                        {/* Rating Section */}
                        <div className="p-6 bg-anime-sub-card rounded-lg shadow-inner border border-anime-border mt-6 md:mt-0"> 
                            <h3 className="text-xl font-semibold text-anime-accent mb-4 text-center">
                                Rate this Anime
                            </h3>
                            {ratingMessage && (
                                <p className="text-anime-success mb-2 text-center">
                                    {ratingMessage}
                                </p>
                            )}
                            {ratingError && (
                                <p className="text-anime-error mb-2 text-center">
                                    {ratingError}
                                </p>
                            )}
                            {userId ? (
                                <form onSubmit={handleRatingSubmit} className="space-y-3">
                                    <input
                                        type="number"
                                        min="1"
                                        max="10" 
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                        placeholder="1-10" 
                                        className="w-full p-2 rounded-md bg-anime-background border border-anime-border
                               text-anime-text-dark focus:outline-none focus:ring-2 focus:ring-anime-accent"
                                        required
                                    />
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-2 bg-anime-accent text-white font-semibold rounded-md
                               hover:bg-anime-accent-dark transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-anime-accent"
                                    >
                                        Submit Rating
                                    </button>
                                </form>
                            ) : (
                                <p className="text-anime-text-dark text-center">
                                    Please log in to rate.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AnimeDetailPage;
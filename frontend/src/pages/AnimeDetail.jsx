import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAnimeDetails, rateAnime } from '../api';
import { useAuth } from '../context/AuthContext';

// Helper function to convert YouTube watch URL to embed URL
const getEmbedUrl = (url) => {
    if (!url) return null;

    // Check if it's already an embed URL (e.g., from YouTube or Vimeo)
    if (url.includes('embed/') || url.includes('player.vimeo.com/video/')) {
        return url;
    }

    // Convert YouTube watch URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)
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

    const handleRatingSubmit = async (e) => {
        e.preventDefault();
        setRatingMessage('');
        setRatingError('');

        if (!userId) {
            setRatingError('Please log in to rate anime.');
            return;
        }
        const score = parseInt(rating);

        if (isNaN(score) || score < 1 || score > 5) {
            setRatingError('Rating must be between 1 and 5.');
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
            });
            setRatingMessage(`Rated ${response.score}/5 successfully!`);
            // Optionally update average rating if API returns it
        } catch (err) {
            console.error('Rating submission error:', err);
            setRatingError(err.message || 'Failed to submit rating.');
        } finally {
            setRating('');
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
                        <div className="mt-8 mb-8 p-6 bg-anime-sub-card rounded-lg border border-anime-border"> {/* Added padding, background, border to contain info */}
                            <h3 className="text-2xl font-semibold text-anime-accent mb-4">Details</h3> {/* New heading for this section */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-lg"> {/* Grid layout */}
                                <div className="flex items-start"> {/* Use flex to align label and value */}
                                    <span className="font-semibold text-anime-accent mr-2 min-w-[100px]">Genre:</span> {/* min-w for alignment */}
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
                        <div className="mt-8"> {/* Adjusted mt-8 for spacing after the new info box */}
                            <h3 className="text-2xl font-semibold text-anime-accent mb-2">
                                Description
                            </h3>
                            <p className="text-anime-text-light leading-relaxed">
                                {anime.description || 'No description available.'}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Rating */}
                    <div className="md:w-1/3 flex flex-col justify-start">
                        <div className="p-6 bg-anime-sub-card rounded-lg shadow-inner border border-anime-border">
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
                                        max="5"
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                        placeholder="1-5"
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
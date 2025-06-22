import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { addAnime, updateAnime, deleteAnime, getAdminCounts, addGenre, addSeason, getAllGenres, getAllSeasons } from '../api';
import { useNavigate } from 'react-router-dom';

function AdminPage() {
  const { userId, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formType, setFormType] = useState('add'); // 'add' or 'update'
  const [animeIdToUpdate, setAnimeIdToUpdate] = useState('');
  const [title, setTitle] = useState('');
  const [genreId, setGenreId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [year, setYear] = useState('');
  const [episodes, setEpisodes] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deleteAnimeId, setDeleteAnimeId] = useState('');

  const [newGenreName, setNewGenreName] = useState('');
  const [newSeasonName, setNewSeasonName] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [adminCounts, setAdminCounts] = useState(null);
  const [genres, setGenres] = useState([]);
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
    fetchAdminData();
  }, [isAdmin, navigate]);

  const fetchAdminData = async () => {
    if (!userId || !isAdmin) return;
    try {
      const [countsData, genresData, seasonsData] = await Promise.all([
        getAdminCounts(userId),
        getAllGenres(),
        getAllSeasons()
      ]);
      setAdminCounts(countsData);
      setGenres(genresData);
      setSeasons(seasonsData);
    } catch (err) {
      setError(err.message || 'Failed to fetch admin data.');
    }
  };

  const handleAnimeSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    const animeData = {
      title,
      genreId: parseInt(genreId),
      seasonId: parseInt(seasonId),
      locationId: parseInt(locationId),
      year: parseInt(year),
      episodes: parseInt(episodes),
      description,
      image_url: imageUrl,
    };

    try {
      if (formType === 'add') {
        const response = await addAnime(animeData, userId);
        setMessage(`Anime '${response.title}' added successfully!`);
      } else {
        const response = await updateAnime(animeIdToUpdate, animeData, userId);
        setMessage(`Anime '${response.title}' updated successfully!`);
      }
      resetForm();
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnime = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await deleteAnime(deleteAnimeId, userId);
      setMessage(response.message);
      setDeleteAnimeId('');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to delete anime.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGenre = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const response = await addGenre({ name: newGenreName });
      setMessage(response.message);
      setNewGenreName('');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to add genre.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSeason = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      const response = await addSeason({ name: newSeasonName });
      setMessage(response.message);
      setNewSeasonName('');
      fetchAdminData();
    } catch (err) {
      setError(err.message || 'Failed to add season.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAnimeIdToUpdate('');
    setTitle('');
    setGenreId('');
    setSeasonId('');
    setLocationId('');
    setYear('');
    setEpisodes('');
    setDescription('');
    setImageUrl('');
    setFormType('add');
  };

  if (!isAdmin) {
    return (
      <div className="text-center p-4 text-anime-error text-2xl my-12">
        Access Denied. You must be an administrator to view this page.
      </div>
    );
  }

  return (
    <div className="bg-anime-card p-8 rounded-lg shadow-xl border border-anime-border max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-anime-accent text-center mb-8">Admin Dashboard</h2>

      {message && <p className="text-anime-success text-center mb-4 text-lg">{message}</p>}
      {error && <p className="text-anime-error text-center mb-4 text-lg">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Admin Counts */}
        <div className="bg-anime-bg p-6 rounded-lg border border-anime-border shadow-md">
          <h3 className="text-2xl font-bold text-anime-accent mb-4">Current Stats</h3>
          {adminCounts ? (
            <>
              <p className="text-anime-text-light text-lg mb-2">Total Anime: {adminCounts.total_anime}</p>
              <h4 className="text-xl font-semibold text-anime-text-light mt-4 mb-2">Anime by Genre:</h4>
              <ul className="list-disc list-inside text-anime-text-dark">
                {Object.entries(adminCounts.genres).map(([genre, count]) => (
                  <li key={genre}>{genre}: {count}</li>
                ))}
              </ul>
              <h4 className="text-xl font-semibold text-anime-text-light mt-4 mb-2">Anime by Season:</h4>
              <ul className="list-disc list-inside text-anime-text-dark">
                {Object.entries(adminCounts.seasons).map(([season, count]) => (
                  <li key={season}>{season}: {count}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-anime-text-dark">Loading stats...</p>
          )}
        </div>

        {/* Add/Update Anime Form */}
        <div className="bg-anime-bg p-6 rounded-lg border border-anime-border shadow-md">
          <h3 className="text-2xl font-bold text-anime-accent mb-4">
            {formType === 'add' ? 'Add New Anime' : 'Update Anime'}
          </h3>
          <div className="mb-4">
            <button
              onClick={() => { setFormType('add'); resetForm(); }}
              className={`mr-2 px-4 py-2 rounded-md font-semibold ${formType === 'add' ? 'bg-anime-accent text-anime-bg' : 'bg-anime-border text-anime-text-light hover:bg-anime-accent-dark'}`}
            >
              Add Mode
            </button>
            <button
              onClick={() => setFormType('update')}
              className={`px-4 py-2 rounded-md font-semibold ${formType === 'update' ? 'bg-anime-accent text-anime-bg' : 'bg-anime-border text-anime-text-light hover:bg-anime-accent-dark'}`}
            >
              Update Mode
            </button>
          </div>

          {formType === 'update' && (
            <div className="mb-4">
              <label htmlFor="animeIdToUpdate" className="block text-anime-text-light text-sm font-bold mb-2">
                Anime ID to Update:
              </label>
              <input
                type="number"
                id="animeIdToUpdate"
                value={animeIdToUpdate}
                onChange={(e) => setAnimeIdToUpdate(e.target.value)}
                className="shadow appearance-none border border-anime-border rounded w-full py-2 px-3 text-anime-text-light leading-tight focus:outline-none focus:shadow-outline bg-anime-card"
                placeholder="Enter Anime ID"
              />
            </div>
          )}

          <form onSubmit={handleAnimeSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-anime-text-light text-sm font-bold mb-1">Title:</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required={formType === 'add'} className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light" />
            </div>
            <div>
              <label htmlFor="genreId" className="block text-anime-text-light text-sm font-bold mb-1">Genre ID:</label>
              <select id="genreId" value={genreId} onChange={(e) => setGenreId(e.target.value)} required={formType === 'add'} className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light">
                <option value="">Select a Genre</option>
                {genres.map(g => <option key={g.genreId} value={g.genreId}>{g.name} (ID: {g.genreId})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="seasonId" className="block text-anime-text-light text-sm font-bold mb-1">Season ID:</label>
              <select id="seasonId" value={seasonId} onChange={(e) => setSeasonId(e.target.value)} required={formType === 'add'} className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light">
                <option value="">Select a Season</option>
                {seasons.map(s => <option key={s.seasonId} value={s.seasonId}>{s.name} (ID: {s.seasonId})</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="locationId" className="block text-anime-text-light text-sm font-bold mb-1">Location ID:</label>
              <input type="number" id="locationId" value={locationId} onChange={(e) => setLocationId(e.target.value)} required={formType === 'add'} className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light" />
            </div>
            <div>
              <label htmlFor="year" className="block text-anime-text-light text-sm font-bold mb-1">Year:</label>
              <input type="number" id="year" value={year} onChange={(e) => setYear(e.target.value)} required={formType === 'add'} className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light" />
            </div>
            <div>
              <label htmlFor="episodes" className="block text-anime-text-light text-sm font-bold mb-1">Episodes:</label>
              <input type="number" id="episodes" value={episodes} onChange={(e) => setEpisodes(e.target.value)} required={formType === 'add'} className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light" />
            </div>
            <div>
              <label htmlFor="description" className="block text-anime-text-light text-sm font-bold mb-1">Description:</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"></textarea>
            </div>
            <div>
              <label htmlFor="imageUrl" className="block text-anime-text-light text-sm font-bold mb-1">Image URL:</label>
              <input type="text" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light" />
            </div>
            <button
              type="submit"
              className="w-full bg-anime-accent hover:bg-anime-accent-dark text-anime-bg font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md hover:shadow-anime-glow"
              disabled={loading}
            >
              {loading ? 'Processing...' : (formType === 'add' ? 'Add Anime' : 'Update Anime')}
            </button>
            {formType === 'update' && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full mt-2 bg-anime-border hover:bg-anime-text-dark text-anime-text-light font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md"
              >
                Reset Form
              </button>
            )}
          </form>
        </div>

        {/* Delete Anime Form */}
        <div className="bg-anime-bg p-6 rounded-lg border border-anime-border shadow-md">
          <h3 className="text-2xl font-bold text-anime-accent mb-4">Delete Anime</h3>
          <form onSubmit={handleDeleteAnime} className="space-y-4">
            <div>
              <label htmlFor="deleteAnimeId" className="block text-anime-text-light text-sm font-bold mb-1">Anime ID to Delete:</label>
              <input
                type="number"
                id="deleteAnimeId"
                value={deleteAnimeId}
                onChange={(e) => setDeleteAnimeId(e.target.value)}
                required
                className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
                placeholder="Enter Anime ID"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-anime-error hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete Anime'}
            </button>
          </form>
        </div>

        {/* Add Genre Form */}
        <div className="bg-anime-bg p-6 rounded-lg border border-anime-border shadow-md">
          <h3 className="text-2xl font-bold text-anime-accent mb-4">Add New Genre</h3>
          <form onSubmit={handleAddGenre} className="space-y-4">
            <div>
              <label htmlFor="newGenreName" className="block text-anime-text-light text-sm font-bold mb-1">Genre Name:</label>
              <input
                type="text"
                id="newGenreName"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                required
                className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-anime-accent hover:bg-anime-accent-dark text-anime-bg font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md hover:shadow-anime-glow"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Genre'}
            </button>
          </form>
        </div>

        {/* Add Season Form */}
        <div className="bg-anime-bg p-6 rounded-lg border border-anime-border shadow-md">
          <h3 className="text-2xl font-bold text-anime-accent mb-4">Add New Season</h3>
          <form onSubmit={handleAddSeason} className="space-y-4">
            <div>
              <label htmlFor="newSeasonName" className="block text-anime-text-light text-sm font-bold mb-1">Season Name:</label>
              <input
                type="text"
                id="newSeasonName"
                value={newSeasonName}
                onChange={(e) => setNewSeasonName(e.target.value)}
                required
                className="w-full p-2 rounded border border-anime-border bg-anime-card text-anime-text-light"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-anime-accent hover:bg-anime-accent-dark text-anime-bg font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md hover:shadow-anime-glow"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Season'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
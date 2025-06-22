import React, { useState } from 'react';
import { loginUser } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginUser({ username_or_email: usernameOrEmail, password });
      login(response.user_id, response.username);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <form onSubmit={handleSubmit} className="bg-anime-card p-8 rounded-lg shadow-xl max-w-md w-full border border-anime-border">
        <h2 className="text-3xl font-bold text-anime-accent text-center mb-6">Login</h2>

        {error && <p className="text-anime-error text-center mb-4 text-lg">{error}</p>}

        <div className="mb-4">
          <label htmlFor="usernameOrEmail" className="block text-anime-text-light text-sm font-bold mb-2">
            Username or Email:
          </label>
          <input
            type="text"
            id="usernameOrEmail"
            value={usernameOrEmail}
            onChange={(e) => setUsernameOrEmail(e.target.value)}
            required
            className="shadow appearance-none border border-anime-border rounded w-full py-2 px-3 text-anime-text-light leading-tight focus:outline-none focus:shadow-outline bg-anime-bg"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-anime-text-light text-sm font-bold mb-2">
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shadow appearance-none border border-anime-border rounded w-full py-2 px-3 text-anime-text-light leading-tight focus:outline-none focus:shadow-outline bg-anime-bg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-anime-accent hover:bg-anime-accent-dark text-anime-bg font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out shadow-md hover:shadow-anime-glow"
          disabled={loading}
        >
          {loading ? 'Logging In...' : 'Login'}
        </button>

        <p className="text-center text-anime-text-dark text-sm mt-4">
          Don't have an account? <Link to="/signup" className="text-anime-accent hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
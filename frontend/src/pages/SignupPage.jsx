import React, { useState } from 'react';
import { signupUser } from '../api';
import { Link, useNavigate } from 'react-router-dom';

function SignupPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!country.trim() || !state.trim() || !city.trim()) {
      setError('Please provide your country, state, and city.');
      return;
    }

    setLoading(true);
    try {
      const response = await signupUser({
        userName,
        email,
        password,
        location: {
          country,
          state,
          city,
        },
      });

      setMessage(response.message || 'Signup successful!');
      
      setUserName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCountry('');
      setState('');
      setCity('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to sign up. An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
      <form onSubmit={handleSubmit} className="bg-anime-card p-8 rounded-lg shadow-xl max-w-md w-full border border-anime-border">
        <h2 className="text-3xl font-bold text-anime-accent text-center mb-6">Sign Up</h2>

        {message && <p className="text-anime-success text-center mb-4 text-lg">{message}</p>}
        {error && <p className="text-anime-error text-center mb-4 text-lg">{error}</p>}

        <div className="mb-4">
          <label htmlFor="userName" className="block text-anime-text-light text-sm font-bold mb-2">
            Username:
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            className="shadow appearance-none border border-anime-border rounded w-full py-2 px-3 text-anime-text-light leading-tight focus:outline-none focus:shadow-outline bg-anime-bg"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-anime-text-light text-sm font-bold mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow appearance-none border border-anime-border rounded w-full py-2 px-3 text-anime-text-light leading-tight focus:outline-none focus:shadow-outline bg-anime-bg"
          />
        </div>

        <h3 className="text-xl font-bold text-anime-text-light mt-6 mb-4">Your Location:</h3>
        <div className="mb-4">
          <label htmlFor="country" className="block text-anime-text-light text-sm font-bold mb-2">
            Country:
          </label>
          <input
            type="text"
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="shadow appearance-none border border-anime-border rounded w-full py-2 px-3 text-anime-text-light leading-tight focus:outline-none focus:shadow-outline bg-anime-bg"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="state" className="block text-anime-text-light text-sm font-bold mb-2">
            State:
          </label>
          <input
            type="text"
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            className="shadow appearance-none border border-anime-border rounded w-full py-2 px-3 text-anime-text-light leading-tight focus:outline-none focus:shadow-outline bg-anime-bg"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="city" className="block text-anime-text-light text-sm font-bold mb-2">
            City:
          </label>
          <input
            type="text"
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="shadow appearance-none border border-anime-border rounded w-full py-2 px-3 text-anime-text-light leading-tight focus:outline-none focus:shadow-outline bg-anime-bg"
          />
        </div>

        <div className="mb-4">
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

        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-anime-text-light text-sm font-bold mb-2">
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="shadow appearance-none border border-anime-border rounded w-full py-2 px-3 text-anime-text-light leading-tight focus:outline-none focus:shadow-outline bg-anime-bg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-anime-accent hover:bg-anime-accent-dark text-anime-bg font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-300 ease-in-out shadow-md hover:shadow-anime-glow"
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <p className="text-center text-anime-text-dark text-sm mt-4">
          Already have an account? <Link to="/login" className="text-anime-accent hover:underline">Log In</Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;
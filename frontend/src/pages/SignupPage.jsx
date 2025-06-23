import React, { useEffect, useState } from 'react';
import { signupUser, getCountries, getStates, getCities } from '../api';
import { Link, useNavigate } from 'react-router-dom';

function SignupPage() {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [country, setCountry] = useState('');
  const [states, setStates] = useState([]);
  const [state, setState] = useState('');
  const [cities, setCities] = useState([]);
  const [city, setCity] = useState('');
  const [countries, setCountries] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // --- API Call Logic (Backend-dependent, keeping as is) ---
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await getCountries();
        setCountries(data);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
        setError("Failed to load countries. Please try again.");
      }
    };
    fetchCountries();
  }, []);

  useEffect(() => {
    if (country) {
      const fetchStates = async () => {
        try {
          const data = await getStates(country);
          setStates(data);
          setState('');
          setCities([]);
          setCity('');
        } catch (err) {
          console.error(`Failed to fetch states for ${country}:`, err);
          setStates([]);
          setError(`Failed to load states for ${country}.`);
        }
      };
      fetchStates();
    } else {
      setStates([]);
      setState('');
      setCities([]);
      setCity('');
    }
  }, [country]);

  useEffect(() => {
    if (state && country) { // Pass country to getCities
      const fetchCities = async () => {
        try {
          const data = await getCities(state, country); // Pass country here
          setCities(data);
          setCity('');
        } catch (err) {
          console.error(`Failed to fetch cities for ${state}, ${country}:`, err);
          setCities([]);
          setError(`Failed to load cities for ${state}.`);
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setCity('');
    }
  }, [state, country]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!country.trim() || !state.trim() || !city.trim()) {
      setError('Please select your country, state, and city from the dropdowns.');
      return;
    }

    setLoading(true);
    try {
      const response = await signupUser({
        userName,
        email,
        password,
        country,
        city, 
        state,
      });

      setMessage(response.message || 'Signup successful!');

      // Clear form fields
      setUserName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setCountry('');
      setState('');
      setCity('');
      setStates([]);
      setCities([]);

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setError(err.message || 'Failed to sign up. An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // --- Beautification Starts Here ---

  // Common classes for inputs and selects for consistency and cleaner code
  const inputClasses = `
    shadow-sm appearance-none border border-anime-border rounded-md w-full py-2 px-3
    text-anime-text-light leading-tight focus:outline-none focus:ring-2
    focus:ring-anime-accent focus:border-transparent bg-anime-bg
    transition duration-200 ease-in-out
  `;

  const disabledInputClasses = `
    disabled:opacity-60 disabled:cursor-not-allowed
  `;

  return (
    <div className="flex flex-grow items-center justify-center py-8 px-4 bg-anime-bg"> {/* Enhanced main container for centering and background */}
      <form
        onSubmit={handleSubmit}
        className="bg-anime-card p-8 rounded-xl shadow-2xl max-w-md w-full
                   border border-anime-border transform transition-all duration-300
                   hover:shadow-anime-glow" // Added a subtle hover glow for the card
      >
        <h2 className="text-4xl font-extrabold text-anime-accent text-center mb-8 tracking-wide"> {/* Larger, bolder title */}
          Join the Anime Community!
        </h2>

        {message && (
          <p className="bg-anime-success/20 text-anime-success border border-anime-success rounded-md p-3 mb-4 text-center text-base animate-pulse"> {/* Enhanced success message */}
            {message}
          </p>
        )}
        {error && (
          <p className="bg-anime-error/20 text-anime-error border border-anime-error rounded-md p-3 mb-4 text-center text-base animate-bounce-in"> {/* Enhanced error message, maybe an actual bounce-in if you define it in CSS */}
            {error}
          </p>
        )}

        <div className="mb-5"> {/* Increased margin-bottom for better spacing */}
          <label htmlFor="userName" className="block text-anime-text-light text-sm font-medium mb-2"> {/* Slightly adjusted font */}
            Username:
          </label>
          <input
            type="text"
            id="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
            className={`${inputClasses}`}
          />
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="block text-anime-text-light text-sm font-medium mb-2">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={`${inputClasses}`}
          />
        </div>

        <h3 className="text-2xl font-semibold text-anime-text-light mt-8 mb-5 border-b border-anime-border pb-2"> {/* Styled subheading */}
          Your Location:
        </h3>
        <div className="mb-5">
          <label htmlFor="country" className="block text-anime-text-light text-sm font-medium mb-2">
            Country:
          </label>
          <select
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className={`${inputClasses}`}
          >
            <option value="">Select Country</option>
            {countries.map((c) => (
              <option key={c} value={c} className="bg-anime-card text-anime-text-light">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label htmlFor="state" className="block text-anime-text-light text-sm font-medium mb-2">
            State:
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
            disabled={!country || states.length === 0}
            className={`${inputClasses} ${disabledInputClasses}`}
          >
            <option value="">Select State</option>
            {states.map((s) => (
              <option key={s} value={s} className="bg-anime-card text-anime-text-light">
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label htmlFor="city" className="block text-anime-text-light text-sm font-medium mb-2">
            City:
          </label>
          <select
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            disabled={!state || cities.length === 0}
            className={`${inputClasses} ${disabledInputClasses}`}
          >
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c} value={c} className="bg-anime-card text-anime-text-light">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-5">
          <label htmlFor="password" className="block text-anime-text-light text-sm font-medium mb-2">
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={`${inputClasses}`}
          />
        </div>

        <div className="mb-8"> {/* Increased margin-bottom for spacing before button */}
          <label htmlFor="confirmPassword" className="block text-anime-text-light text-sm font-medium mb-2">
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className={`${inputClasses}`}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-anime-accent hover:bg-anime-accent-dark text-anime-bg
                     font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2
                     focus:ring-anime-accent focus:ring-offset-2 focus:ring-offset-anime-card
                     transition duration-300 ease-in-out shadow-lg hover:shadow-anime-glow
                     transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed" // Enhanced button styles
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>

        <p className="text-center text-anime-text-dark text-sm mt-6"> {/* Increased margin-top */}
          Already have an account?{' '}
          <Link to="/login" className="text-anime-accent hover:underline font-semibold">
            Log In
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignupPage;
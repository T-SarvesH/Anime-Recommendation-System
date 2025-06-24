const API_BASE_URL = 'http://127.0.0.1:8001'; // Make sure this matches your FastAPI server

async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // FastAPI typically returns a 'detail' field for HTTPExceptions
      const errorMessage = data.detail || response.statusText;
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error; // Re-throw to be caught by the calling component
  }
}

export const getRecommendations = async (userId) => {
  return fetchData(`${API_BASE_URL}/anime/recommendations/${userId}`);
};

export const getUserProfile = async (userId) => {
  return fetchData(`${API_BASE_URL}/user/${userId}`);
};


export const getAllAnime = async () => {
  return fetchData(`${API_BASE_URL}/anime/all`);
};


export const getAnimeDetails = async (animeName) => {
  return fetchData(`${API_BASE_URL}/anime/${encodeURIComponent(animeName)}`);
};

export const loginUser = async (credentials) => {
  return fetchData(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
};

export const signupUser = async (userData) => {
  return fetchData(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
};

export const addGenre = async (genreData) => {
  return fetchData(`${API_BASE_URL}/add_genre`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(genreData),
  });
};

export const addSeason = async (seasonData) => {
  return fetchData(`${API_BASE_URL}/add_season`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(seasonData),
  });
};

export const addAnime = async (animeData, adminUserId) => {
  return fetchData(`${API_BASE_URL}/admin/anime?admin_user_id=${adminUserId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(animeData),
  });
};

export const updateAnime = async (animeId, updateData, adminUserId) => {
  return fetchData(`${API_BASE_URL}/admin/anime/${animeId}?admin_user_id=${adminUserId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });
};

export const deleteAnime = async (animeId, adminUserId) => {
  return fetchData(`${API_BASE_URL}/admin/anime/${animeId}?admin_user_id=${adminUserId}`, {
    method: 'DELETE',
  });
};

export const getAdminCounts = async (adminUserId) => {
  return fetchData(`${API_BASE_URL}/admin/counts?admin_user_id=${adminUserId}`);
};

export const rateAnime = async (ratingData) => {
  return fetchData(`${API_BASE_URL}/rate_anime`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ratingData),
  });
};

export const getAllGenres = async () => {
    return fetchData(`${API_BASE_URL}/genres/all`);
};

export const getAllSeasons = async () => {
    return fetchData(`${API_BASE_URL}/seasons/all`);
};

// UPDATED: Simplified getAnimeWithFilters to only include genre filter for now
export const getAnimeWithFilters = async ({ userId = null, genreId = null }) => {
  const params = new URLSearchParams();
  if (userId) params.append('user_id', userId);
  if (genreId) params.append('genre_id', genreId);

  const url = userId
    ? `${API_BASE_URL}/anime/recommendations/${userId}?${params.toString()}`
    : `${API_BASE_URL}/anime/all?${params.toString()}`;

  return fetchData(url);
};

//Get Cities for the state
export const getCities = async(stateName) =>{

  return fetchData(`${API_BASE_URL}/get_cities/${stateName}`);
}

export const getStates = async(countryName) => {

  return fetchData(`${API_BASE_URL}/get_states/${countryName}`);
}

export const getCountries = async() => {

  return fetchData(`${API_BASE_URL}/get_countries`);
}
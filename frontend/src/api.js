const API_BASE_URL = 'http://127.0.0.1:8001'; // Make sure this matches your FastAPI server

async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json(); // Always try to parse JSON response

    if (!response.ok) {
      let errorMessage = response.statusText || 'An unknown error occurred';
      if (data && data.detail) {
        // If FastAPI provides a 'detail' field, use it.
        // For 422 errors, 'detail' is often a list of validation errors.
        if (Array.isArray(data.detail)) {
          errorMessage = data.detail.map(err => {
            const loc = err.loc ? err.loc.join('.') : 'unknown_location';
            const msg = err.msg || 'no message';
            return `${loc}: ${msg}`;
          }).join('; ');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        }
      }
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error; 
  }
}

export const getRecommendations = async (userId) => {
  return fetchData(`${API_BASE_URL}/get_recommendations/${userId}`);
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

export const addTowatchedList = async(animeListUpdate) => {

  return fetchData(`${API_BASE_URL}/add-to-watched-list/`, {

    method: 'PATCH',
    headers:{

      "Content-Type": "application/json",
    },

    body: JSON.stringify(animeListUpdate),

  });
}

export const addTowatchingList = async(animeListUpdate) => {

  return fetchData(`${API_BASE_URL}/add-to-watching-list/`, {

    method: 'PATCH',
    headers:{

      "Content-Type": "application/json",
    },

    body: JSON.stringify(animeListUpdate),

  });
}

export const removeFromWatched = async(animeListUpdate) => {

  return fetchData(`${API_BASE_URL}/remove-from-watched-list/`, {

    method: 'PATCH',
    headers:{

      "Content-Type": "application/json",
    },

    body: JSON.stringify(animeListUpdate),

  });
}

export const removeFromWatching = async(animeListUpdate) => {

  return fetchData(`${API_BASE_URL}/remove-from-watching-list/`, {

    method: 'PATCH',
    headers:{

      "Content-Type": "application/json",
    },

    body: JSON.stringify(animeListUpdate),

  });
}

export const getUserProfile = async(user_id) => {

  return fetchData(`${API_BASE_URL}/profile/${user_id}`);
  
}
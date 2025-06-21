// my-anime-recs-frontend/src/api.js
const API_BASE_URL = 'http://127.0.0.1:8001'; // IMPORTANT: Your FastAPI backend URL

//A simple call to our react page

export const simpleCall = async() => {

    try {
    const response = await fetch(`${API_BASE_URL}/`, { 
      method: "GET",
      headers: {
        "Content-Type": "application/json"  
      }
      
    });

    console.log("Status:", response.status, response.statusText);

    if (!response.ok) {
      throw new Error('HTTP Error ' + response.status);
    }

    console.log("Sending API resp");
    return await response.json(); // 👈 Await this
  } catch (error) {
    console.error("Fetch failed:", error.message);
    throw error;
  }
}

//Use common function fetch

export const fetchfunction = async(URL, options = {}) => {

    const fetchResponse = fetch(URL, options);

    if (!fetchResponse.ok)
        throw error ('HTTP_ERROR' + await fetchResponse.status)

    return fetchResponse.json();
    
}
export const signup = async({user}) => {

        return fetchfunction('{API_BASE_URL}/signup', {

            method: "POST",
            headers: {

                'Content-type': 'application/json'
            },
            body: JSON.stringify({user})
        })

}
/**
 * API utilities for making requests to the backend
 */

// Determine API base URL based on environment
const isDevelopment = import.meta.env.DEV;
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:8000' 
  : 'https://kalashala.pythonanywhere.com';

// Log which environment we're using
console.log(`Using API URL: ${API_BASE_URL} (${isDevelopment ? 'development' : 'production'} mode)`);

/**
 * Make an API request with fetch
 * @param {string} endpoint - API endpoint (e.g., '/custom_auth/login/')
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @returns {Promise} - Fetch response promise
 */
export const apiRequest = async (endpoint, options = {}) => {
  // Always include credentials to handle cookies for authentication
  const fetchOptions = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, fetchOptions);
  
  // For unsuccessful responses, throw an error with the status
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, data: errorData };
  }
  
  // Return JSON if the response has content, otherwise return null
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return null;
};

/**
 * Get the CSRF token
 * @returns {Promise<string>} - CSRF token
 */
export const getCsrfToken = async () => {
  try {
    const data = await apiRequest('/custom_auth/get-csrf-token/');
    return data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    return null;
  }
};

/**
 * Login user
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise<Object>} - Login result
 */
export const login = async (credentials) => {
  const token = await getCsrfToken();
  
  try {
    await apiRequest('/custom_auth/login/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': token,
      },
      body: JSON.stringify({
        username: credentials.email,
        password: credentials.password
      })
    });
    
    // If login is successful, get user data
    const userData = await apiRequest('/custom_auth/user/', {
      headers: {
        'X-CSRFToken': token,
      }
    });
    
    // Set authentication data in localStorage
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userName", userData.name || userData.username);
    localStorage.setItem("userType", userData.user_type || "None");
    
    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.data?.error || "Login failed. Please check your credentials." 
    };
  }
};

/**
 * Logout user
 * @returns {Promise<boolean>} - Logout success status
 */
export const logout = async () => {
  const token = await getCsrfToken();
  
  try {
    await apiRequest('/custom_auth/logout/', {
      method: 'POST',
      headers: {
        'X-CSRFToken': token,
      }
    });
    
    // Clear authentication data in localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("userType");
    
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
};
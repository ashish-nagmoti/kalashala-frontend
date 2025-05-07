import { createContext, useState, useEffect } from 'react';
import { getCsrfToken, login as apiLogin, logout as apiLogout, apiRequest } from '../utils/api';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [userType, setUserType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [csrfToken, setCsrfToken] = useState('');

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        // Get token first
        const token = await getCsrfToken();
        setCsrfToken(token);
        
        // Check if user is authenticated in localStorage
        const auth = localStorage.getItem("isAuthenticated") === "true";
        
        if (auth) {
          // Try to get user data from server
          try {
            const userData = await apiRequest('/custom_auth/user/', {
              headers: {
                "X-CSRFToken": token,
              }
            });
            
            const name = userData.name || userData.username;
            const type = userData.user_type || "None";
            
            setUserName(name);
            setUserType(type);
            localStorage.setItem("userName", name);
            localStorage.setItem("userType", type);
            setIsAuthenticated(true);
          } catch (error) {
            console.error("Error fetching user data:", error);
            clearAuthData();
          }
        } else {
          // User is not authenticated according to localStorage
          clearAuthData();
        }
      } catch (err) {
        console.error("Auth check error:", err);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const result = await apiLogin(credentials);
      
      if (result.success) {
        // Get stored user data from localStorage (set by the API utility)
        setUserName(localStorage.getItem("userName") || '');
        setUserType(localStorage.getItem("userType") || '');
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        error: "Something went wrong. Please try again later." 
      };
    }
  };

  // Logout function
  const logout = async () => {
    const success = await apiLogout();
    
    if (success) {
      clearAuthData();
    }
    
    return success;
  };

  // Helper function to clear auth data
  const clearAuthData = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userName");
    localStorage.removeItem("userType");
    setIsAuthenticated(false);
    setUserName("");
    setUserType("");
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userName, 
      userType, 
      isLoading, 
      csrfToken,
      login,
      logout,
      getCsrfToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
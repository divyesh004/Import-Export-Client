import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL, getApiConfig } from '../config/env';

// Create the auth context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL
  });
  
  // Add request interceptor to include token in headers
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Check if user is already logged in on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      setCurrentUser({ token, role });
    }
    
    setLoading(false);
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      
      // Save token and user role to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      
      // Set current user
      setCurrentUser({
        token: response.data.token,
        role: response.data.user.role
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Save token and user role to localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.user.role);
      
      // Set current user
      setCurrentUser({
        token: response.data.token,
        role: response.data.user.role
      });
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setCurrentUser(null);
  };

  // Forgot password
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to process forgot password request' };
    }
  };

  // Reset password
  const resetPassword = async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to reset password' };
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.patch('/auth/update', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update profile' };
    }
  };

  // Show notification with improved styling and user-friendly messages
  const showNotification = (message, type = 'info') => {
    // Format system error messages to be more user-friendly
    let formattedMessage = message;
    
    // Common error message improvements
    if (type === 'error') {
      // Replace technical error messages with user-friendly ones
      if (message.includes('Failed to fetch') || message.includes('Network Error')) {
        formattedMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (message.includes('401') || message.includes('Unauthorized')) {
        formattedMessage = 'Your session has expired. Please login again.';
      } else if (message.includes('404') || message.includes('Not Found')) {
        formattedMessage = 'The requested resource was not found.';
      } else if (message.includes('500') || message.includes('Internal Server Error')) {
        formattedMessage = 'Something went wrong on our end. Please try again later.';
      }
    }
    
    setNotification({ message: formattedMessage, type });
    
    // Clear notification after 5 seconds
    setTimeout(() => {
      setNotification({ message: '', type: '' });
    }, 5000);
  };

  // Google login
  const googleLogin = async () => {
    try {
      window.location.href = `${API_BASE_URL}/auth/google`;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to login with Google' };
    }
  };

  // Toggle login popup
  const toggleLoginPopup = (show = true) => {
    setShowLoginPopup(show);
  };

  const value = {
    currentUser,
    setCurrentUser,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    notification,
    showNotification,
    googleLogin,
    showLoginPopup,
    toggleLoginPopup
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {notification.message && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${notification.type === 'error' ? 'bg-red-500 text-white' : notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
          {notification.message}
        </div>
      )}
    </AuthContext.Provider>
  );
};
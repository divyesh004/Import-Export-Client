// Authentication utilities for token handling and API configuration

import axios from 'axios';
import { API_BASE_URL } from '../config/env';

/**
 * Creates an axios instance with authentication interceptors
 * @param {Function} onTokenExpired - Callback function to execute when token expires
 * @param {Function} showNotification - Function to display notifications
 * @returns {Object} Configured axios instance
 */
export const createAuthenticatedApi = (onTokenExpired, showNotification) => {
  // Create axios instance
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
  
  // Add response interceptor to handle token expiration
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response && error.response.status === 401) {
        // Get user role before clearing data
        const userRole = localStorage.getItem('role');
        
        // Clear user data
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        
        // Show notification about session expiration
        if (showNotification) {
          showNotification('Your session has expired. Please login again.', 'error');
        }
        
        // Call the token expired callback with user role
        if (onTokenExpired) {
          onTokenExpired(userRole);
        }
      }
      return Promise.reject(error);
    }
  );
  
  return api;
};

/**
 * Checks if the current user is authenticated
 * @returns {Boolean} True if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Gets the current user's role
 * @returns {String|null} User role or null if not authenticated
 */
export const getUserRole = () => {
  return localStorage.getItem('role');
};
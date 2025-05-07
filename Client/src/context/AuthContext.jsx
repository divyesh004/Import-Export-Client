import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL, getApiConfig } from '../config/env';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL
  });
  
  // Setup axios interceptors inside useEffect to have access to navigate
  useEffect(() => {
    // Add request interceptor to include token in headers
    const requestInterceptor = api.interceptors.request.use(
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
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized errors (token expired or invalid)
        if (error.response && error.response.status === 401) {
          // Get user role before clearing data
          const userRole = localStorage.getItem('role');
          
          // Clear user data
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          setCurrentUser(null);
          
          // Show notification about session expiration
          setNotification({
            message: 'Your session has expired. Please login again.',
            type: 'error'
          });
          
          // Show login popup
          setShowLoginPopup(true);
          
          // Define protected routes by role
          const protectedRoutes = {
            user: ['/dashboard', '/profile', '/orders', '/my-inquiries'],
            seller: ['/seller', '/seller-dashboard', '/manage-products'],
            admin: ['/admin', '/admin-dashboard', '/rtq-management']
          };
          
          const currentPath = window.location.pathname;
          
          // Check if current path is protected for any role
          const isProtectedRoute = Object.values(protectedRoutes).some(routes => 
            routes.some(route => currentPath.startsWith(route))
          );
          
          // If on protected route, redirect based on previous role
          if (isProtectedRoute) {
            if (userRole === 'admin' || userRole === 'seller') {
              // For admin and seller, redirect to home page
              navigate('/');
            } else {
              // For regular users, redirect to login
              navigate('/login');
            }
          }
        }
        return Promise.reject(error);
      }
    );
    
    // Cleanup interceptors when component unmounts
    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]); // Add navigate as a dependency

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
      // Extract captchaToken if it exists in userData
      const { captchaToken, ...userInfo } = userData;
      
      // Create request payload with captcha token
      const requestData = {
        ...userInfo,
        recaptchaToken: captchaToken // Send the reCAPTCHA token to the backend
      };
      
      const response = await api.post('/auth/signup', requestData);
      
      // Don't automatically log in the user after registration
      // Instead, return the response data which should include a message about email verification
      return {
        ...response.data,
        requiresEmailVerification: true
      };
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  };
  
  // Verify email with token
  const verifyEmail = async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Email verification failed' };
    }
  };
  
  // Resend verification email
  const resendVerificationEmail = async (email) => {
    try {
      // If email is provided, use the specific endpoint
      if (email) {
        const response = await api.post('/auth/resend-verification', { email });
        return response.data;
      } else {
        // If no email provided, use the user's current session
        const response = await api.post('/auth/verify-email/resend');
        return response.data;
      }
    } catch (error) {
      throw error.response?.data || { error: 'Failed to resend verification email' };
    }
  };

  // Login user
  const login = async (email, password, captchaToken) => {
    try {
      // Create request payload with email, password and captcha token
      const requestData = {
        email,
        password,
        recaptchaToken: captchaToken // Send the reCAPTCHA token to the backend
      };
      
      const response = await api.post('/auth/login', requestData);
      
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
      // Make sure token is properly formatted and not undefined
      if (!token) {
        throw new Error('Reset token is missing or invalid');
      }
      
      // Check if token contains error parameters
      if (token.includes('error=') || token.includes('error_code=')) {
        throw new Error('Invalid reset token. The link appears to contain error information instead of a valid token.');
      }
      
      // Log the token for debugging (remove in production)
      console.log('Using reset token:', token);
      
      const response = await api.post('/auth/reset-password', { 
        token, 
        new_password: password 
      });
      
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 401) {
          throw { error: 'Your password reset link has expired or is invalid. Please request a new one.' };
        } else if (error.response.status === 400) {
          throw { error: 'Invalid password format or reset request. Please try again with a stronger password.' };
        }
      }
      
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

  // Toggle login popup with role-based redirection
  const toggleLoginPopup = (show = true) => {
    setShowLoginPopup(show);
    
    if (show) {
      // Get current user role
      const userRole = localStorage.getItem('role');
      
      // Get current path to check if we're on a protected page
      const currentPath = window.location.pathname;
      
      // Define protected routes by role
      const protectedRoutes = {
        user: ['/profile', '/orders', '/my-inquiries'],
        seller: ['/seller', '/seller-dashboard', '/manage-products'],
        admin: ['/admin', '/admin-dashboard', '/rtq-management']
      };
      
      // Check if current path is protected for the user's role
      const isProtectedRoute = userRole && protectedRoutes[userRole] && 
        protectedRoutes[userRole].some(route => currentPath.startsWith(route));
      
      // If we're on a protected route, redirect based on role
      if (isProtectedRoute) {
        // For admin and seller, redirect to their respective dashboards
        if (userRole === 'admin') {
          navigate('/admin');
        } else if (userRole === 'seller') {
          navigate('/seller');
        } else {
          // For regular users, redirect to home
          navigate('/');
        }
      }
    }
  };




  // Check if user's email is verified
  const checkEmailVerification = async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data.email_verified || false;
    } catch (error) {
      console.error('Failed to check email verification status:', error);
      return false;
    }
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
    toggleLoginPopup,
    verifyEmail,
    resendVerificationEmail,
    checkEmailVerification
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
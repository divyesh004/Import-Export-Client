// Environment variables configuration

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// App Information
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Import Export Platform';
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '0.1.0';

// Feature Flags
export const ENABLE_ANALYTICS = import.meta.env.VITE_ENABLE_ANALYTICS === 'true';

// reCAPTCHA Configuration
// For production, use your actual site key from Google reCAPTCHA dashboard
// For testing, you can use Google's test key: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
export const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

// Create a configured axios instance that can be imported throughout the app
export const getApiConfig = (token) => {
  return {
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  };
};
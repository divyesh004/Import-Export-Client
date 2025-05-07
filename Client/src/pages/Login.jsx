import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaLock, FaGoogle, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_SITE_KEY } from '../config/env';

const Login = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaError, setCaptchaError] = useState('');
  const { login, googleLogin, showNotification } = useAuth();
  const navigate = useNavigate();
  
  // Using reCAPTCHA site key from environment configuration

  // Login validation schema
  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .required('Password is required')
  });
  
  // Handle reCAPTCHA change
  const handleCaptchaChange = (value) => {
    setCaptchaValue(value);
    setCaptchaError('');
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setCaptchaError('');
      setIsLoading(true);
      
      // Verify reCAPTCHA
      if (!captchaValue) {
        setCaptchaError('Please complete the security verification');
        setIsLoading(false);
        setSubmitting(false);
        return;
      }
      
      // Add captcha token to the login request
      await login(values.email, values.password, captchaValue);
      showNotification('Login successful!', 'success');
      navigate('/profile');
    } catch (err) {
      // More user-friendly error messages
      let errorMessage = 'Unable to sign in at this time. Please try again.';
      
      if (err.error) {
        if (err.error.includes('password') || err.error.includes('credentials')) {
          errorMessage = 'Incorrect email or password. Please try again.';
        } else if (err.error.includes('not found') || err.error.includes('email')) {
          errorMessage = 'This email is not registered. Please check your email or create an account.';
        } else if (err.error.includes('many attempts')) {
          errorMessage = 'Too many unsuccessful login attempts. Please try again later or reset your password.';
        } else if (err.error.includes('captcha') || err.error.includes('recaptcha')) {
          errorMessage = 'Security verification failed. Please try again.';
          setCaptchaError('Security verification failed. Please try again.');
        }
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    try {
      setError('');
      await googleLogin();
    } catch (err) {
      // More user-friendly Google login error message
      let errorMessage = 'Unable to sign in with Google at this time. Please try again or use email login.';
      
      if (err.error) {
        if (err.error.includes('access') || err.error.includes('permission')) {
          errorMessage = 'Google login was denied. Please allow the necessary permissions to continue.';
        } else if (err.error.includes('network') || err.error.includes('connection')) {
          errorMessage = 'Network issue detected. Please check your internet connection and try again.';
        }
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center">
      <div className="container max-w-md mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header with decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-700"></div>
          
          <div className="p-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
                <FaLock className="text-primary-600 text-2xl" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-center text-gray-500 mb-8">Sign in to access your account</p>
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-lg flex items-start animate-fadeIn">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <Formik
              initialValues={{ email: '', password: '', recaptcha: '' }}
              validationSchema={loginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2 text-sm">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                        placeholder="Enter your email"
                      />
                    </div>
                    <ErrorMessage name="email" component="div" className="mt-1 text-red-600 text-sm font-medium" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label htmlFor="password" className="block text-gray-700 font-medium text-sm">Password</label>
                      <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800 hover:underline transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                      </div>
                      <Field
                        type="password"
                        name="password"
                        id="password"
                        className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                        placeholder="Enter your password"
                      />
                    </div>
                    <ErrorMessage name="password" component="div" className="mt-1 text-red-600 text-sm font-medium" />
                  </div>
                  
                  {/* reCAPTCHA */}
                  <div className="mt-6 mb-4">
                    <div className="flex flex-col items-center">
                      <div className="mb-2 flex items-center">
                        <FaShieldAlt className="text-primary-500 mr-2" />
                        <span className="text-sm text-gray-600">Security Verification</span>
                      </div>
                      <div className="flex justify-center">
                        <ReCAPTCHA
                          sitekey={RECAPTCHA_SITE_KEY}
                          onChange={handleCaptchaChange}
                        />
                      </div>
                      {captchaError && (
                        <div className="mt-2 text-red-600 text-sm font-medium">{captchaError}</div>
                      )}
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none font-medium mt-2"
                  >
                    {isSubmitting || isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : 'Sign In'}
                  </button>
                </Form>
              )}
            </Formik>
            
        
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-600 hover:text-primary-800 font-medium hover:underline transition-colors">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
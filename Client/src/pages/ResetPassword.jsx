import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaLock, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword, showNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams(); // Get URL parameters using useParams hook

  // Extract token from URL on component mount
  useEffect(() => {
    // Clear previous states
    setError('');
    setSuccess('');
    
    try {
      // Check if there are error parameters in the URL
      const searchParams = new URLSearchParams(location.search);
      const errorParam = searchParams.get('error');
      const errorCode = searchParams.get('error_code');
      const errorDescription = searchParams.get('error_description');
      
      // If there are error parameters, show appropriate error message
      if (errorParam === 'access_denied' || errorCode === 'otp_expired') {
        const errorMsg = errorDescription 
          ? decodeURIComponent(errorDescription.replace(/\+/g, ' ')) 
          : 'Your password reset link has expired or is invalid.';
        throw new Error(errorMsg);
      }
      
      // Check all possible token locations
      let resetToken = null;
      
      // 1. Check URL params from React Router (for routes like /reset-password/:token)
      // This is the most reliable method when using React Router
      if (params.token && params.token.length > 10) {
        resetToken = params.token;
      }
      
      // 2. Check URL query parameters (most common format: /reset-password?token=xyz)
      if (!resetToken) {
        resetToken = searchParams.get('token') || searchParams.get('reset');
      }
      
      // 3. Check URL path parameter (format: /reset-password/xyz)
      if (!resetToken) {
        const pathSegments = location.pathname.split('/');
        if (pathSegments.length > 2) {
          // Get the last segment of the path
          const lastSegment = pathSegments[pathSegments.length - 1];
          // Make sure it's not just 'reset-password' and has a reasonable token length
          if (lastSegment !== 'reset-password' && lastSegment.length > 10) {
            resetToken = lastSegment;
          }
        }
      }
      
      // 4. Check URL hash fragment (format: /reset-password#token=xyz)
      if (!resetToken) {
        if (location.hash && location.hash.length > 1) {
          const hash = location.hash.substring(1);
          // Check if hash contains a token parameter
          if (hash.includes('token=')) {
            const hashParams = new URLSearchParams(hash);
            resetToken = hashParams.get('token');
          } else if (hash.length > 10) {
            // If hash is just the token itself (format: /reset-password#xyz)
            resetToken = hash;
          }
        }
      }
      
      // 5. Check if token is in the state from a previous navigation
      if (!resetToken && location.state && location.state.token) {
        resetToken = location.state.token;
      }
      
      // Set token if found and validate it has a reasonable length
      if (resetToken && resetToken.length > 10) {
        console.log('Reset token found:', resetToken);
        setToken(resetToken);
      } else {
        console.error('Token not found or invalid length:', resetToken);
        throw new Error('Password reset token not found. Please request a new password reset link.');
      }
    } catch (err) {
      console.error('Error extracting token:', err);
      setError(err.message || 'Invalid or unavailable reset token. Please request a new password reset link.');
    }
  }, [location, params]);

  // Reset password validation schema
  const resetPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(/[^\w\s]/, 'Password must contain at least one special character')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords do not match')
      .required('Password confirmation is required')
  });

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      
      if (!token) {
        throw new Error('Invalid or unavailable reset token');
      }
      
      await resetPassword(token, values.password);
      
      setSuccess('Your password has been successfully reset!');
      showNotification('Password reset successful!', 'success');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      // User-friendly password reset error messages
      let errorMessage = 'Unable to reset your password at this time. Please try again.';
      
      if (err.error) {
        if (err.error.includes('token') || err.error.includes('expired') || err.error.includes('invalid')) {
          errorMessage = 'Your password reset link has expired or is invalid. Please request a new one.';
        } else if (err.error.includes('password')) {
          errorMessage = 'Your new password does not meet the requirements. Please choose a strong password.';
        }
      } else if (err.message) {
        // Use the error message directly if available
        errorMessage = err.message;
      }
      
      console.error('Password reset failed:', err);
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">Reset Your Password</h1>
          <p className="text-center text-gray-600 mb-8">
            Create a new password for your account.
          </p>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-md flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded-md">
              <p>{success}</p>
              <p className="mt-2 text-sm">Redirecting to login page...</p>
            </div>
          )}
          
          {token && !success && (
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              validationSchema={resetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 font-medium mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="mt-1 text-red-600 text-sm" />
                    <p className="mt-1 text-xs text-gray-500">Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character.</p>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <Field
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-red-600 text-sm" />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </Form>
              )}
            </Formik>
          )}
          
          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium">
              <FaArrowLeft className="mr-2" />
              Back to Sign In
            </Link>
          </div>
          
          {!token && !error && (
            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-primary-600 hover:text-primary-800 font-medium">
                Get a new password reset link
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
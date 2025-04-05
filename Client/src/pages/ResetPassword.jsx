import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const { resetPassword, showNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tokenFromUrl = searchParams.get('token');
    
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Invalid or unavailable reset token. Please request a new password reset link.');
    }
  }, [location]);

  // Reset password validation schema
  const resetPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required')
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      
      if (!token) {
        throw new Error('Invalid or missing reset token');
      }
      
      await resetPassword(token, values.password);
      
      setSuccess('Your password has been successfully reset!');
      showNotification('Password reset successful!', 'success');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      // More user-friendly password reset error messages in Hindi
      let errorMessage = 'Unable to reset your password at this time. Please try again.';
      
      if (err.error) {
        if (err.error.includes('token') || err.error.includes('expired')) {
          errorMessage = 'Your password reset link has expired or is invalid. Please request a new one.';
        } else if (err.error.includes('password')) {
          errorMessage = 'Your new password does not meet the requirements. Please choose a strong password.';
        }
      }
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12">
      <div className="container max-w-md mx-auto">
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
            <div className="bg-green-50 text-green-800 p-4 mb-6 rounded-md">
              {success}
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
                        type="password"
                        name="password"
                        id="password"
                        className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <ErrorMessage name="password" component="div" className="mt-1 text-red-600 text-sm" />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <Field
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Confirm new password"
                      />
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
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword, showNotification } = useAuth();

  // Forgot password validation schema
  const forgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required')
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      
      await forgotPassword(values.email);
      
      setSuccess('Password reset instructions have been sent to your email.');
      showNotification('Password reset email sent successfully!', 'success');
      resetForm();
    } catch (err) {
      // More user-friendly password reset error messages
      let errorMessage = 'Unable to send password reset email at this time. Please try again later.';
      
      if (err.error) {
        if (err.error.includes('not found') || err.error.includes('no account')) {
          errorMessage = 'No account found with this email address. Please check your email or create an account.';
        } else if (err.error.includes('too many') || err.error.includes('rate limit')) {
          errorMessage = 'Too many reset attempts. Please wait a while before trying again.';
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
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">Forgot Your Password?</h1>
          <p className="text-center text-gray-600 mb-8">
            Enter your email address and we'll send you instructions to reset your password.
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
            </div>
          )}
          
          <Formik
            initialValues={{ email: '' }}
            validationSchema={forgotPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-6">
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      className="pl-10 w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="mt-1 text-red-600 text-sm" />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isLoading ? 'Sending...' : 'Send Reset Instructions'}
                </button>
              </Form>
            )}
          </Formik>
          
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

export default ForgotPassword;
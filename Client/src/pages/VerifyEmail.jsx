import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Loading from '../components/common/Loading';

const VerifyEmail = () => {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { showNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');

        if (!token) {
          setError('Verification token is missing. Please check your email link.');
          setLoading(false);
          return;
        }

        // Create axios instance
        const api = axios.create({
          baseURL: API_BASE_URL
        });

        // Call API to verify email
        const response = await api.post('/auth/verify-email', { token });

        if (response.data && response.data.success) {
          setSuccess(true);
          showNotification('Your email has been successfully verified!', 'success');
          
          // Redirect to profile page after 3 seconds
          setTimeout(() => {
            navigate('/profile');
          }, 3000);
        } else {
          throw new Error('Email verification failed');
        }
      } catch (err) {
        console.error('Email verification error:', err);
        const errorMessage = err.response?.data?.error || err.message || 'Email verification failed';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [location, navigate, showNotification]);

  return (
    <div className="py-12">
      <div className="container max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {loading ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Verifying Your Email</h1>
              <div className="flex justify-center mb-4">
                <Loading size="lg" />
              </div>
              <p className="text-gray-700">Please wait while we verify your email address...</p>
            </>
          ) : success ? (
            <>
              <div className="text-green-500 flex justify-center mb-4">
                <FaCheckCircle size={50} />
              </div>
              <h1 className="text-2xl font-bold text-green-600 mb-4">Email Verified!</h1>
              <p className="text-gray-700 mb-4">Your email has been successfully verified.</p>
              <p className="text-gray-500">Redirecting to your profile page...</p>
            </>
          ) : (
            <>
              <div className="text-red-500 flex justify-center mb-4">
                <FaExclamationTriangle size={50} />
              </div>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Verification Failed</h1>
              <p className="text-gray-700 mb-4">{error}</p>
              <button
                onClick={() => navigate('/profile')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition duration-300"
              >
                Go to Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
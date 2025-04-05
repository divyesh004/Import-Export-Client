import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import { API_BASE_URL } from '../config/env';

const AuthCallback = () => {
  const [error, setError] = useState('');
  const { setCurrentUser, showNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash fragment from the URL
        const hash = location.hash;
        
        if (!hash) {
          setError('Authentication failed. No token received.');
          return;
        }

        // Parse the hash to get access_token and other data
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (!accessToken) {
          setError('Authentication failed. Invalid token.');
          return;
        }

        // Get user info from Supabase using the token
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to verify authentication');
        }

        const data = await response.json();
        
        // Set user in context
        setCurrentUser({
          token: accessToken,
          role: data.role || 'customer'
        });

        showNotification('Successfully signed in with Google!', 'success');
        
        // Redirect to profile page
        navigate('/profile');
      } catch (err) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
        showNotification(err.message || 'Authentication failed', 'error');
        
        // Redirect to login page after error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [location, navigate, setCurrentUser, showNotification]);

  return (
    <div className="py-12">
      <div className="container max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {error ? (
            <>
              <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
              <p className="text-gray-700 mb-4">{error}</p>
              <p className="text-gray-500">Redirecting to login page...</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Authenticating</h1>
              <div className="flex justify-center mb-4">
                <Loading size="lg" />
              </div>
              <p className="text-gray-700">Please wait while we complete your authentication...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
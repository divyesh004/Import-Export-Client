import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaIndustry, FaBoxOpen, FaSpinner, FaExclamationCircle, FaCheckCircle, FaReply } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { createAuthenticatedApi } from '../../utils/authUtils';
import Loading from '../common/Loading';
import { motion, AnimatePresence } from 'framer-motion';

const MyCustomProductRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, showNotification, toggleLoginPopup } = useAuth();
  
  // Create API instance with authentication handling
  let api;
  
  // Initialize API with authentication handling
  useEffect(() => {
    // Create authenticated API instance that handles token expiration
    api = createAuthenticatedApi(
      // Token expired callback with role-based redirection
      (userRole) => {
        // Show login popup when token expires
        toggleLoginPopup(true);
        
        // Redirect based on previous user role
        if (userRole === 'admin') {
          // Admin will be redirected to admin dashboard when they log in again
          window.location.href = '/';
        } else if (userRole === 'seller') {
          // Seller will be redirected to seller dashboard when they log in again
          window.location.href = '/';
        } else {
          // Regular users are redirected to home page
          window.location.href = '/';
        }
      },
      // Show notification function
      showNotification
    );
  }, [toggleLoginPopup, showNotification]);
  
  // Check if token exists on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Please login to access this page', 'error');
      toggleLoginPopup(true);
      window.location.href = '/';
    }
  }, [showNotification, toggleLoginPopup]);

  // Fetch all custom product requests for the current user
  useEffect(() => {
    const fetchUserRequests = async () => {
      if (!currentUser) {
        setLoading(false);
        // Redirect to home if no current user
        showNotification('Please login to access this page', 'error');
        toggleLoginPopup(true);
        window.location.href = '/';
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Make sure API is initialized before using it
        if (!api) {
          // Create authenticated API instance that handles token expiration
          api = createAuthenticatedApi(
            // Token expired callback
            () => {
              // Show login popup when token expires
              toggleLoginPopup(true);
              // Redirect to home page
              window.location.href = '/';
            },
            // Show notification function
            showNotification
          );
        }
        
        // Get token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found. Please login again.');
          showNotification('Please login to view your product requests', 'error');
          toggleLoginPopup(true);
          setLoading(false);
          // Redirect to home page if no token
          window.location.href = '/';
          return;
        }
        
        // Get all product requests for the current user
        const response = await api.get('/product-requests');
        
        // Check if response.data exists and is an array
        if (!response.data || !Array.isArray(response.data)) {
          setRequests([]);
          setLoading(false);
          return;
        }
        
        // Sort requests by date (newest first)
        const sortedRequests = response.data.sort(
          (a, b) => {
            try {
              return new Date(b.created_at) - new Date(a.created_at);
            } catch (err) {
              console.error('Error sorting dates:', err);
              return 0; // Keep original order if there's an error
            }
          }
        );
        
        setRequests(sortedRequests);
      } catch (err) {
        console.error('Error fetching user product requests:', err);
        // Check for specific error types
        if (err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            setError('Authentication error. Please login again.');
            showNotification('Please login to view your product requests', 'error');
            toggleLoginPopup(true);
          } else {
            setError(`Failed to load your product requests: ${err.response.data?.error || err.response.data?.message || 'Unknown error'}`);
            showNotification('Failed to load your product requests', 'error');
          }
        } else {
          setError('Failed to load your product requests. Network error.');
          showNotification('Failed to load your product requests. Please check your internet connection.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserRequests();
  }, [currentUser, showNotification, toggleLoginPopup]); 

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge based on request status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <FaSpinner className="mr-1 animate-spin" />
            Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <FaSpinner className="mr-1 animate-spin" />
            Processing
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <FaCheckCircle className="mr-1" />
            Completed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <FaExclamationCircle className="mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FaSpinner className="mr-1" />
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FaBoxOpen className="mr-2 text-primary-600" />
          My Custom Product Requests
        </h2>
        <div className="flex justify-center py-8">
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FaBoxOpen className="mr-2 text-primary-600" />
          My Custom Product Requests
        </h2>
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-hidden">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <FaBoxOpen className="mr-2 text-primary-600" />
          My Custom Product Requests
        </h2>
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <FaBoxOpen className="mx-auto text-4xl text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">You haven't made any custom product requests yet.</p>
          <Link 
            to="/products" 
            className="inline-block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 overflow-hidden">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <FaBoxOpen className="mr-2 text-primary-600" />
        My Custom Product Requests
      </h2>
      
      <div className="space-y-4">
        {requests.map((request) => (
          <motion.div 
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center gap-2">
              <div className="flex items-center">
                <FaBoxOpen className="text-primary-600 mr-2" />
                <h3 className="font-medium text-gray-800">{request.product_name}</h3>
              </div>
              <div className="flex items-center space-x-3">
                {getStatusBadge(request.status)}
                <span className="text-xs text-gray-500 flex items-center">
                  <FaCalendarAlt className="mr-1" />
                  {formatDate(request.created_at)}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Contact Information:</p>
                  <div className="text-sm">
                    <p className="flex items-center mb-1">
                      <FaUser className="text-gray-400 mr-2" />
                      <span className="font-medium">{request.name}</span>
                    </p>
                    <p className="text-gray-600">{request.email}</p>
                    <p className="text-gray-600">{request.phone}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Industry:</p>
                  <p className="flex items-center text-sm">
                    <FaIndustry className="text-gray-400 mr-2" />
                    <span className="capitalize">{request.industry}</span>
                  </p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Product Details:</p>
                <p className="text-sm text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-md">
                  {request.product_details}
                </p>
              </div>
              
              {request.response && (
                <div className="mt-4 border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2 flex items-center">
                    <FaReply className="mr-2 text-primary-600" />
                    Response from Seller:
                  </p>
                  <div className="bg-primary-50 p-3 rounded-md text-sm text-gray-700 whitespace-pre-line">
                    {request.response}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default MyCustomProductRequests;
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaShoppingBag, FaSpinner, FaExclamationCircle, FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaFileInvoice, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { createAuthenticatedApi } from '../utils/authUtils';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/env';
import Loading from '../components/common/Loading';
import ProductFallbackImage from '../components/common/ProductFallbackImage';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgErrors, setImgErrors] = useState({});
  const { currentUser, showNotification, toggleLoginPopup } = useAuth();
  const navigate = useNavigate();
  
  // Handle image error
  const handleImageError = (orderId, imageUrl) => {
    setImgErrors(prev => ({ ...prev, [orderId]: true }));
  };
  
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
          navigate('/');
        } else if (userRole === 'seller') {
          // Seller will be redirected to seller dashboard when they log in again
          navigate('/');
        } else {
          // Regular users are redirected to home page
          navigate('/');
        }
      },
      // Show notification function
      showNotification
    );
  }, [toggleLoginPopup, showNotification, navigate]);

  // Fetch orders for the current user only
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Try to fetch only current user's orders with user_id parameter
        // If backend doesn't support this parameter, we'll filter on frontend
        const response = await api.get(`/orders?user_id=${currentUser.id}`);
        
        
        if (response.data && Array.isArray(response.data)) {
          // Even if backend doesn't filter by user_id, ensure we only show current user's orders
          const userOrders = response.data.filter(order => {
            // Filter orders that belong to current user
            return order.user_id === currentUser.id;
          });
          
          // Sort orders by date (newest first)
          const sortedOrders = userOrders.sort((a, b) => {
            return new Date(b.created_at) - new Date(a.created_at);
          });
          
          // Process orders to ensure product data is properly structured
          // Using sortedOrders which now contains only the current user's orders
          const processedOrders = sortedOrders.map(order => {
            
            
            // Handle the case where product data is in 'products' object (as shown in API response)
            if (order.products) {
              // If we have products object, use it directly
              if (!order.product) {
                order.product = {
                  id: order.products.id,
                  name: order.products.name,
                  price: order.products.price,
                  image_url: order.products.imageUrls?.[0] || order.products.image_url,
                  imageUrls: order.products.imageUrls || (order.products.image_url ? [order.products.image_url] : []),
                  description: order.products.description
                };
              }
            }
            // If order has product_id but no product object, create a basic one
            else if (order.product_id && !order.product) {
              order.product = {
                id: order.product_id,
                name: order.product_name || 'Product',
                price: order.price || 0,
                product_images: order.product_images || []
              };
            }
            
            // Handle different image data structures
            if (order.product) {
              // If product exists but has no images or incomplete image data
              if (!order.product.image_url && !order.product.imageUrls?.length && !order.product.product_images?.length) {
                if (order.product_images && Array.isArray(order.product_images) && order.product_images.length > 0) {
                  // If order has product_images array directly
                  order.product.product_images = order.product_images;
                  // Also set image_url for convenience
                  if (order.product_images[0].image_url) {
                    order.product.image_url = order.product_images[0].image_url;
                    
                    // Fix relative URLs by prepending API_BASE_URL if needed
                    if (order.product.image_url && !order.product.image_url.startsWith('http')) {
                      order.product.image_url = `${API_BASE_URL}${order.product.image_url.startsWith('/') ? '' : '/'}${order.product.image_url}`;
                    }
                  }
                } 
                
                if (order.image_url) {
                  // If order has direct image_url
                  order.product.image_url = order.image_url;
                  
                  // Fix relative URLs by prepending API_BASE_URL if needed
                  if (order.product.image_url && !order.product.image_url.startsWith('http')) {
                    order.product.image_url = `${API_BASE_URL}${order.product.image_url.startsWith('/') ? '' : '/'}${order.product.image_url}`;
                  }
                } 
                
                if (order.products?.imageUrls?.length) {
                  // If order has imageUrls in products object
                  order.product.imageUrls = order.products.imageUrls.map(url => {
                    // Fix relative URLs in imageUrls array
                    if (url && !url.startsWith('http')) {
                      return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
                    }
                    return url;
                  });
                  
                  // Also set image_url if not already set
                  if (!order.product.image_url && order.product.imageUrls[0]) {
                    order.product.image_url = order.product.imageUrls[0];
                  }
                }
                
                if (order.products?.image_url) {
                  // If products has a direct image_url
                  order.product.image_url = order.products.image_url;
                  
                  // Fix relative URLs by prepending API_BASE_URL if needed
                  if (order.product.image_url && !order.product.image_url.startsWith('http')) {
                    order.product.image_url = `${API_BASE_URL}${order.product.image_url.startsWith('/') ? '' : '/'}${order.product.image_url}`;
                  }
                }
              } else {
                // Fix existing image URLs if they are relative
                if (order.product.image_url && !order.product.image_url.startsWith('http')) {
                  order.product.image_url = `${API_BASE_URL}${order.product.image_url.startsWith('/') ? '' : '/'}${order.product.image_url}`;
                }
                
                if (order.product.imageUrls && Array.isArray(order.product.imageUrls)) {
                  order.product.imageUrls = order.product.imageUrls.map(url => {
                    if (url && !url.startsWith('http')) {
                      return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
                    }
                    return url;
                  });
                }
                
                if (order.product.product_images && Array.isArray(order.product.product_images)) {
                  order.product.product_images.forEach(img => {
                    if (img.image_url && !img.image_url.startsWith('http')) {
                      img.image_url = `${API_BASE_URL}${img.image_url.startsWith('/') ? '' : '/'}${img.image_url}`;
                    }
                  });
                }
              }
              
              // Ensure product name is set
              if (!order.product.name || order.product.name === 'Product') {
                order.product.name = order.products?.name || order.product_name || 'Product';
              }
            }
            
            
            
            return order;
          });
          
          setOrders(processedOrders);
        } else {
          console.warn('No orders data or invalid format received:', response.data);
          setOrders([]);
        }
      } catch (err) {
        
        setError('Failed to load your orders');
        if (showNotification) {
          showNotification('Failed to load your orders', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (err) {
      
      return 'Invalid date';
    }
  };

  // Get status badge based on order status
  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Pending</span>;
      case 'processing':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Processing</span>;
      case 'shipped':
        return <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">Shipped</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Delivered</span>;
      case 'cancelled':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Cancelled</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Unknown</span>;
    }
  };

  // If user is not logged in
  if (!currentUser) {
    return (
      <div className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 px-6 text-white text-center">
              <FaBoxOpen className="mx-auto text-5xl mb-4" />
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">My Orders</h1>
              <p className="text-lg opacity-90">Please login to view your orders</p>
            </div>
            <div className="p-6 sm:p-8 md:p-10 text-center">
              <button 
                onClick={() => toggleLoginPopup(true)}
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Login to View Orders
              </button>
              <div className="mt-4">
                <Link to="/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
                  <FaArrowLeft className="mr-2" />
                  Back to Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>
          <div className="flex justify-center p-12">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FaExclamationCircle className="mx-auto text-red-500 text-4xl mb-4" />
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No orders state
  if (orders.length === 0) {
    return (
      <div className="py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">My Orders</h1>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-8 text-center">
              <FaShoppingBag className="mx-auto text-gray-400 text-5xl mb-4" />
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start shopping to place your first order!</p>
              <Link 
                to="/products" 
                className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors inline-block"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Orders list view
  return (
    <div className="py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">My Orders</h1>
        
        {/* Orders list */}
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Order header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-wrap justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <FaCalendarAlt className="text-gray-500 text-sm" />
                    <span className="text-sm text-gray-600">{formatDate(order.created_at)}</span>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              </div>
              
              {/* Order content */}
              <div className="p-4 sm:p-6">
                {/* Product info */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 pb-4 border-b border-gray-200">
                  <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center mb-3 sm:mb-0 sm:mr-4 relative overflow-hidden">
                    {(() => {
                      // Extract all possible image sources
                      const imageSources = [
                        order.product?.image_url,
                        order.product?.imageUrls?.[0],
                        order.product?.product_images?.[0]?.image_url,
                        order.products?.imageUrls?.[0],
                        order.image_url,
                        order.product_images?.[0]?.image_url,
                        order.products?.image_url,
                        order.products?.product_images?.[0]?.image_url
                      ];
                      
                      // Filter out undefined, null, empty strings and validate URLs
                      const validSources = imageSources.filter(src => {
                        return src && typeof src === 'string' && src.trim() !== '';
                      });
                      
                      // Find the first valid image source
                      let imageUrl = validSources.length > 0 ? validSources[0] : null;
                      
                      // Fix relative URLs by prepending API_BASE_URL
                      if (imageUrl && !imageUrl.startsWith('http')) {
                        // If URL is relative, prepend API_BASE_URL
                        imageUrl = `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                      }
                      
                      // Validate final URL
                      if (imageUrl) {
                        try {
                          // Test if URL is valid by creating a URL object
                          new URL(imageUrl);
                        } catch (e) {
                          
                          imageUrl = null; // Reset to null if invalid
                        }
                      }
                      
                      // Debug image sources with more details
                      
                      
                      
                      
                      if (!imageUrl || imgErrors[order.id]) {
                        return <ProductFallbackImage />;
                      }
                      
                      return (
                        <div className="relative">
                          {/* Image with error handling */}
                          <img 
                            src={imageUrl} 
                            alt={order.products?.name || order.product?.name || order.product_name || 'Product Image'} 
                            className="max-w-full max-h-full object-contain"
                            
                            onError={() => handleImageError(order.id, imageUrl)}
                          />
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-lg">{order.products?.name || order.product?.name || order.product_name || (order.product && order.product.product_name) || 'Product'}</h3>
                    <div className="text-gray-600 text-sm mt-1">Quantity: {order.quantity || 1}</div>
                    <div className="text-gray-600 text-sm">Price: ${(order.products?.price || order.product?.price || order.price || 0).toFixed(2)}</div>
                    {(order.products?.description || order.product_description) && <div className="text-gray-600 text-sm mt-1 line-clamp-2">{order.products?.description || order.product_description}</div>}
                    {(order.product?.id || order.products?.id || order.product_id) && (
                      <Link 
                        to={`/products/${order.product?.id || order.products?.id || order.product_id}`}
                        className="inline-flex items-center text-sm bg-indigo-600 text-white px-3 py-1 rounded mt-2 hover:bg-indigo-700 transition-colors"
                      >
                        Go to Product
                      </Link>
                    )}
                  </div>
                  <div className="mt-3 sm:mt-0">
                    <div className="text-lg font-semibold">
                      ${((order.products?.price || order.product?.price || order.price || 0) * (order.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                {/* Order details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-gray-500" />
                      Shipping Address
                    </h4>
                    <p className="text-gray-600 text-sm">{order.shipping_address || 'No address provided'}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FaCalendarAlt className="mr-2 text-gray-500" />
                      Delivery Information
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Preferred Delivery Date: {formatDate(order.preferred_delivery_date)}
                    </p>
                    {order.tracking_number && (
                      <p className="text-gray-600 text-sm mt-1">
                        Tracking Number: {order.tracking_number}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Additional notes */}
                {order.additional_notes && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                      <FaInfoCircle className="mr-2 text-gray-500" />
                      Additional Notes
                    </h4>
                    <p className="text-gray-600 text-sm">{order.additional_notes}</p>
                  </div>
                )}
              </div>
              
              {/* Order footer */}
              <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex flex-wrap justify-between items-center">
                <div>
                  {order.status === 'delivered' && (
                    <div className="flex items-center text-green-600">
                      <FaCheckCircle className="mr-1" />
                      <span className="text-sm">Delivered on {formatDate(order.delivered_at)}</span>
                    </div>
                  )}
                  {order.status === 'shipped' && (
                    <div className="flex items-center text-blue-600">
                      <FaTruck className="mr-1" />
                      <span className="text-sm">Shipped on {formatDate(order.shipped_at)}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  {order.invoice_url && (
                    <a 
                      href={order.invoice_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm flex items-center text-indigo-600 hover:text-indigo-800"
                    >
                      <FaFileInvoice className="mr-1" />
                      View Invoice
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Back to products link */}
        <div className="mt-8 text-center">
          <Link to="/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
            <FaArrowLeft className="mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Orders;
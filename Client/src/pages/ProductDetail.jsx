import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaShare, FaChevronLeft, FaChevronRight, FaFileAlt, FaInfoCircle, FaShieldAlt, FaTruck, FaExchangeAlt, FaRegClock } from 'react-icons/fa';
import Skeleton from '../components/common/Skeleton';
import Loading from '../components/common/Loading';
import RTQForm from '../components/common/RTQForm';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/env';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rtqModalOpen, setRtqModalOpen] = useState(false);
  const { showNotification } = useAuth();
  
  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL
  });
  
  // Add request interceptor to include token in headers
  api.interceptors.request.use(
    (config) => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Fetch product details from backend
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get(`/products/${id}`);
        
        if (response.data) {
          // Format the product data to match our component's expectations
          const productData = response.data;
          const formattedProduct = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            discount: productData.discount || 0,
            images: productData.product_images ? 
              productData.product_images.map(img => img.image_url) : 
              ['/images/category-electronics-new.svg'], // Fallback image if none provided
            category: productData.category || 'Uncategorized',
            brand: productData.brand || 'Unknown',
            rating: productData.rating || 4.0,
            reviews: productData.reviews || [],
            description: productData.description,
            features: (() => {
              try {
                if (!productData.features) return [];
                if (typeof productData.features === 'string') {
                  try {
                    const parsedFeatures = JSON.parse(productData.features);
                    return Array.isArray(parsedFeatures) ? parsedFeatures : [];
                  } catch (parseError) {
                    console.error('Error parsing features JSON:', parseError);
                    // If JSON parsing fails, try to split by commas or newlines
                    if (productData.features.includes(',')) {
                      return productData.features.split(',').map(item => item.trim()).filter(Boolean);
                    } else if (productData.features.includes('\n')) {
                      return productData.features.split('\n').map(item => item.trim()).filter(Boolean);
                    }
                    // If all else fails, return as a single item array
                    return [productData.features];
                  }
                }
                return Array.isArray(productData.features) ? productData.features : 
                       (productData.features ? [productData.features.toString()] : []);
              } catch (e) {
                console.error('Error processing features:', e);
                return [];
              }
            })(),
            specifications: (() => {
              try {
                if (!productData.specifications) return {};
                if (typeof productData.specifications === 'string') {
                  try {
                    const parsedSpecs = JSON.parse(productData.specifications);
                    return typeof parsedSpecs === 'object' && parsedSpecs !== null ? parsedSpecs : {};
                  } catch (parseError) {
                    console.error('Error parsing specifications JSON:', parseError);
                    // If JSON parsing fails, try to create a simple object
                    const fallbackSpecs = {};
                    if (productData.specifications.includes(':')) {
                      // Try to parse as key-value pairs if it contains colons
                      const lines = productData.specifications.split('\n');
                      lines.forEach(line => {
                        const parts = line.split(':');
                        if (parts.length >= 2) {
                          const key = parts[0].trim();
                          const value = parts.slice(1).join(':').trim();
                          if (key && value) fallbackSpecs[key] = value;
                        }
                      });
                      return Object.keys(fallbackSpecs).length > 0 ? fallbackSpecs : { 'Specification': productData.specifications };
                    }
                    return { 'Specification': productData.specifications };
                  }
                }
                return typeof productData.specifications === 'object' && productData.specifications !== null ? 
                       productData.specifications : {};
              } catch (e) {
                console.error('Error processing specifications:', e);
                return {};
              }
            })(),
            stock: productData.stock || 10,
            shipping: productData.shipping || 'Standard Shipping',
            returnPolicy: productData.return_policy || '30-day return policy'
          };
          
          setProduct(formattedProduct);
        } else {
          // Show error if no product returned
          setError('Product not found');
          showNotification('Product not found', 'error');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to fetch product details';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        
        // Show error message
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id, showNotification]);
  
  // Calculate discounted price
  const discountedPrice = product && product.discount 
    ? (product.price - (product.price * product.discount / 100)).toFixed(2) 
    : product ? product.price : 0;

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity > 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handle image navigation
  const nextImage = () => {
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="container">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center mb-6">
            <Skeleton type="text" />
          </div>
          
          {/* Product Details Skeleton */}
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            {/* Product Images Skeleton */}
            <div className="lg:w-1/2">
              <div className="bg-gradient-skeleton rounded-lg h-96 skeleton-animation mb-4"></div>
              
              {/* Thumbnail Images Skeleton */}
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="w-20 h-20 bg-gradient-skeleton rounded-md skeleton-animation"></div>
                ))}
              </div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="lg:w-1/2">
              <Skeleton type="title" />
              
              {/* Rating Skeleton */}
              <div className="flex items-center mb-4 mt-2">
                <Skeleton type="text" />
              </div>
              
              {/* Price Skeleton */}
              <div className="mb-6">
                <Skeleton type="title" />
              </div>
              
              {/* Short Description Skeleton */}
              <div className="mb-6">
                <Skeleton type="text" count={2} />
              </div>
              
              {/* Details Skeleton */}
              <div className="space-y-6 mb-6">
                <div className="flex items-center">
                  <Skeleton type="text" />
                </div>
                <div className="flex items-center">
                  <Skeleton type="text" />
                </div>
                <div className="flex items-center">
                  <Skeleton type="text" />
                </div>
              </div>
              
              {/* Quantity Selector Skeleton */}
              <div className="flex items-center mb-6">
                <Skeleton type="text" />
              </div>
              
              {/* Action Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Skeleton type="button" />
                <Skeleton type="button" />
                <Skeleton type="button" />
              </div>
            </div>
          </div>
          
          {/* Product Tabs Skeleton */}
          <div className="mb-12">
            <div className="border-b border-gray-200">
              <div className="flex">
                <Skeleton type="text" />
                <Skeleton type="text" />
                <Skeleton type="text" />
              </div>
            </div>
            
            <div className="py-6">
              <Skeleton type="text" count={5} />
            </div>
          </div>
          
          {/* Related Products Skeleton */}
          <div>
            <Skeleton type="title" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="card">
                  <div className="h-48 bg-gradient-skeleton rounded-t skeleton-animation"></div>
                  <div className="p-4">
                    <Skeleton type="title" />
                    <Skeleton type="text" />
                    <div className="flex justify-between items-center mt-2">
                      <Skeleton type="text" />
                      <Skeleton type="button" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error message if product not found or error occurred
  if (error) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link to="/products" className="btn bg-primary-600 text-white hover:bg-primary-700 inline-block">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error if product is null
  if (!product) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-600 mb-4">Product Not Found</h2>
            <p className="text-gray-700 mb-6">The product you are looking for does not exist or has been removed.</p>
            <Link to="/products" className="btn bg-primary-600 text-white hover:bg-primary-700 inline-block">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4 sm:py-8 bg-gray-50 min-h-screen">
      <div className="container px-4 sm:px-6 mx-auto">
        {/* Breadcrumb - Hidden on mobile, visible on larger screens */}
        <div className="hidden sm:flex items-center text-sm text-gray-500 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
          <span className="mx-2">/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary-600 transition-colors">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium truncate max-w-[150px]">{product.name}</span>
        </div>

        {/* Mobile Back Button - Only visible on mobile */}
        <div className="sm:hidden mb-4">
          <Link 
            to="/products" 
            className="inline-flex items-center text-primary-600 font-medium"
          >
            <FaChevronLeft className="mr-1" size={14} />
            Back to Products
          </Link>
        </div>

        {/* Product Details Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 sm:mb-8"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Product Images Section */}
            <div className="lg:w-1/2 p-4 sm:p-6">
              {/* Main Image with Zoom Effect */}
              <div className="relative bg-gray-50 rounded-xl overflow-hidden mb-4 aspect-square sm:aspect-auto sm:h-[400px] md:h-[500px] flex items-center justify-center group">
                <div className="relative w-full h-full overflow-hidden">
                  <motion.img 
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={product.images[selectedImage]} 
                    alt={product.name} 
                    className="max-w-full max-h-full object-contain p-2 transition-transform duration-300 cursor-zoom-in"
                    style={{
                      transformOrigin: 'center',
                      transform: 'scale(1)',
                      transition: 'transform 0.3s ease-out'
                    }}
                    onMouseMove={(e) => {
                      const bounds = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - bounds.left) / bounds.width;
                      const y = (e.clientY - bounds.top) / bounds.height;
                      
                      e.currentTarget.style.transformOrigin = `${x * 100}% ${y * 100}%`;
                      e.currentTarget.style.transform = 'scale(2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                    }}
                  />
                </div>
                
                {/* Image Navigation Arrows - keep existing code */}
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-md transition-all hover:scale-110 z-10 text-primary-600"
                  aria-label="Previous image"
                >
                  <FaChevronLeft />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-md transition-all hover:scale-110 z-10 text-primary-600"
                  aria-label="Next image"
                >
                  <FaChevronRight />
                </button>
              </div>
              
              {/* Thumbnail Images - Scrollable on mobile with active indicator */}
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide justify-center sm:justify-start">
                {product.images.map((image, index) => (
                  <motion.button 
                    key={index} 
                    onClick={() => setSelectedImage(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary-500 ring-2 ring-primary-200' : 'border-transparent hover:border-gray-300'}`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} thumbnail ${index + 1}`} 
                      className="w-full h-full object-contain bg-gray-50"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                      }}
                    />
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Product Info Section with Improved Layout */}
            <div className="lg:w-1/2 p-4 sm:p-6 lg:border-l border-gray-100">
              {/* Product Title with Animation */}
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight"
              >
                {product.name}
              </motion.h1>
              
              {/* Rating with Improved Styling */}
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar 
                      key={i} 
                      className={i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300'}
                      size={18}
                    />
                  ))}
                </div>
                <span className="text-gray-600 ml-2 text-sm font-medium">{product.rating.toFixed(1)} ({product.reviews.length} reviews)</span>
              </div>
              
              {/* Price with Better Discount Display */}
              <div className="mb-6 flex items-center">
                {product.discount > 0 ? (
                  <>
                    <span className="text-3xl sm:text-4xl font-bold text-primary-600">${discountedPrice}</span>
                    <span className="ml-3 text-lg text-gray-500 line-through">${product.price.toFixed(2)}</span>
                    <span className="ml-3 bg-red-100 text-red-700 px-2 py-1 rounded-full text-sm font-medium">
                      {product.discount}% OFF
                    </span>
                  </>
                ) : (
                  <span className="text-3xl sm:text-4xl font-bold text-primary-600">${product.price.toFixed(2)}</span>
                )}
              </div>
              
              {/* Short Description with Better Styling */}
              <div className="bg-gray-50 p-4 rounded-xl mb-6 border-l-4 border-primary-500">
                <p className="text-gray-700">{product.description.split('.')[0] + '.'}</p>
              </div>
              
              {/* Product Details in Card Format with Icons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Brand */}
                <div className="bg-gray-50 p-4 rounded-xl flex items-start">
                  <FaInfoCircle className="text-primary-500 mt-1 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Brand</span>
                    <span className="text-gray-800 font-medium">{product.brand}</span>
                  </div>
                </div>
                
                {/* Availability */}
                <div className="bg-gray-50 p-4 rounded-xl flex items-start">
                  <FaRegClock className="text-primary-500 mt-1 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Availability</span>
                    {product.stock > 0 ? (
                      <span className="text-green-600 font-medium">{product.stock} in stock</span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    )}
                  </div>
                </div>
                
                {/* Shipping */}
                <div className="bg-gray-50 p-4 rounded-xl flex items-start">
                  <FaTruck className="text-primary-500 mt-1 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Shipping</span>
                    <span className="text-gray-800 font-medium">{product.shipping}</span>
                  </div>
                </div>
                
                {/* Return Policy */}
                <div className="bg-gray-50 p-4 rounded-xl flex items-start">
                  <FaExchangeAlt className="text-primary-500 mt-1 mr-3" />
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Return Policy</span>
                    <span className="text-gray-800 font-medium">{product.returnPolicy}</span>
                  </div>
                </div>
              </div>
              
              {/* Quantity Selector with Improved Styling */}
              <div className="mb-6">
                <label className="text-gray-700 font-medium block mb-2">Quantity:</label>
                <div className="inline-flex items-center border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-6 py-2 border-x border-gray-300 font-medium bg-white">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Action Buttons with Improved Design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRtqModalOpen(true)}
                  className="btn bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg w-full font-medium"
                >
                  <FaFileAlt />
                  Request a Quote
                </motion.button>
                <div className="flex gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors flex-1 hover:border-primary-500 hover:text-primary-600"
                  >
                    <FaHeart />
                    <span className="hidden sm:inline">Wishlist</span>
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors flex-1 hover:border-primary-500 hover:text-primary-600"
                  >
                    <FaShare />
                    <span className="hidden sm:inline">Share</span>
                  </motion.button>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center sm:justify-start bg-gray-50 p-3 rounded-lg text-gray-600 text-sm">
                <FaShieldAlt className="text-primary-500 mr-2" />
                <span>Secure transaction & Authentic products guaranteed</span>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Product Tabs with Improved Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 sm:mb-8"
        >
          {/* Tab Navigation - Scrollable on mobile with better indicators */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab('description')}
                className={`px-4 sm:px-6 py-4 font-medium whitespace-nowrap transition-colors flex-1 text-center text-sm sm:text-base relative
                  ${activeTab === 'description' ? 'text-primary-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Description
                {activeTab === 'description' && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('specifications')}
                className={`px-4 sm:px-6 py-4 font-medium whitespace-nowrap transition-colors flex-1 text-center text-sm sm:text-base relative
                  ${activeTab === 'specifications' ? 'text-primary-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Specifications
                {activeTab === 'specifications' && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('features')}
                className={`px-4 sm:px-6 py-4 font-medium whitespace-nowrap transition-colors flex-1 text-center text-sm sm:text-base relative
                  ${activeTab === 'features' ? 'text-primary-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Features
                {activeTab === 'features' && (
                  <motion.div 
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="prose max-w-none"
                >
                  <p className="text-gray-700">{product.description}</p>
                </motion.div>
              )}

              {activeTab === 'specifications' && (
                <motion.div
                  key="specifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-4 rounded-lg">
                      <span className="text-gray-600 text-sm block mb-1">{key}</span>
                      <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'features' && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-5 w-5 text-primary-500">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="ml-3 text-gray-700">{feature}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* RTQ Modal */}
        <AnimatePresence>
          {rtqModalOpen && product && (
            <RTQForm
              isOpen={rtqModalOpen}
              onClose={() => setRtqModalOpen(false)}
              product={product}
              productName={product.name}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductDetail;
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaShare, FaChevronLeft, FaChevronRight, FaFileAlt, FaInfoCircle, FaShieldAlt, FaTruck, FaExchangeAlt, FaRegClock } from 'react-icons/fa';
import Skeleton from '../components/common/Skeleton';
import Loading from '../components/common/Loading';
import RTQForm from '../components/common/RTQForm';
import RelatedProductsSlider from '../components/product/RelatedProductsSlider';
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
  
  // Reference for description tab section
  const descriptionRef = useRef(null);
  
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
            key_features: (() => {
              try {
                if (!productData.key_features && !productData.features) return [];
                
                // Use key_features if available, otherwise fall back to features
                const featureData = productData.key_features || productData.features;
                
                // If features is already an array, use it directly
                if (Array.isArray(featureData)) {
                  // Check if array contains objects with title/description format
                  const hasStructuredFeatures = featureData.some(feature => 
                    typeof feature === 'object' && feature !== null && feature.title && feature.description
                  );
                  
                  if (hasStructuredFeatures) {
                    // Already in desired format, return as is
                    return featureData;
                  }
                  
                  // Check if array contains strings with key-value format
                  const hasKeyValueFeatures = featureData.some(feature => 
                    typeof feature === 'string' && feature.includes(':')
                  );
                  
                  if (hasKeyValueFeatures) {
                    // Convert key-value strings to structured objects
                    return featureData.map(feature => {
                      if (typeof feature === 'string' && feature.includes(':')) {
                        const [title, ...descParts] = feature.split(':');
                        return {
                          title: title.trim(),
                          description: descParts.join(':').trim()
                        };
                      }
                      return feature;
                    });
                  }
                  
                  // Simple array of strings/values, return as is
                  return featureData;
                }
                
                // If features is a string, try to parse it
                if (typeof featureData === 'string') {
                  // First try to parse as JSON
                  try {
                    const parsedFeatures = JSON.parse(featureData);
                    // If parsed result is an array, return it
                    if (Array.isArray(parsedFeatures)) {
                      return parsedFeatures;
                    } 
                    // If parsed result is an object, convert to array of structured objects
                    else if (typeof parsedFeatures === 'object' && parsedFeatures !== null) {
                      return Object.entries(parsedFeatures).map(([key, value]) => ({
                        title: key,
                        description: value.toString()
                      }));
                    }
                  } catch (parseError) {
                    console.error('Error parsing features JSON:', parseError);
                    
                    // If JSON parsing fails, try to split by different delimiters
                    const text = featureData.trim();
                    
                    // Check for structured format with titles and descriptions
                    if (text.includes(':\n') || text.includes(': \n')) {
                      const sections = text.split(/\n(?=\S+:)/);
                      return sections.map(section => {
                        const [title, ...descParts] = section.split(':');
                        return {
                          title: title.trim(),
                          description: descParts.join(':').trim()
                        };
                      });
                    }
                    // Check for bullet points
                    else if (text.includes('• ')) {
                      return text.split('• ').filter(Boolean).map(item => item.trim());
                    }
                    // Check for numbered list (1. 2. etc)
                    else if (/\d+\.\s/.test(text)) {
                      return text.split(/\d+\.\s/).filter(Boolean).map(item => item.trim());
                    }
                    // Check for newlines
                    else if (text.includes('\n')) {
                      const lines = text.split('\n').filter(Boolean).map(item => item.trim());
                      
                      // Check if lines contain key-value pairs
                      const hasKeyValue = lines.some(line => line.includes(':'));
                      if (hasKeyValue) {
                        return lines.map(line => {
                          if (line.includes(':')) {
                            const [title, ...descParts] = line.split(':');
                            return {
                              title: title.trim(),
                              description: descParts.join(':').trim()
                            };
                          }
                          return line;
                        });
                      }
                      
                      return lines;
                    }
                    // Check for commas
                    else if (text.includes(',')) {
                      return text.split(',').filter(Boolean).map(item => item.trim());
                    }
                    // Check for colon-separated key-value pair
                    else if (text.includes(':')) {
                      const parts = text.split(':');
                      if (parts.length >= 2) {
                        return [{
                          title: parts[0].trim(),
                          description: parts.slice(1).join(':').trim()
                        }];
                      }
                    }
                    // If all else fails, return as a single item array
                    return [text];
                  }
                }
                
                // If features is another type, convert to string and return as single item
                return featureData ? [featureData.toString()] : [];
              } catch (e) {
                console.error('Error processing features:', e);
                return [];
              }
            })(),
            specification: (() => {
              try {
                if (!productData.specification) return {};
                
                // If specifications is already an object, use it directly
                if (typeof productData.specification === 'object' && productData.specification !== null && !Array.isArray(productData.specification)) {
                  return productData.specification;
                }
                
                // If specifications is a string, try to parse it
                if (typeof productData.specification === 'string') {
                  try {
                    // First try to parse as JSON
                    const parsedSpecs = JSON.parse(productData.specification);
                    if (typeof parsedSpecs === 'object' && parsedSpecs !== null && !Array.isArray(parsedSpecs)) {
                      return parsedSpecs;
                    } else if (Array.isArray(parsedSpecs)) {
                      // Convert array to object with numbered keys
                      const specsObject = {};
                      parsedSpecs.forEach((spec, index) => {
                        if (typeof spec === 'object' && spec !== null) {
                          // If array contains objects, merge them
                          Object.assign(specsObject, spec);
                        } else {
                          // If array contains primitives, use indexed keys
                          specsObject[`Specification ${index + 1}`] = spec.toString();
                        }
                      });
                      return specsObject;
                    }
                  } catch (parseError) {
                    console.error('Error parsing specifications JSON:', parseError);
                    
                    // If JSON parsing fails, try to create a simple object
                    const fallbackSpecs = {};
                    const text = productData.specification.trim();
                    
                    // Check for structured format with categories
                    if (text.includes(':\n') || text.includes(': \n')) {
                      const sections = text.split(/\n(?=\S+:)/);
                      sections.forEach(section => {
                        const [key, ...valueParts] = section.split(':');
                        if (key && valueParts.length > 0) {
                          fallbackSpecs[key.trim()] = valueParts.join(':').trim();
                        }
                      });
                      
                      if (Object.keys(fallbackSpecs).length > 0) {
                        return fallbackSpecs;
                      }
                    }
                    
                    // Try to parse as key-value pairs if it contains colons
                    if (text.includes(':')) {
                      // Split by newlines first, then by semicolons if no newlines
                      const lines = text.includes('\n') ? 
                        text.split('\n') : 
                        text.includes(';') ? text.split(';') : [text];
                      
                      lines.forEach(line => {
                        if (!line.trim()) return; // Skip empty lines
                        
                        const parts = line.split(':');
                        if (parts.length >= 2) {
                          const key = parts[0].trim();
                          const value = parts.slice(1).join(':').trim();
                          if (key && value) {
                            // Check if value might be a list
                            if (value.includes(',')) {
                              // Try to parse as a list if it contains commas
                              const valueItems = value.split(',').map(item => item.trim()).filter(Boolean);
                              if (valueItems.length > 1) {
                                fallbackSpecs[key] = valueItems;
                              } else {
                                fallbackSpecs[key] = value;
                              }
                            } else {
                              fallbackSpecs[key] = value;
                            }
                          }
                        }
                      });
                      
                      if (Object.keys(fallbackSpecs).length > 0) {
                        return fallbackSpecs;
                      }
                    }
                    
                    // Try to parse as table-like format
                    if (text.includes('|')) {
                      const lines = text.split('\n').filter(line => line.includes('|'));
                      if (lines.length > 0) {
                        lines.forEach(line => {
                          const [key, value] = line.split('|').map(part => part.trim()).filter(Boolean);
                          if (key && value) {
                            fallbackSpecs[key] = value;
                          }
                        });
                        
                        if (Object.keys(fallbackSpecs).length > 0) {
                          return fallbackSpecs;
                        }
                      }
                    }
                    
                    // If all parsing fails, return as a single specification
                    return { 'Specification': text };
                  }
                }
                
                // If specifications is an array, convert to object
                if (Array.isArray(productData.specification)) {
                  const specsObject = {};
                  productData.specification.forEach((spec, index) => {
                    if (typeof spec === 'object' && spec !== null) {
                      // If array contains objects, merge them
                      Object.assign(specsObject, spec);
                    } else {
                      // If array contains primitives, use indexed keys
                      specsObject[`Specification ${index + 1}`] = spec.toString();
                    }
                  });
                  return specsObject;
                }
                
                // If specifications is another type, convert to string and return as single item
                return productData.specification ? 
                  { 'Specification': productData.specification.toString() } : {};
              } catch (e) {
                console.error('Error processing specifications:', e);
                return {};
              }
            })(),
            stock: productData.availability || 10,
            shipping: productData.shipping || 'Standard Shipping',
            returnPolicy: productData.return_policy || 'No return policy',
            availability: productData.availability || null
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
  
  // Scroll to description section
  const scrollToDescription = () => {
    if (descriptionRef.current) {
      descriptionRef.current.scrollIntoView({ behavior: 'smooth' });
      setActiveTab('description');
    }
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
                  <Skeleton type="button" />
                </div>
              </div>
              <div className="motion-div">
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
    <div className="py-4 sm:py-8 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <div className="container px-4 sm:px-6 mx-auto">
        {/* Breadcrumb - Hidden on mobile, visible on larger screens */}
        <div className="hidden sm:flex items-center text-sm text-gray-500 mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap bg-white p-3 rounded-lg shadow-sm">
          <Link to="/" className="hover:text-primary-600 transition-colors font-medium">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/products" className="hover:text-primary-600 transition-colors font-medium">Products</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary-600 transition-colors font-medium">{product.category}</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-primary-600 font-medium truncate max-w-[150px]">{product.name}</span>
        </div>

        {/* Mobile Back Button - Only visible on mobile */}
        <div className="sm:hidden mb-4">
          <Link 
            to="/products" 
            className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm text-primary-600 font-medium"
          >
            <FaChevronLeft className="mr-2" size={14} />
            Back to Products
          </Link>
        </div>

        {/* Product Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 sm:mb-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row">
            {/* Product Images Section */}
            <div className="lg:w-1/2 p-4 sm:p-6 bg-gray-50">
              {/* Main Image with Zoom Effect */}
              <div className="relative bg-white rounded-xl overflow-hidden mb-4 aspect-square sm:aspect-auto sm:h-[400px] md:h-[500px] flex items-center justify-center group shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                  <motion.img 
                    key={selectedImage}
                    src={product.images[selectedImage]} 
                    alt={product.name} 
                    className="max-w-[90%] max-h-[90%] object-contain p-2 transition-transform duration-300 cursor-zoom-in fade-in"
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
                
                  {/* Image Navigation Arrows with improved styling */}
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-primary-600 hover:text-white p-3 rounded-full shadow-md transition-all hover:scale-110 z-10 text-primary-600"
                    aria-label="Previous image"
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-primary-600 hover:text-white p-3 rounded-full shadow-md transition-all hover:scale-110 z-10 text-primary-600"
                    aria-label="Next image"
                  >
                    <FaChevronRight />
                  </button>
                </div>
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
                    <div className="w-full h-full flex items-center justify-center bg-white">
                      <img 
                        src={image} 
                        alt={`${product.name} thumbnail ${index + 1}`} 
                        className="max-w-[90%] max-h-[90%] object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                        }}
                      />
                    </div>
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
                  <FaInfoCircle className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Brand</span>
                    <span className="text-gray-800 font-medium">{product.brand}</span>
                  </div>
                </div>
                
                {/* Availability - Dynamic */}
                <div className="bg-gray-50 p-4 rounded-xl flex items-start">
                  <FaRegClock className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <span className="text-gray-500 text-sm block mb-1">Availability</span>
                    {(() => {
                      // Check if availability is explicitly provided
                      if (product.availability) {
                        return <span className={`font-medium ${product.availability.toLowerCase().includes('in stock') || product.availability.toLowerCase().includes('available') ? 'text-green-600' : 'text-red-600'}`}>
                          {product.availability}
                        </span>;
                      }
                      // Fall back to stock-based availability
                      else if (product.stock !== undefined) {
                        if (product.stock > 10) {
                          return <span className="text-green-600 font-medium">In Stock ({product.stock} available)</span>;
                        } else if (product.stock > 0) {
                          return <span className="text-orange-500 font-medium">Low Stock (Only {product.stock} left)</span>;
                        } else {
                          return <span className="text-red-600 font-medium">Out of Stock</span>;
                        }
                      }
                      // Default fallback
                      else {
                        return <span className="text-gray-600 font-medium">Please inquire about availability</span>;
                      }
                    })()}
                  </div>
                </div>
                
                {/* Shipping */}
                <div className="bg-gray-50 p-4 rounded-xl flex items-start">
                  <FaTruck className="text-primary-500 mt-1 mr-3 flex-shrink-0" />
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
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={scrollToDescription}
                  className="btn bg-accent-600 text-white hover:bg-accent-700 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors shadow-md hover:shadow-lg w-full font-medium"
                >
                  View Description
                </motion.button>
                <div className="flex gap-4">
                  <button 
                    className="btn border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors flex-1 hover:border-primary-500 hover:text-primary-600"
                  >
                    <FaHeart />
                    <span className="hidden sm:inline">Wishlist</span>
                  </button>
                  <button 
                    className="btn border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-3 rounded-lg transition-colors flex-1 hover:border-primary-500 hover:text-primary-600"
                  >
                    <FaShare />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center sm:justify-start bg-gray-50 p-3 rounded-lg text-gray-600 text-sm">
                <FaShieldAlt className="text-primary-500 mr-2" />
                <span>Secure transaction & Authentic products guaranteed</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs with Improved Design */}
       
          {/* Tab Navigation - Scrollable on mobile with better indicators */}
          <div className="border-b border-gray-200 bg-gray-50" ref={descriptionRef}>
            <div className="flex overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveTab('description')}
                className={`px-4 sm:px-6 py-4 font-medium whitespace-nowrap transition-colors flex-1 text-center text-sm sm:text-base relative
                  ${activeTab === 'description' ? 'text-primary-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Description
                {activeTab === 'description' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('specification')}
                className={`px-4 sm:px-6 py-4 font-medium whitespace-nowrap transition-colors flex-1 text-center text-sm sm:text-base relative
                  ${activeTab === 'specification' ? 'text-primary-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Specification
                {activeTab === 'specification' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('features')}
                className={`px-4 sm:px-6 py-4 font-medium whitespace-nowrap transition-colors flex-1 text-center text-sm sm:text-base relative
                  ${activeTab === 'features' ? 'text-primary-600 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Features
                {activeTab === 'features' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
                )}
              </button>
            </div>
          </div>
          

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
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

              {activeTab === 'specification' && (
                <motion.div
                  key="specification"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {(() => {
                    // Check if specification exist and have content
                    const hasSpecifications = product.specification && 
                      (typeof product.specification === 'object' && Object.keys(product.specification).length > 0);
                    
                    if (hasSpecifications) {
                      // Group specifications by category if possible
                      const groupedSpecs = {};
                      let hasGroups = false;
                      
                      // Try to detect if specification have categories
                      Object.entries(product.specification).forEach(([key, value]) => {
                        // Check if the key contains category indicators
                        const categoryMatch = key.match(/^(.*?)\s*[:\-]\s*(.*)$/);
                        
                        if (categoryMatch && categoryMatch[1] && categoryMatch[2]) {
                          // We have a category and a spec name
                          const category = categoryMatch[1].trim();
                          const specName = categoryMatch[2].trim();
                          
                          if (!groupedSpecs[category]) {
                            groupedSpecs[category] = {};
                          }
                          
                          groupedSpecs[category][specName] = value;
                          hasGroups = true;
                        } else {
                          // No category found, use 'General' as default
                          if (!groupedSpecs['General']) {
                            groupedSpecs['General'] = {};
                          }
                          
                          groupedSpecs['General'][key] = value;
                        }
                      });
                      
                      // If we detected groups, display grouped specifications
                      if (hasGroups) {
                        return (
                          <div className="space-y-6">
                            {Object.entries(groupedSpecs).map(([category, specs]) => (
                              <div key={category} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                  <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                                </div>
                                <table className="w-full divide-y divide-gray-200">
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {Object.entries(specs).map(([key, value], index) => (
                                      <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900 w-1/3">{key}</td>
                                        <td className="px-6 py-4 whitespace-normal text-sm text-gray-700 w-2/3">
                                          {typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
                                            <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                              {value}
                                            </a>
                                          ) : Array.isArray(value) ? (
                                            <ul className="list-disc pl-5">
                                              {value.map((item, i) => (
                                                <li key={i}>{item}</li>
                                              ))}
                                            </ul>
                                          ) : (
                                            value
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      // Otherwise, display flat specifications table
                      return (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                          <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Specification</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/3">Details</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {Object.entries(product.specification ? product.specification : {}).map(([key, value], index) => (
                                <tr key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-6 py-4 whitespace-normal text-sm font-medium text-gray-900">{key}</td>
                                  <td className="px-6 py-4 whitespace-normal text-sm text-gray-700">
                                    {typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
                                      <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                        {value}
                                      </a>
                                    ) : Array.isArray(value) ? (
                                      <ul className="list-disc pl-5">
                                        {value.map((item, i) => (
                                          <li key={i}>{item}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      value
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    } else {
                      // No specifications available
                      return (
                        <div className="bg-gray-50 p-6 rounded-lg text-center">
                          <p className="text-gray-500">No specifications available for this product.</p>
                        </div>
                      );
                    }
                  })()}
                </motion.div>
              )}

              {activeTab === 'features' && (
                <motion.div
                  key="features"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {(() => {
                    // Check if features exist and have content
                    const hasFeatures = product.key_features && Array.isArray(product.key_features) && product.key_features.length > 0;
                    
                    if (hasFeatures) {
                      // Check if any feature has a title/description format
                      const hasTitledFeatures = product.key_features.some(feature => 
                        typeof feature === 'object' && feature !== null && feature.title && feature.description);
                      
                      // If we have titled features, display them in a more structured way
                      if (hasTitledFeatures) {
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {product.key_features.map((feature, index) => {
                              // Handle different feature formats
                              if (typeof feature === 'object' && feature !== null && feature.title) {
                                // Feature with title and description
                                return (
                                  <div key={index} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center mb-3">
                                      <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                        <span className="text-primary-600 font-semibold">{index + 1}</span>
                                      </div>
                                      <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                                    </div>
                                    <p className="text-gray-700 ml-13">{feature.description}</p>
                                  </div>
                                );
                              } else {
                                // Simple string feature
                                return (
                                  <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start">
                                    <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-primary-600 font-semibold">{index + 1}</span>
                                    </div>
                                    <div>
                                      <p className="text-gray-800">{typeof feature === 'string' ? feature : JSON.stringify(feature)}</p>
                                    </div>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        );
                      }
                      
                      // Check if features might be in a key-value format
                      const isKeyValueFormat = product.key_features.some(feature => 
                        typeof feature === 'string' && feature.includes(':'));
                      
                      if (isKeyValueFormat) {
                        // Parse key-value features
                        const parsedFeatures = product.key_features.map(feature => {
                          if (typeof feature === 'string' && feature.includes(':')) {
                            const [title, ...descParts] = feature.split(':');
                            return {
                              title: title.trim(),
                              description: descParts.join(':').trim()
                            };
                          }
                          return { description: feature };
                        });
                        
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {parsedFeatures.map((feature, index) => (
                              <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                {feature.title ? (
                                  <>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                    <p className="text-gray-700">{feature.description}</p>
                                  </>
                                ) : (
                                  <div className="flex items-start">
                                    <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                      <span className="text-primary-600 font-semibold">{index + 1}</span>
                                    </div>
                                    <p className="text-gray-800">{feature.description}</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      }
                      
                      // Default display for simple string features
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {product.key_features.map((feature, index) => (
                            <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex items-start">
                              <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                                <span className="text-primary-600 font-semibold">{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-gray-800">{typeof feature === 'string' ? feature : JSON.stringify(feature)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      // No features available
                      return (
                        <div className="bg-gray-50 p-6 rounded-lg text-center">
                          <p className="text-gray-500">No features available for this product.</p>
                        </div>
                      );
                    }
                  })()}
                </motion.div>
              )}
            </div>
          </div>
        
        
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
     
      
      {/* Related Products Slider */}
      {!loading && !error && product && (
        <RelatedProductsSlider 
          currentProductId={product.id} 
          category={product.category} 
        />
      )}
      </div>
  );
};

export default ProductDetail;
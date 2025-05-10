import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar,FaTimesCircle, FaShoppingCart, FaHeart, FaShare, FaChevronLeft, FaChevronRight, FaFileAlt, FaInfoCircle, FaShieldAlt, FaTruck, FaExchangeAlt, FaRegClock } from 'react-icons/fa';
import Skeleton from '../components/common/Skeleton';
import Loading from '../components/common/Loading';
import RTQForm from '../components/common/RTQForm';
import BackToTopButton from '../components/common/BackToTopButton';
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
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-accent-600 mb-4">Product Not Found</h2>
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
    <div className="py-0 bg-gray-100 min-h-screen">
      <div className="container px-0 sm:px-4 mx-auto max-w-7xl">
        {/* Simple Breadcrumb - Hidden on mobile */}
        <div className="hidden sm:flex items-center text-xs text-gray-500 py-2 px-4">
          <Link to="/" className="hover:text-blue-500 transition-colors">Home</Link>
          <span className="mx-1 text-gray-400">/</span>
          <Link to="/products" className="hover:text-blue-500 transition-colors">Products</Link>
          <span className="mx-1 text-gray-400">/</span>
          <span className="text-blue-500 truncate max-w-[150px]">{product.name}</span>
        </div>

        {/* Mobile Back Button */}
        <div className="sm:hidden p-3 bg-white">
          <Link 
            to="/products" 
            className="inline-flex items-center text-blue-500"
          >
            <FaChevronLeft className="mr-1" size={12} />
            Back
          </Link>
        </div>

        {/* Product Details - Flipkart Style */}
        <div className="mb-2">
          <div className="flex flex-col lg:flex-row bg-white">
            {/* Product Images Section - Flipkart Style */}
            <div className="lg:w-[40%] border-r border-gray-200 p-2 sm:p-4">
              {/* Main Image - Flipkart Style */}
              <div className="relative bg-white overflow-hidden mb-1 aspect-square flex items-center justify-center sticky top-0">
                <motion.img 
                  key={selectedImage}
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="max-w-full max-h-full object-contain transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
              
                {/* Simplified Navigation Arrows */}
                <button 
                  onClick={prevImage}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-r-full z-10 text-gray-700 hover:text-blue-500 shadow-md"
                  aria-label="Previous image"
                >
                  <FaChevronLeft size={16} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-l-full z-10 text-gray-700 hover:text-blue-500 shadow-md"
                  aria-label="Next image"
                >
                  <FaChevronRight size={16} />
                </button>
              </div>
              
              {/* Thumbnail Images - Flipkart Style */}
              <div className="flex overflow-x-auto gap-1 py-2 hide-scrollbar">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`min-w-[60px] h-[60px] border rounded overflow-hidden flex items-center justify-center ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'}`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - Thumbnail ${index + 1}`} 
                      className="max-w-full max-h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                      }}
                    />
                  </button>
                ))}
              </div>
              
              {/* Action Buttons - Mobile Only */}
              <div className="flex gap-2 mt-4 lg:hidden">
                <button 
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-sm font-medium flex items-center justify-center"
                  disabled={product.stock <= 0}
                >
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </button>
                
                <button 
                  onClick={() => setRtqModalOpen(true)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-sm font-medium flex items-center justify-center"
                >
                  <FaFileAlt className="mr-2" />
                  Request Quote
                </button>
              </div>
            </div>
            
            {/* Product Info Section - Flipkart Style */}
            <div className="lg:w-[60%] p-4">
              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl font-medium text-gray-800 mb-1">{product.name}</h1>
              
              {/* Product Rating - Flipkart Style */}
              <div className="flex items-center mb-3">
                <div className="flex items-center bg-green-600 text-white px-2 py-0.5 rounded-sm text-sm mr-2">
                  <span className="font-medium mr-1">{product.rating}</span>
                  <FaStar size={12} />
                </div>
                <span className="text-sm text-gray-500">
                  {product.reviews?.length || 0} Ratings & Reviews
                </span>
              </div>
              
              {/* Product Price - Flipkart Style */}
              <div className="mb-4">
                {product.discount > 0 ? (
                  <div className="flex flex-wrap items-baseline">
                    <span className="text-2xl font-medium text-gray-800">₹{discountedPrice}</span>
                    <span className="text-sm text-gray-500 line-through ml-2">₹{product.price}</span>
                    <span className="ml-2 text-green-600 font-medium text-sm">{product.discount}% Discount</span>
                  </div>
                ) : (
                  <span className="text-2xl font-medium text-gray-800">₹{product.price}</span>
                )}
              </div>
              
              {/* Product Availability - Flipkart Style */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <div className="text-green-600 font-medium flex items-center">
                    <FaCheckCircle className="mr-2" />
                    In Stock ({product.stock})
                  </div>
                ) : (
                  <div className="text-red-600 font-medium flex items-center">
                    <FaTimesCircle className="mr-2" />
                    {product.availability === 0 || product.availability === null ? "Out of Stock" : `Limited Availability (${product.availability})`}
                  </div>
                )}
              </div>
              
              {/* Product Highlights - Flipkart Style */}
              <div className="mb-4">
                <h2 className="text-base font-medium text-gray-800 mb-2">Highlights</h2>
                <ul className="list-disc pl-5 space-y-1 text-gray-700">

                  <li>Brand: <span className="font-medium">{product.brand}</span></li>
                  <li>Category: <span className="font-medium">{product.category}</span></li>
                  <li>Shipping: <span className="font-medium">{product.shipping}</span></li>
                  <li>Return Policy: <span className="font-medium">{product.returnPolicy}</span></li>
                </ul>
              </div>
              
              {/* Quantity Selector - Flipkart Style */}
              <div className="flex items-center mb-6">
                <span className="text-gray-600 mr-4">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded">
                  <button 
                    onClick={() => handleQuantityChange(-1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-x border-gray-300">{quantity}</span>
                  <button 
                    onClick={() => handleQuantityChange(1)}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Action Buttons - Desktop Only */}
              <div className="hidden lg:flex gap-4 mb-6">
                {/* Add to Cart Button */}
                <button 
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-sm font-medium flex items-center justify-center"
                  disabled={product.stock <= 0}
                >
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </button>
                
                {/* Request Quote Button */}
                <button 
                  onClick={() => setRtqModalOpen(true)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-sm font-medium flex items-center justify-center"
                >
                  <FaFileAlt className="mr-2" />
                  Request Quote
                </button>
              </div>
              
              {/* Seller Info - Flipkart Style */}
              <div className="border border-gray-200 rounded p-3 mb-4">
                <h3 className="font-medium text-gray-800 mb-2">Seller Information</h3>
                <div className="flex items-center text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">Trusted Seller</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs - Flipkart Style */}
        <div className="bg-white mt-2 mb-2" ref={descriptionRef}>
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setActiveTab('description')}
                className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap transition-colors flex-1 text-center text-sm sm:text-base relative
                  ${activeTab === 'description' ? 'text-blue-500 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Description
                {activeTab === 'description' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('specification')}
                className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap transition-colors flex-1 text-center text-sm sm:text-base relative
                  ${activeTab === 'specification' ? 'text-blue-500 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Specifications
                {activeTab === 'specification' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('features')}
                className={`px-4 sm:px-6 py-3 font-medium whitespace-nowrap transition-colors flex-1 text-center text-sm sm:text-base relative
                  ${activeTab === 'features' ? 'text-blue-500 bg-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Features
                {activeTab === 'features' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
                )}
              </button>
            </div>
          </div>
          

          {/* Tab Content - Enhanced UI */}
          <div className="p-4 sm:p-6">
              {activeTab === 'description' && (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-none"
                >
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-200 flex items-center">
                      <FaFileAlt className="text-blue-500 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-800">Product Description</h2>
                    </div>
                    <div className="p-6">
                      {product.description ? (
                        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed">
                          {product.description.split('\n').map((paragraph, index) => (
                            <p key={index} className="mb-4">{paragraph}</p>
                          ))}
                          
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold mb-4">Why Choose Our Products?</h3>
                            <p className="mb-4">We pride ourselves on offering the highest quality products with exceptional service:</p>
                            <ul className="list-disc pl-5 space-y-2">
                              <li><span className="font-medium">Quality Guarantee</span> - All our products are 100% original with quality assurance</li>
                              <li><span className="font-medium">Fast Shipping</span> - We offer quick delivery worldwide with package tracking</li>
                              <li><span className="font-medium">Easy Returns</span> - Hassle-free 7-day return policy for your peace of mind</li>
                              <li><span className="font-medium">24/7 Support</span> - Our customer service team is always available to assist you</li>
                            </ul>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <FaInfoCircle className="mx-auto mb-3 text-gray-400" size={24} />
                          <p>No description available for this product.</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Service Specifications */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-200 flex items-center">
                      <FaShieldAlt className="text-blue-500 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-800">Service Specifications</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-800 mb-2 flex items-center">
                            <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-xs">1</span>
                            Quality Assurance
                          </div>
                          <div className="text-gray-600">
                            100% original products with manufacturer warranty and quality certification
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-800 mb-2 flex items-center">
                            <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 text-xs">2</span>
                            Shipping Details
                          </div>
                          <div className="text-gray-600">
                            Worldwide shipping with tracking, estimated delivery time: 3-7 business days
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-800 mb-2 flex items-center">
                            <span className="h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-2 text-xs">3</span>
                            Return Policy
                          </div>
                          <div className="text-gray-600">
                            7-day hassle-free return policy, product must be in original condition
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-800 mb-2 flex items-center">
                            <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-2 text-xs">4</span>
                            Customer Support
                          </div>
                          <div className="text-gray-600">
                            24/7 customer service via email, phone, and live chat with multilingual support
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-6">
                    <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-gray-200 flex items-center">
                      <FaInfoCircle className="text-green-500 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-800">Technical Specifications</h2>
                    </div>
                    <div className="p-0">
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
                              <div className="divide-y divide-gray-200">
                                {Object.entries(groupedSpecs).map(([category, specs], categoryIndex) => (
                                  <div key={category} className="overflow-hidden">
                                    <div className={`px-6 py-4 ${categoryIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                      <h3 className="text-lg font-medium text-gray-900 flex items-center">
                                        <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 text-xs">{categoryIndex + 1}</span>
                                        {category}
                                      </h3>
                                    </div>
                                    <div className="px-6 pb-4 pt-2">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(specs).map(([key, value], index) => (
                                          <div key={key} className="border border-gray-100 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="font-medium text-gray-700 mb-1 text-sm">{key}</div>
                                            <div className="text-gray-600 text-sm">
                                              {typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
                                                <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
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
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                          
                          // Otherwise, display flat specifications in a card grid
                          return (
                            <div className="p-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(product.specification ? product.specification : {}).map(([key, value], index) => (
                                  <div key={key} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                                    <div className="font-medium text-gray-800 mb-2 flex items-center">
                                      <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 text-xs">{index + 1}</span>
                                      {key}
                                    </div>
                                    <div className="text-gray-600">
                                      {typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://')) ? (
                                        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
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
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        } else {
                          // No specifications available
                          return (
                            <div className="text-center py-12 px-6">
                              <FaInfoCircle className="mx-auto mb-4 text-gray-400" size={32} />
                              <p className="text-gray-500 mb-2">No specifications available for this product.</p>
                              <p className="text-sm text-gray-400">Please check the description tab for more information.</p>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                  
                  {/* Service Specifications */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                    <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-200 flex items-center">
                      <FaShieldAlt className="text-blue-500 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-800">Service Specifications</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-800 mb-2 flex items-center">
                            <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 text-xs">1</span>
                            Quality Assurance
                          </div>
                          <div className="text-gray-600">
                            100% original products with manufacturer warranty and quality certification
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-800 mb-2 flex items-center">
                            <span className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 text-xs">2</span>
                            Shipping Details
                          </div>
                          <div className="text-gray-600">
                            Worldwide shipping with tracking, estimated delivery time: 3-7 business days
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-800 mb-2 flex items-center">
                            <span className="h-6 w-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mr-2 text-xs">3</span>
                            Return Policy
                          </div>
                          <div className="text-gray-600">
                            7-day hassle-free return policy, product must be in original condition
                          </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="font-medium text-gray-800 mb-2 flex items-center">
                            <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mr-2 text-xs">4</span>
                            Customer Support
                          </div>
                          <div className="text-gray-600">
                            24/7 customer service via email, phone, and live chat with multilingual support
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  {/* Our Services Section */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mb-6">
                    <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b border-gray-200 flex items-center">
                      <FaInfoCircle className="text-purple-500 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-800">Our Services</h2>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                            <FaShieldAlt className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <span className="font-medium block text-lg">Quality Guarantee</span>
                            <span className="text-gray-600">100% original products with quality assurance</span>
                          </div>
                        </div>
                        <div className="flex items-center p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
                          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                            <FaTruck className="text-green-600" size={20} />
                          </div>
                          <div>
                            <span className="font-medium block text-lg">Fast Shipping</span>
                            <span className="text-gray-600">Quick delivery worldwide with tracking</span>
                          </div>
                        </div>
                        <div className="flex items-center p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
                          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mr-4">
                            <FaExchangeAlt className="text-orange-600" size={20} />
                          </div>
                          <div>
                            <span className="font-medium block text-lg">Easy Returns</span>
                            <span className="text-gray-600">Hassle-free 7-day return policy</span>
                          </div>
                        </div>
                        <div className="flex items-center p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-shadow">
                          <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                            <FaRegClock className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <span className="font-medium block text-lg">24/7 Support</span>
                            <span className="text-gray-600">Always here to help you with any questions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
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
     

      {/* Back to Top Button */}
      
</div>
<BackToTopButton />
    </div>

     
  )}
  



    
 
 


export default ProductDetail;
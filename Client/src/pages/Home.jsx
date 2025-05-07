import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaExclamationCircle, FaSpinner, FaShoppingBag, FaGlobe, FaTag, FaStar, FaShieldAlt, FaTruck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import '../styles/scrollbar.css';
import '../styles/animations.css';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/category/CategoryCard';
import SkeletonLoader from '../components/common/SkeletonLoader';
import { specialOffers } from '../data/homeData';
import { fetchIndustries } from '../services/categoryService';
import { createAuthenticatedApi } from '../utils/authUtils';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/env';
import { motion } from 'framer-motion';
const Home = () => {
  const [industries, setIndustries] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState('');
  const [productError, setProductError] = useState('');
  const { showNotification, toggleLoginPopup } = useAuth();
  
  // Refs for scroll containers
  const scrollContainerRef = useRef(null);
  const industriesScrollRef = useRef(null);
  
  // Scroll functions for trending products
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  
  // Scroll functions for industries
  const scrollIndustriesLeft = () => {
    if (industriesScrollRef.current) {
      industriesScrollRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };
  
  const scrollIndustriesRight = () => {
    if (industriesScrollRef.current) {
      industriesScrollRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
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
        
        // If user was admin or seller, redirect to home page
        if (userRole === 'admin' || userRole === 'seller') {
          // For admin and seller, they will be redirected to their dashboards
          // when they log in again via the toggleLoginPopup function
        }
      },
      // Show notification function
      showNotification
    );
  }, [toggleLoginPopup, showNotification]);

  // Fetch industries from API
  useEffect(() => {
    const getIndustries = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await fetchIndustries();
        
        // Industry images mapping
        const industryImages = {
          'Ayurvedic': '/images/industries/ayurvedic.svg'
        };
        
        // Format the industries data
        const formattedIndustries = data.map((industry, index) => {
          const industryName = industry.name || industry;
          return {
            id: index + 1,
            name: industryName,
            // Use the mapped image if available, otherwise use a fallback
            image: industryImages[industryName] || `/images/category-${industryName.toLowerCase().replace(/\s+/g, '-')}-new.svg`,
            count: industry.count || Math.floor(Math.random() * 100) + 20 // Random count if not provided
          };
        });
        
        setIndustries(formattedIndustries);
      } catch (err) {
        console.error('Error fetching industries:', err);
        setError('Failed to load industries');
        // Fallback to static data from homeData.js if API fails
        import('../data/homeData').then(data => {
          setIndustries(data.categories); // Using categories as fallback
        });
      } finally {
        setLoading(false);
      }
    };
    
    getIndustries();
  }, []);
  
  // Fetch trending products from API
  useEffect(() => {
    const fetchTrendingProducts = async () => {
      if (!api) return;
      
      try {
        setLoadingProducts(true);
        setProductError('');
        
        // Fetch products from API
        const response = await api.get('/products');
        
        if (response.data && Array.isArray(response.data)) {
          // Format the products data
          const formattedProducts = response.data.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            discount: product.discount || 0,
            rating: product.rating || 4.5,
            category: product.category || 'Uncategorized',
            image: product.product_images && product.product_images.length > 0 
              ? product.product_images[0].image_url 
              : '/images/category-electronics-new.svg', // Fallback image
            reviews: product.reviews?.length || Math.floor(Math.random() * 50) + 10 // Random reviews count if not provided
          }));
          
          // Get only the first 4 products for trending section
          const limitedProducts = formattedProducts.slice(0, 4);
          
          setTrendingProducts(limitedProducts);
        } else {
          throw new Error('Invalid product data format');
        }
      } catch (err) {
        console.error('Error fetching trending products:', err);
        setProductError('Failed to load trending products');
        
        // Fallback to static data from homeData.js if API fails
        import('../data/homeData').then(data => {
          setTrendingProducts(data.trendingProducts); // Using static trending products as fallback
        });
      } finally {
        setLoadingProducts(false);
      }
    };
    
    fetchTrendingProducts();
  }, [api]); // Depend on api so it only runs after api is initialized

  return (
    <div>
      {/* Hero Section - Redesigned */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 text-white py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-white opacity-5 rounded-full -ml-48 -mb-48 animate-pulse"></div>
          <div className="absolute top-1/3 left-1/4 w-24 h-24 bg-accent-500 opacity-10 rounded-full blur-xl animate-blob"></div>
          <div className="absolute bottom-1/3 right-1/4 w-32 h-32 bg-secondary-500 opacity-10 rounded-full blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-2/3 left-1/2 w-36 h-36 bg-primary-400 opacity-10 rounded-full blur-xl animate-blob animation-delay-4000"></div>
          
          {/* Floating shapes */}
          <div className="absolute top-20 left-[15%] w-8 h-8 border-2 border-white opacity-20 rounded-md rotate-12 animate-float"></div>
          <div className="absolute top-40 right-[20%] w-6 h-6 border-2 border-white opacity-20 rounded-full animate-float animation-delay-1000"></div>
          <div className="absolute bottom-20 left-[30%] w-10 h-10 border-2 border-white opacity-20 rounded-full animate-float animation-delay-2000"></div>
          <div className="absolute bottom-40 right-[25%] w-12 h-12 border-2 border-white opacity-20 rounded-md rotate-45 animate-float animation-delay-3000"></div>
        </div>
        
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.7 }}
            className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
          >
            <div className="md:w-1/2 mb-8 md:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="inline-block px-4 py-1 mb-4 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-primary-100 border border-white/20"
              >
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse"></span>
                  Premium Import & Export Marketplace
                </span>
              </motion.div>
              
              <motion.h1 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-4xl md:text-6xl font-bold mb-6 leading-tight"
              >
                <span className="block">Quality Products</span>
                <span className="block text-accent-300">from Around the World</span>
              </motion.h1>
              
              <motion.p 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.5, duration: 0.7 }}
                className="text-lg md:text-xl mb-8 text-primary-100 max-w-lg"
              >
                Discover unique items from international sellers at competitive prices with secure transactions and reliable shipping options.
              </motion.p>
              
              <motion.div 
                initial={{ y: 30, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                transition={{ delay: 0.7, duration: 0.7 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/products" className="btn bg-accent-500 hover:bg-accent-600 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center">
                  <FaShoppingBag className="mr-2" /> Shop Now
                </Link>
                <Link to="/about" className="btn bg-transparent border-2 border-white/50 text-white px-8 py-3 rounded-full hover:bg-white/10 hover:scale-105 transition-all duration-300 flex items-center">
                  <FaGlobe className="mr-2" /> Learn More
                </Link>
              </motion.div>
              
              {/* Trust badges */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.9, duration: 0.7 }}
                className="mt-8 flex items-center space-x-6"
              >
                <div className="flex items-center text-primary-100 text-sm">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span>Verified Sellers</span>
                </div>
                <div className="flex items-center text-primary-100 text-sm">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                      <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 011-1v-5h2a1 1 0 00.9-.5l1.08-1.8A3 3 0 0013.12 5H3a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 011-1V9h2.12l-1-2H3a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 011-1v-5h2a1 1 0 00.9-.5l1.08-1.8A3 3 0 0013.12 5H3z" />
                    </svg>
                  </div>
                  <span>Global Shipping</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ delay: 0.4, duration: 0.8 }}
              className="md:w-1/2 relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 backdrop-blur-sm transform hover:scale-[1.02] transition-all duration-700">
                <img 
                  src="/images/hero-image-new.jpg" 
                  alt="Import Export Marketplace" 
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/hero-image.svg';
                  }}
                />
                
                {/* Floating product cards */}
              
                
              
              </div>
              
              {/* Additional floating card at bottom */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="absolute -top-10 left-80 bg-white rounded-lg shadow-xl p-3 w-48 hidden md:block z-20 border border-secondary-200"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-800 text-xs font-medium">Global shipping with fast delivery options</p>
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 0.8 }}
                className="absolute -bottom-14 left-10 bg-white rounded-lg shadow-xl p-3 w-48 hidden md:block z-20 border border-secondary-200"
                whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
              >
                <div className="w-8 h-8 rounded-full bg-secondary-100 flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-secondary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-800 text-xs font-medium">Global shipping with fast delivery options</p>
              </motion.div>
              
              {/* Background glow effect */}
              <div className="absolute -inset-4 bg-accent-500 opacity-20 blur-3xl rounded-full -z-10"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections - New Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-accent-500 opacity-20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-primary-200 opacity-20 rounded-full -ml-20 -mb-20 blur-3xl"></div>
        
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-10"
          >
            <div>
              <div className="inline-block px-3 py-1 mb-2 bg-accent-100 text-accent-700 rounded-full text-xs font-medium">
                CURATED SELECTIONS
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800">Featured Collections</h2>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  const container = document.getElementById('featured-collections-container');
                  if (container) {
                    container.scrollBy({ left: -300, behavior: 'smooth' });
                  }
                }} 
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10 md:flex hidden"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-gray-600" />
              </button>
              <button 
                onClick={() => {
                  const container = document.getElementById('featured-collections-container');
                  if (container) {
                    container.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }} 
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10 md:flex hidden"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-gray-600" />
              </button>
              <Link to="/products" className="text-accent-600 hover:text-accent-700 flex items-center group">
                <span className="mr-2">Browse All</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
          
          {/* Mobile Slider View */}
          <div 
            id="featured-collections-container"
            className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8"
          >
            {/* Collection Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-80 min-w-[280px] md:min-w-0 flex-shrink-0 snap-start"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>
              <img 
                src="/images/collection-premium.jpg" 
                alt="Premium Collection" 
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/category-electronics-new.svg';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium inline-block mb-2">
                  NEW ARRIVALS
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Premium Selection</h3>
                <p className="text-white/90 mb-4">Exclusive high-quality products from around the world</p>
                <Link to="/products?collection=premium" className="inline-flex items-center bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span>Explore</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
            
            {/* Collection Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-80 min-w-[280px] md:min-w-0 flex-shrink-0 snap-start"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>
              <img 
                src="/images/collection-bestsellers.jpg" 
                alt="Bestsellers Collection" 
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/category-fashion-new.svg';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium inline-block mb-2">
                  MOST POPULAR
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Bestsellers</h3>
                <p className="text-white/90 mb-4">Our most popular products loved by customers</p>
                <Link to="/products?collection=bestsellers" className="inline-flex items-center bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span>Explore</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
            
            {/* Collection Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 h-80 min-w-[280px] md:min-w-0 flex-shrink-0 snap-start"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent z-10"></div>
              <img 
                src="/images/collection-seasonal.jpg" 
                alt="Seasonal Collection" 
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/images/category-home-garden-new.svg';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-xs font-medium inline-block mb-2">
                  LIMITED TIME
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Seasonal Specials</h3>
                <p className="text-white/90 mb-4">Limited-time offers on seasonal products</p>
                <Link to="/products?collection=seasonal" className="inline-flex items-center bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <span>Explore</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Mobile Navigation Dots */}
          <div className="flex justify-center mt-4 space-x-2 md:hidden">
            {specialOffers.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const container = document.getElementById('special-offers-container');
                  if (container) {
                    const itemWidth = container.querySelector('.min-w-\\[90\\%\\]')?.offsetWidth || container.offsetWidth * 0.9;
                    container.scrollTo({ left: itemWidth * index + (index * 16), behavior: 'smooth' });
                  }
                }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${index === 0 ? 'bg-accent-500' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products Section - Redesigned */}
      <section className="py-16 bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-accent-100 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-primary-100 opacity-20 rounded-full blur-3xl"></div>
        
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 gap-4 sm:gap-0"
          >
            <div>
              <div className="inline-block px-3 py-1 mb-2 bg-accent-100 text-accent-700 rounded-full text-xs font-medium">
                FEATURED PRODUCTS
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-gray-800">Trending Products</h2>
            </div>
            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <button 
                onClick={scrollLeft} 
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10 hidden md:flex"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-gray-600" />
              </button>
              <button 
                onClick={scrollRight} 
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10 hidden md:flex"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-gray-600" />
              </button>
              <Link to="/products" className="text-primary-600 hover:text-primary-700 flex items-center group">
                <span className="mr-2">View All</span>
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
          
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-full"
                >
                  <SkeletonLoader variant="product-card" />
                </motion.div>
              ))}
            </div>
          ) : productError ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-50 text-red-600 p-6 rounded-xl shadow-sm border border-red-100"
            >
              <div className="flex items-center">
                <FaExclamationCircle className="text-xl mr-2" />
                {productError}
              </div>
            </motion.div>
          ) : (
            <div>
              {/* Mobile Swipeable Slider / Desktop Grid */}
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8"
              >
                {trendingProducts.map((product, index) => (
                  <motion.div 
                    key={product.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="min-w-[250px] sm:min-w-[280px] md:min-w-0 flex-shrink-0 snap-center md:snap-align-none px-2 sm:px-0"
                  >
                    <div className="hover-lift h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white">
                      <ProductCard product={product} />
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Mobile Navigation Controls */}
              <div className="md:hidden">
                {/* Mobile Navigation Dots */}
                <div className="flex justify-center mt-4 space-x-2">
                  {trendingProducts.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (scrollContainerRef.current) {
                          const itemWidth = scrollContainerRef.current.querySelector('.min-w-\\[250px\\]')?.offsetWidth || 250;
                          scrollContainerRef.current.scrollTo({ left: itemWidth * index + (index * 16), behavior: 'smooth' });
                        }
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-colors ${index === 0 ? 'bg-primary-600' : 'bg-gray-300'}`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
                
                {/* Mobile Scroll Buttons */}
                <div className="flex justify-center mt-4 space-x-4">
                  <button 
                    onClick={scrollLeft} 
                    className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
                    aria-label="Scroll left"
                  >
                    <FaChevronLeft className="text-gray-600" />
                  </button>
                  <button 
                    onClick={scrollRight} 
                    className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
                    aria-label="Scroll right"
                  >
                    <FaChevronRight className="text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* View All Products Button */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                viewport={{ once: true }}
                className="mt-8 text-center"
              >
                <Link to="/products" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full shadow-md inline-flex items-center transition-all duration-300 hover:shadow-lg">
                  <FaShoppingBag className="mr-2" />
                  <span className="font-medium">Explore All Products</span>
                </Link>
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Special Offers Section - Redesigned */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 opacity-30 rounded-full -mt-48 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-100 opacity-30 rounded-full -mb-48 blur-3xl"></div>
        
        <div className="container relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-between items-center mb-10"
          >
            <div className="text-center md:text-left mb-4 md:mb-0">
              <div className="inline-block px-4 py-1 mb-3 bg-accent-100 text-accent-700 rounded-full text-sm font-medium">
                <span className="flex items-center justify-center md:justify-start">
                  <FaTag className="mr-2" />
                  LIMITED TIME DEALS
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Special Offers</h2>
              <p className="text-gray-600 max-w-2xl mt-2">Exclusive deals on premium products from around the world</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  const container = document.getElementById('special-offers-container');
                  if (container) {
                    container.scrollBy({ left: -300, behavior: 'smooth' });
                  }
                }} 
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10 hidden md:flex"
                aria-label="Scroll left"
              >
                <FaChevronLeft className="text-gray-600" />
              </button>
              <button 
                onClick={() => {
                  const container = document.getElementById('special-offers-container');
                  if (container) {
                    container.scrollBy({ left: 300, behavior: 'smooth' });
                  }
                }} 
                className="bg-white rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors z-10 hidden md:flex"
                aria-label="Scroll right"
              >
                <FaChevronRight className="text-gray-600" />
              </button>
            </div>
          </motion.div>
          
          <div 
            id="special-offers-container"
            className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory hide-scrollbar md:grid md:grid-cols-2 md:gap-8"
          >
            {specialOffers.map((offer, index) => (
              <motion.div 
                key={offer.id} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.7 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group min-w-[90%] sm:min-w-[300px] md:min-w-0 flex-shrink-0 snap-center mx-2 sm:mx-0"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2 overflow-hidden relative">
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="w-full h-60 md:h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute top-4 left-4 bg-accent-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                      SPECIAL OFFER
                    </div>
                  </div>
                  <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-center">
                    <div className="flex items-center mb-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-primary-600 font-semibold text-sm">Limited Time Offer</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-gray-800">{offer.title}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{offer.description}</p>
                    <Link 
                      to={offer.link} 
                      className="btn bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl inline-block text-center hover:scale-105 transition-all duration-300 flex items-center justify-center w-full md:w-auto"
                    >
                      {offer.buttonText} <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* Mobile Navigation Dots */}
          <div className="flex justify-center mt-4 space-x-2 md:hidden">
            {specialOffers.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const container = document.getElementById('special-offers-container');
                  if (container) {
                    const itemWidth = container.querySelector('.min-w-\\[90\\%\\]')?.offsetWidth || container.offsetWidth * 0.9;
                    container.scrollTo({ left: itemWidth * index + (index * 16), behavior: 'smooth' });
                  }
                }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${index === 0 ? 'bg-accent-500' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* YouTube Video Section */}
      <section className="py-16">
        <div className="container">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-bold mb-6 text-center"
          >
            Watch Our Product Showcase
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <div className="relative pb-[56.25%] h-0 overflow-hidden">
              <iframe 
                className="absolute top-0 left-0 w-full h-full" 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                title="Product Showcase Video"
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-6 sm:p-8 bg-gray-50">
              <h3 className="text-lg sm:text-xl font-semibold mb-3">Why Choose Our Products?</h3>
              <p className="text-gray-600 mb-4">Learn about our quality standards, sourcing practices, and how we ensure the best products for our customers.</p>
              <Link to="/about" className="text-primary-600 hover:text-primary-700 font-medium flex items-center group">
                Learn more about our company 
                <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                  <FaArrowRight />
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section - Redesigned */}
      <section className="py-24 bg-gradient-to-br from-secondary-700 via-secondary-600 to-secondary-800 text-white relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -ml-32 -mt-32 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-white opacity-5 rounded-full -mr-48 -mb-48 animate-pulse"></div>
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-accent-500 opacity-10 rounded-full blur-xl animate-blob"></div>
          <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-primary-500 opacity-10 rounded-full blur-xl animate-blob animation-delay-2000"></div>
          
          {/* Floating shapes */}
          <div className="absolute top-20 right-[15%] w-8 h-8 border-2 border-white opacity-20 rounded-md rotate-12 animate-float"></div>
          <div className="absolute bottom-20 left-[20%] w-6 h-6 border-2 border-white opacity-20 rounded-full animate-float animation-delay-1000"></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/20"
            >
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="md:w-1/2 text-left">
                  <div className="inline-block px-4 py-1 mb-4 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium text-white border border-white/20">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse"></span>
                      STAY UPDATED
                    </span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
                  <p className="mb-6 text-white/80 text-lg">Get the latest updates on new products, exclusive offers, and upcoming sales delivered to your inbox.</p>
                  
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-2">
                        <FaShieldAlt className="text-accent-300" />
                      </div>
                      <span className="text-sm">No Spam</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-2">
                        <FaTruck className="text-accent-300" />
                      </div>
                      <span className="text-sm">Early Access</span>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="flex flex-col gap-4">
                      <input 
                        type="email" 
                        placeholder="Your email address" 
                        className="w-full px-5 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all bg-white/90 backdrop-blur-sm"
                      />
                      <button className="btn bg-accent-500 hover:bg-accent-600 text-white px-6 py-4 rounded-xl font-medium hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
                        Subscribe Now
                      </button>
                    </div>
                    <p className="text-xs mt-4 text-white/60 text-center">We respect your privacy. Unsubscribe at any time.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Mobile Navigation Dots */}
          <div className="flex justify-center mt-4 space-x-2 md:hidden">
            {specialOffers.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  const container = document.getElementById('special-offers-container');
                  if (container) {
                    const itemWidth = container.querySelector('.min-w-\\[90\\%\\]')?.offsetWidth || container.offsetWidth * 0.9;
                    container.scrollTo({ left: itemWidth * index + (index * 16), behavior: 'smooth' });
                  }
                }}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${index === 0 ? 'bg-accent-500' : 'bg-gray-300'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
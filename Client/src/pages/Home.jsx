import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaSpinner } from 'react-icons/fa';
import '../styles/scrollbar.css';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/category/CategoryCard';
import { specialOffers } from '../data/homeData';
import { fetchIndustries } from '../services/categoryService';
import { createAuthenticatedApi } from '../utils/authUtils';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/env';
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
      // Token expired callback
      () => {
        // Show login popup when token expires
        toggleLoginPopup(true);
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
          'Ayurveda': '/images/industries/ayurveda.svg'
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
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Quality Products from Around the World
              </h1>
              <p className="text-lg mb-6 text-primary-100">
                Discover unique items from international sellers at competitive prices
              </p>
              <div className="flex space-x-4">
                <Link to="/products" className="btn bg-white text-primary-700 hover:bg-primary-50">
                  Shop Now
                </Link>
                <Link to="/about" className="btn border border-white text-white hover:bg-white/10">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/images/hero-image.svg" 
                alt="Import Export Marketplace" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Shop by Industry Categories</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 flex items-center">
              View All <FaArrowRight className="ml-2" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-primary-600 text-3xl" />
              <span className="ml-2 text-gray-600">Loading industries...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-x-auto pb-4 hide-scrollbar" ref={industriesScrollRef}>
                <div className="flex space-x-4 md:space-x-6 px-1 py-2 min-w-full">
                  {industries.map(industry => (
                    <div key={industry.id} className="w-64 md:w-72 flex-shrink-0">
                      <CategoryCard key={industry.id} category={industry} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block">
                <button 
                  className="bg-white rounded-full p-2 shadow-lg text-primary-600 hover:text-primary-700 focus:outline-none transition-all hover:scale-110"
                  onClick={scrollIndustriesLeft}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
                <button 
                  className="bg-white rounded-full p-2 shadow-lg text-primary-600 hover:text-primary-700 focus:outline-none transition-all hover:scale-110"
                  onClick={scrollIndustriesRight}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Trending Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 flex items-center">
              View All <FaArrowRight className="ml-2" />
            </Link>
          </div>
          
          {loadingProducts ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-primary-600 text-3xl" />
              <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
          ) : productError ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {productError}
            </div>
          ) : (
            <div className="relative">
              <div className="overflow-x-auto pb-4 hide-scrollbar" ref={scrollContainerRef}>
                <div className="flex space-x-4 md:space-x-6 px-1 py-2 min-w-full">
                  {trendingProducts.map(product => (
                    <div key={product.id} className="w-64 md:w-72 flex-shrink-0">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:block">
                <button 
                  className="bg-white rounded-full p-2 shadow-lg text-primary-600 hover:text-primary-700 focus:outline-none transition-all hover:scale-110"
                  onClick={scrollLeft}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
                <button 
                  className="bg-white rounded-full p-2 shadow-lg text-primary-600 hover:text-primary-700 focus:outline-none transition-all hover:scale-110"
                  onClick={scrollRight}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specialOffers.map(offer => (
              <div key={offer.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2">
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-6 flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                    <p className="text-gray-600 mb-4">{offer.description}</p>
                    <Link 
                      to={offer.link} 
                      className="btn bg-primary-600 hover:bg-primary-700 text-white inline-block text-center"
                    >
                      {offer.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YouTube Video Section */}
      <section className="py-12">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Watch Our Product Showcase</h2>
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
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
            <div className="p-4 sm:p-6 bg-gray-50">
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Why Choose Our Products?</h3>
              <p className="text-gray-600 mb-4">Learn about our quality standards, sourcing practices, and how we ensure the best products for our customers.</p>
              <Link to="/about" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
                Learn more about our company <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-secondary-600 text-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Subscribe to Our Newsletter</h2>
            <p className="mb-6">Get the latest updates on new products and upcoming sales</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-2 rounded-md text-gray-800 focus:outline-none"
              />
              <button className="btn bg-accent-500 hover:bg-accent-600 text-white">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
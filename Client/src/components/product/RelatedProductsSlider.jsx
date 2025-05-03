import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import CustomProductCard from './CustomProductCard';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env';

const RelatedProductsSlider = ({ currentProductId, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  
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
  
  // Fetch related products based on category
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!category) return;
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch products from the same category
        const response = await api.get('/products');
        
        if (response.data && Array.isArray(response.data)) {
          // Filter products by category and exclude current product
          const relatedProducts = response.data
            .filter(product => 
              product.category === category && 
              product.id !== currentProductId
            )
            .slice(0, 10); // Limit to 10 related products
          
          // Format the products data
          const formattedProducts = relatedProducts.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            discount: product.discount || 0,
            rating: product.rating || 4.5,
            image: product.product_images && product.product_images.length > 0 
              ? product.product_images[0].image_url 
              : 'https://via.placeholder.com/300x300?text=No+Image',
            category: product.category || 'Uncategorized',
            description: product.description || ''
          }));
          
          setProducts(formattedProducts);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError('Failed to load related products');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRelatedProducts();
  }, [currentProductId, category]);
  
  // Handle product click
  const handleProductClick = (productId) => {
    navigate(`/products/${productId}`);
    // Scroll to top of the page when a related product is clicked
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Handle request quote click
  const handleRequestQuote = (product) => {
    // This would typically open a quote request form
    console.log('Request quote for:', product);
  };
  
  // Calculate how many products to show per slide based on screen size
  const getItemsPerSlide = () => {
    if (window.innerWidth >= 1280) return 5; // xl
    if (window.innerWidth >= 1024) return 4; // lg
    if (window.innerWidth >= 768) return 3; // md
    if (window.innerWidth >= 640) return 2; // sm
    return 1; // xs
  };
  
  const itemsPerSlide = getItemsPerSlide();
  
  // Handle next slide
  const nextSlide = () => {
    if (currentIndex + itemsPerSlide < products.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to the beginning
    }
  };
  
  // Handle previous slide
  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(Math.max(0, products.length - itemsPerSlide)); // Go to the end
    }
  };
  
  // If no related products, don't render the component
  if (!loading && products.length === 0) {
    return null;
  }
  
  return (
    <div className="related-products-slider py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Related Products</h2>
          <div className="flex space-x-2">
            <button 
              onClick={prevSlide}
              className="p-2 rounded-full bg-gray-200 hover:bg-primary-100 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Previous slide"
              disabled={currentIndex === 0}
            >
              <FaChevronLeft />
            </button>
            <button 
              onClick={nextSlide}
              className="p-2 rounded-full bg-gray-200 hover:bg-primary-100 text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Next slide"
              disabled={currentIndex + itemsPerSlide >= products.length}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-4 h-64">
                <div className="animate-pulse flex flex-col h-full">
                  <div className="bg-gray-200 h-32 rounded-md mb-4"></div>
                  <div className="bg-gray-200 h-4 rounded-md w-3/4 mb-2"></div>
                  <div className="bg-gray-200 h-4 rounded-md w-1/2 mb-4"></div>
                  <div className="bg-gray-200 h-8 rounded-md mt-auto"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerSlide)}%)` }}
            >
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className={`flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 px-2`}
                >
                  <CustomProductCard 
                    product={product}
                    onRequestQuote={handleRequestQuote}
                    onProductClick={handleProductClick}
                    viewMode="grid"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatedProductsSlider;
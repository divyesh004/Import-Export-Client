import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter } from 'react-icons/fa';
import Skeleton from '../components/common/Skeleton';
import Loading from '../components/common/Loading';
import RTQForm from '../components/common/RTQForm';
import CustomProductCard from '../components/product/CustomProductCard';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/env';

// Create the API instance once outside component for better performance
const api = axios.create({
  baseURL: API_BASE_URL
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


const categories = [
  'All Categories',
  'Electronics',
  'Clothing',
  'Home & Living',
  'Beauty & Health'
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('featured'); // featured, price-asc, price-desc
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rtqModalOpen, setRtqModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { showNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Scroll to top when navigating to a new page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Removed handleAddToCart function
  
  // Using the pre-created API instance from outside the component
  // This prevents recreation of the axios instance on each render
  
  // Memoized function to format products data
  const formatProductsData = useCallback((productsData) => {
    return productsData.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.product_images && product.product_images.length > 0 
        ? product.product_images[0].image_url 
        : 'https://via.placeholder.com/300x300?text=No+Image',
      category: product.category || 'Uncategorized',
      description: product.description || ''
    }));
  }, []);

  // Improved fetch products function with simplified caching
  const fetchProducts = useCallback(async () => {
    // Don't fetch if we already have products and not in loading state
    if (products.length > 0 && !loading) {
      return;
    }
    
    // Start with loading state
    setLoading(true);
    setError('');
    
    try {
      // Always fetch fresh data to ensure we have the latest products
      const response = await api.get('/products');
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Format the products data using memoized function
        const formattedProducts = formatProductsData(response.data);
        
        // Update state with the formatted products
        setProducts(formattedProducts);
        setFilteredProducts(formattedProducts);
      } else {
        // If no products returned or empty array, show empty state
        setProducts([]);
        setFilteredProducts([]);
        setError('No products found. Our catalog might be updating.');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      // More user-friendly product loading error messages
      let errorMessage = 'Unable to load products at this time. Please try again later.';
      
      if (err.response?.data?.error) {
        if (err.response.status === 404) {
          errorMessage = 'No products found. Our catalog might be updating.';
        } else if (err.response.status === 403) {
          errorMessage = 'You do not have permission to view these products.';
        } else if (err.response.status >= 500) {
          errorMessage = 'Our servers are currently experiencing issues. Please try again later.';
        }
      } else if (err.request) {
        errorMessage = 'Network connection issue. Please check your internet connection.';
      }
      
      setError(errorMessage);
      // Only show notification once
      if (showNotification && !error) {
        showNotification(errorMessage, 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [formatProductsData, showNotification, products.length, loading]);
  
  // Call fetchProducts only once when component mounts
  useEffect(() => {
    fetchProducts();
    // Empty dependency array ensures this runs only once when component mounts
  }, []);

  // Memoize the sorting functions to prevent recreation
  const sortAscending = useCallback((a, b) => a.price - b.price, []);
  const sortDescending = useCallback((a, b) => b.price - a.price, []);
  
  // Simplified and optimized filtering and sorting function
  const filteredAndSortedProducts = useMemo(() => {
    // Early return if products array is empty
    if (!products || products.length === 0) {
      return [];
    }
    
    // Prepare search term once outside the filter loop for better performance
    const searchTermLower = searchTerm.toLowerCase();
    const isSearchActive = searchTermLower.length > 0;
    const isCategoryFiltered = selectedCategory !== 'All Categories';
    
    // Apply all filters together in a single pass
    const result = products.filter(product => {
      // Only check search if search term exists (short-circuit evaluation)
      const matchesSearch = !isSearchActive || (
        product.name.toLowerCase().includes(searchTermLower) ||
        (product.description && product.description.toLowerCase().includes(searchTermLower))
      );
      
      // Only check category if not set to 'All Categories'
      const matchesCategory = !isCategoryFiltered || product.category === selectedCategory;
      
      // Return combined result of all filters
      return matchesSearch && matchesCategory;
    });
    
    // Only sort if needed
    if (sortBy === 'price-asc') {
      return [...result].sort(sortAscending);
    } else if (sortBy === 'price-desc') {
      return [...result].sort(sortDescending);
    }
    
    return result;
  }, [products, searchTerm, selectedCategory, sortBy, sortAscending, sortDescending]);
  
  // Update filtered products when dependencies change - direct update without extra function
  useEffect(() => {
    setFilteredProducts(filteredAndSortedProducts);
  }, [filteredAndSortedProducts]);
  
  // ProductCard component is now imported from separate file
  
  // Memoize handlers to prevent recreation on each render
  const handleRequestQuote = useCallback((product) => {
    setSelectedProduct(product);
    setRtqModalOpen(true);
  }, []);
  
  // Memoize product click handler
  const handleProductClick = useCallback((productId) => {
    navigate(`/products/${productId}`);
    window.scrollTo(0, 0);
  }, [navigate]);

  if (loading) {
    return (
      <div className="py-4 sm:py-6 md:py-8">
        <div className="container px-4 sm:px-6 mx-auto">
          <div className="text-center sm:text-left">
            <Skeleton type="title" />
          </div>
          
          {/* Search and Filter Bar Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
            <div className="relative w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mb-3 sm:mb-0">
              <Skeleton type="input" />
            </div>
            
            <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-2 sm:gap-4">
              <div className="sm:hidden">
                <Skeleton type="button" width="80px" />
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Skeleton type="text" width="60px" />
                <Skeleton type="input" width="120px" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            {/* Filters Sidebar Skeleton */}
            <div className="hidden md:block md:w-1/4 lg:w-1/5 bg-white p-4 rounded-lg shadow-sm h-fit">
              <div className="mb-6">
                <Skeleton type="text" />
                <div className="mt-3 space-y-2">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} type="text" />
                  ))}
                </div>
              </div>
              
              <div>
                <Skeleton type="text" />
                <div className="mt-3 space-y-2">
                  <Skeleton type="text" />
                  <Skeleton type="text" />
                  <Skeleton type="text" />
                </div>
              </div>
            </div>
            
            {/* Products Grid Skeleton */}
            <div className="flex-1">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 8].map((item) => (
                  <div key={item} className="card bg-white rounded-lg shadow-sm">
                    <div className="h-36 sm:h-40 md:h-48 bg-gradient-skeleton rounded-t-lg skeleton-animation"></div>
                    <div className="p-3 sm:p-4">
                      <Skeleton type="title" />
                      <Skeleton type="text" />
                      <div className="flex justify-between items-center mt-2">
                        <Skeleton type="text" width="40px" />
                        <Skeleton type="button" width="80px" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-4 sm:py-6 md:py-8">
      <div className="container px-4 sm:px-6 mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center sm:text-left">All Products</h1>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mb-3 sm:mb-0">
            <input
              type="text"
              placeholder="Search products..."
              className="input pl-10 py-2 w-full rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          
          <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-2 sm:gap-4">
            {/* Filter Toggle (Mobile) */}
            <button 
              className="flex sm:hidden items-center space-x-2 text-primary-600 bg-white px-3 py-2 rounded-lg shadow-sm"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FaFilter />
              <span>Filters {isFilterOpen ? 'Hide' : 'Show'}</span>
            </button>
            
            {/* Sort Options */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <label className="text-gray-700 text-sm sm:text-base whitespace-nowrap">Sort by:</label>
              <select 
                className="input py-1 sm:py-2 px-2 sm:px-3 text-sm sm:text-base rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Mobile Filter Panel - Slide down when open */}
        <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${isFilterOpen ? 'max-h-96 opacity-100 mb-4' : 'max-h-0 opacity-0'}`}>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">Categories</h3>
              <div className="grid grid-cols-2 gap-1">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-mobile-${index}`}
                      name="category-mobile"
                      className="mr-2"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                    />
                    <label htmlFor={`category-mobile-${index}`} className="text-gray-700 text-sm">{category}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5 bg-white p-4 rounded-lg shadow-sm h-fit sticky top-4">
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`category-${index}`}
                      name="category"
                      className="mr-2 accent-primary-600"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                    />
                    <label htmlFor={`category-${index}`} className="text-gray-700">{category}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <CustomProductCard 
                    key={product.id}
                    product={product}
                    onRequestQuote={handleRequestQuote}
                    onProductClick={handleProductClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* RTQ Form Modal - Directly loaded without Suspense */}
      {selectedProduct && (
        <RTQForm 
          isOpen={rtqModalOpen} 
          onClose={() => setRtqModalOpen(false)} 
          product={selectedProduct} 
        />
      )}
    </div>
  );
};

export default Products;
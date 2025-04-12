import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaSort, FaTimes, FaChevronDown, FaChevronUp, FaShoppingBag, FaThLarge, FaList } from 'react-icons/fa';
import Skeleton from '../components/common/Skeleton';
import Loading from '../components/common/Loading';
import RTQForm from '../components/common/RTQForm';
import CustomProductCard from '../components/product/CustomProductCard';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/env';
import { motion, AnimatePresence } from 'framer-motion';

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
  'electronics',
  'Clothing',
  'Home & Living',
  'Beauty & Health',
  'accessories'
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('featured'); // featured, price-asc, price-desc
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rtqModalOpen, setRtqModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const { showNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Scroll to top when navigating to a new page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Memoized function to format products data
  const formatProductsData = useCallback((productsData) => {
    return productsData.map(product => ({
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

  // Handle sort selection
  const handleSortChange = (value) => {
    setSortBy(value);
    setIsSortOpen(false);
  };

  // Close filter and sort dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsFilterOpen(false);
      setIsSortOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Prevent event propagation for dropdown toggles
  const handleDropdownToggle = (e, setter, value) => {
    e.stopPropagation();
    setter(!value);
  };

  if (loading) {
    return (
      <div className="py-4 sm:py-6 md:py-8 bg-gray-50 min-h-screen">
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
    <div className="py-4 sm:py-6 md:py-8 bg-gray-50 min-h-screen">
      <div className="container px-4 sm:px-6 mx-auto">
        {/* Page Header with Animation */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 md:mb-8 text-center sm:text-left"
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-800">All Products</span>
        </motion.h1>
        
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
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
              {searchTerm && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setSearchTerm('')}
                >
                  <FaTimes />
                </button>
              )}
            </div>
            
            <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-2 sm:gap-4">
              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <FaThLarge size={16} />
                </button>
                <button
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <FaList size={16} />
                </button>
              </div>
              
              {/* Filter Toggle (Mobile) */}
              <div className="relative sm:hidden">
                <button 
                  className="flex items-center space-x-2 text-primary-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg font-medium"
                  onClick={(e) => handleDropdownToggle(e, setIsFilterOpen, isFilterOpen)}
                >
                  <FaFilter />
                  <span>Filter</span>
                  {isFilterOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                
                <AnimatePresence>
                  {isFilterOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black bg-opacity-30"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          setIsFilterOpen(false);
                        }
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="w-full max-w-xs bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                          <h3 className="font-semibold text-lg text-gray-800">Filter</h3>
                          <button 
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => setIsFilterOpen(false)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                        <div className="p-4">
                          <h4 className="font-medium text-gray-800 mb-3">Categories</h4>
                          <div className="space-y-3">
                            {categories.map((category, index) => (
                              <div key={index} className="flex items-center">
                                <input
                                  type="radio"
                                  id={`category-mobile-${index}`}
                                  name="category-mobile"
                                  className="mr-3 h-4 w-4 accent-primary-600"
                                  checked={selectedCategory === category}
                                  onChange={() => {
                                    setSelectedCategory(category);
                                    setIsFilterOpen(false);
                                  }}
                                />
                                <label 
                                  htmlFor={`category-mobile-${index}`} 
                                  className={`${selectedCategory === category ? 'text-primary-700 font-medium' : 'text-gray-700'} text-base cursor-pointer`}
                                >
                                  {category}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                          <button
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            onClick={() => setIsFilterOpen(false)}
                          >
                            Apply
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Sort Options */}
              <div className="relative">
                <button 
                  className="flex items-center space-x-2 text-primary-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg font-medium"
                  onClick={(e) => handleDropdownToggle(e, setIsSortOpen, isSortOpen)}
                >
                  <FaSort />
                  <span className="hidden xs:inline">Sort</span>
                  {isSortOpen ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                </button>
                
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="sm:absolute sm:right-0 sm:mt-2 sm:w-48 fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black bg-opacity-30 sm:bg-transparent sm:static sm:inset-auto sm:pt-0 sm:px-0 sm:flex-none sm:justify-start"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          setIsSortOpen(false);
                        }
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        className="w-full max-w-xs bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 sm:rounded-lg sm:shadow-lg sm:w-48 sm:max-w-none"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 sm:hidden">
                          <h3 className="font-semibold text-lg text-gray-800">Sort</h3>
                          <button 
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => setIsSortOpen(false)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                        <div className="py-2">
                          <button 
                            className={`w-full text-left px-4 py-3 sm:py-2 text-base sm:text-sm ${sortBy === 'featured' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => handleSortChange('featured')}
                          >
                            Featured
                          </button>
                          <button 
                            className={`w-full text-left px-4 py-3 sm:py-2 text-base sm:text-sm ${sortBy === 'price-asc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => handleSortChange('price-asc')}
                          >
                            Price: Low to High
                          </button>
                          <button 
                            className={`w-full text-left px-4 py-3 sm:py-2 text-base sm:text-sm ${sortBy === 'price-desc' ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                            onClick={() => handleSortChange('price-desc')}
                          >
                            Price: High to Low
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5 bg-white p-4 rounded-lg shadow-sm h-fit sticky top-4">
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-gray-800">Categories</h3>
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
                    <label 
                      htmlFor={`category-${index}`} 
                      className={`${selectedCategory === category ? 'text-primary-700 font-medium' : 'text-gray-700'} cursor-pointer`}
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Products Grid/List */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-12 bg-white rounded-lg shadow-sm"
              >
                <div className="flex justify-center mb-4">
                  <FaShoppingBag className="text-gray-300 text-5xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search or filter criteria</p>
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear search
                  </button>
                )}
                {selectedCategory !== 'All Categories' && (
                  <button 
                    onClick={() => setSelectedCategory('All Categories')}
                    className="mt-2 text-primary-600 hover:text-primary-700 font-medium block mx-auto"
                  >
                    Show all categories
                  </button>
                )}
              </motion.div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </div>
                
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 md:gap-6"
                  >
                    {filteredProducts.map((product) => (
                      <motion.div 
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CustomProductCard 
                          product={product}
                          onRequestQuote={handleRequestQuote}
                          onProductClick={handleProductClick}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
                
                {/* List View */}
                {viewMode === 'list' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {filteredProducts.map((product) => (
                      <motion.div 
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-300"
                        onClick={() => handleProductClick(product.id)}
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="sm:w-1/4 md:w-1/5">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-48 sm:h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                              }}
                              loading="lazy"
                            />
                          </div>
                          <div className="p-4 sm:w-3/4 md:w-4/5 flex flex-col justify-between">
                            <div>
                              <h3 className="font-medium text-lg text-gray-900 hover:text-primary-600 transition-colors mb-2">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                              <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-accent-600 font-semibold text-lg">${product.price}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRequestQuote(product);
                                }}
                                className="text-primary-600 hover:text-primary-700 font-medium px-4 py-2 hover:bg-primary-50 rounded transition-colors"
                              >
                                Request Quote
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
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
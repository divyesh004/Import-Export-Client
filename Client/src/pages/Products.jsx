import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaSort, FaTimes, FaStar, FaChevronDown, FaChevronUp, FaShoppingBag, FaThLarge, FaList, 
  FaWater, FaLeaf, FaOilCan, FaSprayCan, FaHandHoldingMedical, FaHandsWash, FaTooth, FaPumpSoap, FaSpinner } from 'react-icons/fa';
import Skeleton from '../components/common/Skeleton';
import Loading from '../components/common/Loading';
import RTQForm from '../components/common/RTQForm';
import CustomProductCard from '../components/product/CustomProductCard';
import CategoryList from '../components/category/CategoryList';
import { createAuthenticatedApi } from '../utils/authUtils';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/env';
import { motion, AnimatePresence } from 'framer-motion';

// Create the API instance with authentication handling
let api;

const initApi = (toggleLoginPopup, showNotification) => {
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
  
  return api;
};


// Categories with icons for Flipkart-style display
const categories = [
  { id: 'all', name: 'All Categories', icon: FaThLarge, image: '/images/category-electronics-new.svg', color: '#2874f0' },
  { id: 'shampoo', name: 'Shampoo', icon: FaWater, image: '/images/category-beauty-health-new.svg', color: '#ff9f00' },
  { id: 'hair-treatment', name: 'Hair Treatment', icon: FaLeaf, image: '/images/category-beauty-health-new.svg', color: '#fb641b' },
  { id: 'hair-oil', name: 'Hair Oil', icon: FaOilCan, image: '/images/category-beauty-health-new.svg', color: '#ff6161' },
  { id: 'conditioner', name: 'Conditioner', icon: FaSprayCan, image: '/images/category-beauty-health-new.svg', color: '#85d241' },
  { id: 'skin-care', name: 'Skin Care', icon: FaHandHoldingMedical, image: '/images/category-beauty-health-new.svg', color: '#6e41d2' },
  { id: 'massage-oil', name: 'Massage Oil', icon: FaHandsWash, image: '/images/category-beauty-health-new.svg', color: '#d24141' },
  { id: 'toothpaste', name: 'Toothpaste', icon: FaTooth, image: '/images/category-beauty-health-new.svg', color: '#41b7d2' },
  { id: 'herbal-powder', name: 'Herbal Powder', icon: FaLeaf, image: '/images/category-beauty-health-new.svg', color: '#d241c3' },
  { id: 'soap', name: 'Soap', icon: FaPumpSoap, image: '/images/category-beauty-health-new.svg', color: '#41d2a5' },
 ];

// Initial visible categories count
const initialVisibleCount = 5;

// Price ranges for filter
const priceRanges = [
  { id: 'price-all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'price-1', label: 'Under $100', min: 0, max: 100 },
  { id: 'price-2', label: '$100 - $500', min: 100, max: 500 },
  { id: 'price-3', label: '$500 - $1000', min: 500, max: 1000 },
  { id: 'price-4', label: 'Over $1000', min: 1000, max: Infinity }
];

// Ratings for filter
const ratingOptions = [
  { value: 4, label: '4★ & above' },
  { value: 3, label: '3★ & above' },
  { value: 2, label: '2★ & above' },
  { value: 1, label: '1★ & above' }
];

// Availability options
const availabilityOptions = [
  { id: 'in-stock', label: 'In Stock' },
  { id: 'out-of-stock', label: 'Out of Stock' },
];

// Discount options
const discountOptions = [
  { id: 'discount-10', label: '10% Off or more', value: 10 },
  { id: 'discount-25', label: '25% Off or more', value: 25 },
  { id: 'discount-50', label: '50% Off or more', value: 50 },
  { id: 'discount-60', label: '60% Off or more', value: 60 },
  { id: 'discount-70', label: '70% Off or more', value: 70 }
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
  const [selectedPriceRange, setSelectedPriceRange] = useState(priceRanges[0]);
  const [selectedRating, setSelectedRating] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showQuickView, setShowQuickView] = useState(null);
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(initialVisibleCount);
  const [showAllCategories, setShowAllCategories] = useState(false);
  // Pagination and infinite scroll states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [visibleProducts, setVisibleProducts] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerTarget = useRef(null);
  const { showNotification, toggleLoginPopup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Flag to determine whether to show category filter section
  const [showCategoryFilter, setShowCategoryFilter] = useState(true);

  
  // Initialize API with authentication handling
  useEffect(() => {
    initApi(toggleLoginPopup, showNotification);
  }, [toggleLoginPopup, showNotification]);
  
  // Mobile filter drawer state
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  
  // Get all categories
  const visibleCategories = useMemo(() => {
    return categories;
  }, []);
  
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

  // Optimized fetch products function with faster loading and improved pagination
  const fetchProducts = useCallback(async (pageNum = 1, isLoadingMore = false) => {
    // Don't fetch if we already have products and not in loading state, unless loading more
    if (products.length > 0 && !loading && !isLoadingMore && pageNum === 1) {
      return;
    }
    
    // Set appropriate loading state
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError('');
    
    try {
      // Get URL parameters for filtering
      const params = new URLSearchParams(location.search);
      const industryParam = params.get('industry');
      const categoryParam = params.get('category');
      
      // Prepare query parameters
      const queryParams = {};
      if (industryParam) {
        queryParams.industry = industryParam;
        // If we have an industry parameter, update the selected category
        setSelectedCategory(industryParam);
      }
      
      if (categoryParam) {
        queryParams.category = categoryParam;
        // If we have a category parameter, update the selected category
        setSelectedCategory(categoryParam);
      }
      
      // Fetch products with pagination and filter parameters
      // Using a larger page size for faster initial load and smoother experience
      const response = await api.get('/products', { params: queryParams });
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        // Format the products data using memoized function
        const formattedProducts = formatProductsData(response.data);
        
        // Improved pagination with larger initial load
        const totalProducts = formattedProducts.length;
        const startIndex = (pageNum - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
        
        // Check if we have more products to load
        const hasMoreProducts = endIndex < totalProducts;
        setHasMore(hasMoreProducts);
        
        if (pageNum === 1) {
          // First page - set all products and load more initial visible products for faster display
          setProducts(formattedProducts);
          setFilteredProducts(formattedProducts);
          // Load more items initially for a better first impression
          const initialLoadCount = Math.min(itemsPerPage * 1.5, totalProducts);
          setVisibleProducts(formattedProducts.slice(0, initialLoadCount));
        } else if (isLoadingMore) {
          // Loading more - append to visible products with a slight delay to allow rendering
          setTimeout(() => {
            setVisibleProducts(prev => [...prev, ...formattedProducts.slice(startIndex, endIndex)]);
          }, 100);
        }
      } else {
        // If no products returned or empty array, show empty state
        setProducts([]);
        setFilteredProducts([]);
        setVisibleProducts([]);
        setHasMore(false);
        setError('No products found. Our catalog might be updating.');
      }
    } catch (err) {
      
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
      if (isLoadingMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  }, [formatProductsData, showNotification, products.length, loading, itemsPerPage]);
  
  // Process URL parameters when component mounts or URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchParam = params.get('search');
    const categoryParam = params.get('category');
    const industryParam = params.get('industry');
    
    // Set search term from URL if present
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    
    // Set category from URL if present
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      // Show filter section only when directly viewing products by category
      setShowCategoryFilter(false);
    }
    
    // Set industry from URL if present
    if (industryParam) {
      setSelectedCategory(industryParam);
      // Hide filter section when viewing industry products
      setShowCategoryFilter(false);
    }
    
    // If no category or industry parameter, show filter section
    if (!categoryParam && !industryParam) {
      setShowCategoryFilter(true);
    }
    
    // Reset pagination when URL changes
    setPage(1);
    setHasMore(true);
    fetchProducts(1, false);
  }, [location.search]); // Re-run when URL search parameters change
  
  // Function to load more products - defined before it's used in useEffects
  const loadMoreProducts = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, true);
    }
  }, [page, loadingMore, hasMore, fetchProducts]);
  
  // Setup Intersection Observer for infinite scrolling with unified scroll
  useEffect(() => {
    // Skip if we're loading or there are no more products
    if (loading || loadingMore || !hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        // If the target element is visible and we have more products to load
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          // Load next page of products
          loadMoreProducts();
        }
      },
      { threshold: 0.1, rootMargin: '100px' } // Trigger when 10% of the target is visible with additional margin
    );
    
    // Observe the target element if it exists
    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }
    
    // Cleanup observer on unmount
    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loading, loadingMore, hasMore, filteredProducts, loadMoreProducts]);
  
  // Add scroll event listener for unified scrolling experience
  useEffect(() => {
    const handleScroll = () => {
      // Only check for more products if we're not already loading and have more to load
      if (!loadingMore && hasMore && !loading) {
        // Check if we're near the bottom of the page
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.body.offsetHeight - 500; // Load more before reaching the very bottom
        
        if (scrollPosition >= pageHeight) {
          loadMoreProducts();
        }
      }
    };
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadingMore, hasMore, loading, loadMoreProducts]);
  

  // Memoize the sorting functions to prevent recreation
  const sortAscending = useCallback((a, b) => a.price - b.price, []);
  const sortDescending = useCallback((a, b) => b.price - a.price, []);
  
  // Enhanced filtering and sorting function with additional filters
  const filteredAndSortedProducts = useMemo(() => {
    // Early return if products array is empty
    if (!products || products.length === 0) {
      return [];
    }
    
    // Prepare search term once outside the filter loop for better performance
    const searchTermLower = searchTerm.toLowerCase();
    const isSearchActive = searchTermLower.length > 0;
    const isCategoryFiltered = selectedCategory !== 'All Categories';
    
    // Get URL parameters for filtering
    const params = new URLSearchParams(location.search);
    const categoryParam = params.get('category');
    const industryParam = params.get('industry');
    
    // Apply all filters together in a single pass
    const result = products.filter(product => {
      // Only check search if search term exists (short-circuit evaluation)
      const matchesSearch = !isSearchActive || (
        product.name.toLowerCase().includes(searchTermLower) ||
        (product.description && product.description.toLowerCase().includes(searchTermLower))
      );
      
      // Category filtering logic with URL parameters
      let matchesCategory = true;
      if (categoryParam) {
        matchesCategory = product.category.toLowerCase() === categoryParam.toLowerCase();
      } else if (industryParam) {
        matchesCategory = product.industry?.toLowerCase() === industryParam.toLowerCase();
      } else if (isCategoryFiltered) {
        matchesCategory = product.category.toLowerCase() === selectedCategory.toLowerCase();
      }
      
      // Price range filter
      const price = parseFloat(product.price);
      const matchesPriceRange = !selectedPriceRange || selectedPriceRange.id === 'price-all' || 
        (price >= selectedPriceRange.min && price <= selectedPriceRange.max);
      
      // Rating filter
      const matchesRating = !selectedRating || 
        (product.rating >= selectedRating.value);
      
      // Discount filter
      const matchesDiscount = !selectedDiscount || 
        (product.discount >= selectedDiscount.value);
      
      // Return combined result of all filters
      return matchesSearch && matchesCategory && matchesPriceRange && 
        matchesRating && matchesDiscount;
    });
    
    // Apply sorting
    if (sortBy === 'price-asc') {
      return [...result].sort(sortAscending);
    } else if (sortBy === 'price-desc') {
      return [...result].sort(sortDescending);
    } else if (sortBy === 'discount') {
      return [...result].sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (sortBy === 'rating') {
      return [...result].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      // Assuming products have a createdAt field, otherwise this will fall back to default
      return [...result].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return 0;
      });
    }
    
    return result;
  }, [products, searchTerm, selectedCategory, sortBy, sortAscending, sortDescending, 
      selectedPriceRange, selectedRating, selectedDiscount, location.search]);
      
  // This effect is now handled in the filtered products effect above
  
  // Handle adding/removing products from compare list
  const toggleCompare = useCallback((product) => {
    setCompareList(prevList => {
      const isInList = prevList.some(item => item.id === product.id);
      
      if (isInList) {
        return prevList.filter(item => item.id !== product.id);
      } else {
        // Limit to 4 products for comparison
        if (prevList.length >= 4) {
          showNotification('You can compare up to 4 products at a time', 'warning');
          return prevList;
        }
        return [...prevList, product];
      }
    });
  }, [showNotification]);
  
  // Quick view handler
  const handleQuickView = useCallback((e, productId) => {
    e.stopPropagation();
    setShowQuickView(productId);
  }, []);
  
  // Close quick view
  const closeQuickView = useCallback(() => {
    setShowQuickView(null);
  }, []);
  
  // Update filtered products when dependencies change - direct update without extra function
  useEffect(() => {
    setFilteredProducts(filteredAndSortedProducts);
    
    // Reset pagination when filters change
    setPage(1);
    // Get the first page of filtered products
    const firstPageProducts = filteredAndSortedProducts.slice(0, itemsPerPage);
    setVisibleProducts(firstPageProducts);
    // Check if there are more products to load
    setHasMore(filteredAndSortedProducts.length > itemsPerPage);
  }, [filteredAndSortedProducts, itemsPerPage]);
  
  // Memoize handlers to prevent recreation on each render
  const handleRequestQuote = useCallback((product) => {
    // Check if user is admin or seller
    const userRole = localStorage.getItem('role');
    if (userRole === 'admin' || userRole === 'seller') {
      showNotification('Admin and seller accounts cannot submit quote requests. Please use a customer account.', 'error');
      return;
    }
    
    setSelectedProduct(product);
    setRtqModalOpen(true);
  }, [showNotification]);
  
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
        <div className="w-full max-w-[1920px] px-4 sm:px-6 lg:px-8 mx-auto relative">
          <div className="text-center sm:text-left">
            <Skeleton type="title" />
          </div>
          
          {/* Search and Filter Bar Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4 mt-4 sm:mt-6 md:mt-8">
            <div className="relative w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mb-3 sm:mb-0">
              <Skeleton type="input" />
            </div>
            
            <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-3 sm:gap-4 lg:gap-5">
              <div className="sm:hidden">
                <Skeleton type="button" width="80px" />
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Skeleton type="text" width="60px" />
                <Skeleton type="input" width="120px" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6 lg:gap-8">
            {/* Filters Sidebar Skeleton */}
            <div className="hidden md:block md:w-64 lg:w-72 bg-white p-4 rounded-lg shadow-sm h-fit">
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
            <div className="flex-1 w-full transition-all duration-300">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {Array(8).fill(0).map((_, item) => (
                  <div key={item} className="bg-white p-0.5 hover:z-10 hover:relative">
                    <div className="card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="h-40 sm:h-44 md:h-52 bg-white border-b border-gray-100 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 bg-gradient-skeleton rounded-md skeleton-animation"></div>
                      </div>
                      <div className="p-4">
                        <Skeleton type="title" />
                        <Skeleton type="text" />
                        <Skeleton type="text" />
                        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                          <Skeleton type="text" width="60px" />
                          <Skeleton type="button" width="100px" />
                        </div>
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
  
  // Check if industry or category parameter exists in URL
  const params = new URLSearchParams(location.search);
  const industryParam = params.get('industry');
  const categoryParam = params.get('category');
  // This line was causing issues - we already have a state variable for this
  // const showCategoryFilter = !industryParam && !categoryParam;
  
  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* Fixed Category Bar - For desktop and mobile - Only show when no industry or category is selected */}
      {showCategoryFilter && (
        <div className="sticky top-0 left-0 right-0 z-30 bg-white shadow-md w-full">
          <div className="w-full overflow-x-auto py-3 px-1 sm:px-2 md:px-4 max-w-screen-2xl mx-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <style jsx>{`
              .category-scroll::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <div className="flex space-x-3 sm:space-x-4 md:space-x-5 w-full category-scroll sm:justify-start md:justify-center" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingLeft: '0.5rem', paddingRight: '0.5rem', scrollSnapType: 'x mandatory', scrollBehavior: 'smooth', display: 'flex', flexWrap: 'nowrap' }}>
              {visibleCategories.map((category) => (
                <div 
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    window.scrollTo(0, 0);
                    // Close mobile filter if open
                    if (isFilterOpen) setIsFilterOpen(false);
                  }}
                  className={`flex flex-col items-center justify-center p-1 sm:p-1.5 md:p-2 cursor-pointer transition-colors flex-shrink-0 ${selectedCategory === category.name ? 'opacity-100' : 'opacity-80'}`}
                  style={{ scrollSnapAlign: 'center', minWidth: '70px', maxWidth: '90px' }}
                >
                  <div 
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-1 shadow-sm transition-all duration-200 ${selectedCategory === category.name ? 'border-2 border-blue-500 scale-110' : 'border border-gray-100'}`}
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <category.icon className="text-sm sm:text-base md:text-lg" style={{ color: category.color }} />
                  </div>
                  <span className={`text-[8px] sm:text-[10px] md:text-xs mt-1 whitespace-nowrap font-medium text-center transition-colors duration-200 ${selectedCategory === category.name ? 'text-blue-600' : 'text-gray-700'}`}>{category.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Display CategoryList only when industry is selected */}
      {industryParam && <CategoryList />}
      
      {showCategoryFilter && (
      <div className="flex flex-1 relative">
        {/* Price Filter Sidebar - For desktop */}
        <div className="hidden md:block w-64 bg-white shadow-md sticky top-24 h-fit z-20">
          <div className="py-4 px-3">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 px-2">Price Range</h3>
            <div className="space-y-2 px-2">
              {priceRanges.map((range) => (
                <div 
                  key={range.id}
                  onClick={() => setSelectedPriceRange(range)}
                  className={`flex items-center p-2 cursor-pointer transition-colors rounded-lg ${selectedPriceRange.id === range.id ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <input 
                    type="radio" 
                    checked={selectedPriceRange.id === range.id}
                    onChange={() => setSelectedPriceRange(range)}
                    className="mr-2"
                  />
                  <span className="text-sm">{range.label}</span>
                </div>
              ))}
            </div>
          
            {/* Rating Filter */}
            <div className="mt-6 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 px-2">Rating</h3>
              <div className="space-y-2 px-2">
                {ratingOptions.map((option) => (
                  <div 
                    key={option.value}
                    onClick={() => setSelectedRating(option)}
                    className={`flex items-center p-2 cursor-pointer transition-colors rounded-lg ${selectedRating?.value === option.value ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
                  >
                    <input 
                      type="radio" 
                      checked={selectedRating?.value === option.value}
                      onChange={() => setSelectedRating(option)}
                      className="mr-2"
                    />
                    <span className="text-sm flex items-center">
                      {option.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Container - Unified scroll */}
        <div className="flex-1 px-2 sm:px-4 py-4">
          {/* Mobile Filter and Search Bar */}
          <div className="md:hidden flex flex-col gap-3 mb-4">
            <div className="flex justify-between items-center">
              {showCategoryFilter && (
                <button 
                  className="flex items-center space-x-2 bg-white shadow-sm px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors border border-gray-200"
                  onClick={(e) => handleDropdownToggle(e, setIsFilterOpen, isFilterOpen)}
                >
                  <FaFilter className="mr-2" />
                  <span>Filter</span>
                </button>
              )}
              
              <div className="flex items-center bg-white shadow-sm rounded-lg p-1 border border-gray-200">
                <button
                  className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-blue-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <FaThLarge size={16} />
                </button>
                <button
                  className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-blue-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <FaList size={16} />
                </button>
              </div>
            </div>
          </div>
        
        {/* Products Grid */}
        <div className={`grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4 ${viewMode === 'list' ? '!grid-cols-1' : ''}`}>
          {visibleProducts.length > 0 ? (
            visibleProducts.map((product) => (
              <CustomProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onProductClick={() => handleProductClick(product.id)}
                onRequestQuote={() => handleRequestQuote(product)}
                onToggleCompare={() => toggleCompare(product)}
                isInCompareList={compareList.some(item => item.id === product.id)}
                onQuickView={(e) => handleQuickView(e, product.id)}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-8 sm:py-12 text-center px-4">
              <FaSearch className="text-3xl sm:text-4xl text-gray-300 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-700 mb-2">No Products Found</h3>
              <p className="text-sm sm:text-base text-gray-500 max-w-md">
                {error || 'No products match your filter or search criteria. Please adjust your filters or try with different keywords.'}
              </p>
              <button 
                onClick={() => {
                  setSelectedCategory('All Categories');
                  setSelectedPriceRange(priceRanges[0]);
                  setSelectedRating(null);
                  setSelectedDiscount(null);
                  setSearchTerm('');
                }}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
        
        {/* Loading indicator and observer target with skeleton */}
        <div ref={observerTarget} className="flex justify-center py-4 mt-4 w-full">
          {loadingMore && (
            <div className="w-full grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 xs:gap-3 sm:gap-4">
              {Array(4).fill(0).map((_, index) => (
                <div key={index} className="bg-white p-0.5 hover:z-10 hover:relative">
                  <div className="card bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="h-40 sm:h-44 md:h-52 bg-white border-b border-gray-100 flex items-center justify-center">
                      <div className="w-3/4 h-3/4 bg-gradient-skeleton rounded-md skeleton-animation"></div>
                    </div>
                    <div className="p-4">
                      <Skeleton type="title" />
                      <Skeleton type="text" />
                      <Skeleton type="text" />
                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                        <Skeleton type="text" width="60px" />
                        <Skeleton type="button" width="100px" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
                
        <AnimatePresence>
          {isFilterOpen && showCategoryFilter && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-16 px-4 bg-black bg-opacity-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsFilterOpen(false);
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full max-w-xs bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
                style={{ scrollbarWidth: 'thin' }}
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <h3 className="font-semibold text-lg text-gray-800">Filter Products</h3>
                  <button 
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    onClick={() => setIsFilterOpen(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-gray-800 mb-3">Categories</h4>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {categories.map((category, index) => (
                      <div key={index} className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                        <input
                          type="radio"
                          id={`category-mobile-${index}`}
                          name="category-mobile"
                          className="mr-3 h-4 w-4 accent-primary-600"
                          checked={selectedCategory === category.name}
                          onChange={() => {
                            setSelectedCategory(category.name);
                            setIsFilterOpen(false);
                          }}
                        />
                        <label 
                          htmlFor={`category-mobile-${index}`} 
                          className={`${selectedCategory === category.name ? 'text-primary-700 font-medium' : 'text-gray-700'} text-base cursor-pointer flex items-center`}
                                >
                                  <category.icon className="mr-2 text-lg" style={{ color: category.color }} />
                                  {category.name}
                                </label>
                              </div>
                            ))}
                    </div>
                    
                    <div className="border-t border-gray-100 my-4 pt-4">
                      <h4 className="font-medium text-gray-800 mb-3">Price Range</h4>
                      <div className="space-y-3">
                        {priceRanges.map((range, index) => (
                          <div key={index} className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                            <input
                              type="radio"
                              id={`price-mobile-${index}`}
                              name="price-mobile"
                              className="mr-3 h-4 w-4 accent-primary-600"
                              checked={selectedPriceRange.id === range.id}
                              onChange={() => {
                                setSelectedPriceRange(range);
                              }}
                            />
                            <label 
                              htmlFor={`price-mobile-${index}`} 
                              className={`${selectedPriceRange.id === range.id ? 'text-primary-700 font-medium' : 'text-gray-700'} text-base cursor-pointer`}
                            >
                              {range.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-100 my-4 pt-4">
                      <h4 className="font-medium text-gray-800 mb-3">Rating</h4>
                      <div className="space-y-3">
                        {ratingOptions.map((option, index) => (
                          <div key={index} className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                            <input
                              type="radio"
                              id={`rating-mobile-${index}`}
                              name="rating-mobile"
                              className="mr-3 h-4 w-4 accent-primary-600"
                              checked={selectedRating && selectedRating.value === option.value}
                              onChange={() => {
                                setSelectedRating(option);
                              }}
                            />
                            <label 
                              htmlFor={`rating-mobile-${index}`} 
                              className={`${selectedRating && selectedRating.value === option.value ? 'text-primary-700 font-medium' : 'text-gray-700'} text-base cursor-pointer flex items-center`}
                            >
                              {option.label} <FaStar className="text-yellow-400 ml-1" />
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          <div className="border-t border-gray-100 my-4 pt-4">
                            <h4 className="font-medium text-gray-800 mb-3">Discount</h4>
                            <div className="space-y-3">
                              {discountOptions.map((option, index) => (
                                <div key={index} className="flex items-center hover:bg-gray-50 p-2 rounded-lg transition-all duration-200">
                                  <input
                                    type="radio"
                                    id={`discount-mobile-${index}`}
                                    name="discount-mobile"
                                    className="mr-3 h-4 w-4 accent-primary-600"
                                    checked={selectedDiscount && selectedDiscount.value === option.value}
                                    onChange={() => {
                                      setSelectedDiscount(option);
                                    }}
                                  />
                                  <label 
                                    htmlFor={`discount-mobile-${index}`} 
                                    className={`${selectedDiscount && selectedDiscount.value === option.value ? 'text-primary-700 font-medium' : 'text-gray-700'} text-base cursor-pointer`}
                                  >
                                    {option.label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                          <button
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                            onClick={() => setIsFilterOpen(false)}
                          >
                            Apply Filters
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
            
      
      {/* RTQ Form Modal - Directly loaded without Suspense */}
      {selectedProduct && (
        <RTQForm 
          isOpen={rtqModalOpen} 
          onClose={() => setRtqModalOpen(false)} 
          product={selectedProduct} 
        />
        
      )}
</div>
  )}
    


export default Products

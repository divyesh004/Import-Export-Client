import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaUser,
  FaBars,
  FaTimes,
  FaSearch,
  FaQuoteRight,
  FaClipboardCheck,
  FaClipboardList,
  FaChevronDown,
  FaChevronUp,
  FaHome,
  FaBoxOpen,
  FaSignOutAlt,
  FaUserCircle,
  FaShoppingCart,
  FaQuestionCircle,
  FaHeart,
  FaEnvelope,
  FaTachometerAlt,
  FaShoppingBag,
  FaSpinner,
  FaArrowUp,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import { useMediaQuery } from "react-responsive";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import CustomProductRequestForm from "../common/CustomProductRequestForm";
import { motion } from "framer-motion";
import { createAuthenticatedApi } from "../../utils/authUtils";
import { API_BASE_URL } from "../../config/env";

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

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showCustomRequestForm, setShowCustomRequestForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const { currentUser, logout, toggleLoginPopup, showNotification } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  const searchRef = useRef(null);
  
  // Initialize API with authentication handling
  useEffect(() => {
    initApi(toggleLoginPopup, showNotification);
  }, [toggleLoginPopup, showNotification]);
  
  // Handle custom product request button click
  const handleCustomProductRequest = () => {
    if (!currentUser) {
      toggleLoginPopup(true);
      return;
    }
    setShowCustomRequestForm(true);
  };

  // Refs for handling clicks outside
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const dropdownButtonsRef = useRef({});

  // Function to fetch products based on search term using API
  const fetchSearchResults = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      
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
          image_url: product.product_images && product.product_images.length > 0 
            ? product.product_images[0].image_url 
            : 'https://via.placeholder.com/300x300?text=No+Image',
          category: product.category || 'Uncategorized',
          description: product.description || ''
        }));
        
        // Filter products based on search term
        const filteredProducts = formattedProducts.filter(product =>
          product.name.toLowerCase().includes(term.toLowerCase()) ||
          (product.description && product.description.toLowerCase().includes(term.toLowerCase()))
        );
        
        // Limit to 5 results for better UX
        const limitedResults = filteredProducts.slice(0, 5);
        
        // Set search results
        setSearchResults(limitedResults);
        console.log('Search results:', limitedResults);
      } else {
        setSearchResults([]);
      }
      
    } catch (error) {
      console.error('Error in search functionality:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Memoize the fetch function to prevent unnecessary re-renders
  const memoizedFetchSearchResults = useCallback(fetchSearchResults, []);

  // Handle search input change with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.trim()) {
        memoizedFetchSearchResults(searchTerm);
        setShowSuggestions(true);
      } else {
        setSearchResults([]);
        setShowSuggestions(false);
      }
    }, 300); // 300ms delay

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, memoizedFetchSearchResults]);
  
  // Force show suggestions when input is focused and has value
  const handleInputFocus = () => {
    if (searchTerm.trim()) {
      setShowSuggestions(true);
      // Re-fetch results if we have a search term
      memoizedFetchSearchResults(searchTerm);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm("");
      setShowSuggestions(false);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside dropdown and not on the dropdown toggle button
      const isClickOutsideDropdown =
        dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isClickOnDropdownButton = Object.values(
        dropdownButtonsRef.current
      ).some((ref) => ref && ref.contains(event.target));

      if (isClickOutsideDropdown && !isClickOnDropdownButton) {
        setActiveDropdown(null);
      }

      // Close mobile menu when clicking outside
      if (
        isMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    // Close dropdown when clicking anywhere except the dropdown toggle button
    const handleGlobalClick = (event) => {
      const isClickOnDropdownButton = Object.values(
        dropdownButtonsRef.current
      ).some((ref) => ref && ref.contains(event.target));

      if (!isClickOnDropdownButton && activeDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("click", handleGlobalClick);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("click", handleGlobalClick);
    };
  }, [isMenuOpen, activeDropdown]);

  // Close mobile menu on window resize (when switching to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
        // Re-enable scrolling when menu is closed on resize
        document.body.style.overflow = 'auto';
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMenuOpen]);
  
  // Handle scroll event to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      // Show scroll to top button when user scrolls down 300px
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const toggleMenu = () => {
    const newMenuState = !isMenuOpen;
    setIsMenuOpen(newMenuState);
    
    // Toggle body scroll when menu is opened/closed
    if (newMenuState) {
      // Disable scrolling on body when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      // Enable scrolling on body when menu is closed
      document.body.style.overflow = 'auto';
    }
    
    // Don't reset dropdown when toggling menu
    // This allows dropdowns to stay open when menu is toggled
  };
  
  // Function to scroll to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleDropdown = (dropdownName, event) => {
    // Stop event propagation to prevent immediate closing by the global click handler
    if (event) {
      event.stopPropagation();
    }
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  // Animation classes for mobile menu items
  const mobileMenuItemClass =
    "flex items-center text-gray-700 hover:text-primary-600 transition-all duration-200 py-3 px-4 rounded-lg hover:bg-gray-50 shadow-sm";
  const mobileDropdownItemClass =
    "block text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium py-3 px-4 rounded-lg hover:bg-gray-100";
  const mobileButtonClass =
    "flex items-center w-full text-left text-gray-700 hover:text-primary-600 transition-all duration-200 py-3 px-4 rounded-lg hover:bg-gray-50 mt-2 shadow-sm";

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="flex justify-between items-center py-3 sm:py-3 md:py-4 relative">
          {/* Logo */}
          <Link
            to="/"
            className="text-xl md:text-2xl font-bold text-primary-600 flex items-center"
          >
            <div className="flex items-center">
              <img 
                src="images/indibridge-logo.png" 
                alt="IndiBridge Logo" 
                className="h-10 md:h-12 w-auto mr-2" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = 'none';
                  document.getElementById('fallback-logo-text').style.display = 'block';
                }}
              />
              <h3 id="fallback-logo-text" className="text-xl font-bold" style={{display: 'none'}}>
                INDI<span className="text-accent-500">BRIDGE</span>
              </h3>
            </div>
          </Link>

          {/* Mobile Menu Toggle or Scroll to Top Button */}
          {!isDesktop && (
            <button
              onClick={showScrollToTop ? scrollToTop : toggleMenu}
              className="text-white hover:text-gray-100 focus:outline-none p-3 rounded-full bg-primary-600 hover:bg-primary-700 transition-all duration-200 shadow-md fixed right-4 bottom-4 z-[60]"
              aria-label={showScrollToTop ? "Scroll to top" : "Toggle menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <FaTimes className="h-5 w-5" />
              ) : showScrollToTop ? (
                <FaArrowUp className="h-5 w-5" />
              ) : (
                <FaBars className="h-5 w-5" />
              )}
            </button>
          )}
          
          {/* Desktop Scroll to Top Button - Only visible when scrolling */}
          {isDesktop && showScrollToTop && (
            <button
              onClick={scrollToTop}
              className="text-white hover:text-gray-100 focus:outline-none p-3 rounded-full bg-primary-600 hover:bg-primary-700 transition-all duration-200 shadow-md fixed right-4 bottom-4 z-[60]"
              aria-label="Scroll to top"
            >
              <FaArrowUp className="h-5 w-5" />
            </button>
          )}
      

          {/* Desktop Search Bar */}
          <div className="hidden md:block flex-grow mx-4 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative w-full" ref={searchRef}>
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={handleInputFocus}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-3 flex items-center bg-primary-500 text-white rounded-r-md hover:bg-primary-600 transition-colors"
              >
                <FaSearch />
              </button>
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && (
                <div className="absolute z-[61] w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[50vh] overflow-y-auto">
                  {isSearching ? (
                    <div className="flex justify-center items-center p-4">
                      <FaSpinner className="animate-spin text-primary-500 mr-2" />
                      <span>Searching...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map((product) => {
                        // Simplified product data handling for mock data
                        const productId = product.id || `product-${Math.random()}`;
                        const productName = product.name || 'Product';
                        const productPrice = product.price ? `$${product.price.toFixed(2)}` : 'Price on request';
                        const imageUrl = product.image_url || 'Client\public\assets\images\placeholder-product.png';
                        
                        return (
                          <li key={productId}>
                            <Link
                              to={`/products/${productId}`}
                              className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                              onClick={() => {
                                setSearchTerm("");
                                setShowSuggestions(false);
                                setIsMenuOpen(false); // Close mobile menu
                                navigate(`/products/${productId}`);
                              }}
                            >
                              {imageUrl ? (
                                <img 
                                  src={imageUrl} 
                                  alt={productName} 
                                  className="w-10 h-10 object-cover rounded-md mr-3"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/product-placeholder.png';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
                                  <FaBoxOpen className="text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-800">{productName}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-xs text-gray-500">
                                    {product.discount > 0 ? (
                                      <>
                                        <span className="text-red-500 font-medium">${(product.price - (product.price * product.discount / 100)).toFixed(2)}</span>
                                        <span className="line-through ml-1 text-gray-400">${product.price.toFixed(2)}</span>
                                      </>
                                    ) : (
                                      <span className="font-medium">{productPrice}</span>
                                    )}
                                  </p>
                                  {product.category && (
                                    <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                      {product.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  ) : searchTerm.trim() ? (
                    <div className="p-4 text-center text-gray-500">
                      No products found
                    </div>
                  ) : null}
                </div>
              )}
            </form>
          </div>



          {/* Desktop Navigation */}
          <div
            className="hidden md:flex items-center space-x-4 lg:space-x-6"
            ref={dropdownRef}
          >
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 transition-colors flex items-center"
            >
              <FaHome className="mr-1" />
              <span>Home</span>
            </Link>

            {/* Request Custom Product Button - Moved to after Account dropdown */}

            {/* Products Dropdown */}
            <div className="relative">
              <button
                ref={(el) => (dropdownButtonsRef.current["products"] = el)}
                onClick={(e) => toggleDropdown("products", e)}
                className="flex items-center text-gray-700 hover:text-primary-600 transition-colors focus:outline-none"
                aria-expanded={activeDropdown === "products"}
              >
                <FaBoxOpen className="mr-1" />
                <span>Products</span>
                {activeDropdown === "products" ? (
                  <FaChevronUp className="ml-1 w-3 h-3" />
                ) : (
                  <FaChevronDown className="ml-1 w-3 h-3" />
                )}
              </button>
              {activeDropdown === "products" && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100 animate-fadeIn">
                  <Link
                    to="/products"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    All Products
                  </Link>
                </div>
              )}
            </div>

            {currentUser ? (
              <>
                <Link
                  to="/orders"
                  className="text-gray-700 hover:text-primary-600 transition-colors flex items-center"
                >
                  <FaClipboardCheck className="mr-1" />
                  <span>Orders</span>
                </Link>
                {(currentUser.role === "admin" ||
                  currentUser.role === "seller" ||
                  currentUser.role === "sub-admin") && (
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary-600 transition-colors flex items-center"
                  >
                    <FaTachometerAlt className="mr-1" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {/* Account Dropdown */}
                <div className="relative">
                  <button
                    ref={(el) => (dropdownButtonsRef.current["account"] = el)}
                    onClick={(e) => toggleDropdown("account", e)}
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors focus:outline-none"
                    aria-expanded={activeDropdown === "account"}
                  >
                    <FaUserCircle className="mr-1 text-lg" />
                    <span className="hidden lg:inline">Account</span>
                    {activeDropdown === "account" ? (
                      <FaChevronUp className="ml-1 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="ml-1 w-3 h-3" />
                    )}
                  </button>
                  {activeDropdown === "account" && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {currentUser.email}
                        </p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>

                {/* Custom Product Request Button with Animation - Added after Account dropdown */}
                <motion.button
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-md font-medium flex items-center space-x-1 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    y: {
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    },
                  }}
                  onClick={handleCustomProductRequest}
                >
                  <FaShoppingBag className="text-white" />
                  <span>Need?</span>
                </motion.button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors flex items-center"
                >
                  <FaUser className="mr-1" />
                  <span>Login</span>
                </Link>
                
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                >
                  <FaUserCircle className="mr-1" />
                  <span>Register</span>
                </Link>
                
                {/* Custom Product Request Button for non-logged in users */}
                <motion.button
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-md font-medium flex items-center space-x-1 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    y: [0, -5, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    y: {
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    },
                  }}
                  onClick={handleCustomProductRequest}
                >
                  <FaShoppingBag className="text-white" />
                  <span>Need?</span>
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Icons */}
          <div className="flex items-center space-x-4 md:hidden">
            {currentUser ? (
              <>
                <Link to="/my-inquiries" className="text-primary-600 hover:text-primary-700 transition-colors">
                  <FaQuestionCircle className="text-xl" />
                </Link>
                <Link to="/orders" className="text-primary-600 hover:text-primary-700 transition-colors">
                  <FaClipboardCheck className="text-xl" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-primary-600 hover:text-primary-700 transition-colors"
                >
                  <FaSignOutAlt className="text-xl" />
                </button>
              </>
            ) : (
              <Link to="/login" className="text-primary-600 hover:text-primary-700 transition-colors">
                <FaUser className="text-xl" />
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search - Only visible on mobile and tablet */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full" ref={searchRef}>
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={handleInputFocus}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-3 flex items-center bg-primary-500 text-white rounded-r-md hover:bg-primary-600 transition-colors"
            >
              <FaSearch />
            </button>
            
            {/* Mobile Search Suggestions */}
            {showSuggestions && (
              <div className="fixed left-0 right-0 top-auto z-[61] w-full mx-auto px-4 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-[50vh] overflow-y-auto">
                {isSearching ? (
                  <div className="flex justify-center items-center p-4">
                    <FaSpinner className="animate-spin text-primary-500 mr-2" />
                    <span>Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((product) => {
                      // Ensure product has an id, use index as fallback
                      const productId = product.id || product._id || `product-${Math.random()}`;
                      // Ensure product has a name
                      const productName = product.name || product.title || 'Product';
                      // Handle different price formats
                      let productPrice = 'Price on request';
                      if (product.price !== undefined && product.price !== null) {
                        const price = parseFloat(product.price);
                        if (!isNaN(price)) {
                          productPrice = `$${price.toFixed(2)}`;
                        }
                      }
                      // Handle different image formats
                      let imageUrl = null;
                      if (product.image_url) {
                        imageUrl = product.image_url;
                      } else if (product.imageUrl) {
                        imageUrl = product.imageUrl;
                      } else if (product.imageUrls && product.imageUrls.length > 0) {
                        imageUrl = product.imageUrls[0];
                      } else if (product.images && product.images.length > 0) {
                        imageUrl = product.images[0];
                      } else if (product.product_images && product.product_images.length > 0) {
                        imageUrl = product.product_images[0].image_url || product.product_images[0];
                      }
                      
                      return (
                        <li key={productId}>
                          <Link
                            to={`/products/${productId}`}
                            className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors"
                            onClick={() => {
                              setSearchTerm("");
                              setShowSuggestions(false);
                              setIsMenuOpen(false);
                              navigate(`/products/${productId}`);
                            }}
                          >
                            {imageUrl ? (
                              <img 
                                src={imageUrl} 
                                alt={productName} 
                                className="w-10 h-10 object-cover rounded-md mr-3"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/product-placeholder.png';
                                }}
                              />  
                            ) : (
                              <div className="w-10 h-10 bg-gray-200 rounded-md mr-3 flex items-center justify-center">
                                <FaBoxOpen className="text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-gray-800">{productName}</p>
                              <p className="text-sm text-gray-500">{productPrice}</p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                    
                  </ul>

                ) : searchTerm.trim() ? (
                  <div className="p-4 text-center text-gray-500">
                    No products found
                  </div>
                ) : null}
              </div>
            )}
          </form>
        </div>

        {/* Mobile Menu Overlay - prevents background interaction */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-[51] md:hidden"
            onClick={toggleMenu}
          />
        )}
        
        {/* Mobile Menu with Animation */}
        <div
          className={`md:hidden py-4 border-t border-gray-200 fixed bottom-0 left-0 right-0 bg-white shadow-xl z-[52] max-h-[80vh] overflow-y-auto transition-all duration-300 ease-in-out ${
            isMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-full pointer-events-none"
          }`}
          ref={mobileMenuRef}
          style={{ height: isMenuOpen ? 'auto' : '0' }}
        >
          <div className="flex flex-col space-y-2 px-4">
            {currentUser && (
              <div className="flex items-center space-x-3 pb-3 mb-3 border-b border-gray-200">
                <div className="bg-primary-100 rounded-full p-2 shadow-sm">
                  <FaUserCircle className="text-primary-600 text-2xl" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {currentUser.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser.email}
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Navigation Menu with Icons */}

            <Link
              to="/"
              className={`${mobileMenuItemClass} mb-1`}
              onClick={() => setIsMenuOpen(false)}
            >
              <FaHome className="mr-3 text-primary-500 text-lg" />
              <span className="font-medium">Home</span>
            </Link>

            {/* Products link is handled by the dropdown below */}

            {currentUser && (
              <>
                {/* My Inquiries link is now handled below */}

                <Link
                  to="/orders"
                  className={`${mobileMenuItemClass} mb-1`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaClipboardCheck className="mr-3 text-primary-500 text-lg" />
                  <span className="font-medium">My Orders</span>
                </Link>

                {(currentUser.role === "admin" ||
                  currentUser.role === "seller" ||
                  currentUser.role === "sub-admin") && (
                  <Link
                    to="/dashboard"
                    className={`${mobileMenuItemClass} mb-1`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaTachometerAlt className="mr-3 text-primary-500 text-lg" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                )}
              </>
            )}

            {/* Custom Product Request Button - Mobile */}
            <motion.button
              onClick={() => {
                handleCustomProductRequest();
                setIsMenuOpen(false);
              }}
              className={`${mobileMenuItemClass} bg-gradient-to-r from-primary-500 to-primary-600 text-white my-3 shadow-md`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaShoppingBag className="mr-3 text-white text-lg" />
              <span className="font-medium">Need?</span>
            </motion.button>

            {/* Profile and Logout options for mobile */}
            {currentUser ? (
              <>
                <div className="border-t border-gray-200 my-2 pt-2">
                  <Link
                    to="/profile"
                    className={`${mobileMenuItemClass} mb-1`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaUserCircle className="mr-3 text-primary-500 text-lg" />
                    <span className="font-medium">Profile</span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className={`${mobileButtonClass} mb-1`}
                  >
                    <FaSignOutAlt className="mr-3 text-primary-500 text-lg" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={mobileMenuItemClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="mr-3 text-primary-500 text-lg" />
                  <span className="font-medium">Login</span>
                </Link>
                <Link
                  to="/register"
                  className={`${mobileMenuItemClass} bg-primary-50`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserCircle className="mr-3 text-primary-500 text-lg" />
                  <span className="font-medium">Register</span>
                </Link>
              </>
            )}

            {/* Mobile Products Dropdown */}
            <div className="relative">
              <button
                ref={(el) =>
                  (dropdownButtonsRef.current["mobileProducts"] = el)
                }
                onClick={(e) => toggleDropdown("mobileProducts", e)}
                className={`${mobileMenuItemClass} w-full justify-between`}
              >
                <div className="flex items-center">
                  <FaBoxOpen className="mr-3 text-primary-500 text-lg" />
                  <span className="font-medium">Products</span>
                </div>
                {activeDropdown === "mobileProducts" ? (
                  <FaChevronUp className="ml-1 w-4 h-4 text-primary-500" />
                ) : (
                  <FaChevronDown className="ml-1 w-4 h-4 text-primary-500" />
                )}
              </button>
              {/* Dropdown with animation */}
              <div
                className={`pl-8 mt-1 mb-1 border-l-2 border-primary-300 bg-gray-50 rounded-md shadow-inner overflow-hidden transition-all duration-300 ease-in-out ${
                  activeDropdown === "mobileProducts"
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <Link
                  to="/products"
                  className={mobileDropdownItemClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="flex items-center">
                    <FaBoxOpen className="mr-2 text-primary-400 text-sm" />
                    All Products
                  </span>
                </Link>
              </div>
            </div>

            {/* Shopping Cart Link */}
            <Link
              to="/cart"
              className={mobileMenuItemClass}
              onClick={() => setIsMenuOpen(false)}
            >
              <FaShoppingCart className="mr-3 text-primary-500 text-lg" />
              <span className="font-medium">Cart</span>
            </Link>

            {/* My Inquiries Link - Only show for logged in users */}
            {currentUser && (
              <Link
                to="/my-inquiries"
                className={mobileMenuItemClass}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaQuestionCircle className="mr-3 text-primary-500 text-lg" />
                <span className="font-medium">My Inquiries</span>
              </Link>
            )}

            {currentUser ? (
              <>
                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>

                <Link
                  to="/orders"
                  className={mobileMenuItemClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaClipboardCheck className="mr-3 text-primary-500 text-lg" />
                  <span className="font-medium">Orders</span>
                </Link>

                {/* Dashboard - Only for admin and seller */}
                {(currentUser.role === "admin" ||
                  currentUser.role === "seller" ||
                  currentUser.role === "sub-admin") && (
                  <Link
                    to="/dashboard"
                    className={mobileMenuItemClass}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <FaTachometerAlt className="mr-3 text-primary-500 text-lg" />
                    <span className="font-medium">Dashboard</span>
                  </Link>
                )}

                {(currentUser.role === "admin" ||
                  currentUser.role === "seller") && (
                  <>
                    <Link
                      to="/admin/rtq"
                      className={mobileMenuItemClass}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaClipboardList className="mr-3 text-primary-500 text-lg" />
                      <span className="font-medium">Quote Requests</span>
                    </Link>
                    <Link
                      to="/dashboard"
                      className={mobileMenuItemClass}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaUserCircle className="mr-3 text-primary-500 text-lg" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </>
                )}

                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>

                <Link
                  to="/profile"
                  className={mobileMenuItemClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="mr-3 text-primary-500 text-lg" />
                  <span className="font-medium">Profile</span>
                </Link>

                <Link
                  to="/wishlist"
                  className={mobileMenuItemClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaHeart className="mr-3 text-primary-500 text-lg" />
                  <span className="font-medium">Wishlist</span>
                </Link>

                <Link
                  to="/messages"
                  className={mobileMenuItemClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaEnvelope className="mr-3 text-primary-500 text-lg" />
                  <span className="font-medium">Messages</span>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className={mobileButtonClass}
                >
                  <FaSignOutAlt className="mr-3 text-primary-500 text-lg" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <div className="pt-2 space-y-3">
                {/* Divider */}
                <div className="border-t border-gray-200 my-2"></div>

                <Link
                  to="/login"
                  className={mobileMenuItemClass}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUser className="mr-3 text-primary-500 text-lg" />
                  <span className="font-medium">Login</span>
                </Link>

                <Link
                  to="/register"
                  className="bg-primary-600 text-white px-4 py-3 rounded-md hover:bg-primary-700 transition-all duration-200 inline-block w-full text-center font-medium flex items-center justify-center mt-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <FaUserCircle className="mr-2 text-lg" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
        

        {/* Custom Product Request Form Modal */}
        <CustomProductRequestForm
          isOpen={showCustomRequestForm}
          onClose={() => setShowCustomRequestForm(false)}
        />
        </div>
      </nav>
      
    
  );
}
    

export default Navbar;

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { FaUser, FaBars, FaTimes, FaSearch, FaQuoteRight, FaClipboardCheck, FaClipboardList, FaChevronDown, FaChevronUp, FaHome, FaBoxOpen, FaSignOutAlt, FaUserCircle, FaShoppingCart, FaQuestionCircle, FaHeart, FaEnvelope, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useMediaQuery } from 'react-responsive';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
  const isDesktop = useMediaQuery({ minWidth: 1024 });
  
  // Refs for handling clicks outside
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const dropdownButtonsRef = useRef({});
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside dropdown and not on the dropdown toggle button
      const isClickOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isClickOnDropdownButton = Object.values(dropdownButtonsRef.current).some(ref => 
        ref && ref.contains(event.target)
      );
      
      if (isClickOutsideDropdown && !isClickOnDropdownButton) {
        setActiveDropdown(null);
      }
      
      // Close mobile menu when clicking outside
      if (isMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    // Close dropdown when clicking anywhere except the dropdown toggle button
    const handleGlobalClick = (event) => {
      const isClickOnDropdownButton = Object.values(dropdownButtonsRef.current).some(ref => 
        ref && ref.contains(event.target)
      );
      
      if (!isClickOnDropdownButton && activeDropdown) {
        setActiveDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('click', handleGlobalClick);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [isMenuOpen, activeDropdown]);
  
  // Close mobile menu on window resize (when switching to desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Don't reset dropdown when toggling menu
    // This allows dropdowns to stay open when menu is toggled
  };
  
  const toggleDropdown = (dropdownName, event) => {
    // Stop event propagation to prevent immediate closing by the global click handler
    if (event) {
      event.stopPropagation();
    }
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };
  
  // Animation classes for mobile menu items
  const mobileMenuItemClass = "flex items-center text-gray-700 hover:text-primary-600 transition-all duration-200 py-3 px-2 rounded-md hover:bg-gray-50";
  const mobileDropdownItemClass = "block text-gray-700 hover:text-primary-600 transition-all duration-200 font-medium py-3 px-3 rounded-md hover:bg-gray-100";
  const mobileButtonClass = "flex items-center w-full text-left text-gray-700 hover:text-primary-600 transition-all duration-200 py-3 px-2 rounded-md hover:bg-gray-50 mt-2";

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Main Navbar Row */}
        <div className="flex justify-between items-center py-3 md:py-4">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold text-primary-600 flex items-center">
            <h3 className="text-xl font-bold">Import<span className="text-accent-500">Export</span></h3>
          </Link>

          {/* Search Bar - Hidden on mobile, visible on tablet and desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-6" ref={dropdownRef}>
            <Link to="/" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center">
              <FaHome className="mr-1" />
              <span>Home</span>
            </Link>
            
      
            {/* Products Dropdown */}
            <div className="relative">
              <button 
                ref={el => dropdownButtonsRef.current['products'] = el}
                onClick={(e) => toggleDropdown('products', e)} 
                className="flex items-center text-gray-700 hover:text-primary-600 transition-colors focus:outline-none"
                aria-expanded={activeDropdown === 'products'}
              >
                <FaBoxOpen className="mr-1" />
                <span>Products</span>
                {activeDropdown === 'products' ? (
                  <FaChevronUp className="ml-1 w-3 h-3" />
                ) : (
                  <FaChevronDown className="ml-1 w-3 h-3" />
                )}
              </button>
              {activeDropdown === 'products' && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100 animate-fadeIn">
                  <Link to="/products" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    All Products
                  </Link>
                </div>
              )}
            </div>

            {currentUser ? (
              <>
                <Link to="/orders" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center">
                  <FaClipboardCheck className="mr-1" />
                  <span>Orders</span>
                </Link>
                {(currentUser.role === 'admin' || currentUser.role === 'seller') && (
                  <Link to="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors flex items-center">
                    <FaTachometerAlt className="mr-1" />
                    <span>Dashboard</span>
                  </Link>
                )}
                {/* Account Dropdown */}
                <div className="relative">
                  <button 
                    ref={el => dropdownButtonsRef.current['account'] = el}
                    onClick={(e) => toggleDropdown('account', e)} 
                    className="flex items-center text-gray-700 hover:text-primary-600 transition-colors focus:outline-none"
                    aria-expanded={activeDropdown === 'account'}
                  >
                    <FaUserCircle className="mr-1 text-lg" />
                    <span className="hidden lg:inline">Account</span>
                    {activeDropdown === 'account' ? (
                      <FaChevronUp className="ml-1 w-3 h-3" />
                    ) : (
                      <FaChevronDown className="ml-1 w-3 h-3" />
                    )}
                  </button>
                  {activeDropdown === 'account' && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{currentUser.name}</p>
                        <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Icons */}
          <div className="flex items-center space-x-4 md:hidden">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="text-primary-600 hover:text-primary-700 focus:outline-none p-2 rounded-md bg-primary-50 hover:bg-primary-100 transition-all duration-200 shadow-sm"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <FaTimes className="h-5 w-5" />
              ) : (
                <FaBars className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search - Only visible on mobile */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Search products..." 
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 text-sm" />
            </div>
          </div>
        </div>

        {/* Mobile Menu with Animation */}
        <div 
          className={`md:hidden py-4 border-t border-gray-200 absolute top-full left-0 right-0 bg-white shadow-xl z-50 max-h-[90vh] overflow-y-auto transition-all duration-300 ease-in-out ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`} 
          ref={mobileMenuRef}
        >
            <div className="flex flex-col space-y-2 px-4">
              {currentUser && (
                <div className="flex items-center space-x-3 pb-3 mb-2 border-b border-gray-200">
                  <div className="bg-primary-100 rounded-full p-2">
                    <FaUserCircle className="text-primary-600 text-2xl" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{currentUser.name}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
              )}
              
              {/* Mobile Navigation Menu with Icons */}
              
              <Link
                to="/"
                className={mobileMenuItemClass}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaHome className="mr-3 text-primary-500 text-lg" />
                <span className="font-medium">Home</span>
              </Link>
              
              {/* Mobile Products Dropdown */}
              <div className="relative">
                <button 
                  ref={el => dropdownButtonsRef.current['mobileProducts'] = el}
                  onClick={(e) => toggleDropdown('mobileProducts', e)} 
                  className={`${mobileMenuItemClass} w-full justify-between`}
                >
                  <div className="flex items-center">
                    <FaBoxOpen className="mr-3 text-primary-500 text-lg" />
                    <span className="font-medium">Products</span>
                  </div>
                  {activeDropdown === 'mobileProducts' ? (
                    <FaChevronUp className="ml-1 w-4 h-4 text-primary-500" />
                  ) : (
                    <FaChevronDown className="ml-1 w-4 h-4 text-primary-500" />
                  )}
                </button>
                {/* Dropdown with animation */}
                <div className={`pl-8 mt-1 mb-1 border-l-2 border-primary-300 bg-gray-50 rounded-md shadow-inner overflow-hidden transition-all duration-300 ease-in-out ${activeDropdown === 'mobileProducts' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
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
                    <Link
                      to="/products?category=electronics"
                      className={mobileDropdownItemClass}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="flex items-center">
                        <FaBoxOpen className="mr-2 text-primary-400 text-sm" />
                        Electronics
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
              
              {/* My Inquiries Link */}
              <Link
                to="/my-inquiries"
                className={mobileMenuItemClass}
                onClick={() => setIsMenuOpen(false)}
              >
                <FaQuestionCircle className="mr-3 text-primary-500 text-lg" />
                <span className="font-medium">My Inquiries</span>
              </Link>
              
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
                  {(currentUser.role === 'admin' || currentUser.role === 'seller') && (
                    <Link to="/dashboard" className={mobileMenuItemClass}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaTachometerAlt className="mr-3 text-primary-500 text-lg" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  )}
                  
                  {(currentUser.role === 'admin' || currentUser.role === 'seller') && (
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
      </div>
    </nav>
  );
};

export default Navbar;
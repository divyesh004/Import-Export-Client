import React, { memo, useState } from 'react';
import { FaStar, FaShoppingCart, FaHeart, FaQuoteRight, FaImage, FaShippingFast, FaTag, FaEye } from 'react-icons/fa';

// Optimized ProductCard component specifically for Products page with Flipkart-style design
// Using memo to prevent unnecessary re-renders
const CustomProductCard = memo(({ product, onRequestQuote, onProductClick, viewMode, onQuickView, onToggleCompare, isInCompareList }) => {
  // State to track image loading status
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Prevent event bubbling when clicking the quote button
  const handleQuoteClick = (e, product) => {
    e.stopPropagation();
    onRequestQuote(product);
  };

  // Calculate discount price if available
  const discountedPrice = product.discount 
    ? (product.price - (product.price * (product.discount / 100))).toFixed(2) 
    : null;

  // Mock rating - in a real app, this would come from the product data
  const rating = product.rating || 4.5;

  return (
    <div 
      className={`card group cursor-pointer bg-white rounded-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden h-full flex ${viewMode === 'list' ? 'flex-row' : 'flex-col'} relative`}
      onClick={() => onProductClick(product.id)}
    >
      {/* Flipkart-style Assured Badge */}
      <div className="absolute top-0 left-0 z-10 bg-primary-50 text-primary-600 text-[10px] px-1.5 py-0.5 font-medium">
        <span className="flex items-center">FEATURED</span>
      </div>

      {/* Image Container with Badges */}
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-1/3 min-w-[120px]' : 'aspect-square w-full'} bg-white pt-5`}>
        {/* Discount Badge - Flipkart style */}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-accent-600 text-white text-xs font-bold px-2 py-1 rounded-sm">
            {product.discount}% OFF
          </div>
        )}
        
        {/* Product Image with Hover Effect */}
        <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="animate-pulse rounded-md bg-gray-200 w-3/4 h-3/4"></div>
            </div>
          )}
          
          {imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
              <FaImage className="text-gray-300 text-4xl mb-2" />
              <p className="text-xs text-gray-400">Image not available</p>
            </div>
          )}
          
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-4/5 h-4/5 object-contain transition-transform duration-500 group-hover:scale-110 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.onerror = null;
              setImageError(true);
              setImageLoaded(true);
              e.target.src = '/images/category-electronics-new.svg';
            }}
            loading="lazy"
          />
        </div>
        
        {/* Quick Action Buttons - Visible on Hover (Flipkart style) */}
        <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 md:flex hidden items-center justify-center transition-opacity duration-300">
          <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <button 
              className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleCompare) onToggleCompare(product);
              }}
              aria-label={isInCompareList ? "Remove from compare" : "Add to compare"}
            >
              <FaHeart className={`${isInCompareList ? 'text-primary-600' : 'text-gray-500'} group-hover:text-primary-600 text-xs`} />
            </button>
            <button 
              className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              onClick={(e) => onQuickView && onQuickView(e, product.id)}
              aria-label="Quick view"
            >
              <FaEye className="text-gray-500 group-hover:text-primary-600 text-xs" />
            </button>
            <button 
              className="bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              onClick={(e) => handleQuoteClick(e, product)}
              aria-label="Request quote"
            >
              <FaQuoteRight className="text-gray-500 group-hover:text-primary-600 text-xs" />
            </button>
          </div>
        </div>
        
        {/* Mobile Action Buttons - Always visible on mobile */}
        <div className="absolute bottom-0 right-0 p-1 md:hidden flex gap-1">
          <button 
            className="bg-white/90 w-7 h-7 rounded-full flex items-center justify-center shadow-sm hover:bg-primary-50 text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleCompare) onToggleCompare(product);
            }}
            aria-label={isInCompareList ? "Remove from compare" : "Add to compare"}
          >
            <FaHeart className={`${isInCompareList ? 'text-primary-600' : 'text-gray-500'} text-xs`} />
          </button>
        </div>
      </div>
      
      {/* Product Info - Flipkart style */}
      <div className={`p-3 flex-grow flex flex-col justify-between bg-white ${viewMode === 'list' ? 'w-2/3' : 'w-full'}`}>
        {/* Category Tag - Flipkart style */}
        <div className="mb-1">
          <span className="text-[10px] text-gray-500 uppercase">{product.category}</span>
        </div>
        
        {/* Product Name - Flipkart style */}
        <h3 className="font-medium text-xs sm:text-sm text-gray-800 line-clamp-2 mb-1 hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Shipping Information - Replacing Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center bg-blue-600 text-white text-[9px] sm:text-xs px-1.5 py-0.5 rounded-sm">
            <FaShippingFast size={10} className="mr-0.5" />
            <span>Fast Shipping</span>
          </div>
          {viewMode === 'list' && (
            <div className="ml-2 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`text-[10px] ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">({rating})</span>
            </div>
          )}
        </div>
        
        {/* Description - Only visible in list view */}
        {viewMode === 'list' && product.description && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
        )}
        
        {/* Price Section with Buy Now Button - Flipkart style */}
        <div className="flex items-center justify-between mt-1 flex-wrap gap-y-2">
          <div className="flex items-center flex-wrap">
            {discountedPrice ? (
              <>
                <span className="text-gray-900 font-medium text-sm sm:text-base mr-2">${discountedPrice}</span>
                <span className="text-gray-500 text-xs line-through mr-2">${product.price.toFixed(2)}</span>
                <span className="text-green-600 text-xs font-medium">{product.discount}% off</span>
              </>
            ) : (
              <span className="text-gray-900 font-medium text-sm sm:text-base">${product.price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Add to cart functionality would go here
            }}
            className="bg-accent-600 hover:bg-accent-700 text-white text-[10px] sm:text-xs px-2 py-1 rounded-sm transition-colors flex items-center justify-center"
          >
            <span>Min Order: 10</span>
          </button>
        </div>
        
     
        {/* Request Quote Button - Flipkart style */}
        <button
          onClick={(e) => handleQuoteClick(e, product)}
          className="mt-3 w-full text-white bg-primary-600 hover:bg-primary-700 font-medium text-[10px] sm:text-xs py-1.5 sm:py-2 rounded-sm transition-colors flex items-center justify-center shadow-sm"
        >
          <FaQuoteRight className="mr-1.5" size={10} />
          <span>GET QUOTE</span>
        </button>
      </div>
    </div>
  );
});

export default CustomProductCard;
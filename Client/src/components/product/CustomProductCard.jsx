import React, { memo, useState } from 'react';
import { categories } from '../../pages/Products';
import { FaStar, FaShoppingCart, FaHeart, FaQuoteRight, FaImage, FaShieldAlt, FaTag, FaEye } from 'react-icons/fa';

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
      className={`card group cursor-pointer bg-white border-0 rounded-sm hover:shadow-2xl hover:shadow-gray-300/70 hover:translate-y-[-2px] transition-all duration-300 overflow-hidden h-full flex ${viewMode === 'list' ? 'flex-row' : 'flex-col'} relative`}
      onClick={() => onProductClick(product.id)}
    >
      {/* Flipkart-style Assured Badge */}
     

      {/* Image Container with Badges */}
      <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-1/3 min-w-[120px]' : 'aspect-square w-full'} bg-white pt-5 transition-all duration-300`}>
        {/* Discount Badge - Flipkart style */}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-none">
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
            className={`w-4/5 h-4/5 object-contain transition-transform duration-300 group-hover:scale-105 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.onerror = null;
              setImageError(true);
              setImageLoaded(true);
              // Use specific category image based on product category
              if (product.category && (product.category.toLowerCase() === 'Ayurvedic' || product.category.toLowerCase().includes('Ayurvedic'))) {
                // Use absolute path for Ayurveda image to ensure it loads correctly
                e.target.src = `${window.location.origin}/images/industries/ayurveda.svg`;
              } else if (product.categoryImage) {
                // Use absolute path for category image
                e.target.src = `${window.location.origin}${product.categoryImage}`;
              } else {
                // Default fallback
                e.target.src = `${window.location.origin}/images/category-electronics-new.svg`;
              }
            }}
            loading="lazy"
          />
        </div>
        
        {/* Quick Action Buttons removed as per requirement */}
        
        {/* Mobile Action Buttons removed as per requirement */}
      </div>
      
      {/* Product Info - Flipkart style */}
      <div className={`p-3 flex-grow flex flex-col justify-between bg-white ${viewMode === 'list' ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
        {/* Category Tag - Flipkart style */}
        <div className="mb-1">
          <span className="text-[10px] text-gray-500 uppercase">{product.category}</span>
        </div>
        
        {/* Product Name - Flipkart style */}
        <h3 className="font-medium text-xs sm:text-sm text-gray-800 line-clamp-2 mb-1 hover:text-blue-500 transition-colors">
          {product.name}
        </h3>
        
        {/* Verified Badge - Replacing Shipping Information */}
        <div className="flex items-center mb-2">
          <div className="flex items-center bg-green-100 text-green-700 text-[9px] sm:text-xs px-1.5 py-0.5 rounded-none">
            <FaShieldAlt size={10} className="mr-0.5" />
            <span>Verified</span>
          </div>
          {viewMode === 'list' && (
            <div className="ml-2 flex items-center">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={`text-[10px] ${i < Math.floor(rating) ? 'text-gray-700' : 'text-gray-300'}`} />
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
                <span className="text-green-500 text-xs font-medium">{product.discount}% off</span>
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
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[10px] sm:text-xs px-2 py-1 rounded-none transition-colors flex items-center justify-center"
          >
            <span>Min Order: 10</span>
          </button>
        </div>
        
     
        {/* Request Quote Button - Flipkart style */}
        <button
          onClick={(e) => handleQuoteClick(e, product)}
          className="mt-3 w-full text-[#ff6600] bg-gray-100 hover:bg-gray-200 font-medium text-[10px] sm:text-xs py-1.5 sm:py-2 rounded-sm transition-colors flex items-center justify-center"
        >
          <FaQuoteRight className="mr-1.5" size={10} />
          <span>GET QUOTE</span>
        </button>
      </div>
    </div>
  );
});

export default CustomProductCard;
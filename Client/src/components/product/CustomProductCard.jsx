import React, { memo } from 'react';
import { FaStar, FaShoppingCart, FaHeart, FaQuoteRight } from 'react-icons/fa';

// Optimized ProductCard component specifically for Products page
// Using memo to prevent unnecessary re-renders
const CustomProductCard = memo(({ product, onRequestQuote, onProductClick }) => {
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
      className="card group cursor-pointer bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden transform hover:-translate-y-1"
      onClick={() => onProductClick(product.id)}
    >
      {/* Image Container with Badges */}
      <div className="relative overflow-hidden aspect-[4/3]">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-accent-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.discount}% OFF
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-2 right-2 z-10 bg-white/80 backdrop-blur-sm text-primary-600 text-xs px-2 py-1 rounded-full">
          {product.category}
        </div>
        
        {/* Product Image with Hover Effect */}
        <div className="w-full h-full bg-gray-50 p-4 flex items-center justify-center overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
            }}
            loading="lazy"
          />
        </div>
        
        {/* Quick Action Buttons - Visible on Hover */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <button 
              className="bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Add to wishlist functionality would go here
              }}
              aria-label="Add to wishlist"
            >
              <FaHeart className="text-gray-500 group-hover:text-primary-600" />
            </button>
            <button 
              className="bg-white w-9 h-9 rounded-full flex items-center justify-center shadow-md hover:bg-primary-50 hover:text-primary-600 transition-colors"
              onClick={(e) => handleQuoteClick(e, product)}
              aria-label="Request quote"
            >
              <FaQuoteRight className="text-gray-500 group-hover:text-primary-600" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-medium text-sm sm:text-base text-gray-900 group-hover:text-primary-600 transition-colors cursor-pointer line-clamp-2 mb-1">
          {product.name}
        </h3>
        
        {/* Rating Stars */}
        <div className="flex items-center mb-2">
          <div className="flex text-accent-500">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={i < Math.floor(rating) ? 'text-accent-500' : 'text-gray-300'}
                size={12}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">{rating}</span>
        </div>
        
        {/* Price Section */}
        <div className="flex items-center justify-between mt-2">
          <div>
            {discountedPrice ? (
              <div className="flex items-center">
                <span className="text-accent-600 font-bold text-sm sm:text-base">${discountedPrice}</span>
                <span className="text-gray-400 text-xs line-through ml-2">${product.price.toFixed(2)}</span>
              </div>
            ) : (
              <span className="text-accent-600 font-bold text-sm sm:text-base">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          {/* Request Quote Button */}
          <button
            onClick={(e) => handleQuoteClick(e, product)}
            className="text-primary-600 hover:text-white bg-primary-50 hover:bg-primary-600 font-medium text-xs sm:text-sm px-3 py-1.5 rounded-full transition-colors flex items-center"
          >
            <FaQuoteRight className="mr-1" size={12} />
            Quote
          </button>
        </div>
      </div>
    </div>
  );
});

export default CustomProductCard;
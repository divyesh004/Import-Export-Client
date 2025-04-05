import React, { memo } from 'react';

// Optimized ProductCard component specifically for Products page
// Using memo to prevent unnecessary re-renders
const CustomProductCard = memo(({ product, onRequestQuote, onProductClick }) => {
  // Prevent event bubbling when clicking the quote button
  const handleQuoteClick = (e, product) => {
    e.stopPropagation();
    onRequestQuote(product);
  };

  return (
    <div 
      className="card group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
      onClick={() => onProductClick(product.id)}
    >
      <div className="relative overflow-hidden rounded-t-lg">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-36 sm:h-40 md:h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          // Improved error handling for images
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
          }}
          // Add loading="lazy" to improve initial page load performance
          loading="lazy"
        />
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="font-medium text-sm sm:text-base text-gray-900 group-hover:text-primary-600 transition-colors cursor-pointer line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 mb-2">{product.category}</p>
        <div className="flex justify-between items-center">
          <span className="text-accent-600 font-semibold text-sm sm:text-base">${product.price}</span>
          <button
            onClick={(e) => handleQuoteClick(e, product)}
            className="text-primary-600 hover:text-primary-700 font-medium text-xs sm:text-sm px-2 py-1 hover:bg-primary-50 rounded transition-colors"
          >
            Request Quote
          </button>
        </div>
      </div>
    </div>
  );
});

export default CustomProductCard;
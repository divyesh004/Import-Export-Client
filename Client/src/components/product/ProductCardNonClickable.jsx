import React, { useState } from 'react';
import { FaStar, FaTag, FaShippingFast, FaImage } from 'react-icons/fa';

const ProductCardNonClickable = ({ product }) => {
  // State to track image loading status
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Calculate discount price if available
  const discountedPrice = product.discount 
    ? (product.price - (product.price * (product.discount / 100))).toFixed(2) 
    : null;

  return (
    <div className="card group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden h-full flex flex-col">
      {/* Image Container with Badges */}
      <div className="relative overflow-hidden pt-4">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-accent-600 text-white text-xs font-bold px-2 py-1 rounded-sm">
            {product.discount}% OFF
          </div>
        )}
        
        {/* Featured Badge */}
        <div className="absolute top-0 left-0 z-10 bg-primary-50 text-primary-600 text-[10px] px-1.5 py-0.5 font-medium">
          <span className="flex items-center">FEATURED</span>
        </div>
        
        {/* Product Image with Hover Effect */}
        <div className="w-full h-48 bg-white flex items-center justify-center overflow-hidden">
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
      </div>
      
      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        {/* Category Tag */}
        <div className="mb-1">
          <span className="text-[10px] text-gray-500 uppercase">{product.category}</span>
        </div>
        
        {/* Product Name */}
        <h3 className="font-medium text-sm text-gray-800 line-clamp-2 mb-1 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>
        
        {/* Shipping Information */}
        <div className="flex items-center mb-2">
          <div className="flex items-center bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-sm">
            <FaShippingFast size={10} className="mr-0.5" />
            <span>Fast Shipping</span>
          </div>
        </div>
        
        {/* Price Section */}
        <div className="flex items-center justify-between mt-1 flex-wrap gap-y-2">
          <div className="flex items-center flex-wrap">
            {discountedPrice ? (
              <>
                <span className="text-gray-900 font-medium text-sm mr-2">${discountedPrice}</span>
                <span className="text-gray-500 text-xs line-through mr-2">${product.price.toFixed(2)}</span>
                <span className="text-green-600 text-xs font-medium">{product.discount}% off</span>
              </>
            ) : (
              <span className="text-gray-900 font-medium text-sm">${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
        
        {/* Product Details */}
        <div className="flex items-center mt-2">
          <span className="text-primary-600 text-xs font-medium">
            Product Details
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCardNonClickable;
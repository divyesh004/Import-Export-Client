import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBoxOpen } from 'react-icons/fa';

const CategoryCard = ({ category, isSubCategory = false }) => {
  // State to track image loading status
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState('/images/category-electronics-new.svg');
  
  // Get appropriate SVG image based on category name
  useEffect(() => {
    if (category && category.name) {
      const categoryName = category.name.toLowerCase();
      
      // Check for industry-specific images first
      if (categoryName.includes('fashion') || categoryName.includes('clothing') || categoryName.includes('apparel') || categoryName.includes('textile')) {
        setFallbackImage('/images/industries/fashion.svg');
      } else if (categoryName.includes('electronics') || categoryName.includes('electrical') || categoryName.includes('digital') || categoryName.includes('tech')) {
        setFallbackImage('/images/industries/electronics.svg');
      } 
      // Detailed Ayurveda categories
      else if (categoryName.includes('ayurvedic')) {
        setFallbackImage('/images/industries/ayurvedic.svg');
      } 
      // Specific Ayurvedic product categories
      else if (categoryName.includes('shampoo')) {
        setFallbackImage('/images/categories/shampoo.svg');
      } else if (categoryName.includes('hair treatment')) {
        setFallbackImage('/images/categories/hair-treatment.svg');
      } else if (categoryName.includes('hair oil')) {
        setFallbackImage('/images/categories/hair-oil.svg');
      } else if (categoryName.includes('conditioner')) {
        setFallbackImage('/images/categories/conditioner.svg');
      } else if (categoryName.includes('skin care')) {
        setFallbackImage('/images/categories/skin-care.svg');
      } else if (categoryName.includes('massage oil')) {
        setFallbackImage('/images/categories/massage-oil.svg');
      } else if (categoryName.includes('toothpaste')) {
        setFallbackImage('/images/categories/toothpaste.svg');
      } else if (categoryName.includes('herbal powder')) {
        setFallbackImage('/images/categories/herbal-powder.svg');
      } else if (categoryName.includes('soap')) {
        setFallbackImage('/images/categories/soap.svg');
      }
      // Other categories
      else if (categoryName.includes('food') || categoryName.includes('grocery') || categoryName.includes('beverage')) {
        setFallbackImage('/images/industries/food.svg');
      } else if (categoryName.includes('furniture') || categoryName.includes('chair') || categoryName.includes('table')) {
        setFallbackImage('/images/industries/furniture.svg');
      } else if (categoryName.includes('sports') || categoryName.includes('fitness') || categoryName.includes('gym')) {
        setFallbackImage('/images/industries/sports.svg');
      } else if (categoryName.includes('automotive') || categoryName.includes('car') || categoryName.includes('vehicle')) {
        setFallbackImage('/images/industries/automotive.svg');
      } else if (categoryName.includes('beauty') || categoryName.includes('health') || categoryName.includes('cosmetic')) {
        setFallbackImage('/images/industries/beauty-health.svg');
      } else if (categoryName.includes('home') || categoryName.includes('garden') || categoryName.includes('decor')) {
        setFallbackImage('/images/industries/home-garden.svg');
      } else if (categoryName.includes('oil') || categoryName.includes('massage')) {
        setFallbackImage('/images/industries/ayurveda-oil.svg');
      } else if (categoryName.includes('powder') || categoryName.includes('herbal')) {
        setFallbackImage('/images/industries/ayurveda-powder.svg');
      } else {
        // Default fallback
        setFallbackImage('/images/category-electronics-new.svg');
      }
    }
  }, [category]);

  // Determine the correct link based on category type and isSubCategory flag
  const getLinkPath = () => {
    // If this is a subcategory (already on industry page), link to products
    if (isSubCategory) {
      return `/products?category=${encodeURIComponent(category.name)}`;
    }
    
    // If this is an industry category, link to categories page
    if (category.name.toLowerCase() === 'ayurvedic' || 
        category.name.toLowerCase().includes('industry') ||
        category.id === 'all') {
      return `/categories?industry=${encodeURIComponent(category.name)}`;
    }
    
    // Default case - treat as a regular category
    return `/products?category=${encodeURIComponent(category.name)}`;
  };

  return (
    <Link 
      to={getLinkPath()}
      className="block h-full"
    >
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col border border-gray-100 group hover:-translate-y-1">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-white pt-4 px-4">
          {/* Product count badge */}
          <div className="absolute top-3 right-3 bg-accent-500 text-white text-xs font-medium px-2 py-1 rounded-full z-10">
            {category.count || '20+'} Products
          </div>
          
          {/* Category Image with Hover Effect */}
          <div className="w-full h-40 flex items-center justify-center overflow-hidden">
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-pulse rounded-full bg-gray-200 w-32 h-32"></div>
              </div>
            )}
            
            {/* Only show error state if fallback image also fails */}
            {imageError && !fallbackImage && (
              <div className="flex flex-col items-center justify-center h-full">
                <FaBoxOpen className="text-gray-300 text-4xl mb-2" />
                <p className="text-xs text-gray-400">Image not available</p>
              </div>
            )}
            
            <img 
              src={imageError && fallbackImage ? fallbackImage : category.image} 
              alt={category.name} 
              className={`w-36 h-36 object-contain transition-transform duration-500 group-hover:scale-110 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImageLoaded(true)}
              onError={(e) => {
                e.target.onerror = null;
                // Set error state if already showing fallback image
                if (e.target.src === fallbackImage) {
                  setImageError(true);
                  setImageLoaded(true);
                } else {
                  // Show fallback image on first error
                  setImageError(true);
                  setImageLoaded(true);
                  if (fallbackImage) {
                    e.target.src = fallbackImage;
                    // Update error state when fallback image loads
                    setTimeout(() => setImageError(false), 100);
                  }
                }
              }}
              loading="lazy"
            />
          </div>
          
          {/* Decorative wave shape */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-white" style={{
            clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%, 75% 50%, 50% 0%, 25% 50%, 0% 0%)'
          }}></div>
        </div>
        
        <div className="p-4 flex-grow flex flex-col justify-between bg-white">
          <div>
            <h3 className="font-medium text-gray-800 text-lg mb-1 group-hover:text-primary-600 transition-colors">
              {category.name}
            </h3>
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              Explore {category.count || '20+'} products in this category
            </p>
          </div>
          
          <div className="flex items-center text-primary-600 font-medium text-sm group-hover:text-primary-700">
            <span className="mr-2">Browse Products</span>
            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
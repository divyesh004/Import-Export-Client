import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const CategoryCard = ({ category, isSubCategory = false }) => {
  // State to track image loading status
  const [imageLoaded, setImageLoaded] = useState(false);
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
      else if (categoryName.includes('ayurveda') || categoryName.includes('ayurvedic')) {
        setFallbackImage('/images/industries/ayurveda.svg');
      } else if (categoryName.includes('herbal powder') || categoryName.includes('churna') || categoryName.includes('powder')) {
        setFallbackImage('/images/industries/ayurveda-powder.svg');
      } else if (categoryName.includes('herbal oil') || categoryName.includes('ayurvedic oil') || categoryName.includes('massage oil') || categoryName.includes('tel')) {
        setFallbackImage('/images/industries/ayurveda-oil.svg');
      } else if (categoryName.includes('herbal cream') || categoryName.includes('ayurvedic cream') || categoryName.includes('balm')) {
        setFallbackImage('/images/industries/ayurveda-cream.svg');
      } else if (categoryName.includes('herbal juice') || categoryName.includes('ayurvedic juice') || categoryName.includes('ras')) {
        setFallbackImage('/images/industries/ayurveda-juice.svg');
      } else if (categoryName.includes('herbal tablet') || categoryName.includes('ayurvedic tablet') || categoryName.includes('vati') || categoryName.includes('goli')) {
        setFallbackImage('/images/industries/ayurveda-tablet.svg');
      } else if (categoryName.includes('herbal capsule') || categoryName.includes('ayurvedic capsule')) {
        setFallbackImage('/images/industries/ayurveda-capsule.svg');
      } else if (categoryName.includes('herbal') || categoryName.includes('natural')) {
        setFallbackImage('/images/industries/ayurveda.svg');
      } else if (categoryName.includes('food') || categoryName.includes('grocery') || categoryName.includes('beverage') || categoryName.includes('restaurant')) {
        setFallbackImage('/images/industries/food.svg');
      } else if (categoryName.includes('furniture') || categoryName.includes('chair') || categoryName.includes('table') || categoryName.includes('sofa')) {
        setFallbackImage('/images/industries/furniture.svg');
      } else if (categoryName.includes('sports') || categoryName.includes('fitness') || categoryName.includes('gym') || categoryName.includes('athletic')) {
        setFallbackImage('/images/industries/sports.svg');
      } else if (categoryName.includes('automotive') || categoryName.includes('car') || categoryName.includes('vehicle') || categoryName.includes('auto')) {
        setFallbackImage('/images/industries/automotive.svg');
      } else if (categoryName.includes('beauty') || categoryName.includes('health') || categoryName.includes('personal') || categoryName.includes('cosmetic')) {
        setFallbackImage('/images/industries/beauty-health.svg');
      } else if (categoryName.includes('home') || categoryName.includes('garden') || categoryName.includes('decor') || categoryName.includes('interior')) {
        setFallbackImage('/images/industries/home-garden.svg');
      } else if (categoryName.includes('toys') || categoryName.includes('games') || categoryName.includes('children') || categoryName.includes('kids')) {
        setFallbackImage('/images/industries/toys-games.svg');
      } else if (categoryName.includes('books') || categoryName.includes('stationery') || categoryName.includes('education') || categoryName.includes('learning')) {
        setFallbackImage('/images/industries/books-education.svg');
      } else if (categoryName.includes('jewelry') || categoryName.includes('accessories') || categoryName.includes('watches') || categoryName.includes('gems')) {
        setFallbackImage('/images/industries/jewelry-accessories.svg');
      } else if (categoryName.includes('agriculture') || categoryName.includes('farming') || categoryName.includes('garden') || categoryName.includes('plants')) {
        setFallbackImage('/images/industries/agriculture.svg');
      } else if (categoryName.includes('industrial') || categoryName.includes('machinery') || categoryName.includes('equipment') || categoryName.includes('tools')) {
        setFallbackImage('/images/industries/industrial.svg');
      } else if (categoryName.includes('pet') || categoryName.includes('animal') || categoryName.includes('veterinary')) {
        setFallbackImage('/images/industries/pet-supplies.svg');
      } else if (categoryName.includes('art') || categoryName.includes('craft') || categoryName.includes('hobby') || categoryName.includes('creative')) {
        setFallbackImage('/images/industries/art-craft.svg');
      } else if (categoryName.includes('music') || categoryName.includes('instrument') || categoryName.includes('audio')) {
        setFallbackImage('/images/industries/music.svg');
      } else if (categoryName.includes('travel') || categoryName.includes('luggage') || categoryName.includes('tourism') || categoryName.includes('vacation')) {
        setFallbackImage('/images/industries/travel.svg');
      } else if (categoryName.includes('baby') || categoryName.includes('infant') || categoryName.includes('maternity')) {
        setFallbackImage('/images/industries/baby-care.svg');
      } else if (categoryName.includes('office') || categoryName.includes('business') || categoryName.includes('corporate')) {
        setFallbackImage('/images/industries/office-supplies.svg');
      } else if (categoryName.includes('medical') || categoryName.includes('healthcare') || categoryName.includes('pharmacy') || categoryName.includes('hospital')) {
        setFallbackImage('/images/industries/medical.svg');
      } else if (categoryName.includes('construction') || categoryName.includes('building') || categoryName.includes('hardware')) {
        setFallbackImage('/images/industries/construction.svg');
      } else if (categoryName.includes('packaging') || categoryName.includes('container') || categoryName.includes('box')) {
        setFallbackImage('/images/industries/packaging.svg');
      } else if (categoryName.includes('chemical') || categoryName.includes('laboratory') || categoryName.includes('science')) {
        setFallbackImage('/images/industries/chemical.svg');
      } else if (categoryName.includes('energy') || categoryName.includes('power') || categoryName.includes('electricity') || categoryName.includes('solar')) {
        setFallbackImage('/images/industries/energy.svg');
      } else if (categoryName.includes('safety') || categoryName.includes('security') || categoryName.includes('protection')) {
        setFallbackImage('/images/industries/safety.svg');
      } else {
        // Default fallback
        setFallbackImage('/images/category-electronics-new.svg');
      }
    }
  }, [category]);
  
  // Determine the link path based on whether it's a subcategory
  const linkPath = isSubCategory
    ? `/products?category=${encodeURIComponent(category.name)}`
    : `/products?industry=${encodeURIComponent(category.name)}`;
  
  return (
    <div className="h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link to={linkPath} className="block h-full">
        <div className="card group bg-white rounded-xl overflow-hidden shadow-md h-full flex flex-col border border-gray-100">
          {/* Image container with loading state */}
          <div className="relative overflow-hidden h-48 bg-white flex items-center justify-center">
            {/* Loading placeholder - improved animation */}
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                <div className="animate-pulse rounded-md bg-gray-200 w-3/4 h-3/4 flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
              </div>
            )}
            
            {/* Actual image with hover effect */}
            <div className="relative z-10 w-4/5 h-4/5 flex items-center justify-center">
              <img 
                src={category.image || fallbackImage} 
                alt={category.name} 
                className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 ${!imageLoaded ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  e.target.onerror = null;
                  setImageLoaded(true);
                  e.target.src = fallbackImage;
                }}
                loading="lazy"
                style={{ maxWidth: '100%', maxHeight: '100%' }}
              />
            </div>
            
            {/* Hover overlay effect - improved with better positioning and animation */}
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
              <div className="bg-white text-primary-600 p-3 rounded-full hover:bg-primary-600 hover:text-white transition-all duration-300 transform scale-90 group-hover:scale-100 shadow-lg hover:shadow-xl">
                <FaArrowRight size={20} className="transform group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </div>
          </div>
          
          {/* Content section - improved styling */}
          <div className="p-4 flex-grow flex flex-col justify-between">
            <div>
              <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors text-center text-lg truncate">{category.name}</h3>
              <p className="text-sm text-gray-500 mb-2 text-center">{category.count || 0} products</p>
            </div>
            <div className="flex justify-center mt-2">
              <span className="inline-flex items-center text-primary-600 text-sm font-medium hover:underline transition-all duration-300">
                Browse Products <FaArrowRight className="ml-1 text-xs group-hover:ml-2 transition-all duration-300" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default CategoryCard;
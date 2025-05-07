import React from 'react';

// Generic skeleton loader component with different variants
const SkeletonLoader = ({ variant = 'rectangle', count = 1, className = '', height, width }) => {
  // Base skeleton pulse animation class
  const baseClass = 'animate-pulse bg-gray-200 rounded-md';
  
  // Generate skeleton items based on count
  const renderSkeletons = () => {
    const items = [];
    
    for (let i = 0; i < count; i++) {
      let skeletonClass = '';
      
      // Apply different styles based on variant
      switch (variant) {
        case 'circle':
          skeletonClass = `${baseClass} rounded-full`;
          break;
        case 'text':
          skeletonClass = `${baseClass} h-4`;
          break;
        case 'title':
          skeletonClass = `${baseClass} h-8 w-3/4`;
          break;
        case 'button':
          skeletonClass = `${baseClass} h-10 rounded-md`;
          break;
        case 'card':
          skeletonClass = `${baseClass} h-64 rounded-lg`;
          break;
        case 'image':
          skeletonClass = `${baseClass} rounded-lg`;
          break;
        case 'product-card':
          return (
            <div key={i} className="w-full h-full">
              <div className={`${baseClass} rounded-lg h-40 mb-3`}></div>
              <div className={`${baseClass} h-6 w-3/4 mb-2`}></div>
              <div className={`${baseClass} h-4 w-1/2 mb-2`}></div>
              <div className={`${baseClass} h-6 w-1/4 mb-2`}></div>
              <div className="flex justify-between items-center">
                <div className={`${baseClass} h-8 w-1/3 rounded-md`}></div>
                <div className={`${baseClass} h-8 w-8 rounded-full`}></div>
              </div>
            </div>
          );
        case 'category-card':
          return (
            <div key={i} className="w-full h-full">
              <div className={`${baseClass} rounded-lg h-32 mb-3`}></div>
              <div className={`${baseClass} h-5 w-2/3 mb-2`}></div>
              <div className={`${baseClass} h-4 w-1/3`}></div>
            </div>
          );
        case 'special-offer':
          return (
            <div key={i} className="w-full h-full flex flex-col md:flex-row bg-white rounded-lg overflow-hidden shadow-md">
              <div className={`${baseClass} md:w-1/2 h-48 md:h-full`}></div>
              <div className="md:w-1/2 p-6 flex flex-col justify-center space-y-4">
                <div className={`${baseClass} h-6 w-3/4`}></div>
                <div className={`${baseClass} h-4 w-full`}></div>
                <div className={`${baseClass} h-4 w-full`}></div>
                <div className={`${baseClass} h-10 w-1/2 rounded-md`}></div>
              </div>
            </div>
          );
        case 'hero':
          return (
            <div key={i} className="w-full flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 space-y-4">
                <div className={`${baseClass} h-10 w-3/4 mb-2`}></div>
                <div className={`${baseClass} h-10 w-full mb-2`}></div>
                <div className={`${baseClass} h-5 w-full mb-6`}></div>
                <div className="flex space-x-4">
                  <div className={`${baseClass} h-10 w-32 rounded-md`}></div>
                  <div className={`${baseClass} h-10 w-32 rounded-md`}></div>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className={`${baseClass} h-64 md:h-80 w-full rounded-lg`}></div>
              </div>
            </div>
          );
        default:
          skeletonClass = baseClass;
      }
      
      // Apply custom height and width if provided
      const style = {};
      if (height) style.height = height;
      if (width) style.width = width;
      
      items.push(
        <div 
          key={i} 
          className={`${skeletonClass} ${className}`}
          style={style}
        />
      );
    }
    
    return items;
  };
  
  return (
    <>{renderSkeletons()}</>
  );
};

export default SkeletonLoader;
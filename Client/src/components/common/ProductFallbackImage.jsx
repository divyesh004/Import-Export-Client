import React from 'react';
import { FaBoxOpen } from 'react-icons/fa';

const ProductFallbackImage = ({ className = '' }) => {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded ${className}`}>
      <FaBoxOpen className="text-gray-400 text-4xl mb-2" />
    </div>
  );
};

export default ProductFallbackImage;
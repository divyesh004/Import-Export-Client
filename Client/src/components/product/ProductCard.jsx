import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';

const ProductCard = ({ product }) => (
  <Link to={`/products/${product.id}`} className="block">
    <div className="card group">
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          {/* View product overlay */}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{product.name}</h3>
          <span className="text-accent-600 font-semibold">${product.price}</span>
        </div>
        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
        <div className="flex items-center">
          <div className="flex text-accent-500">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={i < Math.floor(product.rating) ? 'text-accent-500' : 'text-gray-300'}
                size={14}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">{product.reviews} reviews</span>
        </div>
      </div>
    </div>
  </Link>
);

export default ProductCard;
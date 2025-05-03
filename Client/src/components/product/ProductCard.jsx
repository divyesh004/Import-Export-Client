import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaEye, FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product }) => (
  <div className="h-full transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
    <Link to={`/products/${product.id}`} className="block h-full">
      <div className="card group bg-white rounded-xl overflow-hidden shadow-md h-full flex flex-col border border-gray-100">
        <div className="relative overflow-hidden">
          {product.discount > 0 && (
            <div className="absolute top-0 left-0 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-br-lg z-10">
              {product.discount}% OFF
            </div>
          )}
          <div className="h-52 overflow-hidden bg-white flex items-center justify-center">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-4/5 h-4/5 object-contain transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/category-electronics-new.svg';
              }}
              loading="lazy"
            />
          </div>
          <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="flex space-x-2">
              <button className="bg-white text-primary-600 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-colors duration-300">
                <FaEye size={18} />
              </button>
              <button className="bg-white text-primary-600 p-2 rounded-full hover:bg-primary-600 hover:text-white transition-colors duration-300">
                <FaShoppingCart size={18} />
              </button>
            </div>
          </div>
        </div>
        <div className="p-4 flex-grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-1">
              <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">{product.name}</h3>
              <div className="flex flex-col items-end">
                {product.discount > 0 ? (
                  <>
                    <span className="text-accent-600 font-semibold">${(product.price * (1 - product.discount / 100)).toFixed(2)}</span>
                    <span className="text-gray-400 text-xs line-through">${product.price}</span>
                  </>
                ) : (
                  <span className="text-accent-600 font-semibold">${product.price}</span>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-2 bg-gray-100 inline-block px-2 py-0.5 rounded-full text-xs">{product.category}</p>
          </div>
          <div className="flex items-center mt-2">
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
  </div>
);

export default ProductCard;
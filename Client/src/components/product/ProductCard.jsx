import { Link } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt, FaShoppingCart, FaHeart, FaShieldAlt } from 'react-icons/fa';
import { useState } from 'react';

const ProductCard = ({ product, addToCart, addToWishlist }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format price with currency symbol
  const formatPrice = (price) => {
    return `₹${price.toLocaleString()}`;
  };
  
  // Calculate discounted price
  const calculateDiscountedPrice = (price, discount) => {
    if (!discount) return price;
    return price - (price * discount / 100);
  };
  
  // Render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} className="text-accent-500" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-accent-500" />);
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} className="text-accent-500" />);
    }
    
    return stars;
  };
  
  // Handle image error
  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/images/category-electronics-new.svg'; // Fallback image
  };
  
  return (
    <div 
      className=" rounded-xl shadow-md overflow-hidden transition-all duration-300 h-full card-transition"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`} className="block relative h-full">
        <div className="relative overflow-hidden h-48 bg-gray-50 flex items-center justify-center">
          <img 
            src={product.image} 
            alt={product.name}
            className={`w-full h-full object-contain transition-transform duration-500 ${isHovered ? 'scale-105' : 'scale-100'}`}
            onError={handleImageError}
            loading="lazy"
          />
          {product.discount > 0 && (
            <div className="absolute top-2 right-2 bg-accent-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              {product.discount}% OFF
            </div>
          )}
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center">
            <FaShieldAlt className="mr-1" size={12} />
            <span>Verified</span>
          </div>
        </div>
        
        <div className="p-5">
          <div className="text-xs text-gray-500 mb-1 uppercase">{product.category}</div>
          <h3 className="text-gray-800 font-semibold text-lg mb-2 line-clamp-2 h-14">{product.name}</h3>
          
          <div className="flex items-center mb-3">
            <div className="flex mr-2">
              {renderStarRating(product.rating)}
            </div>
            <span className="text-gray-600 text-sm">
              ({product.reviews || 0})
            </span>
          </div>
          
          <div className="flex items-center justify-between mt-auto">
            <div>
              {product.discount > 0 ? (
                <div className="flex flex-col">
                  <span className="text-gray-500 line-through text-sm">
                    {formatPrice(product.price)}
                  </span>
                  <span className="text-primary-600 font-bold">
                    {formatPrice(calculateDiscountedPrice(product.price, product.discount))}
                  </span>
                </div>
              ) : (
                <span className="text-primary-600 font-bold">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              {addToWishlist && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    addToWishlist(product);
                  }}
                  className="p-2 text-gray-500 hover:text-accent-500 transition-colors bg-gray-100 rounded-full hover:bg-accent-100"
                  aria-label="Add to wishlist"
                >
                  <FaHeart />
                </button>
              )}
              
              {addToCart && (
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product);
                  }}
                  className="p-2 text-gray-500 hover:text-primary-600 transition-colors bg-gray-100 rounded-full hover:bg-primary-100"
                  aria-label="Add to cart"
                >
                  <FaShoppingCart />
                </button>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
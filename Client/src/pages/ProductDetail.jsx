import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaStar, FaShoppingCart, FaHeart, FaShare, FaChevronLeft, FaChevronRight, FaFileAlt } from 'react-icons/fa';
import Skeleton from '../components/common/Skeleton';
import Loading from '../components/common/Loading';
import RTQForm from '../components/common/RTQForm';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/env';



const ProductDetail = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rtqModalOpen, setRtqModalOpen] = useState(false);
  const { showNotification } = useAuth();
  
  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL
  });
  
  // Add request interceptor to include token in headers
  api.interceptors.request.use(
    (config) => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  
  // Fetch product details from backend
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await api.get(`/products/${id}`);
        
        if (response.data) {
          // Format the product data to match our component's expectations
          const productData = response.data;
          const formattedProduct = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            discount: productData.discount || 0,
            images: productData.product_images ? 
              productData.product_images.map(img => img.image_url) : 
              ['/images/category-electronics-new.svg'], // Fallback image if none provided
            category: productData.category || 'Uncategorized',
            brand: productData.brand || 'Unknown',
            rating: productData.rating || 4.0,
            reviews: productData.reviews || [],
            description: productData.description,
            features: productData.features ? JSON.parse(productData.features) : [],
            specifications: productData.specifications ? JSON.parse(productData.specifications) : {},
            stock: productData.stock || 10,
            shipping: productData.shipping || 'Standard Shipping',
            returnPolicy: productData.return_policy || '30-day return policy'
          };
          
          setProduct(formattedProduct);
        } else {
          // Show error if no product returned
          setError('Product not found');
          showNotification('Product not found', 'error');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.error || 'Failed to fetch product details';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
        
        // Show error message
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProductDetails();
  }, [id, showNotification]);
  
  // Calculate discounted price
  const discountedPrice = product && product.discount 
    ? (product.price - (product.price * product.discount / 100)).toFixed(2) 
    : product ? product.price : 0;

  // Handle quantity change
  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity > 0 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Handle image navigation
  const nextImage = () => {
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="container">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center mb-6">
            <Skeleton type="text" />
          </div>
          
          {/* Product Details Skeleton */}
          <div className="flex flex-col lg:flex-row gap-8 mb-12">
            {/* Product Images Skeleton */}
            <div className="lg:w-1/2">
              <div className="bg-gradient-skeleton rounded-lg h-96 skeleton-animation mb-4"></div>
              
              {/* Thumbnail Images Skeleton */}
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="w-20 h-20 bg-gradient-skeleton rounded-md skeleton-animation"></div>
                ))}
              </div>
            </div>
            
            {/* Product Info Skeleton */}
            <div className="lg:w-1/2">
              <Skeleton type="title" />
              
              {/* Rating Skeleton */}
              <div className="flex items-center mb-4 mt-2">
                <Skeleton type="text" />
              </div>
              
              {/* Price Skeleton */}
              <div className="mb-6">
                <Skeleton type="title" />
              </div>
              
              {/* Short Description Skeleton */}
              <div className="mb-6">
                <Skeleton type="text" count={2} />
              </div>
              
              {/* Details Skeleton */}
              <div className="space-y-6 mb-6">
                <div className="flex items-center">
                  <Skeleton type="text" />
                </div>
                <div className="flex items-center">
                  <Skeleton type="text" />
                </div>
                <div className="flex items-center">
                  <Skeleton type="text" />
                </div>
              </div>
              
              {/* Quantity Selector Skeleton */}
              <div className="flex items-center mb-6">
                <Skeleton type="text" />
              </div>
              
              {/* Action Buttons Skeleton */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Skeleton type="button" />
                <Skeleton type="button" />
                <Skeleton type="button" />
              </div>
            </div>
          </div>
          
          {/* Product Tabs Skeleton */}
          <div className="mb-12">
            <div className="border-b border-gray-200">
              <div className="flex">
                <Skeleton type="text" />
                <Skeleton type="text" />
                <Skeleton type="text" />
              </div>
            </div>
            
            <div className="py-6">
              <Skeleton type="text" count={5} />
            </div>
          </div>
          
          {/* Related Products Skeleton */}
          <div>
            <Skeleton type="title" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="card">
                  <div className="h-48 bg-gradient-skeleton rounded-t skeleton-animation"></div>
                  <div className="p-4">
                    <Skeleton type="title" />
                    <Skeleton type="text" />
                    <div className="flex justify-between items-center mt-2">
                      <Skeleton type="text" />
                      <Skeleton type="button" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error message if product not found or error occurred
  if (error) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <Link to="/products" className="btn bg-primary-600 text-white hover:bg-primary-700 inline-block">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error if product is null
  if (!product) {
    return (
      <div className="py-8">
        <div className="container">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-600 mb-4">Product Not Found</h2>
            <p className="text-gray-700 mb-6">The product you are looking for does not exist or has been removed.</p>
            <Link to="/products" className="btn bg-primary-600 text-white hover:bg-primary-700 inline-block">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-8">
      <div className="container">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary-600">Products</Link>
          <span className="mx-2">/</span>
          <Link to={`/products?category=${product.category}`} className="hover:text-primary-600">{product.category}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{product.name}</span>
        </div>

        {/* Product Details */}
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Product Images */}
          <div className="lg:w-1/2">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name} 
                className="w-full h-96 object-contain"
              />
              
              {/* Image Navigation Arrows */}
              <button 
                onClick={prevImage}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              >
                <FaChevronLeft />
              </button>
              <button 
                onClick={nextImage}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              >
                <FaChevronRight />
              </button>
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {product.images.map((image, index) => (
                <button 
                  key={index} 
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-md overflow-hidden border-2 ${selectedImage === index ? 'border-primary-500' : 'border-transparent'}`}
                >
                  <img 
                    src={image} 
                    alt={`${product.name} thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="lg:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex text-accent-500">
                {[...Array(5)].map((_, i) => (
                  <FaStar 
                    key={i} 
                    className={i < Math.floor(product.rating) ? 'text-accent-500' : 'text-gray-300'}
                    size={18}
                  />
                ))}
              </div>
              <span className="text-gray-600 ml-2">{product.rating} ({product.reviews.length} reviews)</span>
            </div>
            
            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            </div>
            
            {/* Short Description */}
            <p className="text-gray-600 mb-6">{product.description.split('.')[0] + '.'}</p>
            
            {/* Brand */}
            <div className="flex items-center mb-6">
              <span className="text-gray-700 font-medium w-24">Brand:</span>
              <span className="text-gray-600">{product.brand}</span>
            </div>
            
            {/* Availability */}
            <div className="flex items-center mb-6">
              <span className="text-gray-700 font-medium w-24">Availability:</span>
              {product.stock > 0 ? (
                <span className="text-green-600">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>
            
            {/* Shipping */}
            <div className="flex items-center mb-6">
              <span className="text-gray-700 font-medium w-24">Shipping:</span>
              <span className="text-gray-600">{product.shipping}</span>
            </div>
            
            {/* Quantity Selector */}
            <div className="flex items-center mb-6">
              <span className="text-gray-700 font-medium w-24">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-4 py-1 border-x border-gray-300">{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <button 
                onClick={() => setRtqModalOpen(true)}
                className="btn bg-primary-600 text-white hover:bg-primary-700 flex items-center justify-center gap-2 py-3"
              >
                <FaFileAlt />
                Request a Quote
              </button>
              <button className="btn border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-3">
                <FaHeart />
                Add to Wishlist
              </button>
              <button className="btn border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 py-3">
                <FaShare />
                Share
              </button>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mb-12">
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              <button 
                onClick={() => setActiveTab('description')}
                className={`px-6 py-3 font-medium ${activeTab === 'description' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Description
              </button>
              <button 
                onClick={() => setActiveTab('specifications')}
                className={`px-6 py-3 font-medium ${activeTab === 'specifications' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Specifications
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-3 font-medium ${activeTab === 'reviews' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Reviews ({product.reviews.length})
              </button>
            </div>
          </div>
          
          <div className="py-6">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-600 mb-6">{product.description}</p>
                <h3 className="text-lg font-semibold mb-4">Key Features</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-600">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value], index) => (
                  <div key={index} className="flex border-b border-gray-200 py-3">
                    <span className="font-medium text-gray-700 w-1/3">{key}</span>
                    <span className="text-gray-600 w-2/3">{value}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                  <div className="flex items-center mb-6">
                    <div className="flex text-accent-500 mr-2">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < Math.floor(product.rating) ? 'text-accent-500' : 'text-gray-300'}
                          size={24}
                        />
                      ))}
                    </div>
                    <span className="text-xl font-semibold">{product.rating} out of 5</span>
                  </div>
                  
                  {/* Review List */}
                  <div className="space-y-6">
                    {product.reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-6">
                        <div className="flex justify-between mb-2">
                          <h4 className="font-medium">{review.user}</h4>
                          <span className="text-gray-500 text-sm">{review.date}</span>
                        </div>
                        <div className="flex text-accent-500 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <FaStar 
                              key={i} 
                              className={i < review.rating ? 'text-accent-500' : 'text-gray-300'}
                              size={14}
                            />
                          ))}
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Write Review Form */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-gray-700 mb-2">Your Rating</label>
                      <div className="flex text-gray-300">
                        {[...Array(5)].map((_, i) => (
                          <button 
                            key={i} 
                            type="button"
                            className="text-2xl focus:outline-none"
                          >
                            <FaStar />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 mb-2">Your Review</label>
                      <textarea 
                        className="input min-h-[120px]" 
                        placeholder="Write your review here..."
                      ></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Submit Review
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Related products will be loaded dynamically from backend */}
            <div className="text-center col-span-full py-4">
              <p className="text-gray-500">Related products will appear here</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* RTQ Form Modal */}
      <RTQForm 
        isOpen={rtqModalOpen} 
        onClose={() => setRtqModalOpen(false)} 
        product={product} 
      />
    </div>
  );
};

export default ProductDetail;
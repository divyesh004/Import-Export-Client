import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link, useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { FaUser, FaBox, FaEnvelope, FaPhone, FaCommentAlt, FaLock, FaFileAlt, FaCalculator, FaQuestionCircle } from 'react-icons/fa';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env';
import '../../styles/scrollbar.css'; // Import custom scrollbar styles

const RTQForm = ({ isOpen, onClose, product }) => {
  const { currentUser, showNotification, toggleLoginPopup } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(product?.price || 0);
  const [hasInquired, setHasInquired] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL
  });
  
  // Add request interceptor to include token in headers
  api.interceptors.request.use(
    (config) => {
      // Try to get token from currentUser first, then fallback to localStorage
      const token = currentUser?.token || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Fetch user profile data and check if user has already inquired when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser || !isOpen) return;

      // Add check for product before proceeding
      if (!product) {
        console.error('Product is undefined in RTQForm');
        showNotification('Unable to load product information. Please try again later.', 'error');
        setLoading(false);
        onClose(); // Close the modal if product is undefined
        return;
      }

      try {
        setLoading(true);
        const response = await api.get('/auth/profile');
        
        if (response.data && response.data.profile) {
          setUserData({...response.data.profile});
        } else {
          setUserData({...response.data});
        }

        // Only check for inquiries if product exists and has an id
        if (product.id) {
          try {
            const inquiriesResponse = await api.get('/qa/questions');
            const userInquiries = inquiriesResponse.data;
            const hasAlreadyInquired = userInquiries.some(inquiry => 
              inquiry.product_id === product.id
            );
            
            setHasInquired(hasAlreadyInquired);
          } catch (inquiryErr) {
            console.error('Failed to fetch inquiry data:', inquiryErr);
          }
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        showNotification('Unable to load your profile information. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, isOpen, product, showNotification]);
  
  // Update calculated price when product changes
  useEffect(() => {
    if (product) {
      setCalculatedPrice(product.price);
    }
  }, [product]);
  
  // Handle window resize to update mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Form validation schema
  const rtqSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long (maximum 50 characters)')
      .required('Name is required'),
    email: Yup.string()
      .email('Please enter a valid email address')
      .required('Email is required'),
    phone: Yup.string()
      .matches(/^[0-9+\-\s()]+$/, 'Please enter a valid phone number')
      .min(10, 'Phone number is too short (minimum 10 characters)')
      .required('Phone number is required'),
    quantity: Yup.string()
      .required('Quantity is required')
      .test('is-not-zero', 'Quantity cannot be zero', value => value !== '0')
      .test('is-positive-integer', 'Quantity must be a positive whole number', value => {
        const num = parseInt(value);
        return !isNaN(num) && num > 0 && Number.isInteger(num);
      }),
    message: Yup.string()
      .min(10, 'Please provide more details about your requirements')
      .max(500, 'Message is too long (maximum 500 characters)')
      .required('Please provide additional details for your quote request')
  });

  // Calculate price based on quantity
  const calculatePrice = (quantity) => {
    if (!product) return 0;
    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity) || numQuantity <= 0) return 0;
    const price = product.price * numQuantity;
    setCalculatedPrice(price);
    return price.toFixed(2);
  };

  // Handle form submission
  const handleSubmit = async (values, { resetForm, setSubmitting: formikSetSubmitting }) => {
    // If user is not logged in, show login popup and return
    if (!currentUser) {
      onClose();
      toggleLoginPopup(true);
      return;
    }

    // If user has already made an inquiry, show notification and return
    if (hasInquired) {
      showNotification('You have already submitted an inquiry for this product. Please wait for a response.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      formikSetSubmitting(true);
      
      // Prepare data for backend submission
      // Removed email and phone number as per requirement
      const quoteRequestData = {
        product_id: product?.id, // Added optional chaining to safely access id
        question: `Quote Request for ${product?.name || 'Product'} - Quantity: ${values.quantity}\n\nCustomer Details:\nName: ${values.name}\n\nMessage: ${values.message}\n\nCalculated Price: $${calculatePrice(values.quantity)}`
      };
      
      // Send data to the backend
      const response = await api.post('qa/questions', quoteRequestData);
      
      console.log('RTQ Form Submitted:', response.data);
      
      // Close the modal and show success notification
      resetForm();
      onClose();
      showNotification('Your price request has been successfully submitted! Our team will review it and contact you soon.', 'success');
      
    } catch (error) {
      console.error('Error submitting RTQ form:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to submit price request. Please try again.';
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please login again to submit your request.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.error || 'Please check your form details and try again.';
        } else if (error.response.status === 429) {
          errorMessage = 'Too many requests. Please wait a bit before trying again.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Our server is currently experiencing problems. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your Internet connection and try again.';
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
      formikSetSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Request price"
      size="lg"
    >
      {!currentUser ? (
        <div className="text-center py-4 sm:py-6 md:py-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <FaLock className="text-primary-600 text-3xl sm:text-4xl md:text-5xl" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Login Required</h3>
          <p className="text-gray-600 mb-4 sm:mb-5 md:mb-6 px-3 sm:px-2 md:px-0 text-sm sm:text-base">Please login to submit your price request</p>
          <button
            onClick={() => {
              onClose();
              toggleLoginPopup(true);
            }}
            className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
            aria-label="log in now"
          >
           log in now
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center py-4 sm:py-6 md:py-8">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : hasInquired ? (
        <div className="text-center py-4 sm:py-6 md:py-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <FaFileAlt className="text-primary-600 text-3xl sm:text-4xl md:text-5xl" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">Inquiry has already been submitted</h3>
          <p className="text-gray-600 mb-4 sm:mb-5 md:mb-6 px-3 sm:px-2 md:px-0 text-sm sm:text-base">You have already submitted an inquiry for this product. Please wait for a response.</p>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-5 md:px-6 py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
            aria-label="Close"
          >
            Close
          </button>
        </div>
      ) : (
        <Formik
          initialValues={{
            name: userData?.name || '',
            email: userData?.email || '',
            phone: userData?.phone || '',
            quantity: 1,
            message: `I'm interested in ordering ${product?.name} and would like to request a quote.`
          }}
          validationSchema={rtqSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="space-y-5 custom-scrollbar max-h-[70vh] overflow-y-auto px-1 py-2">
              <div className="bg-gray-50 p-3 sm:p-4 md:p-5 rounded-lg mb-4 sm:mb-5 md:mb-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base md:text-lg flex items-center">
                  <FaCalculator className="mr-2 text-primary-600" />
                  Product Information
                </h3>
                <div className="flex flex-col md:flex-row gap-3 sm:gap-4 items-start">
                  {/* Product Image */}
                  <div className="w-full md:w-1/4 bg-white rounded-lg overflow-hidden border border-gray-200">
                    {product?.image ? (
                      <img 
                        src={product.image} 
                        alt={product?.name} 
                        className="w-full h-32 object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-24 sm:h-28 md:h-32 bg-gray-100 flex items-center justify-center">
                        <FaBox className="text-gray-400 text-2xl sm:text-3xl md:text-4xl" />
                      </div>
                    )}
                  </div>
                  
                  {/* Product Details */}
                  <div className="w-full md:w-3/4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                      <div>
                        <h4 className="text-gray-800 font-semibold text-base sm:text-lg mb-1">{product?.name}</h4>
                        <p className="text-gray-600 text-sm mb-2">
                          <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-xs font-medium">
                            {product?.category}
                          </span>
                        </p>
                        <p className="text-gray-700 text-sm">{product?.description?.substring(0, 100)}{product?.description?.length > 100 ? '...' : ''}</p>
                      </div>
                      <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center">
                        <p className="text-primary-600 font-bold text-lg sm:text-xl">
                          ${calculatePrice(values.quantity)}
                        </p>
                        <p className="text-gray-500 text-xs">Base price: ${product?.price?.toFixed(2)} per unit</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <Link 
                        to={`/products/${product?.id}`} 
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                        onClick={(e) => {
                          e.preventDefault();
                          onClose();
                          navigate(`/products/${product?.id}`);
                        }}
                        aria-label="View Product Details"
                      >
                        <FaQuestionCircle className="mr-1" />
                        View Product Details & Chat
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2 text-sm">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400 text-base" />
                    </div>
                    <Field
                      type="text"
                      name="name"
                      id="name"
                      className="pl-11 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm shadow-sm"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      aria-required="true"
                    />
                  </div>
                  <ErrorMessage name="name" component="div" className="mt-1.5 text-red-600 text-sm font-medium" role="alert" />
                </div>
                
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2 text-sm">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400 text-base" />
                    </div>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      className="pl-11 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm shadow-sm"
                      placeholder="Enter your email address"
                      autoComplete="email"
                      aria-required="true"
                    />
                  </div>
                  <ErrorMessage name="email" component="div" className="mt-1.5 text-red-600 text-sm font-medium" role="alert" />
                </div>
                
                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2 text-sm">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FaPhone className="text-gray-400 text-base" />
                    </div>
                    <Field
                      type="tel"
                      name="phone"
                      id="phone"
                      className="pl-11 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm shadow-sm"
                      placeholder="Enter your phone number"
                      autoComplete="tel"
                      aria-required="true"
                    />
                  </div>
                  <ErrorMessage name="phone" component="div" className="mt-1.5 text-red-600 text-sm font-medium" role="alert" />
                </div>
                
                {/* Quantity Field */}
                <div>
                  <label htmlFor="quantity" className="block text-gray-700 font-medium mb-2 text-sm">Quantity Needed <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <FaBox className="text-gray-400 text-base" />
                    </div>
                    <Field
                      type={isMobile ? "text" : "number"}
                      name="quantity"
                      id="quantity"
                      min="1"
                      className="pl-11 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm shadow-sm"
                      placeholder="Quantity"
                      aria-required="true"
                      onChange={(e) => {
                        const value = e.target.value;
                        setFieldValue('quantity', value);
                        calculatePrice(value);
                      }}
                    />
                  </div>
                  <ErrorMessage name="quantity" component="div" className="mt-1.5 text-red-600 text-sm font-medium" role="alert" />
                  <p className="mt-1 text-gray-500 text-xs">Please enter a positive whole number. Quantity cannot be zero.</p>
                </div>
              </div>
              
              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2 text-sm">Additional Details <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute top-3 left-3.5 flex items-start pointer-events-none">
                    <FaCommentAlt className="text-gray-400 text-base" />
                  </div>
                  <Field
                    as="textarea"
                    name="message"
                    id="message"
                    rows="4"
                    className="pl-11 w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm shadow-sm"
                    placeholder="Provide specific requirements, delivery preferences, or questions about the product"
                    aria-required="true"
                  />
                </div>
                <ErrorMessage name="message" component="div" className="mt-1.5 text-red-600 text-sm font-medium" role="alert" />
                <p className="mt-2 text-gray-500 text-sm">Your detailed requirements help us provide an accurate quote. Include information about delivery timeline, special handling needs, or any other specific requirements.</p>
              </div>
              
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors text-sm shadow-sm"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || submitting}
                  className="w-full sm:w-auto mb-2 sm:mb-0 px-5 py-2.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
                  aria-label="Submit Request"
                >
                  {isSubmitting || submitting ? (
                    <>
                      <span className="animate-spin mr-2 inline-block h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                      Submitting...
                    </>
                  ) : 'Submit Quote Request'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Modal>
  );
};

export default RTQForm
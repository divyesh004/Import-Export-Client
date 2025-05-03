import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaEnvelope, FaPhone, FaCommentAlt, FaBoxOpen, FaTimes, FaPaperPlane, FaIndustry } from 'react-icons/fa';
import Modal from './Modal';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env';

const CustomProductRequestForm = ({ isOpen, onClose }) => {
  const { currentUser, showNotification } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Form validation schema
  const requestSchema = Yup.object().shape({
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
    product_name: Yup.string()
      .min(3, 'Product name must be at least 3 characters')
      .max(100, 'Product name is too long (maximum 100 characters)')
      .required('Product name is required'),
    product_details: Yup.string()
      .min(10, 'Please provide more details about your requirements')
      .max(500, 'Description is too long (maximum 500 characters)')
      .required('Please provide details about the product you need'),
    industry: Yup.string()
      .required('Industry is required')
  });

  // Create axios instance with auth header if user is logged in
  const api = axios.create({
    baseURL: API_BASE_URL
  });
  
  // Add request interceptor to include token in headers if available
  api.interceptors.request.use(
    (config) => {
      const token = currentUser?.token || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Handle form submission
  const handleSubmit = async (values, { resetForm, setSubmitting: formikSetSubmitting }) => {
    try {
      setSubmitting(true);
      formikSetSubmitting(true);
      
      // Prepare data for backend submission
      const requestData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        product_name: values.product_name,
        product_details: values.product_details,
        industry: values.industry
      };
      
      // Send data to the backend
      const response = await api.post('/product-requests', requestData);
      
      console.log('Custom Product Request Form Submitted:', response.data);
      
      // Close the modal and show success notification
      resetForm();
      onClose();
      showNotification('Your custom product request has been successfully submitted! Our team will contact you soon.', 'success');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to submit request. Please try again.';
      
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
      title="Request Custom Product"
      size="lg"
    >
      <div className="p-4 sm:p-6">
        <div className="mb-6 bg-gradient-to-r from-primary-50 to-blue-50 p-5 rounded-lg border-l-4 border-primary-500 shadow-md hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
            <span className="bg-primary-100 p-2 rounded-full mr-3 text-primary-600 shadow-sm"><FaBoxOpen className="text-lg" /></span>
            <span className="bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">Need a specific product?</span>
          </h2>
          <p className="text-gray-600 ml-1 border-l-2 border-primary-200 pl-3">Fill out this form to request a product that's not in our catalog. Our team will get back to you as soon as possible.</p>
        </div>

        <Formik
          initialValues={{
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            phone: currentUser?.phone || '',
            product_name: '',
            product_details: '',
            industry: ''
          }}
          validationSchema={requestSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center group">
                    <span className="bg-primary-50 p-1.5 rounded-md mr-2 text-primary-600 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors duration-200 shadow-sm"><FaUser /></span>
                    <span className="relative after:absolute after:bottom-0 after:left-0 after:bg-primary-500 after:h-0.5 after:w-0 group-hover:after:w-full after:transition-all after:duration-300">Your Name</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                    </div>
                    <Field
                      type="text"
                      name="name"
                      id="name"
                      className={`pl-1 h-10 block w-full rounded-lg ${errors.name && touched.name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary-400'} shadow-md focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-all duration-300 hover:shadow-lg focus:shadow-primary-100/50 bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm border-opacity-80 ${!errors.name && 'hover:border-primary-500 hover:bg-primary-50/30'} transform hover:scale-[1.01] hover:translate-y-[-2px] focus:scale-[1.02] focus:translate-y-[-3px] border-2 focus:border-primary-500 focus:bg-white`}
                      placeholder="John Doe"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.name && touched.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <ErrorMessage name="name" component="p" className="mt-1 text-sm text-red-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center group">
                    <span className="bg-primary-50 p-1.5 rounded-md mr-2 text-primary-600 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors duration-200 shadow-sm"><FaEnvelope /></span>
                    <span className="relative after:absolute after:bottom-0 after:left-0 after:bg-primary-500 after:h-0.5 after:w-0 group-hover:after:w-full after:transition-all after:duration-300">Email Address</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                    </div>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      className={`pl-1 h-10 block w-full rounded-lg ${errors.email && touched.email ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary-400'} shadow-md focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-all duration-300 hover:shadow-lg focus:shadow-primary-100/50 bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm border-opacity-80 ${!errors.email && 'hover:border-primary-500 hover:bg-primary-50/30'} transform hover:scale-[1.01] hover:translate-y-[-2px] focus:scale-[1.02] focus:translate-y-[-3px] border-2 focus:border-primary-500 focus:bg-white`}
                      placeholder="john@example.com"
                    />
                  </div>
                  <AnimatePresence>
                    {errors.email && touched.email && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <ErrorMessage name="email" component="p" className="mt-1 text-sm text-red-600" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Phone Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center group">
                  <span className="bg-primary-50 p-1.5 rounded-md mr-2 text-primary-600 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors duration-200 shadow-sm"><FaPhone /></span>
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:bg-primary-500 after:h-0.5 after:w-0 group-hover:after:w-full after:transition-all after:duration-300">Phone Number</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <Field
                    type="text"
                    name="phone"
                    id="phone"
                    className={`pl-1 h-10 block w-full rounded-lg ${errors.phone && touched.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary-400'} shadow-md focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-all duration-300 hover:shadow-lg focus:shadow-primary-100/50 bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm border-opacity-80 ${!errors.phone && 'hover:border-primary-500 hover:bg-primary-50/30'} transform hover:scale-[1.01] hover:translate-y-[-2px] focus:scale-[1.02] focus:translate-y-[-3px] border-2 focus:border-primary-500 focus:bg-white`}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <AnimatePresence>
                  {errors.phone && touched.phone && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <ErrorMessage name="phone" component="p" className="mt-1 text-sm text-red-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Product Name Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <label htmlFor="product_name" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center group">
                  <span className="bg-primary-50 p-1.5 rounded-md mr-2 text-primary-600 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors duration-200 shadow-sm"><FaBoxOpen /></span>
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:bg-primary-500 after:h-0.5 after:w-0 group-hover:after:w-full after:transition-all after:duration-300">Product Name</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBoxOpen className="text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <Field
                    type="text"
                    name="product_name"
                    id="product_name"
                    className={`pl-1 h-10 block w-full rounded-lg ${errors.product_name && touched.product_name ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary-400'} shadow-md focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-all duration-300 hover:shadow-lg focus:shadow-primary-100/50 bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm border-opacity-80 ${!errors.product_name && 'hover:border-primary-500 hover:bg-primary-50/30'} transform hover:scale-[1.01] hover:translate-y-[-2px] focus:scale-[1.02] focus:translate-y-[-3px] border-2 focus:border-primary-500 focus:bg-white`}
                    placeholder="Describe the product you need"
                  />
                </div>
                <AnimatePresence>
                  {errors.product_name && touched.product_name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <ErrorMessage name="product_name" component="p" className="mt-1 text-sm text-red-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Industry Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.35 }}
              >
                <label htmlFor="industry" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center group">
                  <span className="bg-primary-50 p-1.5 rounded-md mr-2 text-primary-600 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors duration-200 shadow-sm"><FaIndustry /></span>
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:bg-primary-500 after:h-0.5 after:w-0 group-hover:after:w-full after:transition-all after:duration-300">Industry</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIndustry className="text-gray-400 group-hover:text-primary-500 transition-colors duration-200" />
                  </div>
                  <Field
                    as="select"
                    name="industry"
                    id="industry"
                    className={`pl-1 h-10 block w-full rounded-lg ${errors.industry && touched.industry ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary-400'} shadow-md focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-all duration-300 hover:shadow-lg focus:shadow-primary-100/50 bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm border-opacity-80 ${!errors.industry && 'hover:border-primary-500 hover:bg-primary-50/30'} transform hover:scale-[1.01] hover:translate-y-[-2px] focus:scale-[1.02] focus:translate-y-[-3px] border-2 focus:border-primary-500 focus:bg-white`}
                  >
                    <option value="">Select Industry</option>
                    <option value="electronics">Electronics</option>
                    <option value="textiles">Textiles</option>
                    <option value="food">Food & Beverages</option>
                    <option value="automotive">Automotive</option>
                    <option value="pharmaceuticals">Pharmaceuticals</option>
                    <option value="chemicals">Chemicals</option>
                    <option value="machinery">Machinery</option>
                    <option value="furniture">Furniture</option>
                    <option value="other">Other</option>
                  </Field>
                </div>
                <AnimatePresence>
                  {errors.industry && touched.industry && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <ErrorMessage name="industry" component="p" className="mt-1 text-sm text-red-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Description Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.45 }}
                className="bg-gradient-to-br from-gray-50 to-blue-50/30 p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary-200"
              >
                <label htmlFor="product_details" className="block text-sm font-semibold text-gray-800 mb-2 flex items-center group">
                  <span className="bg-primary-50 p-1.5 rounded-md mr-2 text-primary-600 group-hover:bg-primary-100 group-hover:text-primary-700 transition-colors duration-200 shadow-sm"><FaCommentAlt /></span>
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:bg-primary-500 after:h-0.5 after:w-0 group-hover:after:w-full after:transition-all after:duration-300">Product Details</span>
                </label>
                <div className="relative group">
                  <Field
                    as="textarea"
                    name="product_details"
                    id="product_details"
                    rows={4}
                    className={`pl-1 pt-1 block w-full rounded-lg ${errors.product_details && touched.product_details ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-primary-400'} shadow-md focus:border-primary-500 focus:ring-primary-500 sm:text-sm transition-all duration-300 hover:shadow-lg focus:shadow-primary-100/50 bg-gradient-to-r from-white to-blue-50 backdrop-blur-sm border-opacity-80 ${!errors.product_details && 'hover:border-primary-500 hover:bg-primary-50/30'} transform hover:scale-[1.01] hover:translate-y-[-2px] focus:scale-[1.02] focus:translate-y-[-3px] border-2 focus:border-primary-500 focus:bg-white resize-none`}
                    placeholder="Please provide detailed specifications, quantities needed, and any other relevant information about the product you're looking for."
                  />
                </div>
                <AnimatePresence>
                  {errors.product_details && touched.product_details && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <ErrorMessage name="product_details" component="p" className="mt-1 text-sm text-red-600" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <p className="mt-2 text-xs text-gray-500 italic">Your detailed requirements help us understand exactly what you need.</p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-6"
              >
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center items-center rounded-lg border-2 border-gray-300 shadow-sm px-5 py-2.5 bg-gradient-to-r from-white to-gray-50 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm transition-all duration-300 hover:shadow-md transform hover:-translate-y-1 active:translate-y-0 hover:border-gray-400 group"
                >
                  <FaTimes className="mr-2 text-gray-500 group-hover:text-gray-700" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center items-center rounded-lg border-2 border-primary-500 shadow-md px-5 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 text-base font-medium text-white hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 hover:shadow-xl relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary-400 to-primary-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></span>
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="relative z-10">Submitting...</span>
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-2 group-hover:animate-pulse" />
                      <span className="relative z-10">Submit Request</span>
                    </>
                  )}
                </button>
              </motion.div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default CustomProductRequestForm;
import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaPaperPlane, FaQuoteRight } from 'react-icons/fa';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env';

const RTQResponseForm = ({ isOpen, onClose, request, onSuccess }) => {
  const { showNotification } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL
  });
  
  // Add request interceptor to include token in headers
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Parse RTQ data from question string
  const parseRTQData = (questionText) => {
    try {
      const productLine = questionText.split('\n')[0];
      const productName = productLine.replace('Quote Request for ', '').split(' - Quantity:')[0];
      const quantityMatch = productLine.match(/Quantity: (\d+)/);
      const quantity = quantityMatch ? quantityMatch[1] : 'N/A';
      
      const customerSection = questionText.split('Customer Details:')[1].split('\n\nMessage:')[0];
      const nameMatch = customerSection.match(/Name: (.+)/);
      const emailMatch = customerSection.match(/Email: (.+)/);
      const phoneMatch = customerSection.match(/Phone: (.+)/);
      
      const name = nameMatch ? nameMatch[1] : 'N/A';
      const email = emailMatch ? emailMatch[1] : 'N/A';
      const phone = phoneMatch ? phoneMatch[1] : 'N/A';
      
      const messageMatch = questionText.match(/Message: ([\s\S]+)$/);
      const message = messageMatch ? messageMatch[1].trim() : 'N/A';
      
      return {
        productName,
        quantity,
        name,
        email,
        phone,
        message
      };
    } catch (error) {
      console.error('Error parsing RTQ data:', error);
      return {
        productName: 'Error parsing data',
        quantity: 'N/A',
        name: 'N/A',
        email: 'N/A',
        phone: 'N/A',
        message: 'Error parsing message'
      };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Response validation schema
  const responseSchema = Yup.object().shape({
    response: Yup.string().required('Response is required'),
    includeQuote: Yup.boolean(),
    price: Yup.number()
      .when('includeQuote', {
        is: true,
        then: Yup.number()
          .required('Price is required when including a quote')
          .positive('Price must be positive')
      }),
    deliveryTime: Yup.string()
      .when('includeQuote', {
        is: true,
        then: Yup.string().required('Delivery time is required when including a quote')
      })
  });

  // Handle form submission
  const handleSubmit = async (values, { resetForm }) => {
    try {
      setSubmitting(true);
      
      // Format the response based on whether a quote is included
      let formattedResponse = values.response;
      
      if (values.includeQuote) {
        const rtqData = parseRTQData(request.question);
        const quantity = parseInt(rtqData.quantity);
        const unitPrice = parseFloat(values.price);
        const totalPrice = (unitPrice * quantity).toFixed(2);
        
        formattedResponse = `Dear ${rtqData.name},\n\n${values.response}\n\n`;
        formattedResponse += `QUOTE DETAILS:\n`;
        formattedResponse += `Product: ${rtqData.productName}\n`;
        formattedResponse += `Quantity: ${rtqData.quantity}\n`;
        formattedResponse += `Unit Price: $${unitPrice.toFixed(2)}\n`;
        formattedResponse += `Total Price: $${totalPrice}\n`;
        formattedResponse += `Estimated Delivery: ${values.deliveryTime}\n\n`;
        formattedResponse += `If you would like to proceed with this quote, please reply to this message or place an order through our website.\n\n`;
        formattedResponse += `Thank you for your interest in our products!`;
      }
      
      // Send the response to the backend
      await api.post(`/qa/answers/${request.id}`, {
        answer: formattedResponse
      });
      
      // Show success notification and close modal
      showNotification('Response sent successfully!', 'success');
      resetForm();
      onSuccess();
      
    } catch (error) {
      console.error('Error submitting response:', error);
      showNotification(error.response?.data?.error || 'Failed to send response. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Get RTQ data for display
  const rtqData = request ? parseRTQData(request.question) : null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Respond to Quote Request"
      size="lg"
    >
      {!request ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Request Information */}
          <div className="bg-gray-50 p-3 sm:p-4 rounded-md mb-4 sm:mb-6">
            <h3 className="font-medium text-gray-700 mb-2 text-base sm:text-lg">Request Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <p className="text-gray-600 text-xs sm:text-sm">From: <span className="font-medium text-gray-800">{rtqData.name}</span></p>
                <p className="text-gray-600 text-xs sm:text-sm">Email: <span className="font-medium text-gray-800">{rtqData.email}</span></p>
                <p className="text-gray-600 text-xs sm:text-sm">Phone: <span className="font-medium text-gray-800">{rtqData.phone}</span></p>
              </div>
              <div className="space-y-1 sm:space-y-2 mt-2 sm:mt-0">
                <p className="text-gray-600 text-xs sm:text-sm">Product: <span className="font-medium text-gray-800">{rtqData.productName}</span></p>
                <p className="text-gray-600 text-xs sm:text-sm">Quantity: <span className="font-medium text-gray-800">{rtqData.quantity}</span></p>
                <p className="text-gray-600 text-xs sm:text-sm">Date: <span className="font-medium text-gray-800">{formatDate(request.created_at)}</span></p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-gray-600 text-xs sm:text-sm">Message:</p>
              <p className="text-gray-800 mt-1 p-2 bg-white rounded border border-gray-200 whitespace-pre-line text-xs sm:text-sm overflow-auto max-h-32 sm:max-h-48">{rtqData.message}</p>
            </div>
          </div>
          
          {/* Response Form */}
          <Formik
            initialValues={{
              response: `Thank you for your interest in ${rtqData.productName}. We appreciate your quote request.\n\nWe'd be happy to provide you with a customized quote for your order.`,
              includeQuote: false,
              price: '',
              deliveryTime: ''
            }}
            validationSchema={responseSchema}
            onSubmit={handleSubmit}
          >
            {({ values, isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label htmlFor="response" className="block text-gray-700 font-medium mb-2 text-sm sm:text-base">Your Response</label>
                  <Field
                    as="textarea"
                    name="response"
                    id="response"
                    rows="5"
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                    placeholder="Enter your response to the customer"
                  />
                  <ErrorMessage name="response" component="div" className="mt-1 text-red-600 text-xs sm:text-sm" />
                </div>
                
                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <Field
                      type="checkbox"
                      name="includeQuote"
                      id="includeQuote"
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="includeQuote" className="ml-2 block text-gray-700 text-sm sm:text-base">
                      Include Quote Details
                    </label>
                  </div>
                  
                  {values.includeQuote && (
                    <div className="space-y-3 sm:space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label htmlFor="price" className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Unit Price ($)</label>
                          <Field
                            type="number"
                            name="price"
                            id="price"
                            step="0.01"
                            min="0"
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                            placeholder="Enter price per unit"
                          />
                          <ErrorMessage name="price" component="div" className="mt-1 text-red-600 text-xs sm:text-sm" />
                          
                          {values.price && rtqData && rtqData.quantity && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-md">
                              <p className="text-gray-700 text-xs sm:text-sm">Quantity: <span className="font-medium">{rtqData.quantity}</span></p>
                              <p className="text-gray-700 text-xs sm:text-sm">Total Price: <span className="font-medium">${(values.price * parseInt(rtqData.quantity)).toFixed(2)}</span></p>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 sm:mt-0">
                          <label htmlFor="deliveryTime" className="block text-gray-700 font-medium mb-1 sm:mb-2 text-sm sm:text-base">Estimated Delivery</label>
                          <Field
                            type="text"
                            name="deliveryTime"
                            id="deliveryTime"
                            className="w-full p-2 sm:p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 text-sm sm:text-base"
                            placeholder="e.g. 2-3 business days"
                          />
                          <ErrorMessage name="deliveryTime" component="div" className="mt-1 text-red-600 text-xs sm:text-sm" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto order-2 sm:order-1 px-4 sm:px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || submitting}
                    className="w-full sm:w-auto order-1 sm:order-2 flex justify-center items-center px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  >
                    {isSubmitting || submitting ? (
                      <>
                        <span className="animate-spin mr-2 h-3 w-3 sm:h-4 sm:w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane className="mr-2 text-xs sm:text-sm" />
                        Send Response
                      </>
                    )}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      )}
    </Modal>
  );
};

export default RTQResponseForm;
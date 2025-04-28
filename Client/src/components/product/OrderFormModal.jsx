import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaBox, FaMapMarkerAlt, FaCalendarAlt, FaCommentAlt } from 'react-icons/fa';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env';

/**
 * OrderFormModal Component
 * 
 * Modal form that appears when a user clicks the "Order Now" button
 * after a seller has replied to their question
 */
const OrderFormModal = ({ isOpen, onClose, product, questionData }) => {
  const { currentUser, showNotification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL
  });
  
  // Add request interceptor to include token in headers
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

  // Fetch user profile data when modal opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser || !isOpen) return;

      try {
        setLoading(true);
        const response = await api.get('/auth/profile');
        
        if (response.data && response.data.profile) {
          setUserData({...response.data.profile});
        } else {
          setUserData({...response.data});
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        showNotification('Unable to load your profile information. Please try again later.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser, isOpen, showNotification]);

  // Form validation schema
  const orderSchema = Yup.object().shape({
    quantity: Yup.number()
      .required('Quantity is required')
      .positive('Quantity must be positive')
      .integer('Quantity must be a whole number'),
    delivery_address: Yup.string()
      .required('Delivery address is required')
      .min(10, 'Address is too short'),
    preferred_delivery_date: Yup.date()
      .required('Preferred delivery date is required')
      .min(new Date(Date.now() + 24*60*60*1000), 'Delivery date must be at least tomorrow'),
    additional_notes: Yup.string()
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      // Prepare order data
      const orderData = {
        product_id: product.id,
        quantity: values.quantity,
        shipping_address: values.delivery_address,
        preferred_delivery_date: values.preferred_delivery_date,
        additional_notes: values.additional_notes,
        rtq_question_id: questionData?.id // Link to the original question
      };

      // Submit order to backend
      const response = await api.post('/orders', orderData);
      
      showNotification('Order placed successfully! It is pending approval from admin.', 'success');
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error placing order:', error);
      showNotification(error.response?.data?.error || 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Calculate minimum date for the date picker (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Place Your Order">
      <div className="p-4">
        <div className="mb-4 bg-gray-50 p-3 rounded-md">
          <h3 className="font-semibold text-gray-800">{product?.name}</h3>
          <p className="text-gray-600 text-sm mt-1">Price: ${product?.price?.toFixed(2)}</p>
        </div>

        <Formik
          initialValues={{
            quantity: 1,
            delivery_address: userData?.address || '',
            preferred_delivery_date: '',
            additional_notes: ''
          }}
          validationSchema={orderSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true}
        >
          {({ isSubmitting, touched, errors }) => (
            <Form className="space-y-4">
              {/* Quantity */}
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaBox className="inline mr-2" />
                  Quantity
                </label>
                <Field
                  type="number"
                  name="quantity"
                  id="quantity"
                  min="1"
                  className={`w-full p-2 border rounded-md ${touched.quantity && errors.quantity ? 'border-red-500' : 'border-gray-300'}`}
                />
                <ErrorMessage name="quantity" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Delivery Address */}
              <div>
                <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMapMarkerAlt className="inline mr-2" />
                  Delivery Address
                </label>
                <Field
                  as="textarea"
                  name="delivery_address"
                  id="delivery_address"
                  rows="3"
                  className={`w-full p-2 border rounded-md ${touched.delivery_address && errors.delivery_address ? 'border-red-500' : 'border-gray-300'}`}
                />
                <ErrorMessage name="delivery_address" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Preferred Delivery Date */}
              <div>
                <label htmlFor="preferred_delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaCalendarAlt className="inline mr-2" />
                  Preferred Delivery Date
                </label>
                <Field
                  type="date"
                  name="preferred_delivery_date"
                  id="preferred_delivery_date"
                  min={getMinDate()}
                  className={`w-full p-2 border rounded-md ${touched.preferred_delivery_date && errors.preferred_delivery_date ? 'border-red-500' : 'border-gray-300'}`}
                />
                <ErrorMessage name="preferred_delivery_date" component="div" className="text-red-500 text-sm mt-1" />
              </div>

              {/* Additional Notes */}
              <div>
                <label htmlFor="additional_notes" className="block text-sm font-medium text-gray-700 mb-1">
                  <FaCommentAlt className="inline mr-2" />
                  Additional Notes (Optional)
                </label>
                <Field
                  as="textarea"
                  name="additional_notes"
                  id="additional_notes"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  disabled={isSubmitting || loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={isSubmitting || loading}
                >
                  {(isSubmitting || loading) ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Modal>
  );
};

export default OrderFormModal;
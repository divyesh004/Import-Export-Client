import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaEnvelope, FaLock, FaBuilding, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('customer');
  const { register, showNotification } = useAuth();
  const navigate = useNavigate();

  // Registration validation schema
  const registerSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, 'Name must be at least 2 characters')
      .matches(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')
      .required('Full name is required'),
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required'),
    password: Yup.string()
      .min(6, 'Password must be at least 6 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm password is required'),
    phone: Yup.string()
      .matches(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number format'),
    company_name: Yup.string()
      .when('role', {
        is: 'seller',
        then: () => Yup.string().required('Company name is required for sellers')
      }),
    address: Yup.string()
      .when('role', {
        is: 'seller',
        then: () => Yup.string().required('Address is required for sellers')
      }),
    role: Yup.string().required('Role is required')
  });

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setIsLoading(true);
      
      // Remove confirmPassword as it's not needed for the API
      const { confirmPassword, ...userData } = values;
      
      await register(userData);
      showNotification('Registration successful! Welcome to our platform.', 'success');
      navigate('/profile');
    } catch (err) {
      // More user-friendly registration error messages in Hindi
      let errorMessage = 'Unable to complete registration at this time. Please try again.';
      
      if (err.error) {
        if (err.error.includes('email already registered') || err.error.includes('already exists')) {
          errorMessage = 'This email is already registered. Please use a different email or try logging in.';
        } else if (err.error.includes('password')) {
          errorMessage = 'Your password does not meet the requirements. Please choose a strong password.';
        } else if (err.error.includes('validation')) {
          errorMessage = 'Please check your information and try again.';
        }
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center">
      <div className="container max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header with decorative top bar */}
          <div className="h-2 bg-gradient-to-r from-primary-500 to-primary-700"></div>
          
          <div className="p-8">
            {/* Logo/Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
                <FaUser className="text-primary-600 text-2xl" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-center text-gray-500 mb-8">Join our platform and explore our services</p>
          
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-lg flex items-start animate-fadeIn">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            <div className="mb-8">
              <p className="text-center text-gray-600 mb-3 text-sm">I want to register as:</p>
              <div className="flex justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setUserRole('customer')}
                  className={`py-3 px-6 rounded-lg transition-all duration-200 ${userRole === 'customer' 
                    ? 'bg-primary-600 text-white shadow-md transform -translate-y-0.5' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setUserRole('seller')}
                  className={`py-3 px-6 rounded-lg transition-all duration-200 ${userRole === 'seller' 
                    ? 'bg-primary-600 text-white shadow-md transform -translate-y-0.5' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Seller
                </button>
              </div>
            </div>
          
          <Formik
            initialValues={{
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              phone: '',
              company_name: '',
              address: '',
              role: userRole
            }}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
            enableReinitialize={true}
          >
            {({ isSubmitting, values, setFieldValue }) => {
              // Update role field when userRole state changes
              if (values.role !== userRole) {
                setFieldValue('role', userRole);
              }
              
              return (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label htmlFor="name" className="block text-gray-700 font-medium mb-2 text-sm">Full Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUser className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                        </div>
                        <Field
                          type="text"
                          name="name"
                          id="name"
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <ErrorMessage name="name" component="div" className="mt-1 text-red-600 text-sm font-medium" />
                    </div>
                    
                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-gray-700 font-medium mb-2 text-sm">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                        </div>
                        <Field
                          type="email"
                          name="email"
                          id="email"
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                          placeholder="Enter your email"
                        />
                      </div>
                      <ErrorMessage name="email" component="div" className="mt-1 text-red-600 text-sm font-medium" />
                    </div>
                    
                    {/* Password */}
                    <div>
                      <label htmlFor="password" className="block text-gray-700 font-medium mb-2 text-sm">Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                        </div>
                        <Field
                          type="password"
                          name="password"
                          id="password"
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                          placeholder="Create a password"
                        />
                      </div>
                      <ErrorMessage name="password" component="div" className="mt-1 text-red-600 text-sm font-medium" />
                    </div>
                    
                    {/* Confirm Password */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2 text-sm">Confirm Password</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaLock className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                        </div>
                        <Field
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                          placeholder="Confirm your password"
                        />
                      </div>
                      <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-red-600 text-sm font-medium" />
                    </div>
                    
                    {/* Phone Number */}
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 font-medium mb-2 text-sm">Phone Number </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaPhone className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                        </div>
                        <Field
                          type="text"
                          name="phone"
                          id="phone"
                          className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <ErrorMessage name="phone" component="div" className="mt-1 text-red-600 text-sm font-medium" />
                    </div>
                    
                    {/* Seller-specific fields */}
                    {userRole === 'seller' && (
                      <>
                        <div>
                          <label htmlFor="company_name" className="block text-gray-700 font-medium mb-2 text-sm">Company Name</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaBuilding className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <Field
                              type="text"
                              name="company_name"
                              id="company_name"
                              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                              placeholder="Enter your company name"
                            />
                          </div>
                          <ErrorMessage name="company_name" component="div" className="mt-1 text-red-600 text-sm font-medium" />
                        </div>
                        
                        <div>
                          <label htmlFor="address" className="block text-gray-700 font-medium mb-2 text-sm">Business Address</label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaMapMarkerAlt className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                            </div>
                            <Field
                              type="text"
                              name="address"
                              id="address"
                              className="pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 shadow-sm"
                              placeholder="Enter your business address"
                            />
                          </div>
                          <ErrorMessage name="address" component="div" className="mt-1 text-red-600 text-sm font-medium" />
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isSubmitting || isLoading}
                      className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none font-medium"
                    >
                      {isSubmitting || isLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating Account...
                        </span>
                      ) : 'Create Account'}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Register;

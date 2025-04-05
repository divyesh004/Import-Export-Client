import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaBuilding, FaPhone, FaMapMarkerAlt, FaSave, FaEdit, FaSignOutAlt, FaQuestionCircle, FaShoppingBag, FaHistory, FaUserCircle, FaShieldAlt, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Skeleton from '../components/common/Skeleton';
import Loading from '../components/common/Loading';
import { API_BASE_URL } from '../config/env';

const UserProfile = () => {
  const { currentUser, showNotification, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  // Profile validation schema
  const profileSchema = Yup.object().shape({
    name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().nullable(),
    address: Yup.string().nullable(),
    company_name: Yup.string().when('role', {
      is: 'seller',
      then: () => Yup.string().required('Company name is required for sellers'),
      otherwise: () => Yup.string().nullable()
    })
  });

  // Create axios instance with auth header
  const api = axios.create({
    baseURL: API_BASE_URL
  });
  
  // Add request interceptor to include token in headers
  api.interceptors.request.use(
    (config) => {
      // Get token from localStorage instead of currentUser object
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError('');

        const response = await api.get('/auth/profile');
        // Make sure we're setting the profile data correctly
        if (response.data && response.data.profile) {
          setProfileData({...response.data.profile});
        } else {
          setProfileData({...response.data});
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch profile data';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [currentUser]);
  
  // Re-fetch profile data when isEditing changes from true to false
  // This ensures we have the latest data after profile update
  useEffect(() => {
    if (!isEditing && currentUser) {
      const refreshProfileData = async () => {
        try {
          const response = await api.get('/auth/profile');
          if (response.data && response.data.profile) {
            setProfileData({...response.data.profile});
          } else if (response.data) {
            setProfileData({...response.data});
          }
        } catch (err) {
          console.error('Failed to refresh profile data:', err);
        }
      };
      
      refreshProfileData();
    }
  }, [isEditing, currentUser]);

  // Handle profile update
  const handleProfileUpdate = async (values, { setSubmitting }) => {
    try {
      setError('');
      setIsSaving(true);

      // Prepare data for update - only include fields that are allowed to be updated
      const updateData = {
        name: values.name
      };
      
      // Only add fields if they have values (avoid sending empty strings)
      if (values.phone && values.phone !== '') {
        updateData.phone = values.phone;
      }
      
      if (values.address && values.address !== '') {
        updateData.address = values.address;
      }
      
      if (values.company_name && values.company_name !== '') {
        updateData.company_name = values.company_name;
      }
      

      // Make the API call with properly formatted data
      const response = await api.patch('/auth/update', updateData);

      // Update profileData with the profile data from the response
      if (response.data && response.data.profile) {
        // Update the local profileData state with the updated profile
        setProfileData({...response.data.profile});
      } else if (response.data) {
        // Fallback in case the profile is not nested
        setProfileData({...response.data});
      } else {
        console.error('Invalid response format:', response.data);
      }
      
      // Fetch fresh profile data to ensure we have the latest data
      const refreshResponse = await api.get('/auth/profile');
      if (refreshResponse.data && refreshResponse.data.profile) {
        setProfileData({...refreshResponse.data.profile});
      } else if (refreshResponse.data) {
        setProfileData({...refreshResponse.data});
      }
      
      setIsEditing(false);
      showNotification('Profile updated successfully!', 'success');
    } catch (err) {
      console.error('Profile update error:', err);
      // More user-friendly profile update error messages in English
      let errorMessage = 'Unable to update your profile at this time. Please try again later.';
      
      if (err.response) {
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          if (err.response.data.message.includes('email')) {
            errorMessage = 'This email is already in use by another account. Please use a different email.';
          } else if (err.response.data.message.includes('phone')) {
            errorMessage = 'Invalid phone number format. Please enter a valid phone number.';
          } else if (err.response.data.message.includes('permission')) {
            errorMessage = 'You do not have permission to update this profile.';
          }
        }
      }
      
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
      setIsSaving(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="py-12 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
        <div className="container max-w-6xl mx-auto px-4 sm:px-6">
          {/* Skeleton Page Header */}
          <div className="text-center mb-8 sm:mb-12">
            <Skeleton type="title" className="mx-auto" />
            <div className="mt-2 max-w-2xl mx-auto">
              <Skeleton type="text" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Skeleton Sidebar */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                {/* Skeleton Profile Card */}
                <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <Skeleton type="avatar" />
                  </div>
                  <Skeleton type="title" />
                  <div className="mt-2 flex justify-center">
                    <div className="w-32">
                      <Skeleton type="text" />
                    </div>
                  </div>
                </div>

                {/* Skeleton Navigation Menu */}
                <div className="p-4">
                  <div className="space-y-3">
                    <Skeleton type="button" />
                    <Skeleton type="button" />
                    <Skeleton type="button" />
                    <Skeleton type="button" />
                    <Skeleton type="button" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Skeleton Main Content */}
            <div className="lg:col-span-9">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                {/* Skeleton Content Header */}
                <div className="border-b px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex justify-between items-center">
                    <Skeleton type="title" />
                    <div className="w-24">
                      <Skeleton type="button" />
                    </div>
                  </div>
                </div>

                {/* Skeleton Form */}
                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Skeleton type="text" />
                      <div className="mt-2">
                        <Skeleton type="input" />
                      </div>
                    </div>
                    <div>
                      <Skeleton type="text" />
                      <div className="mt-2">
                        <Skeleton type="input" />
                      </div>
                    </div>
                    <div>
                      <Skeleton type="text" />
                      <div className="mt-2">
                        <Skeleton type="input" />
                      </div>
                    </div>
                    <div>
                      <Skeleton type="text" />
                      <div className="mt-2">
                        <Skeleton type="input" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-8">
                    <Skeleton type="button" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Account</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Manage your profile information, security settings, and view your activity</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-24 border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
              {/* Profile Card */}
              <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 opacity-50"></div>
                
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-white/20 text-white mb-4 ring-4 ring-white/30 shadow-lg transform transition-transform hover:scale-105">
                  <FaUserCircle className="h-14 w-14" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {profileData?.name || 'User Profile'}
                </h2>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-primary-50 text-sm font-medium mt-2">
                  {profileData?.role === 'seller' ? 'Seller Account' : 'Customer Account'}
                </div>
              </div>
              
              {/* Navigation Menu */}
              <div className="p-4">
                <nav className="space-y-1">
                  <button
                    className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'profile' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <FaUser className={`mr-3 ${activeTab === 'profile' ? 'text-primary-500' : 'text-gray-400'}`} />
                    Profile Information
                  </button>
                  
                  <button
                    className={`w-full flex items-center px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === 'security' ? 'bg-primary-50 text-primary-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <FaShieldAlt className={`mr-3 text-primary-500 hidden sm:block`} />
                    Security
                  </button>
                  
                  <Link
                    to="/my-inquiries"
                    className="w-full flex items-center px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                  >
                    <FaQuestionCircle className="mr-3 text-gray-400" />
                    My Inquiries
                  </Link>
                  
                  <Link
                    to="/orders"
                    className="w-full flex items-center px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                  >
                    <FaHistory className="mr-3 text-gray-400" />
                    Order History
                  </Link>
                  
                  <Link
                    to="/products"
                    className="w-full flex items-center px-4 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
                  >
                    <FaShoppingBag className="mr-3 text-gray-400" />
                    Browse Products
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 rounded-lg font-medium text-red-600 hover:bg-red-50 hover:text-red-700 mt-6 transition-all duration-200"
                  >
                    <FaSignOutAlt className="mr-3" />
                    Sign Out
                  </button>
                </nav>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
              {/* Content Header */}
              <div className="flex justify-between items-center border-b px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                  {activeTab === 'profile' ? (
                    <>
                      <FaUser className="mr-3 text-primary-500 hidden sm:block" />
                      Profile Information
                    </>
                  ) : (
                    <>
                      <FaShieldAlt className="mr-3 text-primary-500 hidden sm:block" />
                      Security Settings
                    </>
                  )}
                </h1>
                {activeTab === 'profile' && !isEditing && (
                  <button
                    type="button"
                    className="flex items-center text-primary-600 hover:text-primary-700 font-medium bg-primary-50 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-primary-100"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit className="mr-2" />
                    Edit Profile
                  </button>
                )}
                {activeTab === 'profile' && isEditing && (
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-800 font-medium bg-gray-100 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-200"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-8">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-lg flex items-start animate-fadeIn shadow-sm">
                    <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                  </div>
                )}
                
                {activeTab === 'profile' && profileData && (
                  <div className="bg-white rounded-lg">
                    {!isEditing && (
                      <div className="bg-gradient-to-r from-primary-50 to-white p-4 rounded-lg mb-6 border border-primary-100 shadow-sm">
                        <h3 className="text-primary-800 font-medium mb-1">Welcome, {profileData.name}!</h3>
                        <p className="text-gray-600 text-sm">Here you can view and update your profile information. Click the Edit Profile button to make changes.</p>
                      </div>
                    )}
                    {/* Fixed: Wrapped adjacent elements in a single parent div */}
                    <div>
                      {isEditing ? (
                        <Formik
                          initialValues={{
                            name: profileData.name || '',
                            email: profileData.email || '',
                            phone: profileData.phone || '',
                            address: profileData.address || '',
                            company_name: profileData.company_name || '',
                            role: profileData.role || 'customer'
                          }}
                          validationSchema={profileSchema}
                          onSubmit={handleProfileUpdate}
                        >
                          {({ isSubmitting, values }) => (
                            <Form>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <label htmlFor="name" className="block text-gray-700 font-medium mb-2 flex items-center">
                                    <FaUser className="text-primary-500 mr-2" />
                                    Full Name
                                  </label>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <FaUser className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                    <Field
                                      type="text"
                                      id="name"
                                      name="name"
                                      className="input pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all duration-200"
                                      placeholder="Your full name"
                                    />
                                  </div>
                                  <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1 font-medium" />
                                </div>
                                
                                <div>
                                  <label htmlFor="email" className="block text-gray-700 font-medium mb-2 flex items-center">
                                    <FaEnvelope className="text-primary-500 mr-2" />
                                    Email Address
                                  </label>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <FaEnvelope className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                    <Field
                                      type="email"
                                      id="email"
                                      name="email"
                                      className="input pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 bg-gray-50 shadow-sm transition-all duration-200"
                                      placeholder="you@example.com"
                                      disabled
                                    />
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                                    <FaLock className="mr-1 text-gray-400" />
                                    Email cannot be changed
                                  </p>
                                </div>
                                
                                <div>
                                  <label htmlFor="phone" className="block text-gray-700 font-medium mb-2 flex items-center">
                                    <FaPhone className="text-primary-500 mr-2" />
                                    Phone Number
                                  </label>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <FaPhone className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                    <Field
                                      type="text"
                                      id="phone"
                                      name="phone"
                                      className="input pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all duration-200"
                                      placeholder="Your phone number"
                                    />
                                  </div>
                                  <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1 font-medium" />
                                </div>
                                
                                <div>
                                  <label htmlFor="address" className="block text-gray-700 font-medium mb-2 flex items-center">
                                    <FaMapMarkerAlt className="text-primary-500 mr-2" />
                                    Address
                                  </label>
                                  <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <FaMapMarkerAlt className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                                    </div>
                                    <Field
                                      type="text"
                                      id="address"
                                      name="address"
                                      className="input pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all duration-200"
                                      placeholder="Your address"
                                    />
                                  </div>
                                  <ErrorMessage name="address" component="div" className="text-red-500 text-sm mt-1 font-medium" />
                                </div>
                                
                                {values.role === 'seller' && (
                                  <div className="md:col-span-2">
                                    <label htmlFor="company_name" className="block text-gray-700 font-medium mb-2 flex items-center">
                                      <FaBuilding className="text-primary-500 mr-2" />
                                      Company Name
                                    </label>
                                    <div className="relative group">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaBuilding className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                                      </div>
                                      <Field
                                        type="text"
                                        id="company_name"
                                        name="company_name"
                                        className="input pl-10 w-full p-3 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 shadow-sm transition-all duration-200"
                                        placeholder="Your company name"
                                      />
                                    </div>
                                    <ErrorMessage name="company_name" component="div" className="text-red-500 text-sm mt-1 font-medium" />
                                  </div>
                                )}
                              </div>
                              
                              <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                                <button
                                  type="submit"
                                  className="btn btn-primary py-3 px-6 flex items-center justify-center rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 transform transition-all duration-200 hover:-translate-y-0.5 shadow-md"
                                  disabled={isSubmitting || isSaving}
                                >
                                  {(isSubmitting || isSaving) ? (
                                    <>
                                      <Loading size="sm" />
                                      <span className="ml-2">Saving Changes...</span>
                                    </>
                                  ) : (
                                    <>
                                      <FaSave className="mr-2" />
                                      Save Changes
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="btn py-3 px-6 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all duration-200 flex items-center justify-center"
                                  onClick={() => setIsEditing(false)}
                                  disabled={isSubmitting || isSaving}
                                >
                                  Cancel
                                </button>
                              </div>
                            </Form>
                          )}
                        </Formik>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                            <h3 className="text-gray-700 font-medium mb-2 flex items-center">
                              <FaUser className="text-primary-500 mr-2" />
                              Full Name
                            </h3>
                            <p className="text-gray-900 font-medium pl-7">{profileData.name ? profileData.name : 'Not provided'}</p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                            <h3 className="text-gray-700 font-medium mb-2 flex items-center">
                              <FaEnvelope className="text-primary-500 mr-2" />
                              Email Address
                            </h3>
                            <p className="text-gray-900 font-medium pl-7">{profileData.email ? profileData.email : 'Not provided'}</p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                            <h3 className="text-gray-700 font-medium mb-2 flex items-center">
                              <FaPhone className="text-primary-500 mr-2" />
                              Phone Number
                            </h3>
                            <p className="text-gray-900 pl-7">{profileData.phone ? profileData.phone : 
                              <span className="text-gray-500 italic">Not provided</span>}
                            </p>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                            <h3 className="text-gray-700 font-medium mb-2 flex items-center">
                              <FaMapMarkerAlt className="text-primary-500 mr-2" />
                              Address
                            </h3>
                            <p className="text-gray-900 pl-7">{profileData.address ? profileData.address : 
                              <span className="text-gray-500 italic">Not provided</span>}
                            </p>
                          </div>
                          
                          {profileData.role === 'seller' && (
                            <div className="md:col-span-2 bg-white p-4 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
                              <h3 className="text-gray-700 font-medium mb-2 flex items-center">
                                <FaBuilding className="text-primary-500 mr-2" />
                                Company Name
                              </h3>
                              <p className="text-gray-900 pl-7">{profileData.company_name ? profileData.company_name : 
                                <span className="text-gray-500 italic">Not provided</span>}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {activeTab === 'security' && (
                  <div>
                    <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        Change Password
                      </h2>
                      <p className="text-gray-600 mb-6 pl-8">
                        To change your password, use the button below to request a password reset email.
                      </p>
                      <div className="pl-8">
                        <Link 
                          to="/forgot-password" 
                          className="inline-flex items-center px-5 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                          Reset Password
                        </Link>
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h2 className="text-xl font-semibold mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Account Type
                      </h2>
                      <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 mt-4">
                        <p className="text-gray-700 flex items-center mb-3">
                          <span className="font-medium w-32">Current Role:</span> 
                          <span className="capitalize bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                            {profileData.role}
                          </span>
                        </p>
                        {profileData.role === 'seller' && (
                          <p className="text-gray-700 flex items-center">
                            <span className="font-medium w-32">Company:</span> 
                            <span>{profileData.company_name ? profileData.company_name : 'Not provided'}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;



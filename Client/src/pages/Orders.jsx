import React from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaClock, FaBell, FaArrowLeft } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Orders = () => {
  const { currentUser } = useAuth();

  // Calculate a future date for the countdown (30 days from now)
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 30);
  
  return (
    <div className="py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-8 px-6 text-white text-center">
            <FaBoxOpen className="mx-auto text-5xl mb-4" />
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Orders Coming Soon</h1>
            <p className="text-lg opacity-90">We're working hard to bring you a seamless ordering experience</p>
          </div>
          
          {/* Main content */}
          <div className="p-6 sm:p-8 md:p-10">
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg mb-6">
                Our order management system is currently under development. Soon you'll be able to place orders, track shipments, and manage your purchases all in one place.
              </p>
              
        
            </div>
            
            {/* Features preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Order Tracking</h3>
                <p className="text-gray-600">Track your orders in real-time with detailed shipping information and delivery updates.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Order History</h3>
                <p className="text-gray-600">Access your complete order history with detailed information about past purchases.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Easy Reordering</h3>
                <p className="text-gray-600">Quickly reorder your favorite products with just a few clicks.</p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Invoice Management</h3>
                <p className="text-gray-600">Download and manage invoices for all your purchases in one convenient location.</p>
              </div>
            </div>
            
            {/* Notification signup */}
            <div className="bg-indigo-50 rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center justify-center">
                <FaBell className="mr-2 text-indigo-600" />
                Get Notified When Orders Launch
              </h3>
              <p className="text-gray-600 mb-4">
                We'll let you know as soon as our ordering system is ready. No spam, just a friendly update.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-2">
                <input 
                  type="email" 
                  placeholder="Your email address"
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:max-w-xs w-full"
                />
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors">
                  Notify Me
                </button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-center">
              <Link to="/products" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors">
                <FaArrowLeft className="mr-2" />
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Orders;
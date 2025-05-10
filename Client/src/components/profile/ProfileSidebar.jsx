import React from "react";
import {
  FaUser,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";

/**
 * ProfileSidebar Component
 * 
 * Displays the user profile sidebar with navigation options
 */
const ProfileSidebar = ({ 
  profileData, 
  activeTab, 
  setActiveTab, 
  handleLogout 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden lg:sticky lg:top-24 border border-gray-100 transform transition-all duration-300 hover:shadow-xl">
      {/* Profile Card */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-4 sm:p-6 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 opacity-50"></div>

        <div className="inline-flex items-center justify-center h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 rounded-full bg-white/20 text-white mb-2 sm:mb-4 ring-4 ring-white/30 shadow-lg transform transition-transform hover:scale-105">
          <FaUserCircle className="h-14 w-14" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
          {profileData?.name || "User Profile"}
        </h2>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-primary-50 text-sm font-medium mt-2">
          {profileData?.role === "seller"
            ? "Seller Account"
            : "Customer Account"}
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="p-3 sm:p-5">
        <nav className="space-y-1 sm:space-y-2">
          <button
            className={`w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl font-medium transition-all duration-300 ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-md border-l-4 border-primary-500"
                : "text-gray-600 hover:bg-gray-50 hover:text-primary-600 hover:pl-5"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <div
              className={`mr-3 transition-all duration-300 ${
                activeTab === "profile"
                  ? "text-primary-500 scale-110"
                  : "text-gray-400"
              }`}
            >
              <FaUser className="transform transition-transform" />
            </div>
            <span>Profile Information</span>
          </button>

          <button
            className={`w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl font-medium transition-all duration-300 ${
              activeTab === "security"
                ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 shadow-md border-l-4 border-primary-500"
                : "text-gray-600 hover:bg-gray-50 hover:text-primary-600 hover:pl-5"
            }`}
            onClick={() => setActiveTab("security")}
          >
            <div
              className={`mr-3 transition-all duration-300 ${
                activeTab === "security"
                  ? "text-primary-500 scale-110"
                  : "text-gray-400"
              }`}
            >
              <FaShieldAlt className="transform transition-transform" />
            </div>
            <span>Security Settings</span>
          </button>

          <button
            className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-xl font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:pl-5 transition-all duration-300"
            onClick={handleLogout}
          >
            <div className="mr-3 text-gray-400">
              <FaSignOutAlt />
            </div>
            <span>Logout</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;
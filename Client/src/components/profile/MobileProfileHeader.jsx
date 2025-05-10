import React from "react";
import { FaUser, FaUserCircle, FaShieldAlt } from "react-icons/fa";

/**
 * MobileProfileHeader Component
 * 
 * Displays the mobile header for user profile with tab navigation
 * Only visible on mobile devices
 */
const MobileProfileHeader = ({ profileData, activeTab, setActiveTab }) => {
  return (
    <div className="md:hidden bg-white rounded-xl shadow-lg mb-4 overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 p-4 flex items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12 opacity-50"></div>
        
        <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-white/20 text-white ring-4 ring-white/30 shadow-lg">
          <FaUserCircle className="h-10 w-10" />
        </div>
        <div className="ml-4 flex-1 overflow-hidden">
          <h2 className="text-lg font-bold text-white truncate">
            {profileData?.name || "User Profile"}
          </h2>
          <div className="inline-flex items-center px-2 py-1 rounded-full bg-white/20 text-primary-50 text-xs font-medium mt-1">
            {profileData?.role === "seller" ? "Seller Account" : "Customer Account"}
          </div>
        </div>
      </div>
      
      {/* Mobile Tab Selector */}
      <div className="flex border-b border-gray-100">
        <button
          className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === "profile" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("profile")}
        >
          <div className="flex flex-col items-center">
            <FaUser className={`mb-1 ${activeTab === "profile" ? "text-primary-600" : "text-gray-400"}`} />
            <span>Profile</span>
          </div>
        </button>
        <button
          className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === "security" ? "text-primary-600 border-b-2 border-primary-600" : "text-gray-500"}`}
          onClick={() => setActiveTab("security")}
        >
          <div className="flex flex-col items-center">
            <FaShieldAlt className={`mb-1 ${activeTab === "security" ? "text-primary-600" : "text-gray-400"}`} />
            <span>Security</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MobileProfileHeader;
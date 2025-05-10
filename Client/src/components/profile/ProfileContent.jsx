import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  FaUser,
  FaEnvelope,
  FaBuilding,
  FaPhone,
  FaMapMarkerAlt,
  FaSave,
  FaEdit,
  FaLock,
  FaExclamationTriangle,
  FaCheckCircle,
  FaGlobe,
  FaInfoCircle,
} from "react-icons/fa";
import ReactCountryFlag from "react-country-flag";

// List of countries with ISO codes for dropdown
const countries = [
  { name: "India", code: "IN" },
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Australia", code: "AU" },
  { name: "China", code: "CN" },
  { name: "Japan", code: "JP" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Brazil", code: "BR" },
  { name: "Russia", code: "RU" },
  { name: "South Africa", code: "ZA" },
  { name: "Mexico", code: "MX" },
  { name: "Italy", code: "IT" },
  { name: "Spain", code: "ES" },
  { name: "South Korea", code: "KR" },
  { name: "Indonesia", code: "ID" },
  { name: "Turkey", code: "TR" },
  { name: "Saudi Arabia", code: "SA" },
  { name: "UAE", code: "AE" },
  { name: "Pakistan", code: "PK" },
  { name: "Bangladesh", code: "BD" },
  { name: "Thailand", code: "TH" },
  { name: "Vietnam", code: "VN" },
  { name: "Malaysia", code: "MY" },
  { name: "Singapore", code: "SG" },
  { name: "Nepal", code: "NP" },
  { name: "Sri Lanka", code: "LK" },
];

/**
 * ProfileContent Component
 * 
 * Displays the main content area of the user profile page
 * including profile information and security settings
 */
const ProfileContent = ({
  activeTab,
  profileData,
  isEditing,
  setIsEditing,
  isSaving,
  error,
  isEmailVerified,
  handleProfileUpdate,
  sendVerificationEmail,
}) => {
  const [editingField, setEditingField] = useState(null);
  
  // Profile validation schema
  const profileSchema = Yup.object().shape({
    name: Yup.string().required("Full name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    phone: Yup.string().nullable(),
    address: Yup.string().nullable(),
    country: Yup.string().nullable(),
    company_name: Yup.string().when("role", {
      is: "seller",
      then: () => Yup.string().required("Company name is required for sellers"),
      otherwise: () => Yup.string().nullable(),
    }),
  });

  // Render profile information tab
  const renderProfileTab = () => (
    <div className="p-3 sm:p-6 md:p-8">
      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2 text-red-500" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <Formik
        initialValues={{
          name: profileData?.name || "",
          email: profileData?.email || "",
          phone: profileData?.phone || "",
          address: profileData?.address || "",
          country: profileData?.country || "",
          company_name: profileData?.company_name || "",
          role: profileData?.role || "customer",
        }}
        validationSchema={profileSchema}
        onSubmit={handleProfileUpdate}
        enableReinitialize={true}
      >
        {({ isSubmitting, values, setFieldValue, errors, touched }) => (
          <Form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <FaUser className="inline mr-2 text-gray-500" />
                  Full Name
                </label>
                <div className="relative">
                  <Field
                    type="text"
                    name="name"
                    id="name"
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border ${errors.name && touched.name
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-lg focus:ring-primary-500 focus:border-primary-500 ${!isEditing ? "bg-gray-50" : ""}`}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <FaEnvelope className="inline mr-2 text-gray-500" />
                  Email Address
                  {!isEmailVerified && (
                    <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      <FaExclamationTriangle className="inline mr-1" />
                      Not Verified
                    </span>
                  )}
                  {isEmailVerified && (
                    <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      <FaCheckCircle className="inline mr-1" />
                      Verified
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    disabled={true} // Email is always disabled as it cannot be changed
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={sendVerificationEmail}
                    className="mt-2 text-primary-600 hover:text-primary-800 text-sm font-medium flex items-center"
                  >
                    <FaEnvelope className="mr-1" /> Send Verification Email
                  </button>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <FaPhone className="inline mr-2 text-gray-500" />
                  Phone Number
                </label>
                <div className="relative">
                  <Field
                    type="text"
                    name="phone"
                    id="phone"
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border ${errors.phone && touched.phone
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-lg focus:ring-primary-500 focus:border-primary-500 ${!isEditing ? "bg-gray-50" : ""}`}
                  />
                  <ErrorMessage
                    name="phone"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Address Field */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <FaMapMarkerAlt className="inline mr-2 text-gray-500" />
                  Address
                </label>
                <div className="relative">
                  <Field
                    as="textarea"
                    name="address"
                    id="address"
                    rows="2"
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border ${errors.address && touched.address
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-lg focus:ring-primary-500 focus:border-primary-500 ${!isEditing ? "bg-gray-50" : ""}`}
                  />
                  <ErrorMessage
                    name="address"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Country Field */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  <FaGlobe className="inline mr-2 text-gray-500" />
                  Country
                </label>
                <div className="relative">
                  <Field
                    as="select"
                    name="country"
                    id="country"
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border ${errors.country && touched.country
                      ? "border-red-500"
                      : "border-gray-300"
                      } rounded-lg focus:ring-primary-500 focus:border-primary-500 ${!isEditing ? "bg-gray-50" : ""}`}
                  >
                    <option value="">Select a country</option>
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.name}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="country"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                {values.country && (
                  <div className="mt-2 flex items-center">
                    <ReactCountryFlag
                      countryCode={values.country}
                      svg
                      style={{
                        width: "1.5em",
                        height: "1.5em",
                      }}
                      title={values.country}
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {countries.find((c) => c.code === values.country)?.name}
                    </span>
                  </div>
                )}
              </div>

              {/* Company Name Field (for sellers) */}
              {values.role === "seller" && (
                <div>
                  <label
                    htmlFor="company_name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <FaBuilding className="inline mr-2 text-gray-500" />
                    Company Name
                  </label>
                  <div className="relative">
                    <Field
                      type="text"
                      name="company_name"
                      id="company_name"
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border ${errors.company_name && touched.company_name
                        ? "border-red-500"
                        : "border-gray-300"
                        } rounded-lg focus:ring-primary-500 focus:border-primary-500 ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                    <ErrorMessage
                      name="company_name"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
                >
                  <FaEdit className="mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isSaving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );

  // Render security settings tab
  const renderSecurityTab = () => (
    <div className="p-3 sm:p-6 md:p-8">
      <div className="space-y-6">
        {/* Email Verification Status */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {isEmailVerified ? (
                  <FaCheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <FaExclamationTriangle className="h-6 w-6 text-amber-500" />
                )}
              </div>
              <div className="ml-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Email Verification
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    {isEmailVerified
                      ? "Your email address has been verified."
                      : "Your email address has not been verified yet. Please verify your email to ensure account security."}
                  </p>
                </div>
                {!isEmailVerified && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={sendVerificationEmail}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <FaEnvelope className="-ml-1 mr-2 h-4 w-4" />
                      Send Verification Email
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Section */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaLock className="h-6 w-6 text-gray-500" />
              </div>
              <div className="ml-3 w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Password
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Change your password regularly to keep your account secure.
                  </p>
                </div>
                <div className="mt-3">
                  <Link
                    to="/reset-password"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FaLock className="-ml-1 mr-2 h-4 w-4" />
                    Change Password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaInfoCircle className="h-6 w-6 text-gray-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Account Information
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Account ID: {profileData?.id || "Not available"}</p>
                  <p>Account Type: {profileData?.role || "customer"}</p>
                  <p>
                    Created:{" "}
                    {profileData?.created_at
                      ? new Date(profileData.created_at).toLocaleDateString()
                      : "Not available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Content Header */}
      <div className="border-b px-6 py-5 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {activeTab === "profile" ? "Profile Information" : "Security Settings"}
          </h2>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" ? renderProfileTab() : renderSecurityTab()}
    </div>
  );
};

export default ProfileContent;
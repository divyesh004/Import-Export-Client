import React from 'react';
import { FaExclamationTriangle, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

const EmailVerificationBanner = ({ isVerified, onResendEmail, isLoading }) => {
  if (isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <FaCheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Your email has been verified. Thank you!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <FaExclamationTriangle className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Your email is not verified
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Please verify your email address to access all features. 
              Check your inbox for a verification email or click the button below to resend it.
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={onResendEmail}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaEnvelope className="-ml-0.5 mr-2 h-4 w-4" />
              {isLoading ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
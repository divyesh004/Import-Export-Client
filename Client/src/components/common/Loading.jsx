import React from 'react';
import './Loading.css';

const Loading = ({ size = 'md', type = 'spinner', text = '', className = '' }) => {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };
  
  const renderLoader = () => {
    switch (type) {
      case 'spinner':
        return (
          <svg 
            className={`animate-spin ${sizeClasses[size]} text-primary-600`} 
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
        );
      
      case 'dots':
        return (
          <div className={`loading-dots ${size}`}>
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        );
      
      case 'pulse':
        return (
          <div className={`loading-pulse ${size}`}>
            <div className="pulse-ring"></div>
          </div>
        );
      
      case 'bars':
        return (
          <div className={`loading-bars ${size}`}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>
        );
        
      default:
        return (
          <svg 
            className={`animate-spin ${sizeClasses[size]} text-primary-600`} 
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
        );
    }
  };
  
  return (
    <div className={`flex flex-col justify-center items-center ${className}`}>
      <div className="loading-container">
        {renderLoader()}
      </div>
      {text && <p className="mt-3 text-sm font-medium text-gray-600">{text}</p>}
    </div>
  );
};

export default Loading;
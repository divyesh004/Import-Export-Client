import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type, count = 1, className = '' }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return <div className={`h-4 bg-gradient-skeleton rounded skeleton-animation skeleton-shadow ${className}`}></div>;
      case 'title':
        return <div className={`h-6 bg-gradient-skeleton rounded skeleton-animation skeleton-shadow ${className}`}></div>;
      case 'avatar':
        return <div className={`h-12 w-12 bg-gradient-skeleton rounded-full skeleton-animation skeleton-shadow ${className}`}></div>;
      case 'button':
        return <div className={`h-10 w-24 bg-gradient-skeleton rounded skeleton-animation skeleton-shadow ${className}`}></div>;
      case 'input':
        return <div className={`h-10 bg-gradient-skeleton rounded skeleton-animation skeleton-shadow ${className}`}></div>;
      case 'card':
        return (
          <div className={`border border-gray-200 rounded-lg p-4 w-full overflow-hidden skeleton-wrapper ${className}`}>
            <div className="h-6 bg-gradient-skeleton rounded skeleton-animation skeleton-shadow mb-4 w-3/4"></div>
            <div className="h-4 bg-gradient-skeleton rounded skeleton-animation skeleton-shadow mb-2"></div>
            <div className="h-4 bg-gradient-skeleton rounded skeleton-animation skeleton-shadow mb-2 w-5/6"></div>
            <div className="h-4 bg-gradient-skeleton rounded skeleton-animation skeleton-shadow w-4/6"></div>
          </div>
        );
      case 'image':
        return <div className={`h-40 bg-gradient-skeleton rounded-lg skeleton-animation skeleton-shadow ${className}`}></div>;
      case 'circle':
        return <div className={`h-8 w-8 bg-gradient-skeleton rounded-full skeleton-animation skeleton-shadow ${className}`}></div>;
      case 'thumbnail':
        return <div className={`h-24 w-24 bg-gradient-skeleton rounded-lg skeleton-animation skeleton-shadow ${className}`}></div>;
      case 'banner':
        return <div className={`h-32 w-full bg-gradient-skeleton rounded-lg skeleton-animation skeleton-shadow ${className}`}></div>;
      default:
        return <div className={`h-4 bg-gradient-skeleton rounded skeleton-animation skeleton-shadow ${className}`}></div>;
    }
  };

  return (
    <div className="w-full space-y-2 skeleton-wrapper">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={index} className="transition-all duration-300">{renderSkeleton()}</div>
        ))}
    </div>
  );
};

export default Skeleton;
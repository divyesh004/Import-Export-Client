import React from 'react';
import './Skeleton.css';

const Skeleton = ({ type, count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'text':
        return <div className="h-4 bg-gradient-skeleton rounded skeleton-animation"></div>;
      case 'title':
        return <div className="h-6 bg-gradient-skeleton rounded skeleton-animation"></div>;
      case 'avatar':
        return <div className="h-12 w-12 bg-gradient-skeleton rounded-full skeleton-animation"></div>;
      case 'button':
        return <div className="h-10 w-24 bg-gradient-skeleton rounded skeleton-animation"></div>;
      case 'input':
        return <div className="h-10 bg-gradient-skeleton rounded skeleton-animation"></div>;
      case 'card':
        return (
          <div className="border border-gray-200 rounded-md p-4 w-full">
            <div className="h-6 bg-gradient-skeleton rounded skeleton-animation mb-4 w-3/4"></div>
            <div className="h-4 bg-gradient-skeleton rounded skeleton-animation mb-2"></div>
            <div className="h-4 bg-gradient-skeleton rounded skeleton-animation mb-2 w-5/6"></div>
            <div className="h-4 bg-gradient-skeleton rounded skeleton-animation w-4/6"></div>
          </div>
        );
      default:
        return <div className="h-4 bg-gradient-skeleton rounded skeleton-animation"></div>;
    }
  };

  return (
    <div className="w-full space-y-2">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={index}>{renderSkeleton()}</div>
        ))}
    </div>
  );
};

export default Skeleton;
import React from 'react';
import Skeleton from '../common/Skeleton';

const HomeSkeleton = () => {
  return (
    <div>
      {/* Hero Section Skeleton */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <Skeleton type="title" />
              <div className="mb-6">
                <Skeleton type="text" count={2} />
              </div>
              <div className="flex space-x-4">
                <Skeleton type="button" />
                <Skeleton type="button" />
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="bg-gradient-skeleton rounded-lg h-64 skeleton-animation"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section Skeleton */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <Skeleton type="title" />
            <Skeleton type="text" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="relative overflow-hidden rounded-lg">
                <div className="bg-gradient-skeleton h-40 skeleton-animation"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                  <Skeleton type="text" />
                  <Skeleton type="text" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products Section Skeleton */}
      <section className="py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <Skeleton type="title" />
            <Skeleton type="text" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="card">
                <div className="h-48 bg-gradient-skeleton rounded-t skeleton-animation"></div>
                <div className="p-4">
                  <Skeleton type="title" />
                  <Skeleton type="text" />
                  <div className="flex justify-between items-center mt-2">
                    <Skeleton type="text" />
                    <Skeleton type="button" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers and Newsletter Skeletons */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <Skeleton type="title" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[1, 2].map((item) => (
              <div key={item} className="rounded-lg overflow-hidden shadow-md bg-primary-500">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2 p-6 text-white">
                    <Skeleton type="title" />
                    <Skeleton type="text" />
                    <div className="mt-4">
                      <Skeleton type="button" />
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <div className="bg-gradient-skeleton h-full w-full skeleton-animation"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section Skeleton */}
      <section className="py-12 bg-secondary-600 text-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Skeleton type="title" />
            <div className="mb-6">
              <Skeleton type="text" />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Skeleton type="input" />
              <Skeleton type="button" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeSkeleton;
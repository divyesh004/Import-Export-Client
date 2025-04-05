import React from 'react';
import { Link } from 'react-router-dom';

const CategoryCard = ({ category }) => (
  <Link to={`/products?category=${category.name}`} className="block group">
    <div className="relative overflow-hidden rounded-lg">
      <img 
        src={category.image} 
        alt={category.name} 
        className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
        <h3 className="text-white font-semibold text-lg">{category.name}</h3>
        <p className="text-white/80 text-sm">{category.count} Products</p>
      </div>
    </div>
  </Link>
);

export default CategoryCard;
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import CategoryCard from './CategoryCard';
import { fetchCategories } from '../../services/categoryService';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    const getCategories = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Get industry from URL parameters
        const params = new URLSearchParams(location.search);
        const industryParam = params.get('industry');
        
        if (!industryParam) {
          setLoading(false);
          return;
        }
        
        // Fetch categories for this industry
        const data = await fetchCategories(industryParam);
        
        // Format the categories data
        const formattedCategories = data.map((category, index) => ({
          id: index + 1,
          name: category.name || category,
          image: `/images/category-${(category.name || category).toLowerCase().replace(/\s+/g, '-')}-new.svg`,
          count: category.count || Math.floor(Math.random() * 50) + 10 // Random count if not provided
        }));
        
        setCategories(formattedCategories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
        // Fallback to empty array if API fails
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    getCategories();
  }, [location.search]);

  // If no industry is selected, don't render anything
  const params = new URLSearchParams(location.search);
  const industryParam = params.get('industry');
  
  if (!industryParam) {
    return null;
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="container">
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{industryParam} Categories</h2>
          <p className="text-gray-600 mt-2">Browse all categories in {industryParam} industry</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <FaSpinner className="animate-spin text-primary-600 text-3xl" />
            <span className="ml-2 text-gray-600">Loading categories...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-md">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
            No categories found for {industryParam} industry.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} isSubCategory={true} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryList;
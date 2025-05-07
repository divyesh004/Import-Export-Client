import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSpinner, FaArrowLeft, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import CategoryCard from '../components/category/CategoryCard';
import { fetchCategories } from '../services/categoryService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [visibleCategoriesCount, setVisibleCategoriesCount] = useState(10);
  // No need for auth context as we're using categoryService directly
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get industry from URL parameters
  const params = new URLSearchParams(location.search);
  const industryParam = params.get('industry');
  
  // No need for API instance as we're using categoryService
  
  // Fetch categories for the selected industry
  useEffect(() => {
    const getCategories = async () => {
      if (!industryParam) {
        setLoading(false);
        setError('No industry selected');
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        
        // Fetch categories for this industry using categoryService
        const data = await fetchCategories(industryParam);
        
        // Format the categories data
        const formattedCategories = data.map((category, index) => ({
          id: category.id || index + 1,
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
  }, [industryParam]);
  
  // Go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // If no industry is selected, show error
  if (!industryParam) {
    return (
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4">Categories</h2>
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
              No industry selected. Please select an industry first.
            </div>
            <button
              onClick={handleGoBack}
              className="mt-4 flex items-center text-primary-600 hover:text-primary-800"
            >
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center">
          <button
            onClick={handleGoBack}
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{industryParam} Categories</h1>
            <p className="text-gray-600 mt-1">Browse all categories in {industryParam} industry</p>
          </div>
        </div>
        
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-8 flex justify-center items-center">
            <FaSpinner className="animate-spin text-primary-600 text-3xl" />
            <span className="ml-2 text-gray-600">Loading categories...</span>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="bg-yellow-50 text-yellow-700 p-4 rounded-md">
              No categories found for {industryParam} industry.
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">All Categories</h2>
              {categories.length > visibleCategoriesCount && (
                <button 
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="text-sm text-primary-600 hover:text-primary-800 flex items-center"
                >
                  {showAllCategories ? (
                    <>
                      <span>Show Less</span>
                      <FaChevronUp className="ml-1" />
                    </>
                  ) : (
                    <>
                      <span>View All</span>
                      <FaChevronDown className="ml-1" />
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories
                .slice(0, showAllCategories ? categories.length : visibleCategoriesCount)
                .map((category) => (
                  <CategoryCard key={category.id} category={category} isSubCategory={true} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
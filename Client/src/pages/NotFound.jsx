import { Link } from 'react-router-dom';
import { FaHome, FaSearch } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="py-16">
      <div className="container max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
          
          <div className="w-24 h-1 bg-accent-500 mx-auto my-6"></div>
          
          <p className="text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link to="/" className="btn btn-primary flex items-center justify-center gap-2">
              <FaHome /> Back to Home
            </Link>
            <Link to="/products" className="btn btn-secondary flex items-center justify-center gap-2">
              <FaSearch /> Browse Products
            </Link>
          </div>
          
          <p className="text-sm text-gray-500">
            If you believe this is an error, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
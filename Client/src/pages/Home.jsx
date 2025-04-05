import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/category/CategoryCard';
import { categories, trendingProducts, specialOffers } from '../data/homeData';
import ProductCardNonClickable from '../components/product/ProductCardNonClickable';


const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Quality Products from Around the World
              </h1>
              <p className="text-lg mb-6 text-primary-100">
                Discover unique items from international sellers at competitive prices
              </p>
              <div className="flex space-x-4">
                <Link to="/products" className="btn bg-white text-primary-700 hover:bg-primary-50">
                  Shop Now
                </Link>
                <Link to="/about" className="btn border border-white text-white hover:bg-white/10">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/images/hero-image.svg" 
                alt="Import Export Marketplace" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Shop by Category</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 flex items-center">
              View All <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      <section className="py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Trending Products</h2>
            <Link to="/products" className="text-primary-600 hover:text-primary-700 flex items-center">
              View All <FaArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingProducts.map(product => (
              <div key={product.id}>
                <ProductCardNonClickable product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {specialOffers.map(offer => (
              <div key={offer.id} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2">
                    <img 
                      src={offer.image} 
                      alt={offer.title} 
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 p-6 flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
                    <p className="text-gray-600 mb-4">{offer.description}</p>
                    <Link 
                      to={offer.link} 
                      className="btn bg-primary-600 hover:bg-primary-700 text-white inline-block text-center"
                    >
                      {offer.buttonText}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-12 bg-secondary-600 text-white">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Subscribe to Our Newsletter</h2>
            <p className="mb-6">Get the latest updates on new products and upcoming sales</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-2 rounded-md text-gray-800 focus:outline-none"
              />
              <button className="btn bg-accent-500 hover:bg-accent-600 text-white">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
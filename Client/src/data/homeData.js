// Static data for home page

export const categories = [
  {
    id: 1,
    name: 'Electronics',
    image: '/images/category-electronics-new.svg',
    count: 120
  },
  {
    id: 2,
    name: 'Fashion',
    image: '/images/category-fashion-new.svg',
    count: 85
  },
  {
    id: 3,
    name: 'Home & Garden',
    image: '/images/category-home-garden-new.svg',
    count: 74
  },
  {
    id: 4,
    name: 'Beauty & Health',
    image: '/images/category-beauty-health-new.svg',
    count: 65
  }
];

export const trendingProducts = [
  {
    id: 1,
    name: 'Wireless Earbuds',
    price: 49.99,
    category: 'Electronics',
    image: '/images/category-electronics-new.svg',
    rating: 4.5,
    reviews: 128
  },
  {
    id: 2,
    name: 'Smart Watch',
    price: 129.99,
    category: 'Electronics',
    image: '/images/category-electronics-new.svg',
    rating: 4.3,
    reviews: 95
  },
  {
    id: 3,
    name: 'Leather Handbag',
    price: 79.99,
    category: 'Fashion',
    image: '/images/category-fashion-new.svg',
    rating: 4.7,
    reviews: 62
  },
  {
    id: 4,
    name: 'Portable Blender',
    price: 34.99,
    category: 'Home & Garden',
    image: '/images/category-home-garden-new.svg',
    rating: 4.2,
    reviews: 47
  }
];

export const specialOffers = [
  {
    id: 1,
    title: 'Summer Sale',
    description: 'Get up to 40% off on selected summer items',
    image: '/images/offer-summer-sale-new.svg',
    buttonText: 'Shop Now',
    link: '/products?sale=summer'
  },
  {
    id: 2,
    title: 'New Arrivals',
    description: 'Be the first to check out our newest products',
    image: '/images/offer-new-arrivals-new.svg',
    buttonText: 'Discover',
    link: '/products?filter=new'
  }
];
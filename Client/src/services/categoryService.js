import axios from 'axios';
import { API_BASE_URL } from '../config/env';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_BASE_URL
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Fetch industries from API
export const fetchIndustries = async () => {
  try {
    const response = await api.get('industries');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching industries:', error);
    // Return mock data if API fails
    return getMockIndustries();
  }
};

// Mock industries data for fallback
const getMockIndustries = () => {
  return [
    'Ayurveda',
  ];
};

// Fetch categories for a specific industry with pagination
export const fetchCategories = async (industry, page = 1, limit = 20) => {
  try {
    const response = await api.get(`categories?industry=${industry}&page=${page}&limit=${limit}`);
    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return mock data if API fails
    return getMockCategories(industry);
  }
};

// Fetch category count for a specific industry
export const fetchCategoryCount = async (industry) => {
  try {
    const response = await api.get(`products?industry=${industry}&count=true`);
    return response.data || {};
  } catch (error) {
    console.error('Error fetching category count:', error);
    return {};
  }
};

// Mock categories data for fallback
const getMockCategories = (industry) => {
  // Generic categories that could apply to any industry
  const categories = [
    { name: 'Popular Products', count: 42 },
    { name: 'New Arrivals', count: 15 },
    { name: 'Best Sellers', count: 28 },
    { name: 'Featured', count: 20 },
  ];
  
  // Industry-specific categories
  const industryCategories = {
    'Beauty': [
      { name: 'Skin Care', count: 35 },
      { name: 'Hair Care', count: 28 },
      { name: 'Makeup', count: 42 },
      { name: 'Fragrances', count: 18 },
      { name: 'Bath & Body', count: 24 },
      { name: 'Tools & Accessories', count: 15 },
    ],
    'Ayurveda': [
      { name: 'Shampoo', count: 25 },
      { name: 'Hair Treatment', count: 18 },
      { name: 'Hair Oil', count: 22 },
      { name: 'Conditioner', count: 15 },
      { name: 'Skin Care', count: 30 },
      { name: 'Massage Oil', count: 12 },
      { name: 'Toothpaste', count: 8 },
      { name: 'Herbal Powder', count: 20 },
      { name: 'Soap', count: 16 },
    ],
    'Electronics': [
      { name: 'Smartphones', count: 45 },
      { name: 'Laptops', count: 32 },
      { name: 'Audio', count: 28 },
      { name: 'Cameras', count: 15 },
      { name: 'Accessories', count: 50 },
      { name: 'Smart Home', count: 22 },
    ],
    'Fashion': [
      { name: 'Women\'s Clothing', count: 65 },
      { name: 'Men\'s Clothing', count: 48 },
      { name: 'Footwear', count: 35 },
      { name: 'Accessories', count: 42 },
      { name: 'Jewelry', count: 28 },
      { name: 'Watches', count: 18 },
    ],
    'Home': [
      { name: 'Furniture', count: 38 },
      { name: 'Decor', count: 45 },
      { name: 'Kitchen', count: 32 },
      { name: 'Bath', count: 25 },
      { name: 'Bedding', count: 28 },
      { name: 'Appliances', count: 20 },
    ],
    'Sports': [
      { name: 'Fitness', count: 42 },
      { name: 'Outdoor', count: 35 },
      { name: 'Team Sports', count: 28 },
      { name: 'Water Sports', count: 18 },
      { name: 'Cycling', count: 24 },
      { name: 'Clothing', count: 38 },
    ],
  };
  
  // Return industry-specific categories if available, otherwise return generic categories
  return industryCategories[industry] || categories;
};
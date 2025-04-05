import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaReply, FaQuestionCircle } from 'react-icons/fa';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env';
import { useAuth } from '../../context/AuthContext';
import Loading from '../common/Loading';

const ProductQuestions = ({ productId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [filterOption, setFilterOption] = useState('all'); // नया स्टेट फ़िल्टर ऑप्शन के लिए
  const { currentUser, showNotification, toggleLoginPopup } = useAuth();

  // Create axios instance
  const api = axios.create({
    baseURL: API_BASE_URL
  });
  
  // Add request interceptor to include token in headers
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/qa/questions/${productId}`);
        setQuestions(response.data);
      } catch (err) {
        console.error('Error fetching product questions:', err);
        setError('Failed to load product questions');
        showNotification('Failed to load product questions', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchQuestions();
    }
  }, [productId, showNotification]);

  if (loading) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Customer Questions</h3>
        <div className="flex justify-center">
          <Loading size="md" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Customer Questions</h3>
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  // Handle submitting a new question
  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    
    if (!newQuestion.trim()) {
      showNotification('Please enter a question', 'error');
      return;
    }
    
    if (!currentUser) {
      // Show login popup instead of just showing notification
      toggleLoginPopup(true);
      showNotification('Please login to ask a question', 'error');
      return;
    }
    
    // Check if user has already submitted an inquiry for this product
    const existingQuestion = questions.find(q => 
      q.user_id === currentUser.id && q.product_id === productId
    );
    
    if (existingQuestion) {
      // Highlight existing question if found
      const questionElement = document.getElementById(`question-${existingQuestion.id}`);
      if (questionElement) {
        questionElement.scrollIntoView({ behavior: 'smooth' });
        questionElement.classList.add('bg-yellow-50');
        setTimeout(() => {
          questionElement.classList.remove('bg-yellow-50');
        }, 2000);
      }
      
      showNotification('You have already made an inquiry for this product. Please wait for a response.', 'warning');
      return;
    }
    
    try {
      const response = await api.post('/qa/questions', {
        product_id: productId,
        question: newQuestion
      });
      
      // Add the new question to the list
      setQuestions([response.data, ...questions]);
      setNewQuestion('');
      showNotification('Your question has been submitted', 'success');
    } catch (err) {
      console.error('Error submitting question:', err);
      
      // Check for specific error about already submitted inquiry
      if (err.response?.data?.error === 'You have already submitted an inquiry for this product') {
        showNotification('You have already made an inquiry for this product. Please wait for a response.', 'warning');
      } else {
        showNotification(err.response?.data?.error || 'Failed to submit your question', 'error');
      }
    }
  };

  // Get filtered questions based on selected filter option
  const getFilteredQuestions = () => {
    if (filterOption === 'all') return questions;
    if (filterOption === 'answered') return questions.filter(q => q.answers && q.answers.length > 0);
    if (filterOption === 'unanswered') return questions.filter(q => !q.answers || q.answers.length === 0);
    return questions;
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold flex items-center">
          <FaQuestionCircle className="mr-2 text-primary-600" />
          Customer Questions about this Match
        </h3>
        {currentUser && (
          <Link 
            to="/my-inquiries" 
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
          >
            View All My Inquiries
          </Link>
        )}
      </div>
      
      {/* Question submission form */}
      <div className="mb-6 bg-gray-50 p-4 rounded-lg">
        <form onSubmit={handleSubmitQuestion}>
          <label htmlFor="newQuestion" className="block text-sm font-medium text-gray-700 mb-2">
            Ask a question about this wrestling match
          </label>
          <textarea
            id="newQuestion"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="What would you like to know about this match?"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
          ></textarea>
          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              onClick={(e) => {
                if (!currentUser) {
                  e.preventDefault();
                  toggleLoginPopup(true);
                }
              }}
            >
              Submit Question
            </button>
          </div>
          {!currentUser && (
            <p className="mt-2 text-sm text-gray-500">
              Please login to ask a question
            </p>
          )}
        </form>
      </div>
      
      {/* Filter Dropdown */}
      {!loading && questions.length > 0 && (
        <div className="mb-4 flex justify-end">
          <div className="relative inline-block">
            <select
              value={filterOption}
              onChange={(e) => setFilterOption(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm leading-5 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Questions</option>
              <option value="answered">Answered Questions</option>
              <option value="unanswered">Unanswered Questions</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center p-4">
          <Loading size="md" />
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-gray-50 p-4 rounded-md text-gray-600 text-center">
          No questions yet about this wrestling match. Be the first to ask!
        </div>
      ) : (
        <div className="space-y-4">
          {getFilteredQuestions().map((question) => (
            <div 
              id={`question-${question.id}`}
              key={question.id} 
              className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start">
                <div className="bg-gray-100 rounded-full p-2 mr-3">
                  <FaUser className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">
                      {question.users?.name || 'Anonymous Fan'}
                    </span>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaCalendarAlt className="mr-1" />
                      {new Date(question.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-700">{question.question}</p>
                  
                  {/* Answers section */}
                  {question.answers && question.answers.length > 0 && (
                    <div className="mt-3 pl-6 border-l-2 border-primary-200">
                      {question.answers.map((answer) => (
                        <div key={answer.id} className="mt-2">
                          <div className="flex items-center mb-1">
                            <FaReply className="text-primary-500 mr-2" />
                            <span className="font-medium text-primary-700">
                              {answer.users?.name || 'Official Response'}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {new Date(answer.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-600">{answer.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductQuestions;
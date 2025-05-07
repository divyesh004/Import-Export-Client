import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaCalendarAlt, FaReply, FaQuestionCircle, FaArrowLeft, FaSpinner, FaPaperPlane, FaCheck, FaClock, FaFilter, FaSort, FaShoppingBag, FaTimes, FaCheckDouble, FaEllipsisH, FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import { createAuthenticatedApi } from '../utils/authUtils';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../config/env';
import OrderFormModal from '../components/product/OrderFormModal';
import OrderNowButton from '../components/product/OrderNowButton';


const MyInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyText, setReplyText] = useState({});
  const [submittingReplyIds, setSubmittingReplyIds] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'answered', 'pending'
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  const [filterProductId, setFilterProductId] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [messageStatus, setMessageStatus] = useState({});
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editingInquiry, setEditingInquiry] = useState(null);
  const [editText, setEditText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { currentUser, showNotification, toggleLoginPopup } = useAuth();
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Create API instance with authentication handling
  let api;
  
  // Initialize API with authentication handling
  useEffect(() => {
    // Create authenticated API instance that handles token expiration
    api = createAuthenticatedApi(
      // Token expired callback
      () => {
        // Show login popup when token expires
        toggleLoginPopup(true);
        // Redirect to home page if on protected page and not logged in
        navigate('/');
      },
      // Show notification function
      showNotification
    );
  }, [toggleLoginPopup, showNotification, navigate]);

  // Check for product_id in URL query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const productId = queryParams.get('product_id');
    if (productId) {
      setFilterProductId(productId);
      fetchProductDetails(productId);
    }
  }, [location.search]);

  // Fetch product details if filtering by product
  const fetchProductDetails = async (productId) => {
    if (!productId) return;
    
    try {
      const response = await api.get(`/products/${productId}`);
      if (response.data) {
        setProductDetails(response.data);
      }
    } catch (err) {
      
    }
  };

  // Fetch all inquiries for the current user
  useEffect(() => {
    const fetchUserInquiries = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        // Get all questions for the current user directly from the backend
        // This endpoint already filters questions for the current user based on the token
        const response = await api.get('/qa/questions');
        
        // Check if response.data exists and is an array
        if (!response.data || !Array.isArray(response.data)) {
          setInquiries([]);
          setLoading(false);
          return;
        }
        
        // For each question, fetch its answers with error handling
        let questionsWithAnswers = [];
        try {
          questionsWithAnswers = await Promise.all(
            response.data.map(async (question) => {
              if (!question || !question.id) {
                
                return null;
              }
              
              try {
                const answersResponse = await api.get(`/qa/answers/${question.id}`);
                return {
                  ...question,
                  answers: answersResponse.data || [],
                  status: answersResponse.data && answersResponse.data.length > 0 ? 'answered' : 'pending'
                };
              } catch (err) {
                
                return {
                  ...question,
                  answers: [],
                  status: 'pending'
                };
              }
            })
          ).then(results => results.filter(Boolean)); // Filter out any null values
        } catch (err) {
          
          // If Promise.all fails, we'll still have the questions without answers
          questionsWithAnswers = response.data.map(question => ({
            ...question,
            answers: [],
            status: 'pending'
          }));
        }
        
        // Sort questions by date (newest first)
        const sortedInquiries = questionsWithAnswers.sort(
          (a, b) => {
            try {
              return new Date(b.created_at) - new Date(a.created_at);
            } catch (err) {
              
              return 0; // Keep original order if there's an error
            }
          }
        );
        
        setInquiries(sortedInquiries);
      } catch (err) {
        
        setError('Failed to load your inquiries');
        if (showNotification) {
          showNotification('Failed to load your inquiries', 'error');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserInquiries();
  }, [currentUser]); // Removed api and showNotification from dependencies

  // Handle submitting a reply to an answer
  const handleSubmitReply = async (productId) => {
    // Validate input - prevent empty messages
    if (!replyText[productId] || !replyText[productId].trim()) {
      if (showNotification) {
        showNotification('Please enter a reply', 'error');
      }
      return;
    }
    
    // Check if user is logged in
    if (!currentUser) {
      toggleLoginPopup(true);
      if (showNotification) {
        showNotification('Please login to submit a reply', 'error');
      }
      return;
    }
    
    // Prevent multiple submissions while one is in progress
    if (submittingReplyIds[productId]) {
      return;
    }
    
    // Check if user has already submitted an inquiry for this product
    const existingInquiry = inquiries.find(inq => inq.product_id === productId);
    if (existingInquiry) {
      // Highlight existing inquiry and show notification
      highlightExistingInquiry(existingInquiry.id);
      
      if (showNotification) {
        showNotification('You have already made an inquiry for this product. Please wait for a response.', 'warning');
      }
      return;
    }
    
    try {
      // Set submitting state to true to prevent duplicate submissions
      setSubmittingReplyIds(prev => ({
        ...prev,
        [productId]: true
      }));
      
      // Submit the question directly with product_id
      const response = await api.post('/qa/questions', {
        product_id: productId,
        question: replyText[productId]
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      // Update the inquiries list with the new question
      const updatedInquiries = [...inquiries];
      updatedInquiries.unshift({
        ...response.data,
        answers: [],
        status: 'pending'
      });
      
      setInquiries(updatedInquiries);
      
      // Clear the reply text
      setReplyText(prev => ({
        ...prev,
        [productId]: ''
      }));
      
      if (showNotification) {
        showNotification('Your message has been sent', 'success');
      }
    } catch (err) {
      
      
      // Check for specific error about already submitted inquiry
      if (err.response?.data?.error === 'You have already submitted an inquiry for this product') {
        // Find the existing inquiry and scroll to it
        const existingInquiry = inquiries.find(inq => inq.product_id === productId);
        if (existingInquiry) {
          highlightExistingInquiry(existingInquiry.id);
        }
        
        if (showNotification) {
          showNotification('You have already made an inquiry for this product. Please wait for a response.', 'warning');
        }
      } else {
        const errorMessage = err.response?.data?.error || 'Failed to send your message';
        setError(errorMessage);
        if (showNotification) {
          showNotification(errorMessage, 'error');
        }
      }
    } finally {
      setSubmittingReplyIds(prev => ({
        ...prev,
        [productId]: false
      }));
    }
  };
  
  // Helper function to highlight existing inquiry
  const highlightExistingInquiry = (inquiryId) => {
    const inquiryElement = document.getElementById(`inquiry-${inquiryId}`);
    if (inquiryElement) {
      inquiryElement.scrollIntoView({ behavior: 'smooth' });
      // Add highlight effect
      inquiryElement.classList.add('bg-yellow-50');
      setTimeout(() => {
        inquiryElement.classList.remove('bg-yellow-50');
      }, 2000);
    }
  };
  
  // Toggle dropdown menu for edit/delete options
  const toggleDropdown = (dropdownId) => {
    setActiveDropdown(activeDropdown === dropdownId ? null : dropdownId);
  };
  
  // Handle editing an inquiry
  const handleEditInquiry = (inquiry) => {
    // Only allow editing pending inquiries
    if (inquiry.status !== 'pending') {
      showNotification('You cannot edit inquiries that have been answered', 'error');
      return;
    }
    
    setEditingInquiry(inquiry.id);
    setEditText(inquiry.question);
    setActiveDropdown(null); // Close dropdown
  };
  
  // Save edited inquiry
  const handleSaveEdit = async (inquiryId) => {
    // Check if the inquiry is pending before allowing edit
    const inquiryToEdit = inquiries.find(inq => inq.id === inquiryId);
    
    if (!inquiryToEdit) {
      showNotification('Inquiry not found', 'error');
      return;
    }
    
    if (inquiryToEdit.status !== 'pending') {
      showNotification('You cannot edit inquiries that have been answered', 'error');
      return;
    }
    
    if (!editText.trim()) {
      showNotification('Question cannot be empty', 'error');
      return;
    }
    
    if (editText.trim() === inquiryToEdit.question) {
      // No changes made, just cancel edit mode
      setEditingInquiry(null);
      setEditText('');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Using POST instead of PUT since the server doesn't have a PUT endpoint
      const response = await api.post(`/qa/questions`, {
        product_id: inquiryToEdit.product_id,
        question: editText.trim(),
        update_id: inquiryId // Adding this to identify it's an update operation
      });
      
      if (response.data) {
        // Update the inquiry in the state
        const updatedInquiries = inquiries.map(inq => 
          inq.id === inquiryId ? { ...inq, question: editText.trim() } : inq
        );
        
        setInquiries(updatedInquiries);
        showNotification('Your question has been updated', 'success');
      }
    } catch (err) {
      
      const errorMessage = err.response?.data?.error || 'Failed to update your question';
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
      setEditingInquiry(null);
      setEditText('');
    }
  };
  
  // Cancel editing
  const handleCancelEdit = () => {
    setEditingInquiry(null);
    setEditText('');
  };
  
  // Handle deleting an inquiry
  const handleDeleteInquiry = async (inquiryId) => {
    // Check if the inquiry is pending before allowing deletion
    const inquiryToDelete = inquiries.find(inq => inq.id === inquiryId);
    
    if (!inquiryToDelete) {
      showNotification('Inquiry not found', 'error');
      return;
    }
    
    if (inquiryToDelete.status !== 'pending') {
      showNotification('You cannot delete inquiries that have been answered', 'error');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this inquiry?')) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      await api.delete(`/qa/questions/${inquiryId}`);
      
      // Remove the inquiry from the state
      const updatedInquiries = inquiries.filter(inq => inq.id !== inquiryId);
      setInquiries(updatedInquiries);
      
      // If we're filtering by this product and there are no more inquiries for it,
      // clear the product filter
      if (filterProductId) {
        const deletedInquiry = inquiries.find(inq => inq.id === inquiryId);
        if (deletedInquiry && deletedInquiry.product_id === filterProductId) {
          const remainingInquiries = updatedInquiries.filter(inq => inq.product_id === filterProductId);
          if (remainingInquiries.length === 0) {
            clearProductFilter();
          }
        }
      }
      
      showNotification('Your inquiry has been successfully deleted', 'success');
    } catch (err) {
      
      const errorMessage = err.response?.data?.error || 'Failed to delete your inquiry';
      showNotification(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
      setActiveDropdown(null); // Close dropdown
    }
  };

  // Clear product filter
  const clearProductFilter = () => {
    setFilterProductId(null);
    setProductDetails(null);
    navigate('/my-inquiries');
  };

  // Filter inquiries based on status and product_id
  const filteredInquiries = inquiries.filter(inquiry => {
    if (!inquiry) return false;
    
    // First filter by status
    const statusMatch = filterStatus === 'all' || inquiry.status === filterStatus;
    
    // Then filter by product_id if applicable
    const productMatch = !filterProductId || inquiry.product_id === filterProductId;
    
    return statusMatch && productMatch;
  });

  // Sort inquiries based on sort order
  const sortedAndFilteredInquiries = [...filteredInquiries].sort((a, b) => {
    // Ensure both objects have valid created_at dates
    if (!a.created_at) return 1;  // Push items without dates to the end
    if (!b.created_at) return -1; // Push items without dates to the end
    
    try {
      if (sortOrder === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else {
        return new Date(a.created_at) - new Date(b.created_at);
      }
    } catch (err) {
      
      return 0; // Keep original order if there's an error
    }
  });

  // Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      };
      return new Date(dateString).toLocaleString(undefined, options);
    } catch (err) {
      
      return 'Invalid date';
    }
  };
  
  // Add CSS for highlight effect and chat animations
  useEffect(() => {
    // Add a style tag for the highlight animation if it doesn't exist
    if (!document.getElementById('chat-styles')) {
      const style = document.createElement('style');
      style.id = 'chat-styles';
      style.innerHTML = `
        .bg-yellow-50 {
          background-color: #fefce8;
          transition: background-color 1s ease;
        }
        
        .chat-bubble-user {
          border-radius: 18px 18px 4px 18px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          word-break: break-word;
        }
        
        .chat-bubble-seller {
          border-radius: 18px 18px 18px 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
          word-break: break-word;
        }
        
        .typing-indicator span {
          width: 6px;
          height: 6px;
          margin: 0 1px;
          background-color: #9ca3af;
          border-radius: 50%;
          display: inline-block;
          animation: typing 1.4s infinite ease-in-out both;
        }
        
        @media (min-width: 640px) {
          .typing-indicator span {
            width: 8px;
            height: 8px;
          }
        }
        
        .typing-indicator span:nth-child(1) {
          animation-delay: 0s;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes typing {
          0%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
        
        .message-status-icon {
          transition: all 0.3s ease;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // Clean up the style tag when component unmounts
      const styleTag = document.getElementById('chat-styles');
      if (styleTag) {
        styleTag.remove();
      }
    };
  }, []);
  
  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    
    // Also ensure the chat container scrolls to bottom when messages change
    if (chatContainerRef.current) {
      const scrollHeight = chatContainerRef.current.scrollHeight;
      chatContainerRef.current.scrollTop = scrollHeight;
    }
  }, [inquiries, filterProductId, sortedAndFilteredInquiries.length]);
  
  // Simulate typing indicator and message status
  useEffect(() => {
    // Simulate typing indicator when a new product is selected
    if (filterProductId) {
      setIsTyping(true);
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      
      return () => clearTimeout(typingTimeout);
    }
  }, [filterProductId]);
  
  // Update message status for sent messages
  useEffect(() => {
    const updateMessageStatus = async () => {
      if (!inquiries.length) return;
      
      // Simulate message status updates
      const newMessageStatus = {};
      
      inquiries.forEach(inquiry => {
        // Set initial status as 'sent'
        newMessageStatus[inquiry.id] = 'sent';
        
        // After 1 second, update to 'delivered'
        setTimeout(() => {
          setMessageStatus(prev => ({
            ...prev,
            [inquiry.id]: 'delivered'
          }));
        }, 1000);
        
        // After 2 seconds, update to 'read' if there are answers
        if (inquiry.answers && inquiry.answers.length > 0) {
          setTimeout(() => {
            setMessageStatus(prev => ({
              ...prev,
              [inquiry.id]: 'read'
            }));
          }, 2000);
        }
      });
      
      setMessageStatus(newMessageStatus);
    };
    
    updateMessageStatus();
  }, [inquiries]);

  if (loading) {
    return (
      <div className="py-4 sm:py-8">
        <div className="container max-w-4xl mx-auto px-2 sm:px-4">
          <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6">My Inquiries</h1>
          <div className="flex justify-center p-6 sm:p-12">
            <Loading size="lg" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">  
      <div className="container mx-auto px-2 sm:px-4 max-w-6xl">  
        {/* Order Form Modal */}
        {orderModalOpen && selectedQuestion && (
          <OrderFormModal
            isOpen={orderModalOpen}
            onClose={() => setOrderModalOpen(false)}
            product={productDetails || { id: selectedQuestion.product_id, name: 'Product' }}
            questionData={selectedQuestion}
          />
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <FaQuestionCircle className="mr-2 text-primary-500" />
            My Inquiries
          </h1>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <select
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="answered">Answered</option>
            </select>
            <select
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-auto"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Product List Sidebar - Hidden on mobile when a product is selected */}
          <div className={`${filterProductId ? 'hidden lg:block' : 'block'} bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] lg:h-[calc(100vh-220px)] overflow-y-auto`}>
            <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Products</h2>
            {/* Group inquiries by product */}
            {Array.from(new Set(inquiries.map(inq => inq.product_id))).map(productId => {
              const productInquiries = inquiries.filter(inq => inq.product_id === productId);
              const latestInquiry = productInquiries[0];
              
              return (
                <div
                  key={productId}
                  className={`p-2 sm:p-3 rounded-lg mb-2 sm:mb-3 cursor-pointer transition-all ${
                    filterProductId === productId ? 'bg-primary-50 border-primary-500' : 'hover:bg-gray-50'
                  } border`}
                  onClick={() => {
                    setFilterProductId(productId);
                    fetchProductDetails(productId);
                  }}
                >
                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                    <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                      {latestInquiry?.product_name || 'Product'}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-full ${
                      productInquiries.some(inq => inq.status === 'pending')
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {productInquiries.some(inq => inq.status === 'pending') ? 'Pending' : 'Answered'}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {latestInquiry?.question || 'No messages yet'}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Chat Window - Full width on mobile when a product is selected */}
          <div className={`${filterProductId ? 'col-span-1 lg:col-span-2' : 'col-span-1 lg:col-span-2'} bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] lg:h-[calc(100vh-220px)]`}>
            {filterProductId ? (
              <>
                {/* Chat Header */}
                <div className="p-3 sm:p-4 border-b flex items-center justify-between">
                  <div className="flex items-center">
                    <button
                      onClick={clearProductFilter}
                      className="mr-2 sm:mr-3 text-gray-500 hover:text-gray-700 block lg:hidden"
                    >
                      <FaArrowLeft size={16} />
                    </button>
                    <div>
                      <h2 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {productDetails?.name || 'Product Discussion'}
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {inquiries.filter(inq => inq.product_id === filterProductId).length} messages
                      </p>
                    </div>
                  </div>
                  <Link
                    to={`/products/${filterProductId}`}
                    className="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium"
                  >
                    View Product
                  </Link>
                </div>

                {/* Chat Messages */}
                <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[calc(100vh-300px)] sm:max-h-[calc(100vh-320px)] lg:max-h-[calc(100vh-340px)]">
                  <AnimatePresence>
                    {inquiries
                      .filter(inq => inq.product_id === filterProductId)
                      .sort((a, b) => sortOrder === 'newest' ? 
                        new Date(b.created_at) - new Date(a.created_at) : 
                        new Date(a.created_at) - new Date(b.created_at))
                      .map(inquiry => (
                        <motion.div 
                          id={`inquiry-${inquiry.id}`} 
                          key={inquiry.id} 
                          className="space-y-3 sm:space-y-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Question */}
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center shadow-md">
                                <FaUser className="text-primary-600" size={14} />
                              </div>
                            </div>
                            <div className="flex-1">
                              <motion.div 
                                className="bg-primary-50 chat-bubble-user p-2 sm:p-4 relative"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                              >
                                <div className="flex items-center justify-between mb-1 sm:mb-2">
                                  <span className="font-medium text-gray-900 text-sm sm:text-base">You</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <FaCalendarAlt className="mr-1" size={10} />
                                      {formatDateTime(inquiry.created_at)}
                                    </span>
                                    {/* Edit and Delete dropdown - Only show for pending inquiries */}
                                    {inquiry.status === 'pending' && (
                                      <div className="relative">
                                        <button 
                                          onClick={() => toggleDropdown(`inquiry-${inquiry.id}`)}
                                          className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full hover:bg-gray-100"
                                          aria-label="More options"
                                        >
                                          <FaEllipsisH size={12} />
                                        </button>
                                        {activeDropdown === `inquiry-${inquiry.id}` && (
                                          <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100 text-left">
                                            <button
                                              onClick={() => handleEditInquiry(inquiry)}
                                              className="block w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                            >
                                              <FaEdit className="mr-2" size={12} /> Edit
                                            </button>
                                            <button
                                              onClick={() => handleDeleteInquiry(inquiry.id)}
                                              className="block w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-gray-100 flex items-center"
                                            >
                                              <FaTrash className="mr-2" size={12} /> Delete
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {editingInquiry === inquiry.id ? (
                                  <div className="mt-1 mb-2">
                                    <textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="w-full border border-gray-300 rounded-md p-2 text-xs sm:text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                      rows="3"
                                    />
                                    <div className="flex justify-end mt-2 space-x-2">
                                      <button
                                        onClick={handleCancelEdit}
                                        className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center"
                                        disabled={isSubmitting}
                                      >
                                        <FaTimes className="mr-1" size={10} /> Cancel
                                      </button>
                                      <button
                                        onClick={() => handleSaveEdit(inquiry.id)}
                                        className="px-2 py-1 text-xs bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors flex items-center"
                                        disabled={isSubmitting}
                                      >
                                        {isSubmitting ? (
                                          <FaSpinner className="mr-1 animate-spin" size={10} />
                                        ) : (
                                          <FaSave className="mr-1" size={10} />
                                        )}
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">{inquiry.question}</p>
                                )}
                                <div className="flex justify-end items-center text-xs text-gray-400 mt-1">
                                  {messageStatus[inquiry.id] === 'sent' && (
                                    <span className="flex items-center message-status-icon">
                                      <FaCheck size={10} className="mr-1" /> Sent
                                    </span>
                                  )}
                                  {messageStatus[inquiry.id] === 'delivered' && (
                                    <span className="flex items-center text-blue-400 message-status-icon">
                                      <FaCheckDouble size={10} className="mr-1" /> Delivered
                                    </span>
                                  )}
                                  {messageStatus[inquiry.id] === 'read' && (
                                    <span className="flex items-center text-green-500 message-status-icon">
                                      <FaCheckDouble size={10} className="mr-1" /> Read
                                    </span>
                                  )}
                                </div>
                              </motion.div>
                            </div>
                          </div>

                          {/* Answers */}
                          {inquiry.answers && inquiry.answers.map(answer => (
                            <motion.div 
                              key={answer.id} 
                              className="flex items-start space-x-2 sm:space-x-3 ml-4 sm:ml-8"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                            >
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center shadow-md">
                                  <FaUser className="text-green-600" size={14} />
                                </div>
                              </div>
                              <div className="flex-1">
                                <motion.div 
                                  className="bg-green-50 chat-bubble-seller p-2 sm:p-4 relative"
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
                                >
                                  <div className="flex items-center justify-between mb-1 sm:mb-2">
                                    <span className="font-medium text-gray-900 flex items-center text-xs sm:text-sm">
                                      Seller
                                      <span className="ml-1 sm:ml-2 bg-green-100 text-green-800 text-xs px-1 sm:px-2 py-0.5 rounded-full">Support</span>
                                    </span>
                                    <span className="text-xs text-gray-500 flex items-center">
                                      <FaCalendarAlt className="mr-1" size={10} />
                                      {formatDateTime(answer.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-700">{answer.answer}</p>
                                  
                                  {/* Order Now Button - Only shown to the question asker when there's a seller reply */}
                                  <div className="mt-3">
                                    <OrderNowButton
                                      isVisible={true} 
                                      onClick={() => {
                                        setSelectedQuestion(inquiry);
                                        setOrderModalOpen(true);
                                      }} 
                                    />
                                  </div>
                                </motion.div>
                              </div>
                            </motion.div>
                          ))}
                          
                          {/* Show typing indicator if this is the most recent inquiry and has no answers */}
                          {isTyping && 
                           inquiry === inquiries.filter(inq => inq.product_id === filterProductId)[0] && 
                           (!inquiry.answers || inquiry.answers.length === 0) && (
                            <motion.div 
                              className="flex items-start space-x-2 sm:space-x-3 ml-4 sm:ml-8"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center">
                                  <FaUser className="text-green-600" size={14} />
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="bg-green-50 chat-bubble-seller p-2 sm:p-3 inline-block">
                                  <div className="typing-indicator px-1 sm:px-2 py-1">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                    ))}
                    </AnimatePresence>
                </div>

                {/* Chat Input */}
                <div className="p-3 sm:p-4 border-t">
                  <div className="flex space-x-2 sm:space-x-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={replyText[filterProductId] || ''}
                        onChange={(e) => setReplyText(prev => ({
                          ...prev,
                          [filterProductId]: e.target.value
                        }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmitReply(filterProductId);
                          }
                        }}
                        placeholder="Type your message..."
                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-sm"
                      />
                      <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 flex space-x-1 sm:space-x-2 text-gray-400">
                        <button className="hover:text-primary-500 transition-colors">
                          <FaEllipsisH size={14} />
                        </button>
                      </div>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => handleSubmitReply(filterProductId)}
                      disabled={submittingReplyIds[filterProductId]}
                      className="bg-primary-600 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 shadow-md flex items-center justify-center"
                    >
                      {submittingReplyIds[filterProductId] ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaPaperPlane size={14} />
                      )}
                    </motion.button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 sm:mt-2 text-center">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                </div>
                
                {/* Invisible element to scroll to */}
                <div ref={messagesEndRef} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center">
                  <FaQuestionCircle className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No Chat Selected</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Select a product from the list to view the conversation
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div> 
    </div>
    
  );
};

export default MyInquiries;
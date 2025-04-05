import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../../config/env';
import { FaReply, FaTrash, FaEye, FaCheckCircle, FaTimesCircle, FaSearch, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import RTQResponseForm from '../../components/admin/RTQResponseForm';

const RTQManagement = () => {
  const { currentUser, showNotification } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rtqRequests, setRtqRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'answered'

  // Create axios instance with auth header
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

  // Check if user is admin or seller
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'seller')) {
      showNotification('Unauthorized access. Redirecting to home page.', 'error');
      navigate('/');
    }
  }, [currentUser, navigate, showNotification]);

  // Fetch all RTQ requests
  useEffect(() => {
    const fetchRTQRequests = async () => {
      try {
        setLoading(true);
        // Get all questions that start with "Quote Request for"
        const response = await api.get('/qa/questions');
        
        // Filter for RTQ requests only
        const rtqData = response.data.filter(q => 
          q.question.startsWith('Quote Request for')
        );
        
        // Get answers for each question
        const requestsWithAnswers = await Promise.all(rtqData.map(async (request) => {
          const answersResponse = await api.get(`/qa/answers/${request.id}`);
          return {
            ...request,
            answers: answersResponse.data || [],
            hasAnswer: (answersResponse.data && answersResponse.data.length > 0)
          };
        }));
        
        setRtqRequests(requestsWithAnswers);
      } catch (error) {
        console.error('Error fetching RTQ requests:', error);
        showNotification('Failed to load quote requests', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRTQRequests();
  }, []);

  // Filter RTQ requests based on status
  const filteredRequests = rtqRequests.filter(request => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !request.hasAnswer;
    if (filter === 'answered') return request.hasAnswer;
    return true;
  });

  // Handle opening response modal
  const handleOpenResponseModal = (request) => {
    setSelectedRequest(request);
    setResponseModalOpen(true);
  };

  // Handle opening view details modal
  const handleOpenViewModal = (request) => {
    setSelectedRequest(request);
    setViewModalOpen(true);
  };

  // Handle deleting a request
  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this quote request?')) {
      try {
        await api.delete(`/qa/questions/${requestId}`);
        setRtqRequests(rtqRequests.filter(req => req.id !== requestId));
        showNotification('Quote request deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting request:', error);
        showNotification('Failed to delete quote request', 'error');
      }
    }
  };

  // Parse RTQ data from question string
  const parseRTQData = (questionText) => {
    try {
      const productLine = questionText.split('\n')[0];
      const productName = productLine.replace('Quote Request for ', '').split(' - Quantity:')[0];
      const quantityMatch = productLine.match(/Quantity: (\d+)/);
      const quantity = quantityMatch ? quantityMatch[1] : 'N/A';
      
      const customerSection = questionText.split('Customer Details:')[1].split('\n\nMessage:')[0];
      const nameMatch = customerSection.match(/Name: (.+)/);
      const emailMatch = customerSection.match(/Email: (.+)/);
      const phoneMatch = customerSection.match(/Phone: (.+)/);
      
      const name = nameMatch ? nameMatch[1] : 'N/A';
      const email = emailMatch ? emailMatch[1] : 'N/A';
      const phone = phoneMatch ? phoneMatch[1] : 'N/A';
      
      const messageMatch = questionText.match(/Message: ([\s\S]+)$/);
      const message = messageMatch ? messageMatch[1].trim() : 'N/A';
      
      return {
        productName,
        quantity,
        name,
        email,
        phone,
        message
      };
    } catch (error) {
      console.error('Error parsing RTQ data:', error);
      return {
        productName: 'Error parsing data',
        quantity: 'N/A',
        name: 'N/A',
        email: 'N/A',
        phone: 'N/A',
        message: 'Error parsing message'
      };
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Quote Request Management</h1>
      
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <h2 className="text-lg font-medium">Filter Requests:</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md ${filter === 'pending' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setFilter('answered')}
              className={`px-4 py-2 rounded-md ${filter === 'answered' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Answered
            </button>
          </div>
        </div>
        <div className="text-gray-600">
          Total: {rtqRequests.length} | Pending: {rtqRequests.filter(r => !r.hasAnswer).length} | Answered: {rtqRequests.filter(r => r.hasAnswer).length}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-lg text-gray-600">No quote requests found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => {
                  const rtqData = parseRTQData(request.question);
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {request.hasAnswer ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCheckCircle className="mr-1" /> Answered
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <FaTimesCircle className="mr-1" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(request.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{rtqData.name}</div>
                        <div className="text-sm text-gray-500">{rtqData.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rtqData.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {rtqData.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleOpenViewModal(request)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          {!request.hasAnswer && (
                            <button
                              onClick={() => handleOpenResponseModal(request)}
                              className="text-green-600 hover:text-green-900"
                              title="Respond"
                            >
                              <FaReply />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Response Modal */}
      {selectedRequest && (
        <RTQResponseForm 
          isOpen={responseModalOpen}
          onClose={() => {
            setResponseModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onSuccess={() => {
            // Update the request in the list to show it's been answered
            const updatedRequests = rtqRequests.map(req => 
              req.id === selectedRequest.id ? {...req, hasAnswer: true} : req
            );
            setRtqRequests(updatedRequests);
            setResponseModalOpen(false);
            setSelectedRequest(null);
          }}
        />
      )}
      
      {/* View Details Modal */}
      {selectedRequest && viewModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Quote Request Details</h2>
                <button 
                  onClick={() => {
                    setViewModalOpen(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </div>
              
              {(() => {
                const rtqData = parseRTQData(selectedRequest.question);
                return (
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h3 className="font-medium text-gray-700 mb-2">Request Information</h3>
                      <p className="text-sm text-gray-600">Submitted on {formatDate(selectedRequest.created_at)}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Status: {selectedRequest.hasAnswer ? (
                          <span className="text-green-600 font-medium">Answered</span>
                        ) : (
                          <span className="text-yellow-600 font-medium">Pending</span>
                        )}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Product Information</h3>
                      <p className="text-gray-800 font-medium">{rtqData.productName}</p>
                      <p className="text-gray-600">Quantity: {rtqData.quantity}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Customer Information</h3>
                      <p className="text-gray-800"><span className="font-medium">Name:</span> {rtqData.name}</p>
                      <p className="text-gray-800"><span className="font-medium">Email:</span> {rtqData.email}</p>
                      <p className="text-gray-800"><span className="font-medium">Phone:</span> {rtqData.phone}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Message</h3>
                      <p className="text-gray-800 whitespace-pre-line">{rtqData.message}</p>
                    </div>
                    
                    {selectedRequest.hasAnswer && selectedRequest.answers && selectedRequest.answers.length > 0 && (
                      <div>
                        <h3 className="font-medium text-gray-700 mb-2">Response</h3>
                        <div className="bg-blue-50 p-4 rounded-md">
                          <p className="text-gray-800 whitespace-pre-line">{selectedRequest.answers[0].answer}</p>
                          <p className="text-sm text-gray-600 mt-2">Responded on {formatDate(selectedRequest.answers[0].created_at)}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          setViewModalOpen(false);
                          setSelectedRequest(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Close
                      </button>
                      
                      {!selectedRequest.hasAnswer && (
                        <button
                          onClick={() => {
                            setViewModalOpen(false);
                            handleOpenResponseModal(selectedRequest);
                          }}
                          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Respond
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RTQManagement;
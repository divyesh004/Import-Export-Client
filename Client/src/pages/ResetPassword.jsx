import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaLock, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { resetPassword, showNotification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL on component mount
  useEffect(() => {
    // Clear previous states
    setError('');
    setSuccess('');
    
    try {
      // Check all possible token locations
      let resetToken = null;
      
      // 1. Check URL query parameters
      const searchParams = new URLSearchParams(location.search);
      resetToken = searchParams.get('token') || searchParams.get('type');
      
      // 2. Check URL path parameter
      if (!resetToken) {
        const pathSegments = location.pathname.split('/');
        if (pathSegments.length > 2 && pathSegments[1] === 'reset-password') {
          const tokenFromPath = pathSegments[pathSegments.length - 1];
          if (tokenFromPath !== 'reset-password') {
            resetToken = tokenFromPath;
          }
        }
      }
      
      // 3. Check URL hash fragment
      if (!resetToken) {
        const hash = location.hash.substring(1);
        const hashParams = new URLSearchParams(hash);
        resetToken = hashParams.get('token');
      }
      
      // Set token if found
      if (resetToken) {
        setToken(resetToken);
      } else {
        throw new Error('पासवर्ड रीसेट टोकन नहीं मिला। कृपया नया पासवर्ड रीसेट लिंक अनुरोध करें।');
      }
    } catch (err) {
      setError(err.message || 'अमान्य या अनुपलब्ध रीसेट टोकन। कृपया नया पासवर्ड रीसेट लिंक अनुरोध करें।');
    }
  }, [location]);

  // Reset password validation schema
  const resetPasswordSchema = Yup.object().shape({
    password: Yup.string()
      .min(8, 'पासवर्ड कम से कम 8 अक्षर का होना चाहिए')
      .matches(/[A-Z]/, 'पासवर्ड में कम से कम एक अपरकेस अक्षर होना चाहिए')
      .matches(/[a-z]/, 'पासवर्ड में कम से कम एक लोअरकेस अक्षर होना चाहिए')
      .matches(/[0-9]/, 'पासवर्ड में कम से कम एक नंबर होना चाहिए')
      .matches(/[^\w\s]/, 'पासवर्ड में कम से कम एक विशेष वर्ण होना चाहिए')
      .required('पासवर्ड आवश्यक है'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'पासवर्ड मेल नहीं खाते')
      .required('पासवर्ड की पुष्टि आवश्यक है')
  });

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      setIsLoading(true);
      
      if (!token) {
        throw new Error('अमान्य या अनुपलब्ध रीसेट टोकन');
      }
      
      await resetPassword(token, values.password);
      
      setSuccess('आपका पासवर्ड सफलतापूर्वक रीसेट कर दिया गया है!');
      showNotification('पासवर्ड रीसेट सफल!', 'success');
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      // User-friendly password reset error messages in Hindi
      let errorMessage = 'इस समय आपका पासवर्ड रीसेट करने में असमर्थ। कृपया पुनः प्रयास करें।';
      
      if (err.error) {
        if (err.error.includes('token') || err.error.includes('expired')) {
          errorMessage = 'आपका पासवर्ड रीसेट लिंक समाप्त हो गया है या अमान्य है। कृपया नया अनुरोध करें।';
        } else if (err.error.includes('password')) {
          errorMessage = 'आपका नया पासवर्ड आवश्यकताओं को पूरा नहीं करता है। कृपया एक मजबूत पासवर्ड चुनें।';
        }
      }
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="container max-w-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-4">अपना पासवर्ड रीसेट करें</h1>
          <p className="text-center text-gray-600 mb-8">
            अपने अकाउंट के लिए एक नया पासवर्ड बनाएं।
          </p>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-md flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 01-1-1v-4a1 1 0 112 0v4a1 1 0 01-1 1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 p-4 mb-6 rounded-md">
              <p>{success}</p>
              <p className="mt-2 text-sm">लॉगिन पेज पर रीडायरेक्ट कर रहे हैं...</p>
            </div>
          )}
          
          {token && !success && (
            <Formik
              initialValues={{ password: '', confirmPassword: '' }}
              validationSchema={resetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-4">
                    <label htmlFor="password" className="block text-gray-700 font-medium mb-2">नया पासवर्ड</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <Field
                        type={showPassword ? "text" : "password"}
                        name="password"
                        id="password"
                        className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="नया पासवर्ड दर्ज करें"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={togglePasswordVisibility}
                      >
                        {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="div" className="mt-1 text-red-600 text-sm" />
                    <p className="mt-1 text-xs text-gray-500">पासवर्ड में कम से कम 8 अक्षर, एक अपरकेस, एक लोअरकेस, एक नंबर और एक विशेष वर्ण होना चाहिए।</p>
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="confirmPassword" className="block text-gray-700 font-medium mb-2">नए पासवर्ड की पुष्टि करें</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <Field
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        id="confirmPassword"
                        className="pl-10 pr-10 w-full p-3 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                        placeholder="नए पासवर्ड की पुष्टि करें"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                      </button>
                    </div>
                    <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-red-600 text-sm" />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full bg-primary-600 text-white py-3 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isLoading ? 'पासवर्ड रीसेट कर रहे हैं...' : 'पासवर्ड रीसेट करें'}
                  </button>
                </Form>
              )}
            </Formik>
          )}
          
          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium">
              <FaArrowLeft className="mr-2" />
              साइन इन पर वापस जाएं
            </Link>
          </div>
          
          {!token && !error && (
            <div className="mt-4 text-center">
              <Link to="/forgot-password" className="text-primary-600 hover:text-primary-800 font-medium">
                नया पासवर्ड रीसेट लिंक प्राप्त करें
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
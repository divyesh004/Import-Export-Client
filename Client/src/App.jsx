import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import LoginPopup from './components/common/LoginPopup'

// Layouts
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Orders from './pages/Orders'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import UserProfile from './pages/UserProfile'
import MyInquiries from './pages/MyInquiries'
import AuthCallback from './pages/AuthCallback'
import RTQManagement from './pages/admin/RTQManagement'
import VerifyEmail from './pages/VerifyEmail'

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Role-based protected route component
const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, showNotification } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(currentUser.role)) {
    showNotification('You do not have permission to access this page', 'error');
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on user role
  if (currentUser.role === 'admin' ||currentUser.role === 'sub-admin') {
    // Redirect admin to admin dashboard
    window.location.href = 'https://import-export-admin-eta.vercel.app/';
    return null;
  } else if (currentUser.role === 'seller') {
    // Redirect seller to seller dashboard
    window.location.href = 'https://import-export-seller.vercel.app/';
    return null;
  }
  
  // Default redirect to home for other roles
  return <Navigate to="/" replace />;
};

function App() {
  const { showLoginPopup, toggleLoginPopup } = useAuth();
  
    return (
      <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* Login Popup */}
      <LoginPopup 
        isOpen={showLoginPopup} 
        onClose={() => toggleLoginPopup(false)} 
      />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          <Route path="/my-inquiries" element={
            <ProtectedRoute>
              <MyInquiries />
            </ProtectedRoute>
          } />
          <Route path="/admin/rtq" element={
            <RoleProtectedRoute allowedRoles={['admin', 'seller']}>
              <RTQManagement />
            </RoleProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <RoleBasedRedirect />
            </ProtectedRoute>
          } />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Add a route with token parameter */}
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
      </div>
  )
}

export default App

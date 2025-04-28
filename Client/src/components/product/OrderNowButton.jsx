import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart } from 'react-icons/fa';

/**
 * OrderNowButton Component
 * 
 * Animated button that appears after a seller has replied to a buyer's question
 * Uses Framer Motion for animations
 */
const OrderNowButton = ({ onClick, isVisible }) => {
  // Animation variants for the button
  const buttonVariants = {
    hidden: { 
      opacity: 0,
      y: 20,
      scale: 0.8
    },
    visible: { 
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15,
        delay: 0.2
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.95
    }
  };

  // Only render the button if it should be visible
  if (!isVisible) return null;

  return (
    <motion.div
      className="mt-4 flex justify-center"
      initial="hidden"
      animate="visible"
      variants={buttonVariants}
    >
      <motion.button
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 w-full md:w-auto"
        onClick={onClick}
        whileHover="hover"
        whileTap="tap"
      >
        <FaShoppingCart className="text-lg" />
        <span>Order Now</span>
      </motion.button>
    </motion.div>
  );
};

export default OrderNowButton;
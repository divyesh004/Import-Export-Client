import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * 
 * Automatically scrolls to top when route changes
 * Also provides smooth scrolling functionality throughout the app
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  // Scroll to top when route changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  // Add smooth scrolling to all anchor links
  useEffect(() => {
    // Function to handle smooth scrolling for anchor links
    const handleSmoothScroll = (e) => {
      // Only process anchor links that point to IDs on the page
      const href = e.currentTarget.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
          // Scroll to the element with smooth behavior
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without page reload
          window.history.pushState(null, '', href);
        }
      }
    };

    // Add event listeners to all anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
      link.addEventListener('click', handleSmoothScroll);
    });

    // Cleanup function to remove event listeners
    return () => {
      anchorLinks.forEach(link => {
        link.removeEventListener('click', handleSmoothScroll);
      });
    };
  }, [pathname]); // Re-run when pathname changes

  return null; // This component doesn't render anything
};

// Export a utility function for programmatic scrolling
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// Export a utility function for scrolling to a specific section
export const scrollToSection = (sectionRef, offset = 0) => {
  if (sectionRef && sectionRef.current) {
    const yPosition = sectionRef.current.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({
      top: yPosition,
      behavior: 'smooth'
    });
  }
};

export default ScrollToTop;
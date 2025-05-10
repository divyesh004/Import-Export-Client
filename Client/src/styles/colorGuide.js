/**
 * Flipkart-Inspired Color Palette
 * 
 * This file serves as a reference guide for the color palette used throughout the application.
 * Use these color references to maintain consistency in the UI.
 */

export const colorPalette = {
  // Primary Color - Flipkart Blue
  primary: {
    50: '#e6f0fd',
    100: '#cce0fb',
    200: '#99c2f7',
    300: '#66a3f3',
    400: '#3385ef',
    500: '#2874F0', // Flipkart Primary Blue
    600: '#1c5dcc',
    700: '#1547a3',
    800: '#0e317b',
    900: '#071a52',
    950: '#040f33',
  },
  
  // Secondary Color - Light Gray
  secondary: {
    50: '#FFFFFF', // White
    100: '#f5f7fa',
    200: '#ebeef3',
    300: '#dde3ec',
    400: '#b0b9c6',
    500: '#8896a6', // Secondary Gray
    600: '#5e6b7b',
    700: '#455163',
    800: '#323c4d',
    900: '#1f2937', // Text Color
    950: '#111827',
  },
  
  // Accent Color - Bright Orange
  accent: {
    50: '#fff5f0',
    100: '#ffede5',
    200: '#ffd9cc',
    300: '#ffc0a8',
    400: '#ff9466',
    500: '#ff6600', // Bright Orange
    600: '#e65c00',
    700: '#cc5200',
    800: '#a34200',
    900: '#7a3100',
    950: '#4d1f00',
  },
  
  // Success - Green
  success: {
    50: '#ecfef5',
    100: '#d1fddf',
    200: '#a3f9c0',
    300: '#6eeea0',
    400: '#34db7b', // Success Green
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },
  
  // Alert/Error - Flipkart Orange
  error: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#F09120', // Flipkart Orange
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407',
  }
};

/**
 * Usage Guide:
 * 
 * Primary (Flipkart Blue):
 * - Use for headers, logo, and key branding elements
 * - Main buttons should use primary-500 (#2874F0)
 * 
 * Accent (Bright Orange):
 * - Use for highlights, promotional elements, and interactive elements
 * - Accent color should be used sparingly to draw attention
 * 
 * Secondary (Light Gray):
 * - Use for subtitles, less important text, and UI elements
 * - Background should use secondary-50 (#FFFFFF) for a clean, professional feel
 * 
 * Success (Green):
 * - Use for success messages and positive indicators
 * 
 * Error/Alert (Flipkart Orange):
 * - Use for error messages, alerts, and promotional indicators
 * 
 * Text Colors:
 * - Primary text: secondary-900 (#1f2937)
 * - Secondary text: secondary-500 (#8896a6)
 * 
 * Accessibility:
 * - Ensure sufficient contrast between text and background colors
 * - Follow WCAG standards for accessibility
 */

// Common UI Element Color Mappings
export const uiColors = {
  // Buttons
  buttons: {
    primary: {
      bg: 'bg-primary-800',
      hover: 'hover:bg-primary-900',
      focus: 'focus:ring-primary-700',
      text: 'text-white'
    },
    secondary: {
      bg: 'bg-secondary-600',
      hover: 'hover:bg-secondary-700',
      focus: 'focus:ring-secondary-500',
      text: 'text-white'
    },
    accent: {
      bg: 'bg-accent-400',
      hover: 'hover:bg-accent-500',
      focus: 'focus:ring-accent-300',
      text: 'text-white'
    },
    success: {
      bg: 'bg-success-500',
      hover: 'hover:bg-success-600',
      focus: 'focus:ring-success-400',
      text: 'text-white'
    },
    error: {
      bg: 'bg-error-500',
      hover: 'hover:bg-error-600',
      focus: 'focus:ring-error-400',
      text: 'text-white'
    }
  },
  
  // Text
  text: {
    primary: 'text-secondary-900',
    secondary: 'text-secondary-500',
    accent: 'text-accent-400',
    success: 'text-success-500',
    error: 'text-error-500',
    light: 'text-white'
  },
  
  // Backgrounds
  backgrounds: {
    main: 'bg-secondary-50',
    card: 'bg-white',
    highlight: 'bg-primary-50',
    accent: 'bg-accent-50',
    success: 'bg-success-50',
    error: 'bg-error-50'
  },
  
  // Borders
  borders: {
    primary: 'border-primary-800',
    secondary: 'border-secondary-300',
    accent: 'border-accent-400',
    success: 'border-success-500',
    error: 'border-error-500'
  },
  
  // Icons
  icons: {
    primary: 'text-primary-800',
    secondary: 'text-secondary-500',
    accent: 'text-accent-400',
    success: 'text-success-500',
    error: 'text-error-500'
  }
};
# B2B Website Light Color Palette Guide

## Modern, Trustworthy & User-Friendly Color Scheme

This document provides guidance on the professional B2B color palette implemented throughout the website. The colors reflect reliability, clarity, and sophistication while maintaining a modern and engaging appearance.

## Color Palette

| Purpose | Color | Hex Code | Description |
|---------|-------|----------|-------------|
| Primary Color | Light Navy Blue | `#2c469f` | Used for headers, logo, and key branding |
| Accent Color | Lighter Sky Blue | `#38d2ff` | Used for highlights and interactive elements |
| Secondary Color | Lighter Cool Gray | `#8896a6` | Used for subtitles and less important text |
| Background | Lighter Gray | `#FAFBFC` | Maintains a clean, professional feel |
| Highlight | Lighter Emerald Green | `#34db7b` | Used for CTAs and success indicators |
| Alert/Error | Lighter Soft Red | `#ff7171` | Used for error messages and alerts |
| Text Color | Lighter Slate | `#1f2937` | Main text color for readability |

## Implementation Details

The color palette has been implemented in the following files:

1. `tailwind.config.js` - Contains the complete color palette configuration
2. `src/index.css` - Contains utility classes for buttons and UI elements
3. `src/styles/colorGuide.js` - Reference guide with usage examples

## Usage Guidelines

### Primary (Light Navy Blue)
- Use for headers, logo, and key branding elements
- Main buttons should use primary-800 (`#2c469f`)

### Accent (Lighter Sky Blue)
- Use for secondary buttons, highlights, and interactive elements
- Accent color should be used sparingly to draw attention

### Secondary (Lighter Cool Gray)
- Use for subtitles, less important text, and UI elements
- Background should use secondary-50 (`#FAFBFC`) for a clean, professional feel

### Success (Lighter Emerald Green)
- Use for CTAs, success messages, and positive indicators

### Error (Lighter Soft Red)
- Use for error messages, alerts, and negative indicators

### Text Colors
- Primary text: secondary-900 (`#1f2937`)
- Secondary text: secondary-500 (`#8896a6`)

## Accessibility

Ensure sufficient contrast between text and background colors by following WCAG standards for accessibility. The color combinations in this palette have been selected with accessibility in mind.

## Utility Classes

The following utility classes are available for use:

### Buttons
- `.btn-primary` - Navy blue buttons for primary actions
- `.btn-secondary` - Gray buttons for secondary actions
- `.btn-accent` - Sky blue buttons for highlighted actions
- `.btn-success` - Green buttons for positive actions

### Text
- `text-secondary-900` - Primary text color
- `text-secondary-500` - Secondary text color
- `text-accent-400` - Accent text color
- `text-success-500` - Success text color
- `text-error-500` - Error text color

### Backgrounds
- `bg-secondary-50` - Main background color
- `bg-white` - Card background color
- `bg-primary-50` - Highlight background color
- `bg-accent-50` - Accent background color
- `bg-success-50` - Success background color
- `bg-error-50` - Error background color

Refer to `src/styles/colorGuide.js` for more detailed usage examples and utility class mappings.
/**
 * 🇳🇵 Pickup Sports App - Nepal-Inspired Color Palette
 * Beautiful colors inspired by Nepal's flag - crimson red, deep blue, and pure white
 */

export const Colors = {
  // Primary Brand Colors - Nepal Crimson Red
  primary: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#dc143c', // Nepal crimson red - main brand color
    600: '#b91c1c',
    700: '#991b1b',
    800: '#7f1d1d',
    900: '#5f1a1a',
    950: '#450a0a',
  },

  // Secondary Colors - Nepal Deep Blue
  secondary: {
    50: '#f0f4ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#003893', // Nepal deep blue
    600: '#002d7a',
    700: '#002461',
    800: '#001d4d',
    900: '#001639',
    950: '#000f26',
  },

  // Success - Green for positive actions
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // Success green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  // Warning - Amber for caution
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b', // Warning amber
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  // Error - Red for errors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444', // Error red
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // Neutral Grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Sports-specific colors (Nepal-inspired)
  sports: {
    basketball: '#dc143c', // Nepal crimson
    soccer: '#22c55e',     // Green
    tennis: '#eab308',     // Yellow
    volleyball: '#003893', // Nepal blue
    baseball: '#dc143c',   // Nepal crimson
    football: '#003893',   // Nepal blue
  },

  // Nepal-specific colors
  nepal: {
    crimson: '#dc143c',    // Traditional Nepal crimson
    blue: '#003893',       // Traditional Nepal blue
    white: '#ffffff',      // Pure white
    gold: '#ffd700',       // For accents (inspired by Nepal's cultural elements)
  },

  // App-specific semantic colors
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    dark: '#111827',
  },

  text: {
    primary: '#111827',
    secondary: '#4b5563',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    muted: '#6b7280',
  },

  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },

  // Gradient combinations - Nepal-inspired
  gradients: {
    primary: ['#dc143c', '#b91c1c'], // Nepal crimson gradient
    secondary: ['#003893', '#002d7a'], // Nepal blue gradient
    success: ['#22c55e', '#15803d'], // Green gradient
    nepal: ['#dc143c', '#003893'], // Nepal flag colors
    himalayan: ['#003893', '#ffffff'], // Blue to white (like snow-capped mountains)
    everest: ['#ffffff', '#dc143c'], // White to crimson
    heritage: ['#dc143c', '#ffd700'], // Crimson to gold
  },

  // Shadow colors for depth
  shadow: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(0, 0, 0, 0.25)',
    colored: 'rgba(220, 20, 60, 0.2)', // Nepal crimson shadow
    blue: 'rgba(0, 56, 147, 0.2)', // Nepal blue shadow
  },
};

// Dark mode colors
export const DarkColors = {
  ...Colors,
  background: {
    primary: '#111827',
    secondary: '#1f2937',
    tertiary: '#374151',
    dark: '#000000',
  },
  text: {
    primary: '#f9fafb',
    secondary: '#d1d5db',
    tertiary: '#9ca3af',
    inverse: '#111827',
    muted: '#6b7280',
  },
  border: {
    light: '#374151',
    medium: '#4b5563',
    dark: '#6b7280',
  },
};

// Export default theme
export default Colors;

import { Colors, DarkColors } from './Colors';

/**
 * 🏃‍♂️ Pickup Sports App - Design System
 * Complete theme with typography, spacing, and component styles
 */

export const Theme = {
  colors: Colors,
  darkColors: DarkColors,

  // Typography scale
  typography: {
    // Font families
    fonts: {
      regular: 'System', // iOS: San Francisco, Android: Roboto
      medium: 'System',
      semibold: 'System',
      bold: 'System',
      // For custom fonts, add them here
      display: 'System', // For headers and display text
      mono: 'Menlo', // For code/numbers
    },

    // Font sizes (following iOS/Material Design scales)
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
    },

    // Line heights
    lineHeight: {
      tight: 1.2,
      snug: 1.3,
      normal: 1.4,
      relaxed: 1.5,
      loose: 1.6,
    },

    // Font weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  // Spacing scale (based on 4px grid)
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    9: 36,
    10: 40,
    11: 44,
    12: 48,
    14: 56,
    16: 64,
    20: 80,
    24: 96,
    28: 112,
    32: 128,
    36: 144,
    40: 160,
    44: 176,
    48: 192,
    52: 208,
    56: 224,
    60: 240,
    64: 256,
    72: 288,
    80: 320,
    96: 384,
  },

  // Border radius scale
  borderRadius: {
    none: 0,
    sm: 2,
    base: 4,
    md: 6,
    lg: 8,
    xl: 12,
    '2xl': 16,
    '3xl': 24,
    full: 9999,
  },

  // Component-specific styles
  components: {
    // Button styles
    button: {
      primary: {
        backgroundColor: Colors.primary[500],
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
        shadowColor: Colors.shadow.colored,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8, // Android shadow
      },
      secondary: {
        backgroundColor: Colors.secondary[500],
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: Colors.primary[500],
        borderWidth: 2,
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 16,
      },
    },

    // Card styles
    card: {
      default: {
        backgroundColor: Colors.background.primary,
        borderRadius: 16,
        padding: 20,
        shadowColor: Colors.shadow.medium,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      elevated: {
        backgroundColor: Colors.background.primary,
        borderRadius: 20,
        padding: 24,
        shadowColor: Colors.shadow.dark,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 12,
      },
    },

    // Input styles
    input: {
      default: {
        backgroundColor: Colors.background.secondary,
        borderColor: Colors.border.light,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
      },
      focused: {
        borderColor: Colors.primary[500],
        borderWidth: 2,
        shadowColor: Colors.primary[500],
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    },

    // Tab bar styles
    tabBar: {
      backgroundColor: Colors.background.primary,
      borderTopColor: Colors.border.light,
      borderTopWidth: 1,
      paddingBottom: 20, // For iPhone safe area
      shadowColor: Colors.shadow.medium,
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  // Animation timings
  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Screen dimensions helpers
  screen: {
    // Common breakpoints
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
};

// Sport-specific theme variations
export const SportThemes = {
  basketball: {
    ...Theme,
    colors: { ...Colors, primary: { ...Colors.primary, 500: Colors.sports.basketball } },
  },
  soccer: {
    ...Theme,
    colors: { ...Colors, primary: { ...Colors.primary, 500: Colors.sports.soccer } },
  },
  tennis: {
    ...Theme,
    colors: { ...Colors, primary: { ...Colors.primary, 500: Colors.sports.tennis } },
  },
  volleyball: {
    ...Theme,
    colors: { ...Colors, primary: { ...Colors.primary, 500: Colors.sports.volleyball } },
  },
};

export default Theme;

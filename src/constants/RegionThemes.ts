import { Colors } from './Colors';
import { Theme } from './Theme';

/**
 * 🇳🇵 Nepal Region-Specific Themes
 * Each geographical region has its own color personality
 */

// Himalaya Theme - Mountain Blues and Whites
export const HimalayaTheme = {
  ...Theme,
  colors: {
    ...Colors,
    primary: {
      ...Colors.secondary, // Use blue as primary for mountains
    },
    accent: '#ffffff', // Snow white
    background: {
      primary: '#f8fafc', // Light blue-gray like mountain mist
      secondary: '#f1f5f9',
      tertiary: '#e2e8f0',
    },
    gradients: {
      ...Colors.gradients,
      region: ['#003893', '#ffffff'], // Blue to white like Himalayan peaks
      accent: ['#ffffff', '#e2e8f0'], // Snow gradients
    },
  },
  identity: {
    name: 'Himalaya',
    nepaliName: 'हिमालय',
    icon: '⛰️',
    elevation: '4,000m+',
    climate: 'Alpine',
    mainSports: ['Trekking', 'Mountaineering', 'Rock Climbing', 'Skiing'],
  },
};

// Pahad Theme - Balanced Red and Blue
export const PahadTheme = {
  ...Theme,
  colors: {
    ...Colors,
    // Keep original Nepal colors as this is the cultural center
    background: {
      primary: '#ffffff',
      secondary: '#fef7f7', // Slight red tint
      tertiary: '#f3f4f6',
    },
    gradients: {
      ...Colors.gradients,
      region: ['#ffffff', '#dc143c'], // White to crimson like sunrise on hills
      accent: ['#dc143c', '#003893'], // Full Nepal flag gradient
    },
  },
  identity: {
    name: 'Pahad',
    nepaliName: 'पहाड',
    icon: '🏞️',
    elevation: '610-4,000m',
    climate: 'Temperate',
    mainSports: ['Football', 'Basketball', 'Tennis', 'Badminton'],
  },
};

// Terai Theme - Earth Greens and Blues
export const TeraiTheme = {
  ...Theme,
  colors: {
    ...Colors,
    primary: {
      ...Colors.success, // Use green as primary for fertile plains
    },
    secondary: {
      ...Colors.secondary, // Keep Nepal blue
    },
    accent: '#dc143c', // Nepal crimson as accent
    background: {
      primary: '#fefffe',
      secondary: '#f0fdf4', // Light green tint like fertile fields
      tertiary: '#f3f4f6',
    },
    gradients: {
      ...Colors.gradients,
      region: ['#22c55e', '#003893'], // Green to blue like fields to sky
      accent: ['#dc143c', '#22c55e'], // Crimson to green
    },
  },
  identity: {
    name: 'Terai',
    nepaliName: 'तराई',
    icon: '🌾',
    elevation: '60-610m',
    climate: 'Subtropical',
    mainSports: ['Cricket', 'Football', 'Athletics', 'Cycling'],
  },
};

// Region selector helper
export function getRegionTheme(region: 'himalaya' | 'pahad' | 'terai') {
  switch (region) {
    case 'himalaya':
      return HimalayaTheme;
    case 'pahad':
      return PahadTheme;
    case 'terai':
      return TeraiTheme;
    default:
      return PahadTheme; // Default to Pahad (cultural center)
  }
}

// Export all themes
export const RegionThemes = {
  himalaya: HimalayaTheme,
  pahad: PahadTheme,
  terai: TeraiTheme,
};

export default RegionThemes;

// Theme color definitions for dynamic accent colors
// Uses Tailwind v4's built-in color variables for consistency

export type AccentColor = 
  | 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone'
  | 'red' | 'orange' | 'amber' | 'yellow' | 'lime' 
  | 'green' | 'emerald' | 'teal' | 'cyan' | 'sky'
  | 'blue' | 'indigo' | 'violet' | 'purple' | 'fuchsia'
  | 'pink' | 'rose';

// Map of color names to their display names
export const accentColorLabels: Record<AccentColor, string> = {
  // Grays
  slate: 'Slate',
  gray: 'Gray',
  zinc: 'Zinc',
  neutral: 'Neutral',
  stone: 'Stone',
  // Colors
  red: 'Red',
  orange: 'Orange',
  amber: 'Amber',
  yellow: 'Yellow',
  lime: 'Lime',
  green: 'Green',
  emerald: 'Emerald',
  teal: 'Teal',
  cyan: 'Cyan',
  sky: 'Sky',
  blue: 'Blue',
  indigo: 'Indigo',
  violet: 'Violet',
  purple: 'Purple',
  fuchsia: 'Fuchsia',
  pink: 'Pink',
  rose: 'Rose',
};

// Color shades to use for light and dark themes
const LIGHT_SHADE = '500';
const DARK_SHADE = '500';
const LIGHT_SOFT_OPACITY = '10%';
const DARK_SOFT_OPACITY = '15%';
const MUTED_OPACITY = '60%';

export function applyAccentColor(colorName: AccentColor, isDark: boolean) {
  const shade = isDark ? DARK_SHADE : LIGHT_SHADE;
  const softOpacity = isDark ? DARK_SOFT_OPACITY : LIGHT_SOFT_OPACITY;
  
  // Use Tailwind's CSS variables directly
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  // Get the color value from Tailwind's variables
  const colorVar = `--color-${colorName}-${shade}`;
  const colorValue = computedStyle.getPropertyValue(colorVar);
  
  if (colorValue) {
    // Set the main accent color using Tailwind's variable
    root.style.setProperty('--accent', `var(${colorVar})`);
    root.style.setProperty('--accent-contrast', '#FFFFFF');
    
    // For soft and muted versions, use color-mix with the Tailwind variable
    root.style.setProperty('--accent-soft', `color-mix(in srgb, var(${colorVar}) ${softOpacity}, transparent)`);
    root.style.setProperty('--accent-muted', `color-mix(in srgb, var(${colorVar}) ${MUTED_OPACITY}, transparent)`);
    
    // Also update the primary color variables for compatibility
    root.style.setProperty('--primary', `var(${colorVar})`);
    root.style.setProperty('--ring', `var(${colorVar})`);
    
    // Update Tailwind v4 color variables
    root.style.setProperty('--color-primary', `var(${colorVar})`);
    root.style.setProperty('--color-accent', `var(${colorVar})`);
  } else {
    console.warn(`Color variable ${colorVar} not found in Tailwind theme`);
  }
}

// Get the default accent color
export function getDefaultAccentColor(): AccentColor {
  return 'blue';
}
// src/core/presentation/design-system.ts
// Design system tokens for the Sentient Dashboard

export interface DesignSystemTokens {
  colors: {
    primary: string
    secondary: string
    success: string
    warning: string
    error: string
    background: string
    foreground: string
    // ... other colors
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
    xxl: number
    // ... other spacing
  }
  borderRadius: {
    none: string
    sm: string
    md: string
    lg: string
    full: string
  }
  shadows: {
    sm: string
    md: string
    lg: string
  }
  motion: {
    springStiffness: number
    springDamping: number
    elasticEaseDuration: number
    // ... other motion-related tokens
  }
}

// Default design system tokens
export const tokens: DesignSystemTokens = {
  colors: {
    primary: '#2563EB', // blue-600
    secondary: '#10B981', // emerald-500
    success: '#10B981',
    warning: '#F59E0B', // amber-500
    error: '#EF4444', // red-500
    background: '#FFFFFF',
    foreground: '#111827', // gray-900
    // ... other colors can be added
  },
  spacing: {
    xs: 4,   // 0.5rem
    sm: 8,   // 0.75rem
    md: 12,  // 1rem
    lg: 16,  // 1.5rem
    xl: 20,  // 2.5rem
    xxl: 24, // 3rem
    // ...
  },
  borderRadius: {
    none: '0px',
    sm: '4px',   // 0.5rem
    md: '8px',   // 1rem
    lg: '12px',  // 1.5rem
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -5px rgba(0,0,0,0.1)',
  },
  motion: {
    springStiffness: 170, // stiffness for spring physics
    springDamping: 26,    // damping for spring physics
    elasticEaseDuration: 300, // duration in ms for elastic easing
    // ...
  },
};

// Helper function to get a token value (if needed for JS usage)
export const getToken = <T, K extends keyof DesignSystemTokens>(
  tokensObj: DesignSystemTokens,
  key: K,
  subKey?: keyof DesignSystemTokens[K]
): T => {
  if (subKey) {
    return tokensObj[key][subKey] as unknown as T;
  }
  return tokensObj[key] as unknown as T;
};
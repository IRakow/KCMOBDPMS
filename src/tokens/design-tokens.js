export const tokens = {
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
    xxxl: '64px'
  },
  
  colors: {
    light: {
      surface: '#ffffff',
      surfaceAlt: '#f8f9fa',
      surfaceHover: '#f3f4f6',
      brand: '#1e40af',
      brandHover: '#1d4ed8',
      textPrimary: '#111827',
      textSecondary: '#4b5563',
      textMuted: '#9ca3af',
      border: '#e5e7eb',
      borderLight: '#f3f4f6',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    },
    dark: {
      surface: '#0f172a',
      surfaceAlt: '#1e293b',
      surfaceHover: '#334155',
      brand: '#3b82f6',
      brandHover: '#2563eb',
      textPrimary: '#f9fafb',
      textSecondary: '#e5e7eb',
      textMuted: '#9ca3af',
      border: '#334155',
      borderLight: '#1e293b',
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    }
  },
  
  radius: {
    none: '0',
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '9999px'
  },
  
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
  },
  
  fontSizes: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px'
  },
  
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    base: '200ms ease-in-out',
    slow: '300ms ease-in-out'
  },
  
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    tooltip: 70
  }
};
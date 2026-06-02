/**
 * J-PDVE Conexiones Design Tokens
 *
 * Brand: Modern, Cinematic, Premium, Youth-Oriented
 * Colors: Blue #1565FF, Gold #FFB400, Black #050505, White #F5F7FA
 * Typography: Anton (headings), Montserrat (body)
 */

export const tokens = {
  // Spacing (8px grid)
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  // Border radius
  radius: {
    sm: '0.375rem', // 6px
    md: '0.625rem', // 10px (--radius)
    lg: '0.75rem', // 12px
    xl: '1rem', // 16px
    full: '9999px',
  },

  // Shadows (warm, not harsh)
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.03)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.03)',
    glow: '0 0 20px -5px hsl(var(--primary) / 0.15)',
  },

  // Animation durations
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slower: '500ms',
  },

  // Easing curves
  easing: {
    default: 'cubic-bezier(0.16, 1, 0.3, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Typography scale
  fontSize: {
    xs: '0.75rem', // 12px
    sm: '0.8125rem', // 13px
    base: '0.875rem', // 14px
    md: '1rem', // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem', // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
  },

  // Z-index scale
  zIndex: {
    dropdown: 50,
    sticky: 40,
    modal: 50,
    overlay: 40,
    toast: 60,
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
} as const;

// Status colors for badges
export const statusColors = {
  success:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200',
  warning:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
  error:
    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
  neutral:
    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-200',
} as const;

// Spiritual/warm accent gradients — J-PDVE Conexiones
export const gradients = {
  primary: 'bg-gradient-to-r from-[#1565FF] to-[#1E88E5]',
  gold: 'bg-gradient-to-r from-[#FFB400] to-[#FFC940]',
  warm: 'bg-gradient-to-r from-amber-500/10 to-orange-500/10',
  spiritual: 'bg-gradient-to-br from-[#1565FF]/5 via-purple-500/5 to-[#FFB400]/5',
  card: 'bg-gradient-to-b from-card to-card/80',
  hero: 'bg-gradient-to-br from-[#050505] via-[#0d1117] to-[#1565FF]/10',
} as const;

// J-PDVE Brand constants
export const brand = {
  name: 'J-PDVE Conexiones',
  colors: {
    blue: '#1565FF',
    gold: '#FFB400',
    black: '#050505',
    white: '#F5F7FA',
  },
  fonts: {
    heading: "'Anton', system-ui, sans-serif",
    body: "'Montserrat', system-ui, -apple-system, sans-serif",
  },
} as const;

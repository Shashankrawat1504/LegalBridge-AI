export const COLORS = {
  // Primary Indian Government Navy & Slate palette
  navyDark: '#0F172A',      // Slate 900 (Main text, dark header elements)
  navyGov: '#1E3A5F',       // Official Ministry Deep Navy
  navyMuted: '#2D4B73',     // Muted Navy for borders/accents
  navySubtle: '#0F172A0D',  // 5% alpha navy

  // Neutrals & Surfaces
  white: '#FFFFFF',
  surfaceLight: '#F8FAFC',  // Slate 50
  surfaceMuted: '#F1F5F9',  // Slate 100
  border: '#E2E8F0',        // Slate 200
  borderDark: '#CBD5E1',    // Slate 300

  // Text
  textDark: '#0F172A',      // Main headers & high-contrast titles
  textPrimary: '#1E293B',   // Slate 800 for primary body text
  textSecondary: '#334155', // Slate 700 for subtitles/secondary
  textMuted: '#64748B',     // Slate 500 for captions/metadata
  textInverse: '#FFFFFF',

  // Accents - Subtle Muted Gold / Amber strictly for CTAs & Highlights
  accentGold: '#D97706',      // Amber 600
  accentGoldDark: '#B45309',  // Amber 700
  accentGoldLight: '#FEF3C7', // Amber 100 (light badge/pill background)
  accentGoldBorder: '#FDE68A',// Amber 200

  // Status (Restrained, professional)
  statusSuccess: '#166534',
  statusSuccessBg: '#DCFCE7',
  statusAlert: '#991B1B',
  statusAlertBg: '#FEE2E2',

  // Gov National Flag accent subtle line (if used)
  govSaffron: '#FF9933',
  govWhite: '#FFFFFF',
  govGreen: '#138808',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12, // Maximum 12px as required
  full: 9999,
};

export const SHADOWS = {
  subtle: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  elevated: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
};

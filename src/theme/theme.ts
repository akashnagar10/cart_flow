export const theme = {
  colors: {
    bg: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#111827',
    muted: '#6B7280',
    border: '#E5E7EB',
    // Figma uses a "fresh green" primary for CTAs
    primary: '#55913D',
    primaryText: '#FFFFFF',
    danger: '#DC2626',
  },
  radii: {
    sm: 10,
    md: 14,
    lg: 18,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
  text: {
    h1: { fontSize: 22, fontWeight: '700' as const },
    h2: { fontSize: 18, fontWeight: '700' as const },
    body: { fontSize: 16, fontWeight: '400' as const },
    small: { fontSize: 13, fontWeight: '400' as const },
    label: { fontSize: 14, fontWeight: '600' as const },
  },
};


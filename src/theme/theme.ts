import { typography } from './typography';
import { palette } from './colors';

export const theme = {
  colors: {
    bg: palette.white,
    surface: palette.white,
    text: palette.gray900,
    muted: palette.gray700,
    border: palette.gray300,
    primary: palette.primaryGreen,
    primaryText: palette.white,
    danger: palette.dangerRed,
    accent: palette.accentOrange,
    error: palette.errorRed,
    infoBg: palette.infoBgBlue,
    infoText: palette.infoTextBlue,

    success: palette.successGreen,
    warningBg: palette.warnBg,
    warningBorder: palette.warnBorder,
    warningIcon: palette.warnIcon,
    couponBadge: palette.teal700,
    discountTag: palette.teal600,
    surfaceMuted: palette.gray100,
    cashBadgeBg: palette.gray50Blue,
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
  text: typography.text,
};


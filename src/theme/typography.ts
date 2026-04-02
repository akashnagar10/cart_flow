export const fonts = {
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semibold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
} as const;

export const typography = {
  fonts,
  text: {
    h1: { fontSize: 22, fontFamily: fonts.bold as string },
    h2: { fontSize: 18, fontFamily: fonts.bold as string, fontWeight: '700' },
    body: { fontSize: 16, fontFamily: fonts.regular as string },
    small: { fontSize: 13, fontFamily: fonts.regular as string },
    label: { fontSize: 16, fontFamily: fonts.semibold as string, fontWeight: '700' },
  },
} as const;


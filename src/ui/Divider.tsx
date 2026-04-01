import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function Divider({ v = 12 }: { v?: number }) {
  const t = useTheme();
  return <View style={{ height: 1, backgroundColor: t.colors.border, marginVertical: v }} />;
}


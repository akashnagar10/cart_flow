import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  const t = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: t.colors.surface,
          borderColor: t.colors.border,
          borderRadius: t.radii.lg,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    padding: 14,
  },
});


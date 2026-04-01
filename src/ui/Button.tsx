import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function Button({
  label,
  onPress,
  disabled,
  variant = 'primary',
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
  style?: ViewStyle;
}) {
  const t = useTheme();

  const bg =
    variant === 'primary'
      ? t.colors.primary
      : variant === 'danger'
        ? t.colors.danger
        : 'transparent';
  const border =
    variant === 'ghost' ? { borderWidth: 1, borderColor: t.colors.border } : undefined;
  const textColor =
    variant === 'primary' ? t.colors.primaryText : variant === 'danger' ? '#FFFFFF' : t.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        border,
        {
          backgroundColor: bg,
          opacity: disabled ? 0.45 : pressed ? 0.85 : 1,
          borderRadius: t.radii.md,
        },
        style,
      ]}>
      <Text style={[t.text.label, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


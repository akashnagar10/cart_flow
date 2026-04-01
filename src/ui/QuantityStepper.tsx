import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export function QuantityStepper({
  value,
  onDec,
  onInc,
  min = 1,
  max = 99,
}: {
  value: number;
  onDec: () => void;
  onInc: () => void;
  min?: number;
  max?: number;
}) {
  const t = useTheme();
  const decDisabled = value <= min;
  const incDisabled = value >= max;

  return (
    <View
      style={[
        styles.wrap,
        { borderColor: t.colors.border, borderRadius: t.radii.md },
      ]}>
      <StepButton label="−" onPress={onDec} disabled={decDisabled} />
      <Text style={[t.text.label, { minWidth: 22, textAlign: 'center', color: t.colors.text }]}>
        {value}
      </Text>
      <StepButton label="+" onPress={onInc} disabled={incDisabled} />
    </View>
  );
}

function StepButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { opacity: disabled ? 0.35 : pressed ? 0.65 : 1 },
      ]}>
      <Text style={[t.text.h2, { color: t.colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 8,
    height: 40,
    gap: 10,
  },
  btn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


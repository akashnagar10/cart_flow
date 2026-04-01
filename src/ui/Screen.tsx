import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

export function Screen({
  children,
  padded = true,
  scroll = false,
  footer,
  overlay,
}: {
  children: React.ReactNode;
  padded?: boolean;
  scroll?: boolean;
  footer?: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const t = useTheme();

  const contentStyle: ViewStyle = {
    paddingHorizontal: padded ? t.spacing.lg : 0,
    paddingTop: padded ? t.spacing.lg : 0,
    paddingBottom: padded ? t.spacing.xl : 0,
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.colors.bg, paddingBottom: insets.bottom }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
      {overlay ? <View pointerEvents="box-none" style={styles.overlay}>{overlay}</View> : null}
      {footer ? <View style={[styles.footer, { paddingHorizontal: t.spacing.lg }]}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  footer: { paddingTop: 12, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth },
});


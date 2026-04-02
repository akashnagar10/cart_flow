import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { palette } from '../theme/colors';

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
  useSafeAreaInsets();
  const t = useTheme();

  const FOOTER_ESTIMATED_HEIGHT = 140;

  const contentStyle: ViewStyle = {
    paddingHorizontal: padded ? t.spacing.lg : 0,
    paddingTop: padded ? t.spacing.lg : 0,
    paddingBottom: padded ? t.spacing.xl + (footer ? FOOTER_ESTIMATED_HEIGHT : 0) : 0,
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.colors.bg }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={contentStyle} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>{children}</View>
      )}
      {overlay ? <View pointerEvents="box-none" style={styles.overlay}>{overlay}</View> : null}
      {footer ? (
        <View
          style={[
            styles.footer
          ]}>
          {footer}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    shadowColor: palette.black,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
});


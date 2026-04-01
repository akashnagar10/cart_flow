import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import DiscountTag from './DiscountTag';
import { usdToInr, formatMoney } from '../state/money';
import { useTheme } from '../theme/ThemeContext';

export function ProductCard({
  title,
  subtitle,
  priceUsd,
  discountPct,
  imageUrl,
  onPress,
  ctaLabel = 'Add',
  onCtaPress,
}: {
  title: string;
  subtitle?: string;
  priceUsd: number;
  discountPct?: number;
  imageUrl: string;
  onPress?: () => void;
  ctaLabel?: string;
  onCtaPress?: () => void;
}) {
  const t = useTheme();
  const price = usdToInr(priceUsd);
  const hasDiscount = typeof discountPct === 'number' && discountPct > 0;
  const mrp = hasDiscount ? price / (1 - Math.min(90, discountPct) / 100) : price;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}>
      <View style={[styles.card, { borderColor: t.colors.border, backgroundColor: t.colors.surface, borderRadius: t.radii.lg }]}>
        {hasDiscount ? (
          <View style={styles.badge}>
            <DiscountTag value={Math.round(discountPct ?? 0)} width={26} height={35} color="#2F6D86" />
          </View>
        ) : null}

        <Image source={{ uri: imageUrl }} style={styles.img} resizeMode="contain" />

        <View style={{ flex: 1, paddingTop: 10, justifyContent: 'space-between' }}>
          <View>
            {subtitle ? (
              <Text style={[t.text.small, { color: t.colors.muted }]} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            <Text style={[t.text.label, { color: t.colors.text }]} numberOfLines={2}>
              {title}
            </Text>

            <View style={{ height: 8 }} />

            <View style={styles.priceRow}>
              <Text style={[t.text.label, { color: t.colors.text }]}>{formatMoney(price)}</Text>
              {hasDiscount ? (
                <Text style={[t.text.small, { color: t.colors.muted, textDecorationLine: 'line-through' }]}>
                  {formatMoney(mrp)}
                </Text>
              ) : null}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={onCtaPress ?? onPress}
            style={({ pressed }) => [
              styles.cta,
              { backgroundColor: t.colors.primary, borderRadius: t.radii.md, opacity: pressed ? 0.85 : 1 },
            ]}>
            <Text style={[t.text.label, { color: t.colors.primaryText }]}>{ctaLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 12,
    minHeight: 170,
    width: 150,
    height: 250,
    // maxWidth: 150,
  },
  img: { width: '100%', height: 78 },
  badge: {
    position: 'absolute',
    left: 10,
    top: 10,
    zIndex: 2,
  },
  priceRow: { flexDirection: 'row', gap: 8, alignItems: 'baseline' },
  cta: { height: 36, alignItems: 'center', justifyContent: 'center' },
});


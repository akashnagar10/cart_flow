import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../state/money';
import { CartItem } from '../state/types';
import { useTheme } from '../theme/ThemeContext';
import { QuantityStepper } from '../ui/QuantityStepper';

export function CartItemRow({
  item,
  onInc,
  onDec,
  onRemove,
}: {
  item: CartItem;
  onInc: () => void;
  onDec: () => void;
  onRemove: () => void;
}) {
  const t = useTheme();
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={[t.text.label, { color: t.colors.text }]}>{item.title}</Text>
        {item.subtitle ? (
          <Text style={[t.text.small, { color: t.colors.muted, marginTop: 2 }]}>
            {item.subtitle}
          </Text>
        ) : null}
        <Text style={[t.text.small, { color: t.colors.muted, marginTop: 8 }]}>
          {formatMoney(item.unitPrice)} each
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[t.text.label, { color: t.colors.text }]}>
          {formatMoney(lineTotal)}
        </Text>
        <View style={{ height: 10 }} />
        <QuantityStepper value={item.quantity} min={0} onDec={onDec} onInc={onInc} />
        <Pressable
          accessibilityRole="button"
          onPress={onRemove}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginTop: 10 }]}>
          <Text style={[t.text.small, { color: t.colors.danger, textAlign: 'right' }]}>
            Remove
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  right: { alignItems: 'flex-end' },
});


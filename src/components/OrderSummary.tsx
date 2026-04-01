import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { formatMoney } from '../state/money';
import {
  selectDiscountAmount,
  selectShippingFee,
  selectSubtotal,
  selectTax,
  selectTotal,
} from '../state/selectors';
import { CartState } from '../state/types';
import { useTheme } from '../theme/ThemeContext';
import { Divider } from '../ui/Divider';

export function OrderSummary({ state }: { state: CartState }) {
  const t = useTheme();
  const subtotal = selectSubtotal(state);
  const discount = selectDiscountAmount(state);
  const shipping = selectShippingFee(state);
  const tax = selectTax(state);
  const total = selectTotal(state);

  return (
    <View>
      <Text style={[t.text.h2, { color: t.colors.text }]}>Order summary</Text>
      <View style={{ height: 12 }} />

      <Row label="Subtotal" value={formatMoney(subtotal)} />
      <Row label="Discount" value={discount > 0 ? `−${formatMoney(discount)}` : formatMoney(0)} />
      <Row label="Shipping" value={shipping > 0 ? formatMoney(shipping) : 'Free'} />
      <Row label="Tax" value={formatMoney(tax)} />

      <Divider v={12} />

      <View style={styles.totalRow}>
        <Text style={[t.text.label, { color: t.colors.text }]}>Total</Text>
        <Text style={[t.text.h2, { color: t.colors.text }]}>{formatMoney(total)}</Text>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <Text style={[t.text.body, { color: t.colors.muted }]}>{label}</Text>
      <Text style={[t.text.body, { color: t.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});


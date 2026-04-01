import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNav } from '../navigation/AppNavigator';
import { useCart } from '../state/CartContext';
import { formatMoney } from '../state/money';
import { selectTotal } from '../state/selectors';
import { useTheme } from '../theme/ThemeContext';
import { OrderSummary } from '../components/OrderSummary';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Divider } from '../ui/Divider';
import { Screen } from '../ui/Screen';

export function PaymentScreen() {
  const t = useTheme();
  const nav = useNav();
  const cart = useCart();
  const total = selectTotal(cart.state);

  const paymentLabel =
    cart.state.payment.type === 'cash'
      ? 'Cash on delivery'
      : `${cart.state.payment.brand.toUpperCase()} •••• ${cart.state.payment.last4}`;

  return (
    <Screen
      scroll
      footer={
        <View style={{ gap: 10 }}>
          <Button
            label={`Place order • ${formatMoney(total)}`}
            onPress={() => {
              const orderId = `AF-${Date.now().toString().slice(-6)}`;
              nav.reset('Success', { orderId });
            }}
          />
          <Button variant="ghost" label="Back" onPress={() => nav.back()} />
        </View>
      }>
      <Text style={[t.text.h1, { color: t.colors.text }]}>Payment</Text>
      <Text style={[t.text.body, { color: t.colors.muted, marginTop: 6 }]}>
        Choose a payment method and confirm.
      </Text>

      <View style={{ height: 18 }} />

      <Card>
        <Text style={[t.text.h2, { color: t.colors.text }]}>Payment method</Text>
        <View style={{ height: 10 }} />
        <RadioRow
          selected={cart.state.payment.type === 'card'}
          title="Card"
          subtitle={paymentLabel}
          onPress={() => cart.setPayment({ type: 'card', brand: 'visa', last4: '4242' })}
        />
        <View style={{ height: 10 }} />
        <RadioRow
          selected={cart.state.payment.type === 'cash'}
          title="Cash on delivery"
          subtitle="Pay when you receive the order"
          onPress={() => cart.setPayment({ type: 'cash' })}
        />

        <Divider v={14} />

        <Text style={[t.text.h2, { color: t.colors.text }]}>Delivery</Text>
        <View style={{ height: 10 }} />
        <Text style={[t.text.label, { color: t.colors.text }]}>{cart.state.address.fullName}</Text>
        <Text style={[t.text.body, { color: t.colors.muted, marginTop: 4 }]}>
          {cart.state.address.line1}
          {cart.state.address.line2 ? `, ${cart.state.address.line2}` : ''}
        </Text>
        <Text style={[t.text.body, { color: t.colors.muted }]}>
          {cart.state.address.city}, {cart.state.address.state} {cart.state.address.postalCode}
        </Text>
      </Card>

      <View style={{ height: 18 }} />

      <Card style={styles.summaryCard}>
        <OrderSummary state={cart.state} />
      </Card>
    </Screen>
  );
}

function RadioRow({
  selected,
  title,
  subtitle,
  onPress,
}: {
  selected: boolean;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.radioRow,
        { borderColor: selected ? t.colors.primary : t.colors.border, opacity: pressed ? 0.75 : 1, borderRadius: t.radii.md },
      ]}>
      <View style={[styles.dot, { borderColor: selected ? t.colors.primary : t.colors.border }]}>
        {selected ? <View style={[styles.dotFill, { backgroundColor: t.colors.primary }]} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[t.text.label, { color: t.colors.text }]}>{title}</Text>
        <Text style={[t.text.small, { color: t.colors.muted, marginTop: 2 }]}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  summaryCard: { padding: 16 },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    padding: 12,
  },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotFill: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});


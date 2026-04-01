import React from 'react';
import { Text, View } from 'react-native';
import { useNav } from '../navigation/AppNavigator';
import { useCart } from '../state/CartContext';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Screen } from '../ui/Screen';

export function SuccessScreen({ orderId }: { orderId: string }) {
  const t = useTheme();
  const nav = useNav();
  const cart = useCart();

  return (
    <Screen
      scroll
      footer={
        <View style={{ gap: 10 }}>
          <Button
            label="Back to cart"
            onPress={() => {
              cart.reset();
              nav.reset('Cart');
            }}
          />
        </View>
      }>
      <Text style={[t.text.h1, { color: t.colors.text }]}>Order placed</Text>
      <Text style={[t.text.body, { color: t.colors.muted, marginTop: 6 }]}>
        Thanks! Your order has been confirmed.
      </Text>

      <View style={{ height: 18 }} />

      <Card>
        <Text style={[t.text.label, { color: t.colors.muted }]}>Order ID</Text>
        <Text style={[t.text.h2, { color: t.colors.text, marginTop: 6 }]}>{orderId}</Text>
        <View style={{ height: 12 }} />
        <Text style={[t.text.body, { color: t.colors.muted }]}>
          You can close the app or continue shopping.
        </Text>
      </Card>
    </Screen>
  );
}


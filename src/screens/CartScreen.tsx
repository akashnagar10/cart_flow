import React from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { fetchProducts, DummyJsonProduct } from '../api/dummyjson';
import { useNav } from '../navigation/AppNavigator';
import { useCart } from '../state/CartContext';
import { formatMoney, usdToInr } from '../state/money';
import { selectDiscountAmount, selectShippingFee, selectSubtotal, selectTotal } from '../state/selectors';
import { useTheme } from '../theme/ThemeContext';
import { OrderSummary } from '../components/OrderSummary';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Divider } from '../ui/Divider';
import { Screen } from '../ui/Screen';
import { QuantityStepper } from '../ui/QuantityStepper';
import PercentIcon from '../assets/PercentIcon';

const coupons = [
  { id: 'ABCD', title: 'Add items worth ₹20 to avail this offer', status: 'active', amountOff: '₹250\nOFF', amountMoney: 250 },
  { id: 'ABCD2', title: 'Upto ₹120 on orders above ₹1200', status: 'expired', amountOff: '₹200\nOFF', amountMoney: 200 },
  { id: 'ABCD3', title: 'Upto ₹120 on orders above ₹1200', status: 'active', amountOff: '₹300\nOFF', amountMoney: 300 },
  { id: 'ABCD4', title: 'Flat ₹75 off on orders above ₹799', status: 'active', amountOff: '₹20\nOFF', amountMoney: 20 },
  { id: 'ABCD5', title: 'Extra ₹50 off with wallet payments', status: 'active', amountOff: '₹50\nOFF', amountMoney: 50 },
  { id: 'ABCD6', title: 'Upto ₹200 off on grocery combos', status: 'expired', amountOff: '₹250\nOFF', amountMoney: 250 },
];

export function CartScreen() {
  const t = useTheme();
  const nav = useNav();
  const cart = useCart();
  const total = selectTotal(cart.state);
  const discountAmount = selectDiscountAmount(cart.state);
  const subtotal = selectSubtotal(cart.state);
  const shippingFee = selectShippingFee(cart.state);
  const [reco, setReco] = React.useState<DummyJsonProduct[]>([]);
  const [selectedInstructions, setSelectedInstructions] = React.useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = React.useState<string[]>([]);
  const [customDraft, setCustomDraft] = React.useState('');

  const cashbackAmount = React.useMemo(() => {
    // Simple dynamic cashback model; keeps UI consistent across the screen.
    if (subtotal <= 0) return 0;
    return Math.max(0, Math.min(200, Math.round(subtotal * 0.05)));
  }, [subtotal]);

  const instructionOptions = React.useMemo(() => {
    return [
      'Don’t ring the bell',
      "Don’t call",
      'Leave order with guard',
      ...customInstructions,
    ];
  }, [customInstructions]);

  const toggleInstruction = React.useCallback((label: string) => {
    setSelectedInstructions(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : [...prev, label],
    );
  }, []);

  const addCustomInstruction = React.useCallback(() => {
    const next = customDraft.trim();
    if (!next) return;
    setCustomInstructions(prev => {
      if (prev.length >= 2) return prev;
      if (prev.some(x => x.toLowerCase() === next.toLowerCase())) return prev;
      return [...prev, next];
    });
    setSelectedInstructions(prev => (prev.includes(next) ? prev : [...prev, next]));
    setCustomDraft('');
  }, [customDraft]);

  const canCheckout = cart.state.items.length > 0 && total > 0;

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const list = await fetchProducts(10, 0);
        if (!alive) return;
        setReco(list.products.slice(0, 6));
      } catch {
        if (!alive) return;
        setReco([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Screen
      scroll
      footer={
        <View style={{ gap: 10 }}>
          <View style={[styles.deliveryRow, { borderColor: t.colors.border, backgroundColor: t.colors.surface, borderRadius: t.radii.lg }]}>
            <View style={{ flex: 1 }}>
              <Text style={[t.text.small, { color: t.colors.muted }]}>Deliver to Home</Text>
              <Text style={[t.text.label, { color: t.colors.text }]} numberOfLines={1}>
                {`${cart.state.address.line1}, ${cart.state.address.city}`}
              </Text>
            </View>
            <Pressable accessibilityRole="button" onPress={() => { }} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <Text style={[t.text.label, { color: t.colors.primary }]}>Change</Text>
            </Pressable>
          </View>

          <Button
            label={canCheckout ? `Proceed • ${formatMoney(total)}` : 'Cart is empty'}
            disabled={!canCheckout}
            onPress={() => nav.navigate('Checkout')}
          />
        </View>
      }>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => nav.back()} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <Text style={[t.text.h2, { color: t.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <Text style={[t.text.label, { color: t.colors.text, flex: 1, textAlign: 'center' }]}>Review Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      {
        discountAmount > 0 && <View style={[styles.savingsBanner, { backgroundColor: '#D8F1FF', borderRadius: t.radii.md }]}>
          <Text style={[t.text.small, { color: '#0B4F64', fontWeight: '700' }]}>
            {`You are saving ${formatMoney(discountAmount)} with this order!`}
          </Text>
        </View>
      }


      <View style={[styles.warning, { backgroundColor: '#FFF7E6', borderColor: '#FCD34D', borderRadius: t.radii.md }]}>
        <View style={[styles.warnIcon, { borderColor: '#F59E0B' }]} />
        <View style={{ flex: 1 }}>
          <Text style={[t.text.small, { color: t.colors.muted }]}>
            Your order might be delayed due to high demand{'\n'}Your order might be delayed due to high demand
          </Text>
        </View>
      </View>

      <View style={{ height: 12 }} />

      <Card>
        {cart.state.items.length === 0 ? (
          <Text style={[t.text.body, { color: t.colors.muted }]}>
            No items in your cart.
          </Text>
        ) : (
          <View style={{ gap: 12 }}>
            {cart.state.items.map((item, idx) => (
              <View key={item.id}>
                <View style={styles.itemRow}>
                  {item.imageUrl ? (
                    <View style={{ width: 50, height: 66, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' }}>
                      <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    </View>
                  ) : (
                    <View style={[styles.thumb, { backgroundColor: '#F3F4F6', borderRadius: 10 }]} />
                  )}
                  <View style={{ flex: 1, justifyContent: 'space-between', gap: 10 }}>
                    <Text style={[t.text.label, { color: t.colors.text }]} numberOfLines={2}>
                      {item.title}
                    </Text>
                    {item.subtitle ? (
                      <Text style={[t.text.small, { color: t.colors.muted, marginTop: 2 }]} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 10 }}>
                    <QuantityStepper
                      value={item.quantity}
                      min={0}
                      onDec={() => cart.dec(item.id)}
                      onInc={() => cart.inc(item.id)}
                    />
                    <Text style={[t.text.label, { color: t.colors.text }]}>
                      {formatMoney(item.unitPrice * item.quantity)}
                    </Text>
                  </View>
                </View>
                {/* {idx < cart.state.items.length - 1 ? <Divider v={12} /> : null} */}
              </View>
            ))}
          </View>
        )}
      </Card>

      

      {cart.state.items.length > 0 ? (
        <>
          <View style={{ height: 14 }} />

          <Card style={{ padding: 14 }}>
            <View style={styles.couponHeader}>
              <PercentIcon />
              <Text style={[t.text.label, { color: '#0B4F64' }]}>Top coupons for you</Text>
              <PercentIcon />
            </View>
            <View style={{ height: 52 }} />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {coupons
                .slice(0, 3)
                .map(c => {
                  const isExpired = c.status === 'expired';
                  const isApplied = cart.state.discount?.label === c.id;
                  const isAmountValid = c.amountMoney < subtotal; // only applicable if coupon amount < total
                  const canApply = !isExpired && subtotal > 0 && isAmountValid;

                  return (
                    <View
                      key={c.id}
                      style={[
                        styles.couponCard,
                        { borderColor: t.colors.border, borderRadius: t.radii.lg, backgroundColor: t.colors.surface },
                      ]}>
                      <View style={styles.couponBadge}>
                        <Text
                          style={[t.text.small, { color: '#FFFFFF', fontWeight: '800', textAlign: 'center' }]}>
                          {c.amountOff}
                        </Text>
                      </View>

                      <Text
                        style={[t.text.small, { color: isExpired ? '#EF4444' : t.colors.muted, marginTop: 26 }]}
                        numberOfLines={2}>
                        {c.title}
                      </Text>

                      <Text
                        style={[
                          t.text.label,
                          { color: t.colors.text, marginTop: 14, alignSelf: 'center', textAlign: 'center' },
                        ]}>
                        {c.id}
                      </Text>

                      <View style={{ flex: 1 }} />

                      <Pressable
                        accessibilityRole="button"
                        disabled={!canApply && !isApplied}
                        onPress={() => {
                          if (isApplied) {
                            cart.setDiscount(undefined);
                            return;
                          }
                          if (!canApply) return;
                          cart.setDiscount({ type: 'fixed', label: c.id, value: c.amountMoney });
                        }}
                        style={({ pressed }) => [
                          styles.couponBtn,
                          {
                            backgroundColor: isExpired || !isAmountValid ? '#F3F4F6' : isApplied ? '#F59E0B' : 'transparent',
                            borderColor: isExpired || !isAmountValid ? '#F3F4F6' : isApplied ? '#F59E0B' : 'transparent',
                            opacity: isExpired || !isAmountValid ? 1 : pressed ? 0.85 : 1,
                            borderRadius: 14,
                          },
                        ]}>
                        <Text
                          style={[
                            t.text.small,
                            {
                              color:
                                isExpired || !isAmountValid
                                  ? t.colors.muted
                                  : isApplied
                                    ? '#FFFFFF'
                                    : '#F59E0B',
                              fontWeight: '800',
                            },
                          ]}>
                          {isExpired ? 'EXPIRED' : !isAmountValid ? 'NOT APPLICABLE' : isApplied ? '✓ APPLIED' : 'APPLY'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })}
            </View>
            <Divider v={12} />
            <View style={{ height: 12 }} />
            {
              discountAmount > 0 && (
                <>
                  <Text style={[t.text.label, { color: '#0B4F64', textAlign: 'center' }]}>
                    🎉 You are saving {discountAmount > 0 ? formatMoney(discountAmount) : formatMoney(0)} with this coupon 🎉
                  </Text>
                  <View style={{ height: 6 }} />
                  <Divider v={12} />
                </>
              )
            }
            <Pressable
              accessibilityRole="button"
              onPress={() => {}}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
              <Text style={[t.text.body, { color: t.colors.muted, textAlign: 'center' }]}>
                View more coupons and offers  ›
              </Text>
            </Pressable>
          </Card>
        </>
      ) : null}

      <View style={{ height: 12 }} />

      <Card style={{ padding: 14, flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={[styles.cashBadge, { borderColor: t.colors.border }]} />
        <View style={{ flex: 1 }}>
          <Text style={[t.text.label, { color: t.colors.text }]}>
            {cashbackAmount > 0
              ? `Yay! You’ve received a cashback of ${formatMoney(cashbackAmount)}`
              : 'Add items to unlock cashback'}
          </Text>
          <Text style={[t.text.small, { color: t.colors.muted, marginTop: 2 }]}>
            The cashback will be added in your Aforro wallet
          </Text>
        </View>
      </Card>

      <View style={{ height: 12 }} />

      <Card style={{ padding: 14 }}>
        <Text style={[t.text.label, { color: t.colors.text }]}>Delivery instructions</Text>
        <View style={{ height: 10 }} />
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {instructionOptions.map(x => {
            const selected = selectedInstructions.includes(x);
            return (
              <Pressable
              key={x}
              accessibilityRole="button"
              onPress={() => toggleInstruction(x)}
              style={({ pressed }) => [
                styles.chip,
                {
                  borderColor: selected ? t.colors.primary : t.colors.border,
                  backgroundColor: selected ? 'rgba(85,145,61,0.12)' : t.colors.surface,
                  borderRadius: t.radii.md,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}>
              <Text style={[t.text.small, { color: selected ? t.colors.primary : t.colors.text }]}>{x}</Text>
            </Pressable>
            );
          })}
        </View>
        <View style={{ height: 10 }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            value={customDraft}
            onChangeText={setCustomDraft}
            placeholder={customInstructions.length >= 2 ? 'Custom limit reached' : 'Add custom instruction'}
            placeholderTextColor={t.colors.muted}
            editable={customInstructions.length < 2}
            style={[
              styles.noteInput,
              { flex: 1, borderColor: t.colors.border, borderRadius: t.radii.md, color: t.colors.text },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            onPress={addCustomInstruction}
            disabled={customInstructions.length >= 2 || customDraft.trim().length === 0}
            style={({ pressed }) => [
              styles.addChipBtn,
              {
                backgroundColor: t.colors.primary,
                borderRadius: t.radii.md,
                opacity: customInstructions.length >= 2 || customDraft.trim().length === 0 ? 0.4 : pressed ? 0.85 : 1,
              },
            ]}>
            <Text style={[t.text.label, { color: t.colors.primaryText }]}>Add</Text>
          </Pressable>
        </View>
        <View style={{ height: 10 }} />
      </Card>

      <View style={{ height: 12 }} />

      <Card style={{ padding: 14 }}>
        <SummaryRow label="Item total" value={formatMoney(subtotal)} />
        <SummaryRow
          label="Delivery fee"
          value={shippingFee > 0 ? formatMoney(shippingFee) : 'FREE'}
          valueColor={shippingFee > 0 ? t.colors.text : '#16A34A'}
          subLabel={shippingFee > 0 ? 'Add items worth ₹20 to get free delivery' : undefined}
          subLabelColor="#F97316"
        />
        <SummaryRow label="Discount" value={discountAmount > 0 ? `−${formatMoney(discountAmount)}` : formatMoney(0)} />
        <SummaryRow label="Platform fee" value={`−${formatMoney(0)}`} />
        <Divider v={12} />
        <View style={styles.totalRow}>
          <Text style={[t.text.label, { color: t.colors.text }]}>Total payable amount</Text>
          <Text style={[t.text.h2, { color: t.colors.text }]}>{formatMoney(total)}</Text>
        </View>
        <View style={{ height: 12 }} />
        <View style={[styles.bottomSavings, { backgroundColor: '#D8F1FF', borderRadius: t.radii.md }]}>
          <Text style={[t.text.label, { color: '#0B4F64' }]}>
            {discountAmount > 0
              ? `You are saving ${formatMoney(discountAmount)} with this order!`
              : 'Add items to see savings'}
          </Text>
        </View>
      </Card>

{/* <Card style={styles.summaryCard}>
  <OrderSummary state={cart.state} />
</Card> */}

      <View style={{ height: 12 }} />

      <Card style={{ padding: 14 }}>
        <Text style={[t.text.label, { color: t.colors.text }]}>Cancellation policy</Text>
        <View style={{ height: 6 }} />
        <Text style={[t.text.small, { color: t.colors.muted }]}>
          You can cancel your order for free within the first 90 seconds. After that, a cancellation fee will apply.
        </Text>
      </Card>
    </Screen>
  );
}

function SummaryRow({
  label,
  value,
  valueColor,
  subLabel,
  subLabelColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
  subLabel?: string;
  subLabelColor?: string;
}) {
  const t = useTheme();
  return (
    <View style={{ paddingVertical: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text style={[t.text.body, { color: t.colors.muted }]}>{label}</Text>
        <Text style={[t.text.body, { color: valueColor ?? t.colors.text }]}>{value}</Text>
      </View>
      {subLabel ? (
        <Text style={[t.text.small, { color: subLabelColor ?? t.colors.muted, marginTop: 2 }]}>{subLabel}</Text>
      ) : null}
    </View>
  );
}

function MiniRecoCard({ item, onAdd }: { item: DummyJsonProduct; onAdd: () => void }) {
  const t = useTheme();
  const price = usdToInr(item.price);
  const hasDiscount = typeof item.discountPercentage === 'number' && item.discountPercentage > 0;
  const mrp = hasDiscount ? price / (1 - Math.min(90, item.discountPercentage) / 100) : price;

  return (
    <View style={[styles.miniCard, { borderColor: t.colors.border, backgroundColor: t.colors.surface, borderRadius: t.radii.lg }]}>
      <Image source={{ uri: item.thumbnail }} style={styles.miniImg} resizeMode="contain" />
      <Text style={[t.text.small, { color: t.colors.muted }]} numberOfLines={1}>
        {item.brand ?? 'Brand'}
      </Text>
      <Text style={[t.text.label, { color: t.colors.text }]} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={{ height: 6 }} />
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
        <Text style={[t.text.label, { color: t.colors.text }]}>{formatMoney(price)}</Text>
        {hasDiscount ? (
          <Text style={[t.text.small, { color: t.colors.muted, textDecorationLine: 'line-through' }]}>
            {formatMoney(mrp)}
          </Text>
        ) : null}
      </View>
      <View style={{ height: 8 }} />
      <Pressable
        accessibilityRole="button"
        onPress={onAdd}
        style={({ pressed }) => [
          styles.miniBtn,
          { backgroundColor: t.colors.primary, borderRadius: t.radii.md, opacity: pressed ? 0.85 : 1 },
        ]}>
        <Text style={[t.text.small, { color: t.colors.primaryText, fontWeight: '700' }]}>Add</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10 },
  savingsBanner: { paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  warning: { marginTop: 10, borderWidth: 1, padding: 10, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  warnIcon: { width: 18, height: 18, borderWidth: 2, borderRadius: 9, marginTop: 2 },
  itemRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginTop: 6 },
  thumb: { width: 46, height: 46 },
  deliveryRow: { borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniCard: { width: 150, borderWidth: 1, padding: 10 },
  miniImg: { width: '100%', height: 78 },
  miniBtn: { height: 32, alignItems: 'center', justifyContent: 'center' },
  couponHeader: {  flexDirection: 'row', gap: 6, alignSelf: 'center', alignItems: 'center' },
  couponCard: { flex: 1, minWidth: 0, padding: 10, borderWidth: 1, height: 170 },
  couponBadge: {
    position: 'absolute',
    top: -26,
    left: '60%',
    transform: [{ translateX: -26 }],
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0C748C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponBtn: { height: 34, alignItems: 'center', justifyContent: 'center' },
  cashBadge: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, backgroundColor: '#EFF6FF' },
  chip: { paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1 },
  noteInput: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  addChipBtn: { height: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  bottomSavings: { paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  summaryCard: {
    padding: 16,
  },
});


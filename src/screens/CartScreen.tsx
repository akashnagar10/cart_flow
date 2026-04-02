import React from 'react';
import { FlatList, Image, Modal, Pressable, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { fetchProducts, DummyJsonProduct } from '../api/dummyjson';
import { useNav } from '../navigation/AppNavigator';
import { useCart } from '../state/CartContext';
import { formatMoney, usdToInr } from '../state/money';
import { FREE_DELIVERY_THRESHOLD, selectDiscountAmount, selectPreShippingTotal, selectShippingFee, selectSubtotal, selectTotal } from '../state/selectors';
import { useTheme } from '../theme/ThemeContext';
import { ProductCard } from '../components/ProductCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Divider } from '../ui/Divider';
import { Screen } from '../ui/Screen';
import { QuantityStepper } from '../ui/QuantityStepper';
import PercentIcon from '../assets/PercentIcon';
import LeftArrowIcon from '../assets/LeftArrowIcon';
import LocationIcon from '../assets/LocationIcon';
import { palette } from '../theme/colors';

const coupons = [
  { id: 'ABCDEFGH', title: 'Add items worth ₹20 to avail this offer', status: 'active', amountOff: '₹250\nOFF', amountMoney: 250 },
  { id: 'ABCD2DHJ', title: 'Upto ₹120 on orders above ₹1200', status: 'expired', amountOff: '₹120\nOFF', amountMoney: 120 },
  { id: 'ABCD3EG', title: 'Upto ₹150 on orders above ₹1200', status: 'active', amountOff: '₹150\nOFF', amountMoney: 150 },
  { id: 'ABCD4HJK', title: 'Flat ₹75 off on orders above ₹799', status: 'active', amountOff: '₹20\nOFF', amountMoney: 20 },
  { id: 'ABCD5KLM', title: 'Extra ₹50 off with wallet payments', status: 'active', amountOff: '₹50\nOFF', amountMoney: 50 },
  { id: 'ABCD6NOP', title: 'Upto ₹200 off on grocery combos', status: 'expired', amountOff: '₹250\nOFF', amountMoney: 250 },
];

export function CartScreen() {
  const t = useTheme();
  const nav = useNav();
  const cart = useCart();
  const total = selectTotal(cart.state);
  const discountAmount = selectDiscountAmount(cart.state);
  const subtotal = selectSubtotal(cart.state);
  const preShippingTotal = selectPreShippingTotal(cart.state);
  const shippingFee = selectShippingFee(cart.state);
  const amountToFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - preShippingTotal);
  const [reco, setReco] = React.useState<DummyJsonProduct[]>([]);
  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const [sheetProduct, setSheetProduct] = React.useState<DummyJsonProduct | null>(null);
  const [variantQty, setVariantQty] = React.useState<Record<string, number>>({});
  const [selectedInstructions, setSelectedInstructions] = React.useState<string[]>([]);
  const [customInstructions, setCustomInstructions] = React.useState<string[]>([]);
  const [customDraft, setCustomDraft] = React.useState('');

  type Variant = { key: string; label: string; multiplier: number };
  const variants = React.useMemo<Variant[]>(
    () => [
      { key: 'v1', label: '1 × 100 g', multiplier: 1 },
      { key: 'v2', label: '3 × 100 g', multiplier: 2 },
    ],
    [],
  );

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
        const list = await fetchProducts(20, 0);
        if (!alive) return;
        setReco(list.products);
      } catch {
        if (!alive) return;
        setReco([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const totalSelected = variants.reduce((sum, v) => sum + (variantQty[v.key] ?? 0), 0);

  const seedQty = React.useCallback(() => {
    const first = variants[0];
    if (!first) return {};
    return { [first.key]: 1 } as Record<string, number>;
  }, [variants]);

  const onOpenOptions = React.useCallback(
    (p: DummyJsonProduct) => {
      setVariantQty(seedQty());
      setSheetProduct(p);
      setOptionsOpen(true);
    },
    [seedQty],
  );

  const onCloseOptions = React.useCallback(() => {
    setOptionsOpen(false);
    setSheetProduct(null);
    setVariantQty({});
  }, []);

  const onAddSingle = React.useCallback(
    (p: DummyJsonProduct) => {
      const baseUnit = usdToInr(p.price);
      cart.add({
        id: `p-${p.id}-single`,
        title: p.title,
        subtitle: p.brand,
        imageUrl: p.thumbnail,
        unitPrice: baseUnit,
        quantity: 1,
      });
    },
    [cart],
  );

  const onConfirmOptions = React.useCallback(() => {
    if (!sheetProduct) return;
    const baseUnit = usdToInr(sheetProduct.price);

    variants.forEach(v => {
      const q = variantQty[v.key] ?? 0;
      if (q <= 0) return;
      cart.add({
        id: `p-${sheetProduct.id}-${v.key}`,
        title: sheetProduct.title,
        subtitle: v.label,
        imageUrl: sheetProduct.thumbnail,
        unitPrice: baseUnit * v.multiplier,
        quantity: q,
      });
    });

    onCloseOptions();
  }, [cart, onCloseOptions, sheetProduct, variantQty, variants]);

  const handleLogin = () => {
    Alert.alert('Good News 🎉', 'This feature is coming soon!');
  }

  const handleAddAddress = () => {
    Alert.alert('Add Address Feature 🎉', 'This feature is coming soon!');
  }

  const handleChangeAddress = () => {
    Alert.alert('Change Address Feature 🎉', 'This feature is coming soon!');
  }

  return (
    <Screen
      scroll
      footer={
        <View style={{ gap: 10, }}>
          {!cart.state.userLoggedIn ? (
            <Card style={{ padding: 14 }}>
              <Text style={[t.text.label, { color: t.colors.text }]}>Login to proceed</Text>
              <View style={{ height: 6 }} />
              <Text style={[t.text.small, { color: t.colors.muted }]}>
                Log in or sign up to proceed with your order
              </Text>
              <View style={{ height: 12 }} />
              <Button label="Login" onPress={handleLogin} style={{ marginBottom: 10 }} />
            </Card>
          ) : !cart.state.locationEnabled ? (
            <Card style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
                <LocationIcon />
                <Text style={[t.text.h2, { color: t.colors.text }]}>Where would you like us to deliver?</Text>

              </View>
              <View style={{ height: 12 }} />
              <Button label="Add address" onPress={handleAddAddress} style={{ marginBottom: 10 }} />
            </Card>
          ) : (
            <View style={{ borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radii.lg, marginBottom: 0 }}>
              <View
                style={[
                  styles.deliveryRow,
                  { borderColor: t.colors.border, backgroundColor: t.colors.surface, borderRadius: t.radii.lg, paddingHorizontal: 16 },
                ]}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <LocationIcon />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        t.text.small,
                        { color: cart.state.locationServiceable ? t.colors.muted : t.colors.error },
                      ]}>
                      {cart.state.locationServiceable ? 'Deliver to Home' : 'Location is not serviceable'}
                    </Text>
                    <Text style={[t.text.label, { color: t.colors.text }]} numberOfLines={1}>
                      {`${cart.state.address.line1}, ${cart.state.address.city}`}
                    </Text>
                  </View>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleChangeAddress}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                  <Text style={[t.text.label, { color: t.colors.primary }]}>Change</Text>
                </Pressable>
              </View>

              <View
                style={[
                  styles.payRow,
                  { borderColor: t.colors.border, backgroundColor: t.colors.surface, borderRadius: t.radii.lg },
                ]}>
                <View>
                  <Text style={[t.text.small, { color: t.colors.muted }]}>To Pay</Text>
                  <Text style={[t.text.h1, { fontSize: 34, color: t.colors.text }]}>{formatMoney(total)}</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  disabled={!canCheckout || !cart.state.locationServiceable}
                  onPress={() => {
                    if (!canCheckout || !cart.state.locationServiceable) return;
                    nav.navigate('Checkout');
                  }}
                  style={({ pressed }) => [
                    styles.proceedBtn,
                    {
                      backgroundColor: t.colors.primary,
                      opacity: !canCheckout || !cart.state.locationServiceable ? 0.25 : pressed ? 0.9 : 1,
                      borderRadius: 14,
                    },
                  ]}>
                  <Text style={[t.text.h2, { color: t.colors.primaryText }]}>Proceed</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      }>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => nav.back()} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
          <LeftArrowIcon style={[t.text.h2, { color: t.colors.text }]} />
        </Pressable>
        <Text style={[t.text.label, { color: t.colors.text, flex: 1, textAlign: 'center' }]}>Review Cart</Text>
        <View style={{ width: 24 }} />
      </View>

      {
        discountAmount > 0 && <View style={[styles.savingsBanner, { backgroundColor: t.colors.infoBg, borderRadius: t.radii.md }]}>
          <Text style={[t.text.small, { color: t.colors.infoText, fontWeight: '700' }]}>
            {`You are saving ${formatMoney(discountAmount)} with this order!`}
          </Text>
        </View>
      }


      <View style={[styles.warning, { backgroundColor: t.colors.warningBg, borderColor: t.colors.warningBorder, borderRadius: t.radii.md }]}>
        <View style={[styles.warnIcon, { borderColor: t.colors.warningIcon }]} />
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
            {cart.state.items.map(item => (
              <View key={item.id}>
                <View style={styles.itemRow}>
                  {item.imageUrl ? (
                    <View style={{ width: 50, height: 66, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: t.colors.border }}>
                      <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
                    </View>
                  ) : (
                    <View style={[styles.thumb, { backgroundColor: t.colors.surfaceMuted, borderRadius: 10 }]} />
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
              </View>
            ))}
          </View>
        )}
      </Card>



      {cart.state.items.length > 0 ? (
        <>
          <View style={{ height: 14 }} />

          {reco.length > 0 ? (
            <Card style={{ padding: 14 }}>
              <Text style={[t.text.h2, { color: t.colors.text }]} numberOfLines={1}>
                Did you forget?
              </Text>
              <View style={{ height: 10 }} />
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={reco.slice(0, 3)}
                keyExtractor={it => String(it.id)}
                contentContainerStyle={{ gap: 12, paddingRight: 8 }}
                renderItem={({ item }) => {
                  const isDiscount =
                    typeof item.discountPercentage === 'number' && item.discountPercentage > 0;

                  return (
                    <ProductCard
                      title={item.title}
                      subtitle={item.brand}
                      priceUsd={item.price}
                      discountPct={item.discountPercentage}
                      imageUrl={item.thumbnail}
                      ctaLabel={isDiscount ? '2 options ▾' : 'Add'}
                      onPress={() => {
                        if (isDiscount) onOpenOptions(item);
                        else onAddSingle(item);
                      }}
                      onCtaPress={() => {
                        if (isDiscount) onOpenOptions(item);
                        else onAddSingle(item);
                      }}
                    />
                  );
                }}
              />
            </Card>
          ) : null}

          <View style={{ height: 12 }} />

          <Card style={{ padding: 14 }}>
            <View style={styles.couponHeader}>
              <PercentIcon />
              <Text style={[t.text.label, { color: t.colors.infoText }]}>Top coupons for you</Text>
              <PercentIcon />
            </View>
            <View style={{ height: 52 }} />

            <View style={{ flexDirection: 'row', gap: 10 }}>
              {coupons
                .slice(0, 3)
                .map(c => {
                  const isExpired = c.status === 'expired';
                  const isApplied = cart.state.discount?.label === c.id;
                  const isAmountValid = c.amountMoney < subtotal;
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
                          style={[t.text.small, { color: t.colors.primaryText, fontWeight: '800', textAlign: 'center' }]}>
                          {c.amountOff}
                        </Text>
                      </View>

                      <Text
                        style={[t.text.small, { color: isExpired ? t.colors.error : t.colors.muted, marginTop: 26 }]}
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
                            backgroundColor: isExpired || !isAmountValid ? t.colors.surfaceMuted : isApplied ? t.colors.warningIcon : 'transparent',
                            borderColor: isExpired || !isAmountValid ? t.colors.surfaceMuted : isApplied ? t.colors.warningIcon : 'transparent',
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
                                    ? t.colors.primaryText
                                    : t.colors.warningIcon,
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
                  <Text style={[t.text.label, { color: t.colors.infoText, textAlign: 'center' }]}>
                    🎉 You are saving {discountAmount > 0 ? formatMoney(discountAmount) : formatMoney(0)} with this coupon 🎉
                  </Text>
                  <View style={{ height: 6 }} />
                  <Divider v={12} />
                </>
              )
            }
            <Pressable
              accessibilityRole="button"
              onPress={() => { }}
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
          valueColor={shippingFee > 0 ? t.colors.text : t.colors.success}
          subLabel={
            shippingFee > 0 && amountToFreeDelivery > 0
              ? `Add items worth ${formatMoney(amountToFreeDelivery)} to get free delivery`
              : undefined
          }
          subLabelColor={t.colors.accent}
        />
        <SummaryRow label="Discount" value={discountAmount > 0 ? `−${formatMoney(discountAmount)}` : formatMoney(0)} />
        <SummaryRow label="Platform fee" value={`−${formatMoney(0)}`} />
        <Divider v={12} />
        <View style={styles.totalRow}>
          <Text style={[t.text.label, { color: t.colors.text }]}>Total payable amount</Text>
          <Text style={[t.text.h2, { color: t.colors.text }]}>{formatMoney(total)}</Text>
        </View>
        <View style={{ height: 12 }} />
        <View style={[styles.bottomSavings, { backgroundColor: t.colors.infoBg, borderRadius: t.radii.md }]}>
          <Text style={[t.text.label, { color: t.colors.infoText }]}>
            {discountAmount > 0
              ? `You are saving ${formatMoney(discountAmount)} with this order!`
              : 'Add items to see savings'}
          </Text>
        </View>
      </Card>

      <View style={{ height: 12 }} />

      <Card style={{ padding: 14 }}>
        <Text style={[t.text.label, { color: t.colors.text }]}>Cancellation policy</Text>
        <View style={{ height: 6 }} />
        <Text style={[t.text.small, { color: t.colors.muted }]}>
          You can cancel your order for free within the first 90 seconds. After that, a cancellation fee will apply.
        </Text>
      </Card>

      <OptionsSheet
        open={optionsOpen}
        onClose={onCloseOptions}
        title={sheetProduct ? sheetProduct.brand ?? sheetProduct.title : 'Choose options'}
        product={sheetProduct}
        variants={variants}
        qty={variantQty}
        setQty={setVariantQty}
        onConfirm={onConfirmOptions}
        confirmDisabled={totalSelected === 0}
      />
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

function OptionsSheet({
  open,
  onClose,
  title,
  product,
  variants,
  qty,
  setQty,
  onConfirm,
  confirmDisabled,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  product: DummyJsonProduct | null;
  variants: Array<{ key: string; label: string; multiplier: number }>;
  qty: Record<string, number>;
  setQty: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onConfirm: () => void;
  confirmDisabled: boolean;
}) {
  const t = useTheme();
  const basePrice = product ? usdToInr(product.price) : 0;
  const mrp = product
    ? usdToInr(product.price / (1 - Math.min(90, product.discountPercentage) / 100))
    : 0;

  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.backdrop} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: t.colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
          ]}>
          <Text style={[t.text.label, { color: t.colors.text }]} numberOfLines={2}>
            {title}
          </Text>
          <Text style={[t.text.small, { color: t.colors.muted, marginTop: 2 }]} numberOfLines={1}>
            {product?.title ?? ''}
          </Text>

          <View style={{ height: 12 }} />

          <View style={{ gap: 12 }}>
            {variants.map(v => {
              const value = qty[v.key] ?? 0;
              const price = basePrice * v.multiplier;
              const mrpLine = mrp * v.multiplier;
              return (
                <View
                  key={v.key}
                  style={[
                    styles.variantRow,
                    { borderColor: t.colors.border, borderRadius: t.radii.md },
                  ]}>
                  {product?.thumbnail ? (
                    <Image source={{ uri: product.thumbnail }} style={styles.variantImg} />
                  ) : (
                    <View style={styles.variantImg} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={[t.text.small, { color: t.colors.muted }]}>{v.label}</Text>
                    <View style={{ height: 4 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                      <Text style={[t.text.label, { color: t.colors.text }]}>{formatMoney(price)}</Text>
                      <Text style={[t.text.small, { color: t.colors.muted, textDecorationLine: 'line-through' }]}>
                        {formatMoney(mrpLine)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <QuantityStepper
                      value={value}
                      min={0}
                      onDec={() =>
                        setQty(prev => ({ ...prev, [v.key]: Math.max(0, (prev[v.key] ?? 0) - 1) }))
                      }
                      onInc={() =>
                        setQty(prev => ({ ...prev, [v.key]: Math.min(99, (prev[v.key] ?? 0) + 1) }))
                      }
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ height: 14 }} />

          <Button label="Confirm" disabled={confirmDisabled} onPress={onConfirm} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 10 },
  savingsBanner: { paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  warning: { marginTop: 10, borderWidth: 1, padding: 10, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  warnIcon: { width: 18, height: 18, borderWidth: 2, borderRadius: 9, marginTop: 2 },
  itemRow: { flexDirection: 'row', gap: 16, alignItems: 'flex-start', marginTop: 6 },
  thumb: { width: 46, height: 46 },
  deliveryRow: { borderBottomWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center' },
  payRow: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 20,
  },
  proceedBtn: { height: 54, paddingHorizontal: 34, alignItems: 'center', justifyContent: 'center' },
  couponHeader: { flexDirection: 'row', gap: 6, alignSelf: 'center', alignItems: 'center' },
  couponCard: { flex: 1, minWidth: 0, padding: 10, borderWidth: 1, height: 170 },
  couponBadge: {
    position: 'absolute',
    top: -26,
    left: '60%',
    transform: [{ translateX: -26 }],
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: palette.teal700,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponBtn: { height: 34, alignItems: 'center', justifyContent: 'center' },
  cashBadge: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, backgroundColor: palette.gray50Blue },
  chip: { paddingVertical: 8, paddingHorizontal: 10, borderWidth: 1 },
  noteInput: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  addChipBtn: { height: 44, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  bottomSavings: { paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center' },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18 },
  variantRow: { flexDirection: 'row', gap: 12, borderWidth: 1, padding: 12, alignItems: 'center' },
  variantImg: { width: 44, height: 44, borderRadius: 10, backgroundColor: palette.gray100 },
});


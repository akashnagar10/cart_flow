import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchProduct, fetchProductsByCategory, DummyJsonProduct } from '../api/dummyjson';
import CartIcon from '../assets/CartIcon';
import { ProductCard } from '../components/ProductCard';
import { useNav } from '../navigation/AppNavigator';
import { useCart } from '../state/CartContext';
import { formatMoney, usdToInr } from '../state/money';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { QuantityStepper } from '../ui/QuantityStepper';
import { Screen } from '../ui/Screen';
import DiscountTag from '../components/DiscountTag';

type Variant = {
  key: string;
  label: string;
  multiplier: number;
};

function formatWeightLabel(weight?: number) {
  if (typeof weight !== 'number' || !Number.isFinite(weight) || weight <= 0) return null;
  if (weight >= 1000) {
    const kg = weight / 1000;
    const pretty = Number.isInteger(kg) ? String(kg) : kg.toFixed(1).replace(/\.0$/, '');
    return `${pretty} kg`;
  }
  return `${Math.round(weight)} g`;
}

const DEFAULT_PRODUCT_ID = 1;

export function ProductDetailScreen() {
  const t = useTheme();
  const nav = useNav();
  const cart = useCart();
  const insets = useSafeAreaInsets();

  const [productId, setProductId] = React.useState(DEFAULT_PRODUCT_ID);
  const [product, setProduct] = React.useState<DummyJsonProduct | null>(null);
  const [similar, setSimilar] = React.useState<DummyJsonProduct[]>([]);
  const [alsoBought, setAlsoBought] = React.useState<DummyJsonProduct[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [optionsOpen, setOptionsOpen] = React.useState(false);
  const [sheetProduct, setSheetProduct] = React.useState<DummyJsonProduct | null>(null);
  const [variantQty, setVariantQty] = React.useState<Record<string, number>>({});
  const [addedByProductId, setAddedByProductId] = React.useState<Record<number, boolean>>({});

  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const p = await fetchProduct(productId);
        if (!alive) return;
        setProduct(p);
        const list = await fetchProductsByCategory(p.category, 15);
        if (!alive) return;
        const others = list.products.filter(x => x.id !== p.id);
        setSimilar(others.slice(0, 4));
        setAlsoBought(others.slice(4, 12));
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : 'Failed to load product');
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [productId]);

  const variants: Variant[] = React.useMemo(() => {
    // DummyJSON doesn't have variants; fabricate 2–3 options like the Figma sheet.
    const base: Variant[] = [
      { key: 'v1', label: '1 × 1 kg', multiplier: 1 },
      { key: 'v2', label: '3 × 1 kg', multiplier: 3 },
    ];
    return base;
  }, []);

  const totalSelected = variants.reduce((sum, v) => sum + (variantQty[v.key] ?? 0), 0);
  const hasMoreThanTwoOptions = variants.length > 2;

  const seedQty = React.useCallback(() => {
    // Start with 1 selected for the first option so users can confirm quickly.
    const first = variants[0];
    if (!first) return {};
    return { [first.key]: 1 } as Record<string, number>;
  }, [variants]);

  const onAddPress = React.useCallback(() => {
    // Figma shows options; use sheet as the main add interaction.
    setVariantQty(seedQty());
    setSheetProduct(product);
    setOptionsOpen(true);
  }, [product, seedQty]);

  const onCardOptionsPress = React.useCallback((p: DummyJsonProduct) => {
    setVariantQty(seedQty());
    setSheetProduct(p);
    setOptionsOpen(true);
  }, [seedQty]);

  const onCloseOptions = React.useCallback(() => {
    setOptionsOpen(false);
    setVariantQty({});
    setSheetProduct(null);
  }, []);

  const onSelectProduct = React.useCallback(
    (p: DummyJsonProduct) => {
      onCloseOptions();
      setProductId(p.id);
    },
    [onCloseOptions],
  );

  const onStartAdd = React.useCallback(
    (p: DummyJsonProduct) => {
      setVariantQty(seedQty());
      setSheetProduct(p);
      setOptionsOpen(true);
    },
    [seedQty],
  );

  const getAddCtaLabel = React.useCallback(
    (p: DummyJsonProduct) => {
      if (hasMoreThanTwoOptions) return '2 options ▾';
      return addedByProductId[p.id] ? 'Added' : 'Add';
    },
    [addedByProductId, hasMoreThanTwoOptions],
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
    setAddedByProductId(prev => ({ ...prev, [sheetProduct.id]: true }));
    setVariantQty({});
    setOptionsOpen(false);
    setSheetProduct(null);
  }, [cart, sheetProduct, variantQty, variants]);

  const priceInr = product ? usdToInr(product.price) : 0;
  const mrpInr = product
    ? usdToInr(product.price / (1 - Math.min(90, product.discountPercentage) / 100))
    : 0;

  return (
    <Screen
      padded={false}
      scroll
      overlay={
        <View pointerEvents="box-none" style={styles.fabHost}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open cart"
            onPress={() => nav.navigate('Cart')}
            style={({ pressed }) => [
              styles.fab,
              {
                backgroundColor: t.colors.primary,
                opacity: pressed ? 0.9 : 1,
                bottom: insets.bottom + 16,
                right: 16,
              },
            ]}>
            <CartIcon color={t.colors.primaryText} size={24} />
          </Pressable>
        </View>
      }>
      <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: t.spacing.lg }}>
        <View style={styles.headerRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => nav.navigate('Cart')}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[t.text.h2, { color: t.colors.text }]}>{'‹'}</Text>
          </Pressable>
          <Text style={[t.text.label, { color: t.colors.text, flex: 1 }]} numberOfLines={1}>
            {product?.title ?? 'Product'}
          </Text>
          {/* <Pressable
            accessibilityRole="button"
            onPress={() => {}}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
            <Text style={[t.text.h2, { color: t.colors.text }]}>{'⤴︎'}</Text>
          </Pressable> */}
        </View>
      </View>

      {loading ? (
        <View style={{ paddingTop: 40, alignItems: 'center' }}>
          <ActivityIndicator />
        </View>
      ) : error || !product ? (
        <View style={{ paddingHorizontal: t.spacing.lg, paddingTop: 24 }}>
          <Card>
            <Text style={[t.text.label, { color: t.colors.text }]}>Couldn’t load product</Text>
            <View style={{ height: 8 }} />
            <Text style={[t.text.small, { color: t.colors.muted }]}>{error ?? 'Unknown error'}</Text>
          </Card>
        </View>
      ) : (
        <View>
          <View style={{ paddingHorizontal: t.spacing.lg }}>
            <Card style={{ padding: 0, overflow: 'hidden' }}>
              <View style={{ height: 14 }} />
              <View style={{ alignItems: 'center' }}>
                {product.discountPercentage > 0 ? (
                  <View style={{ position: 'absolute', top: 0, left: 13 }}>
                    <DiscountTag
                      value={Math.round(product.discountPercentage)}
                      width={50}
                      height={70}
                      color="#2F6D86"
                    />
                  </View>
                ) : null}
                {/* <View style={[styles.discountBadge, { backgroundColor: '#2F6D86' }]}>
                  <Text style={[t.text.small, { color: '#FFFFFF', fontWeight: '800' }]}>
                    {`${Math.round(product.discountPercentage)}%\nOFF`}
                  </Text>
                </View> */}
               
                <Image source={{ uri: product.thumbnail }} style={styles.hero} resizeMode="contain" />
                {product.images.length > 1 ? (
                  <View style={styles.dots}>
                    {Array.from({ length: Math.min(product.images.length, 5) }).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          { backgroundColor: i === 0 ? '#F59E0B' : t.colors.border },
                        ]}
                      />
                    ))}
                  </View>
                ) : null}
              </View>
              <View style={{ padding: 14, paddingTop: 0 }}>
                <Text style={[t.text.small, { color: t.colors.muted }]}>{product.brand ?? 'Brand'}</Text>
                <Text style={[t.text.h2, { color: t.colors.text, marginTop: 4 }]} numberOfLines={2}>
                  {product.title}
                </Text>

                <View style={{ height: 10 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ alignItems: 'baseline', gap: 8 }}>
                    {formatWeightLabel(product.weight) ? (
                      <Text style={[t.text.label, { color: t.colors.muted }]}>
                        {formatWeightLabel(product.weight)}
                      </Text>
                    ) : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={[t.text.label, { color: t.colors.text }]}>{formatMoney(priceInr)}</Text>
                      <Text style={[t.text.small, { color: t.colors.muted, textDecorationLine: 'line-through' }]}>{formatMoney(mrpInr)}</Text>
                    </View>
                  </View>
                  <View style={styles.actionsRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => (hasMoreThanTwoOptions ? onAddPress() : onStartAdd(product))}
                      style={({ pressed }) => [
                        styles.addBtn,
                        { backgroundColor: t.colors.primary, borderRadius: t.radii.md, opacity: pressed ? 0.85 : 1 },
                      ]}>
                      <Text style={[t.text.label, { color: t.colors.primaryText }]}>
                        {getAddCtaLabel(product)}
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <View style={{ height: 12 }} />


              </View>
            </Card>
          </View>

          <View style={{ height: 18 }} />

          <View style={{ paddingHorizontal: t.spacing.lg }}>
            <Text style={[t.text.h2, { color: t.colors.text }]}>Similiar product</Text>
          </View>
          <View style={{ height: 10 }} />

          <FlatList
            contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: 12 }}
            data={similar}
            keyExtractor={it => String(it.id)}
            numColumns={1}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <ProductCard
                title={item.title}
                subtitle={item.brand}
                priceUsd={item.price}
                discountPct={item.discountPercentage}
                imageUrl={item.thumbnail}
                ctaLabel={getAddCtaLabel(item)}
                onCtaPress={() => (hasMoreThanTwoOptions ? onCardOptionsPress(item) : onStartAdd(item))}
                onPress={() => onSelectProduct(item)}
              />
            )}
          />

          <View style={{ height: 18 }} />

          <View style={{ paddingHorizontal: t.spacing.lg }}>
            <Text style={[t.text.h2, { color: t.colors.text }]}>Description</Text>
            <View style={{ height: 10 }} />
            <Card>
              <Text style={[t.text.small, { color: t.colors.muted, lineHeight: 18 }]}>
                {product.description}
              </Text>
            </Card>
          </View>

          <View style={{ height: 18 }} />
{
  alsoBought?.length > 0 ? (
    <>
    <View style={{ paddingHorizontal: t.spacing.lg }}>
            <Text style={[t.text.h2, { color: t.colors.text }]}>Customers also bought</Text>
          </View>
          <View style={{ height: 10 }} />

          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: t.spacing.lg, gap: 12 }}
            data={alsoBought}
            keyExtractor={it => String(it.id)}
            renderItem={({ item }) => (
              <View style={{ width: 140 }}>
                <ProductCard
                  title={item.title}
                  subtitle={item.brand}
                  priceUsd={item.price}
                  discountPct={item.discountPercentage}
                  imageUrl={item.thumbnail}
                  ctaLabel={getAddCtaLabel(item)}
                  onCtaPress={() => (hasMoreThanTwoOptions ? onCardOptionsPress(item) : onStartAdd(item))}
                  onPress={() => onSelectProduct(item)}
                />
              </View>
            )}
          />
    </>
  ) : null
}
          

          <View style={{ height: 28 }} />
        </View>
      )}

      <OptionsSheet
        open={optionsOpen}
        onClose={onCloseOptions}
        title={sheetProduct?.title ?? ''}
        variants={variants}
        product={sheetProduct}
        qty={variantQty}
        setQty={setVariantQty}
        onConfirm={onConfirmOptions}
        confirmDisabled={totalSelected === 0}
      />
    </Screen>
  );
}

function OptionsSheet({
  open,
  onClose,
  title,
  variants,
  product,
  qty,
  setQty,
  onConfirm,
  confirmDisabled,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  variants: Variant[];
  product: DummyJsonProduct | null;
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
        <View style={[styles.sheet, { backgroundColor: t.colors.surface, borderTopLeftRadius: 18, borderTopRightRadius: 18 }]}>
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
                      onDec={() => setQty(prev => ({ ...prev, [v.key]: Math.max(0, (prev[v.key] ?? 0) - 1) }))}
                      onInc={() => setQty(prev => ({ ...prev, [v.key]: Math.min(99, (prev[v.key] ?? 0) + 1) }))}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 10 },
  fabHost: { flex: 1 },
  fab: {
    position: 'absolute',
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  hero: { width: '100%', height: 220 },
  discountBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    zIndex: 2,
  },
  dots: { flexDirection: 'row', gap: 6, paddingTop: 6, paddingBottom: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'flex-end' },
  optionsPill: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: { width: 120, height: 44, alignItems: 'center', justifyContent: 'center' },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 18 },
  variantRow: { flexDirection: 'row', gap: 12, borderWidth: 1, padding: 12, alignItems: 'center' },
  variantImg: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#F3F4F6' },
  smallAdd: { height: 28, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
});


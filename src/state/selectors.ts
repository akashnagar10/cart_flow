import { round2 } from './money';
import { CartState, Money } from './types';

export function selectSubtotal(state: CartState): Money {
  return round2(
    state.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
  );
}

export function selectDiscountAmount(state: CartState): Money {
  if (!state.discount) return 0;
  const subtotal = selectSubtotal(state);
  if (state.discount.type === 'percent') {
    const pct = Math.min(100, Math.max(0, state.discount.value));
    return round2((subtotal * pct) / 100);
  }
  return round2(Math.max(0, state.discount.value));
}

export function selectTaxableAmount(state: CartState): Money {
  const subtotal = selectSubtotal(state);
  const discount = selectDiscountAmount(state);
  return round2(Math.max(0, subtotal - discount));
}

export function selectTax(state: CartState): Money {
  const taxable = selectTaxableAmount(state);
  if (taxable <= 0) return 0;
  const rate = Math.min(1, Math.max(0, state.taxRate));
  return round2(taxable * rate);
}

export function selectShippingFee(state: CartState): Money {
  // If cart is empty, don't charge shipping.
  if (selectSubtotal(state) <= 0) return 0;
  return round2(Math.max(0, state.shipping.fee));
}

export function selectTotal(state: CartState): Money {
  // If cart is empty, there should be no charges at all.
  if (selectSubtotal(state) <= 0) return 0;
  const taxable = selectTaxableAmount(state);
  const tax = selectTax(state);
  const shipping = selectShippingFee(state);
  return round2(taxable + tax + shipping);
}


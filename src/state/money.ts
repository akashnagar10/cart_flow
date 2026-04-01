import { Money } from './types';

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const DEFAULT_CURRENCY = 'INR' as const;

export function formatMoney(value: Money, currency: string = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    maximumFractionDigits: 2,
  }).format(value);
}

// DummyJSON product prices are in USD; we display INR in this app.
export function usdToInr(usd: Money, rate = 83) {
  return round2(usd * rate);
}


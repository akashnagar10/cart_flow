export type Money = number; // stored in major units (e.g. 12.99)

export type CartItem = {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  unitPrice: Money;
  quantity: number;
};

export type Discount =
  | { type: 'percent'; label: string; value: number }
  | { type: 'fixed'; label: string; value: Money };

export type ShippingMethod = {
  id: string;
  label: string;
  fee: Money;
};

export type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export type PaymentMethod =
  | { type: 'card'; last4: string; brand: 'visa' | 'mastercard' | 'amex' | 'other' }
  | { type: 'cash' };

export type CartState = {
  items: CartItem[];
  discount?: Discount;
  shipping: ShippingMethod;
  address: Address;
  payment: PaymentMethod;
  taxRate: number; // 0..1
};


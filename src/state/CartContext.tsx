import React from 'react';
import { clamp } from './money';
import { CartItem, CartState, Discount, PaymentMethod, ShippingMethod } from './types';

type CartAction =
  | { type: 'item/inc'; id: string }
  | { type: 'item/dec'; id: string }
  | { type: 'item/remove'; id: string }
  | { type: 'item/add'; item: CartItem }
  | { type: 'discount/set'; discount?: Discount }
  | { type: 'shipping/set'; shipping: ShippingMethod }
  | { type: 'payment/set'; payment: PaymentMethod }
  | { type: 'cart/reset' };

const initialState: CartState = {
  items: [],
  discount: undefined,
  shipping: { id: 'standard', label: 'Standard', fee: 49 },
  address: {
    fullName: 'Alex Johnson',
    phone: '+91 98765 43210',
    line1: '123 Main St',
    line2: 'Apt 4B',
    city: 'Bengaluru',
    state: 'KA',
    postalCode: '560001',
  },
  userLoggedIn: true,
  locationEnabled: true,
  locationServiceable: true,
  payment: { type: 'card', brand: 'visa', last4: '4242' },
  taxRate: 0.0825,
};

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'item/add': {
      const existing = state.items.find(it => it.id === action.item.id);
      if (existing) {
        return {
          ...state,
          items: state.items.map(it =>
            it.id === action.item.id
              ? { ...it, quantity: clamp(it.quantity + action.item.quantity, 1, 99) }
              : it,
          ),
        };
      }
      return { ...state, items: [...state.items, { ...action.item, quantity: clamp(action.item.quantity, 1, 99) }] };
    }
    case 'item/inc':
      return {
        ...state,
        items: state.items.map(it =>
          it.id === action.id ? { ...it, quantity: clamp(it.quantity + 1, 1, 99) } : it,
        ),
      };
    case 'item/dec':
      return {
        ...state,
        items: state.items
          .map(it => (it.id === action.id ? { ...it, quantity: it.quantity - 1 } : it))
          .filter(it => it.quantity > 0),
      };
    case 'item/remove':
      return { ...state, items: state.items.filter(it => it.id !== action.id) };
    case 'discount/set':
      return { ...state, discount: action.discount };
    case 'shipping/set':
      return { ...state, shipping: action.shipping };
    case 'payment/set':
      return { ...state, payment: action.payment };
    case 'cart/reset':
      return { ...initialState, items: [] };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

type CartApi = {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  add: (item: CartItem) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  setDiscount: (discount?: Discount) => void;
  setShipping: (shipping: ShippingMethod) => void;
  setPayment: (payment: PaymentMethod) => void;
  reset: () => void;
};

const CartContext = React.createContext<CartApi | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const api = React.useMemo<CartApi>(() => {
    return {
      state,
      dispatch,
      add: item => dispatch({ type: 'item/add', item }),
      inc: id => dispatch({ type: 'item/inc', id }),
      dec: id => dispatch({ type: 'item/dec', id }),
      remove: id => dispatch({ type: 'item/remove', id }),
      setDiscount: discount => dispatch({ type: 'discount/set', discount }),
      setShipping: shipping => dispatch({ type: 'shipping/set', shipping }),
      setPayment: payment => dispatch({ type: 'payment/set', payment }),
      reset: () => dispatch({ type: 'cart/reset' }),
    };
  }, [state]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}


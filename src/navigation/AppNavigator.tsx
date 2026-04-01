import React from 'react';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { PaymentScreen } from '../screens/PaymentScreen';
import { SuccessScreen } from '../screens/SuccessScreen';
import { RouteName } from './routes';

type NavState =
  | { name: 'ProductDetail' }
  | { name: 'Cart' }
  | { name: 'Checkout' }
  | { name: 'Payment' }
  | { name: 'Success'; orderId: string };

export type Nav = {
  route: NavState;
  navigate: (name: RouteName, params?: Record<string, unknown>) => void;
  reset: (name: RouteName, params?: Record<string, unknown>) => void;
  back: () => void;
};

const NavigationContext = React.createContext<Nav | null>(null);

export function useNav(): Nav {
  const nav = React.useContext(NavigationContext);
  if (!nav) {
    throw new Error('useNav must be used within AppNavigator');
  }
  return nav;
}

export function AppNavigator() {
  const [stack, setStack] = React.useState<NavState[]>([{ name: 'ProductDetail' }]);

  const route = stack[stack.length - 1];

  const nav = React.useMemo<Nav>(() => {
    return {
      route,
      navigate: (name, params) => {
        setStack(prev => [...prev, toState(name, params)]);
      },
      reset: (name, params) => {
        setStack([toState(name, params)]);
      },
      back: () => {
        setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
      },
    };
  }, [route]);

  return (
    <NavigationContext.Provider value={nav}>
      {route.name === 'ProductDetail' ? <ProductDetailScreen /> : null}
      {route.name === 'Cart' ? <CartScreen /> : null}
      {route.name === 'Checkout' ? <CheckoutScreen /> : null}
      {route.name === 'Payment' ? <PaymentScreen /> : null}
      {route.name === 'Success' ? <SuccessScreen orderId={route.orderId} /> : null}
    </NavigationContext.Provider>
  );
}

function toState(name: RouteName, params?: Record<string, unknown>): NavState {
  switch (name) {
    case 'ProductDetail':
      return { name: 'ProductDetail' };
    case 'Cart':
      return { name: 'Cart' };
    case 'Checkout':
      return { name: 'Checkout' };
    case 'Payment':
      return { name: 'Payment' };
    case 'Success': {
      const orderId =
        typeof params?.orderId === 'string' && params.orderId.trim().length > 0
          ? params.orderId
          : `ORD-${Math.floor(Math.random() * 1_000_000)
              .toString()
              .padStart(6, '0')}`;
      return { name: 'Success', orderId };
    }
    default: {
      const _exhaustive: never = name;
      return _exhaustive;
    }
  }
}


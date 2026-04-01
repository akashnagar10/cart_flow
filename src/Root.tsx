import React from 'react';
import { View } from 'react-native';
import { AppNavigator } from './navigation/AppNavigator';
import { CartProvider } from './state/CartContext';
import { ThemeProvider } from './theme/ThemeContext';

export function Root() {
  return (
    <ThemeProvider>
      <CartProvider>
        <View style={{ flex: 1 }}>
          <AppNavigator />
        </View>
      </CartProvider>
    </ThemeProvider>
  );
}


import React from 'react';
import { theme as baseTheme } from './theme';

export type Theme = typeof baseTheme;

const ThemeContext = React.createContext<Theme>(baseTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeContext.Provider value={baseTheme}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return React.useContext(ThemeContext);
}


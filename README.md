## Aforro — Cart Flow (React Native)

React Native CLI + TypeScript implementation of a complete cart → checkout → payment → success flow.

### What’s implemented

- **Cart screen**: list items, increment/decrement quantity, remove item
- **Checkout screen**: address summary + shipping method selection
- **Payment screen**: payment method selection + place order
- **Success screen**: order confirmation + reset back to cart
- **Business logic**: subtotal/discount/tax/shipping/total are computed from state (no hardcoded totals)

### Project structure

- **`src/navigation/`**: a tiny in-app stack navigator (kept dependency-free)
- **`src/state/`**: cart state (Context + reducer) and pure selectors for totals
- **`src/screens/`**: screen implementations
- **`src/components/`**: reusable domain components (cart item row, order summary)
- **`src/ui/`**: reusable primitives (screen layout, button, card, divider, quantity stepper)
- **`src/theme/`**: centralized theme tokens

### Running locally

Prerequisites: follow React Native environment setup: `https://reactnative.dev/docs/set-up-your-environment`

```sh
npm install
npm start
```

In another terminal:

```sh
npm run ios
# or
npm run android
```

### Notes about the Figma requirement

This codebase is wired so UI tokens can be swapped to match Figma precisely (see `src/theme/theme.ts`).
To match *exact* spacing/typography/colors and all component variants, export/share the Figma frames/specs.

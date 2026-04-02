## Aforro — Cart Flow (React Native)

React Native CLI + TypeScript implementation of a complete **Product → Cart → Checkout → Payment → Success** flow, built to match the “Cart Flow” technical assignment.

### What’s implemented

- **Product detail** (`src/screens/ProductDetailScreen.tsx`)
  - View a product (dummy API)
  - Add to cart (single add or “2 options” bottom sheet for discounted items)
  - Floating cart button shows a **dot badge** when cart has items
- **Cart screen** (`src/screens/CartScreen.tsx`)
  - Cart items list with quantity stepper
  - “Did you forget?” horizontal recommendations strip (dummy API)
  - Coupons UI (apply/remove) affecting totals
  - Delivery instructions chips + custom notes
  - Cart footer states (login / location enabled / serviceable) matching the provided screenshots
- **Checkout screen** (`src/screens/CheckoutScreen.tsx`)
  - Address summary + shipping method selection
- **Payment screen** (`src/screens/PaymentScreen.tsx`)
  - Payment method selection + place order
- **Success screen** (`src/screens/SuccessScreen.tsx`)
  - Order confirmation + reset back to cart
- **Business logic** (`src/state/selectors.ts`)
  - Subtotal/discount/tax/shipping/total are computed from state (**no hardcoded totals**)
  - Free delivery rule: **shipping fee becomes 0 when pre‑shipping total ≥ ₹3000**
- **Typography**
  - Centralized in `src/theme/typography.ts` (Plus Jakarta Sans)

### Project structure

- **`src/navigation/`**: a tiny in-app stack navigator (kept dependency-free)
- **`src/state/`**: cart state (Context + reducer) and pure selectors for totals
- **`src/screens/`**: screen implementations
- **`src/components/`**: reusable domain components (cart item row, order summary)
- **`src/ui/`**: reusable primitives (screen layout, button, card, divider, quantity stepper)
- **`src/theme/`**: centralized theme tokens

### Setup & running locally

Prerequisite: follow the official React Native environment setup for **React Native CLI**:
`https://reactnative.dev/docs/set-up-your-environment`

Install dependencies:

```sh
npm install
```

Start Metro:

```sh
npm start
```

Run the app (in a second terminal):

```sh
npm run ios
# or
npm run android
```

### How the assessment flow works (end-to-end)

- **Product detail → Add to cart**
  - Products come from DummyJSON: `src/api/dummyjson.ts`
  - “Add” inserts a `CartItem` into `CartContext`
  - For “2 options”, a small bottom sheet lets you select quantities for variants before confirming
- **Cart**
  - Quantities update via reducer actions (`inc`/`dec`)
  - Totals shown on Cart/Checkout/Payment are computed by pure selectors (`src/state/selectors.ts`)
- **Checkout**
  - Choose shipping method (fee affects totals; may become free if threshold is met)
- **Payment**
  - Select payment method and “Place order”
- **Success**
  - Shows generated order id, then resets cart state

### Cart footer UI states (for the assignment screenshots)

The Cart screen footer switches based on flags stored in `CartState`:

- **`userLoggedIn`**
- **`locationEnabled`**
- **`locationServiceable`**

They’re currently initialized in `src/state/CartContext.tsx` (`initialState`) so you can easily flip them while developing.

### Notes about the Figma requirement

This codebase is wired so UI tokens can be swapped to match Figma precisely (see `src/theme/theme.ts`).
To match *exact* spacing/typography/colors and all component variants, export/share the Figma frames/specs.

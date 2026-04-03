# Brinjal Fresh Store

## Current State

The app is a PWA vegetable store with:
- **Header** (`App.tsx`): Tall header with green gradient, basket emoji, "Brinjal.fresh" logo, location pill, bell icon, and cart icon. Located in sticky top area.
- **Search bar** (`ShopPage.tsx`): Padded `py-2.5` search box with Search icon, voice Mic button, and Barcode icon.
- **Hero banner** (`ShopPage.tsx`): `HeroBanner` component with `height: 130` fixed height, auto-rotating slides (banner text, free delivery, delivery timing, discount).
- **Bottom navigation** (`App.tsx`): `fixed bottom-0` nav with orange background - but the main content area does NOT properly account for this, causing the nav to overlay content or scroll with the page.
- **Settings tab** (`AdminPage.tsx`): `SettingsTab` has hero banner toggle and banner headline input. The `setBannerEnabled` and `setBannerText` mutations call backend, but the settings tab does NOT have a minimum order field. The backend has `getBannerEnabled`, `setBannerEnabled`, `getBannerText`, `setBannerText` -- these are in both `main.mo` and `useQueries.ts`.
- **Minimum order**: No minimum order feature exists yet in either backend or frontend.
- **Quantity bug**: In `KartContext.tsx`, `addToKart` increments quantity correctly. In `KartPage.tsx`, `placeOrder` sends `quantityLabel: item.quantityOption` (e.g. "1kg"). If a customer adds the SAME quantityOption multiple times (e.g. clicks "1kg" twice = quantity 2), the order sends `quantityLabel: "1kg"` but `quantity` is not sent in the OrderItem -- the `OrderItem` type only has `quantityLabel`, not a separate count. So admin sees "1kg" not "2kg".

## Requested Changes (Diff)

### Add
- **Minimum order setting**: Backend -- add `stable var minimumOrder: Nat = 0` and `getMinimumOrder/setMinimumOrder` functions. Frontend -- add `useMinimumOrder` and `useSetMinimumOrder` hooks. In `SettingsTab` of AdminPage, add a "Minimum Order Amount" input (e.g. ₹99) with a save button. In `ShopPage.tsx` `HeroBanner`, show a 5th slide "Minimum Order ₹99" when minimumOrder > 0. In `KartPage.tsx`, block order placement if subtotal < minimumOrder and show a message.

### Modify
1. **Header (App.tsx)**: Make the header compact and space-saving.
   - Remove: location pill (`flex-1 flex justify-center` center section), bell icon button, the glow bar at top, the basket emoji container
   - Keep only: "Brinjal.fresh" text (smaller font ~1rem) + "Vegetables and Fruits" subtitle, and cart icon button with badge
   - Reduce vertical padding to `py-1.5` or less
   - Keep green gradient background, keep attractive styling

2. **Search bar (ShopPage.tsx)**: Reduce padding from `py-2.5` to `py-1.5`, reduce text from `text-sm` to `text-xs` or keep sm, make it flatter overall.

3. **Hero banner height (ShopPage.tsx)**: Change `height: 130` to `height: 91` (70% of 130 = 91px, i.e. 30% smaller).

4. **Bottom navigation (App.tsx)**: The nav is already `fixed bottom-0` but the main content's `paddingBottom` needs to reliably account for the nav height (~56px). Ensure `<main>` always has enough bottom padding so content is never hidden behind the nav. The nav must always stay pinned at the bottom regardless of scroll.

5. **Quantity display bug fix**: The `OrderItem` type in `main.mo` has `quantityLabel: Text` but no `count/quantity` field. The fix is to encode the full quantity in `quantityLabel` when placing an order. In `KartPage.tsx`, when building `items` for `placeOrder`, change `quantityLabel: item.quantityOption` to `quantityLabel: item.quantity > 1 ? `${item.quantity}x ${item.quantityOption}` : item.quantityOption`. This way admin sees "2x 1kg" or "3x 500g" instead of just "1kg".

6. **Settings tab fix (AdminPage.tsx)**: The settings tab currently calls `setBannerEnabled.mutateAsync` and `setBannerText.mutateAsync`. These use `(actor as any)` casts in useQueries. They should work fine -- but need to verify the backend functions are properly exported. No backend changes needed since `getBannerEnabled`, `setBannerEnabled`, `getBannerText`, `setBannerText` are already in `main.mo`. The issue may be the toggle Switch not working -- verify it calls `handleBannerToggle` properly and uses `checked={bannerEnabled !== false}`. This should already work.

### Remove
- Bell icon button from header
- Location pill from header  
- Basket emoji icon container from header
- Top glow bar from header

## Implementation Plan

1. **Backend (`main.mo`)**: Add `stable var minimumOrder: Nat = 0`, `getMinimumOrder(): async Nat`, `setMinimumOrder(amount: Nat): async ()`.

2. **useQueries.ts**: Add `useMinimumOrder()` and `useSetMinimumOrder()` hooks following same pattern as other hooks.

3. **App.tsx -- Header**: Remove bell, location pill, glow bar, basket icon. Keep only brand text (smaller) and cart icon. Reduce header height significantly.

4. **ShopPage.tsx -- Search bar**: Reduce padding (py-1.5), make flatter.

5. **ShopPage.tsx -- Hero banner**: Change height from 130 to 91. Add 5th slide for minimum order when minimumOrder > 0. Pass minimumOrder prop to HeroBanner.

6. **AdminPage.tsx -- Settings tab**: Add minimum order amount input field + save button using `useSetMinimumOrder`. Fix any issues with banner toggle/text save if needed.

7. **KartPage.tsx -- Quantity label fix**: Change `quantityLabel: item.quantityOption` to `quantityLabel: item.quantity > 1 ? \`${item.quantity}x ${item.quantityOption}\` : item.quantityOption`.

8. **KartPage.tsx -- Minimum order enforcement**: After loading minimumOrder, if subtotal < minimumOrder, show warning and disable Place Order button (or show inline message).

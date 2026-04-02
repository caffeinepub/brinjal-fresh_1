# Brinjal Fresh Store

## Current State

- **Hero banner** (3 slides): slide 1 = custom text, slide 2 = delivery timing, slide 3 = discount
- **Separate FREE DELIVERY banner**: a dedicated green-to-orange gradient strip always shown below the hero
- **Separate discount banner**: an orange strip shown below if discount is active
- **Separate delivery timing banner**: a white strip shown below if timing is set
- **Trust badges strip**: a horizontal row (Fresh Daily, Free Delivery, Same Day, Quality Guaranteed) shown below category pills
- **Discount tab in Admin**: supports percentage discount + flat amount discount (stored as JSON string in `discountText` stable var)
- **Settings tab in Admin**: toggle hero banner, toggle trust badges, set banner headline text
- The `discountText` stable backend var stores a JSON string with fields: `percentage`, `minimumAmount`, `flatAmount`, `flatMinimum`
- `parseDiscount()` in useQueries.ts parses that JSON

## Requested Changes (Diff)

### Add
- New **"Free Item" discount option** in Admin Discount tab: admin can set a free item description (e.g. "1 kg Tomato") and a minimum order amount. When the order reaches the minimum, the free item offer is shown in the cart/checkout and in the hero banner.
- Hero banner now shows Free Delivery message merged into slide content (the separate Free Delivery banner is removed, so hero slide 3 or a dedicated slide handles it)
- Hero banner slide for delivery timing (already exists, keep)
- Hero banner slide for discount or free item offer (already exists, extend to include free item)

### Modify
- **Remove separate FREE DELIVERY banner** (the green-to-orange gradient strip with Truck icon) from ShopPage
- **Remove separate discount banner** (orange Tag strip) from ShopPage
- **Remove separate delivery timing banner** (white strip with truck emoji) from ShopPage
- **Remove trust badges strip** (TrustBadgesStrip component and its render in ShopPage)
- **Hero banner slides** updated: slide 1 = custom headline (from admin), slide 2 = delivery timing, slide 3 = Free Delivery highlight + discount/free item offer combined
- **Admin Discount tab**: add a third section "Free Item Offer" with two fields: free item description (text) and minimum order amount (number)
- **Admin Settings tab**: remove trust badges toggle (since trust badges are removed entirely)
- **`parseDiscount()`**: extend to also parse `freeItem` and `freeItemMinimum` fields
- **Cart/KartPage**: show the free item offer text when subtotal meets the free item minimum

### Remove
- `TrustBadgesStrip` component (frontend only)
- The render of trust badges in ShopPage (`{showTrustBadges && <TrustBadgesStrip />}`)
- The separate FREE DELIVERY banner div in ShopPage
- The separate discount banner div in ShopPage
- The separate delivery timing div in ShopPage
- Trust badges toggle from Admin Settings tab
- `useTrustBadgesEnabled` and `useSetTrustBadgesEnabled` hooks (can keep or just not render - keep to avoid breaking backend, just don't render UI)

## Implementation Plan

1. **Update `parseDiscount()`** in `useQueries.ts` to also return `freeItem: string` and `freeItemMinimum: number`
2. **Update `ShopPage.tsx`**:
   - Remove `TrustBadgesStrip` component
   - Remove trust badges render
   - Remove FREE DELIVERY banner block
   - Remove discount banner block
   - Remove delivery timing banner block
   - Update `HeroBanner` slides: slide 1 = headline, slide 2 = delivery timing (as before), slide 3 = shows Free Delivery + discount info + free item offer combined
3. **Update `AdminPage.tsx` DiscountTab**:
   - Add "Free Item Offer" section with `freeItem` text input and `freeItemMinimum` number input
   - Include `freeItem` and `freeItemMinimum` in the JSON saved to backend
   - Show current free item in the "Current Discount" summary
4. **Update `AdminPage.tsx` SettingsTab**: remove trust badges toggle
5. **Update `KartPage.tsx`**: show free item offer banner when subtotal meets `freeItemMinimum`
6. No backend Motoko changes needed - `discountText` already stores arbitrary JSON, just add new fields to the JSON payload

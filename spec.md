# Brinjal.fresh

## Current State
The discount system stores a free-text string in the backend. The admin types any message which is displayed as-is on the shop page. The cart has no discount logic -- it always charges full subtotal regardless of any discount set.

## Requested Changes (Diff)

### Add
- Admin Discount tab: two structured inputs -- discount percentage (%) and minimum order amount (₹)
- Cart discount calculation: subtract discount from subtotal when subtotal >= minimum order amount
- Cart breakdown display: Subtotal, Discount (X%): -₹Y, Total
- Shop page discount banner: shows "X% off on orders of ₹Y and above" just below the search bar

### Modify
- Admin DiscountTab: replace single free-text input with two fields (percentage + minimum order amount); save as encoded string `"pct|minOrder"` (e.g. `"10|300"`)
- ShopPage discount banner: parse structured discount string and render human-readable message
- KartPage total section: show subtotal, conditional discount row, and final total; also apply discount to order total sent to backend

### Remove
- Nothing removed

## Implementation Plan
1. Update `AdminPage.tsx` DiscountTab -- two inputs for pct + minOrder, save as `"pct|minOrder"`
2. Update `ShopPage.tsx` discount banner -- parse and render structured message
3. Update `KartPage.tsx` -- compute discount, show breakdown, pass discounted total to order

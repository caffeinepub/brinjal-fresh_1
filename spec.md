# Brinjal Fresh Store

## Current State
- Hero banner has dynamic minimum order slide (from admin panel Min Order tab), plus Free Delivery, Delivery Timing, and Discount slides
- Admin panel has a dedicated "Min Order" tab for setting minimum order amount
- Second row uses `HorizontalProductCard`: small horizontal card with image on LEFT and details on RIGHT, two visible at a time
- Hero banner image (`hero-vegetables-group`) occupies ~w-28 (~112px) on the right side of each slide — less than half the banner width
- Homepage layout has no specific scroll constraint; first row may not be fully visible with part of second row peeking

## Requested Changes (Diff)

### Add
- Fixed hero banner slide: "Minimum order up to 99₹" with shopping cart emoji, always shown regardless of admin setting, hardcoded, never removed
- This slide replaces the dynamic minimum order slide (which was conditional on minimumOrder > 0)

### Modify
- **Hero banner vegetable image**: Change from `w-28` to `w-1/2` so the vegetable image covers exactly half the banner area on every slide
- **Second row product cards (`HorizontalProductCard`)**: Change from small horizontal layout (image left, details right) to a taller vertical-style card where:
  - Product image is at the TOP (full width of card)
  - Product name + price + quantity buttons + add button are at the BOTTOM
  - Two cards visible at a time side by side (each ~50% viewport width minus gap)
  - Cards should be noticeably bigger/taller than before
- **Homepage scroll position on load**: Adjust layout heights/spacing so that when a customer first opens the app, they can see the complete first product row AND a small portion of the second row is visible (to hint there's more below)

### Remove
- "Min Order" tab from the admin panel (both the TabsTrigger and TabsContent for `minorder`)
- The `MinOrderTab` function component can be removed too since it's no longer used
- The dynamic minimumOrder slide (conditional on minimumOrder > 0) — replaced by hardcoded fixed slide

## Implementation Plan
1. In `ShopPage.tsx`:
   - In `HeroBanner`: replace the conditional `minimumOrderSlide` with a hardcoded fixed slide for "Minimum order up to 99₹"
   - In `HeroBanner`: change the vegetable image container from `w-28` to `w-1/2` (and adjust text side to `flex-1`)
   - Rewrite `HorizontalProductCard`: change to vertical card layout (image on top, details on bottom), width ~`calc(50vw - 20px)`, taller with proper image height
   - Keep `minimumOrder` prop removal from HeroBanner call site (no longer needed from backend)
2. In `AdminPage.tsx`:
   - Remove the `MinOrderTab` TabsTrigger and TabsContent
   - Remove the `MinOrderTab` function component
   - Remove import of `useMinimumOrder` and `useSetMinimumOrder` from admin if not used elsewhere
3. No backend changes needed — the minimum order backend value is still used in the cart for enforcement

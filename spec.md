# Brinjal Fresh Store

## Current State
- Bottom navigation: Shop, Cart, Admin (3 tabs)
- Admin tab visible to all users, password-protected
- Products have `category` field (unit type: kg/piece/bundle/packet)
- Orders stored with status field (not controlled by admin)
- No customer order tracking page
- No customer profile page
- No product category (Vegetables/Fruits/etc.)
- No customer profiles view in admin

## Requested Changes (Diff)

### Add
- New bottom navigation with 5 tabs: Home, Categories, Cart, Order, Profile
- CategoriesPage: filter products by 5 categories (Vegetables, Fruits, Leafy Vegetables, Root Vegetables, Combo Pack)
- OrderPage: customer sees only their own orders by phone number (stored in localStorage), with status labels (Processing/Delivered/Cancelled)
- ProfilePage: customer name, phone, address auto-filled after first order, editable; saved in localStorage and backend
- `productCategory` field on Product (Vegetables/Fruits/Leafy Vegetables/Root Vegetables/Combo Pack)
- Admin > Products: new dropdown for productCategory when adding/editing products
- Admin > Orders: status dropdown per order (Processing/Delivered/Cancelled) controlled by admin
- Admin > Profiles tab: admin can view all customer profiles (name, phone, address)
- Backend: `saveProfile(name, phone, address)` and `getProfiles()` APIs
- Backend: `getOrdersByPhone(phone)` query for customer order lookup

### Modify
- Bottom navigation: replace Shop/Cart/Admin with Home/Categories/Cart/Order/Profile
- Admin panel: no longer accessible via bottom nav; hidden behind search box (type "admin panel" to open)
- Admin > Products: add productCategory field to add/edit form
- Order status set by admin; reflected immediately to customer in Order tab

### Remove
- Admin tab from bottom navigation

## Implementation Plan
1. Update backend: add `productCategory` to Product type, add CustomerProfile type with save/get APIs, add `getOrdersByPhone` query, keep `updateOrderStatus` as-is
2. Update frontend App.tsx: 5-tab nav (Home/Categories/Cart/Order/Profile), admin accessible via search
3. Create CategoriesPage with product filtering by category
4. Create OrderPage: reads phone from localStorage, fetches orders filtered by phone, shows status
5. Create ProfilePage: localStorage-backed profile, pre-fills checkout form, editable
6. Update AdminPage: add Profiles tab, add order status control in Orders tab, add productCategory to Products tab
7. Update ShopPage: intercept "admin panel" search to open admin, pass productCategory to add/edit product
8. Update KartContext/KartPage: save phone to localStorage after order placed

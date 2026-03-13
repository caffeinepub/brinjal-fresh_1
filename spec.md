# Brinjal.fresh

## Current State
Clean rebuild from scratch. All previous versions had recurring backend issues (naming conflicts, missing `stable` keywords) causing admin panel failures and data resets on every deployment.

## Requested Changes (Diff)

### Add
- Full clean Motoko backend with ALL data variables marked `stable`
- Products, orders, delivery timing, and discount all persist across deployments
- Admin panel with password authentication (`adita96319`), no Internet Identity
- Customer shop with lime green theme and orange bottom navigation
- Quantity selector (250gm, 500gm, 750gm, 1kg) for each product
- Price display with /kg unit, bold and visible
- Checkout without sign-in: name, phone, address only
- Cash on Delivery and Online Payment on Delivery (selection only)
- Discount system: admin sets percentage + minimum order amount
- Auto-refresh shop every 30 seconds
- Admin Orders tab grouped by Today, Yesterday, Past (with full date)
- Delete delivered orders (admin only)
- Custom Brinjal Fresh logo as PWA icon

### Modify
- N/A (clean rebuild)

### Remove
- Feedback tab and admin feedback view (not wanted)

## Implementation Plan
1. Backend (Motoko) - clean, stable variables:
   - `stable var products`: array of Product records
   - `stable var orders`: array of CustomerOrder records (renamed to avoid conflict with base Order type)
   - `stable var deliveryTiming`: Text
   - `stable var discountPct`: Nat
   - `stable var discountMinOrder`: Nat
   - `stable var nextProductId`: Nat
   - `stable var nextOrderId`: Nat
   - Admin auth: checkAdmin(password) returns Bool
   - CRUD: addProduct, updateProduct, deleteProduct, getProducts
   - placeOrder, getOrders, deleteOrder, updateOrderStatus
   - setDeliveryTiming, getDeliveryTiming
   - setDiscount, getDiscount

2. Frontend:
   - Bottom nav: Shop, Cart, Admin (3 tabs, orange)
   - Shop: search bar, discount banner, product grid, 30s auto-refresh
   - Product card: image, name, bold price /kg, quantity dropdown (250gm/500gm/750gm/1kg), Add to Cart
   - Cart: item list, subtotal, discount line (if minimum met), total, checkout form
   - Checkout form: name, phone, address, payment option (COD / Online on Delivery)
   - Admin: password login persisted in localStorage
   - Admin tabs: Products, Orders, Delivery Timing, Discount
   - Admin Orders: Today / Yesterday / Past sections, delete button on delivered orders
   - PWA manifest with Brinjal Fresh logo

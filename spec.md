# Brinjal Fresh Store

## Current State
Fresh rebuild from scratch. No existing source code.

## Requested Changes (Diff)

### Add
- Full Brinjal Fresh Store PWA with all features from conversation history
- Motoko backend with stable variables
- React/TypeScript frontend

### Modify
- N/A (fresh build)

### Remove
- N/A (fresh build)

## Implementation Plan

### Backend (Motoko)
All variables must be `stable` for data persistence. No ICP auth guards — all functions are publicly callable (admin access controlled by frontend password only).

**Data Types:**
- `Product`: id, name, price (per base unit), stock, imageUrl, description, category (Vegetables/Fruits/LeafyVegetables/RootVegetables/ComboPack), unitType (kg/piece/bundle/packet), createdAt
- `Order`: id, customerName, customerPhone, customerAddress, items (array of {productId, productName, quantity, unit, pricePerUnit, totalPrice}), subtotal, discountAmount, discountType, freeItem, total, paymentMethod, status (Processing/Delivered/Cancelled), createdAt
- `CustomerProfile`: phone, name, address, updatedAt
- `DeliveryTiming`: message
- `DiscountSettings`: percentageOff, percentageMinOrder, flatOff, flatMinOrder, freeItemName, freeItemMinOrder
- `AppSettings`: heroBannerEnabled, heroBannerHeadline

**Backend Functions:**
- getProducts, addProduct, updateProduct, deleteProduct
- getOrders, placeOrder, updateOrderStatus, deleteOrder
- getCustomerOrders (by phone)
- saveProfile, getProfile (by phone), getAllProfiles
- getDeliveryTiming, setDeliveryTiming
- getDiscountSettings, setDiscountSettings
- getAppSettings, setAppSettings

### Frontend (React/TypeScript)

**PWA Setup:**
- manifest.json with Brinjal Fresh Store name, lime green theme
- User-uploaded logo as PWA icon: `/assets/uploads/file_0000000059c071faa5c5676b159da8c7-1-1-1.png`
- favicon set to logo
- Auto-refresh every 30 seconds

**Bottom Navigation (5 tabs, fixed at bottom):**
1. Home (main shop)
2. Categories
3. Cart
4. Order
5. Account

**Home Page:**
- Compact slim header: small "Brinjal.fresh" text + "Vegetables and Fruits" subtitle + cart icon with badge. No bell, no location pill.
- Smaller, flatter search bar. Typing "admin panel" opens hidden admin panel.
- Hero banner (30% smaller than default), 4 rotating slides (3 second interval):
  - Slide 1 (fixed): "Minimum order up to ₹99" + vegetables image covering half
  - Slide 2: "Free Delivery on Every Order" + vegetables image
  - Slide 3: Delivery timing from admin (only if set)
  - Slide 4: Discount offer from admin (only if set)
  - Each slide: vegetables group image on right half, text on left half
- Category pill strip below banner (horizontal scroll): Vegetables | Fruits | Leafy | Roots | Combo
- Product rows by category (horizontally scrollable, each with bold section title):
  - Row 1: Vegetables (3 compact cards visible at once, horizontally scroll)
  - Row 2: Vegetables overflow OR Fruits (when fruits added, Fruits take row 2)
  - Row 3: Leafy Vegetables
  - Row 4: Combo Pack
  - Row 5: Fruits (when added)
- Reduced vertical spacing between all sections

**Product Card - Row 1 (compact, 3 per row):**
- Compact square card
- Product photo
- Bold red price + bold unit (e.g. ₹28/kg)
- Inline quantity buttons (250g, 500g, 1kg for kg; 1pc, 2pc, 5pc for piece; etc.) with green highlight
- Calculated price + green "+Add" button

**Product Card - Row 2+ (horizontal box, 2 per row):**
- Wider card
- Product image at top
- Product description and price below
- Same quantity buttons and Add button

**Categories Page:**
- Grid of 5 categories with images (Vegetables, Fruits, Leafy Vegetables, Root Vegetables, Combo Pack)
- Tapping filters products

**Cart Page:**
- Items list with qty, price
- Auto-apply best discount (percentage vs flat vs free item)
- Free item notice if earned
- Subtotal, discount, total
- Checkout: name, phone, address (no login)
- Payment: Cash on Delivery or Online Payment on Delivery (selection only)

**Order Page:**
- Customer sees only their own orders (by phone stored locally)
- Status: Processing / Delivered / Cancelled
- Grouped: Today, Yesterday, Past

**Account Page:**
- Name, phone, address
- Auto-filled after first order
- Editable

**Admin Panel (hidden, password: adita96319):**
- Accessed by typing "admin panel" in search bar
- Tabs: Products, Orders, Delivery Timing, Discount, Profiles, Settings
- **Products:** Add/edit/delete, image upload (file picker), name, price, stock, description, category, unitType
- **Orders:** Grouped Today/Yesterday/Past, show product name + quantity + unit, set status (Processing/Delivered/Cancelled), admin can delete delivered orders
- **Delivery Timing:** Set delivery message, shown in hero banner
- **Discount:** Percentage off (with min order), Flat amount off (with min order), Free item (item name + min order)
- **Profiles:** View all customer profiles
- **Settings:** Toggle hero banner on/off, edit headline text

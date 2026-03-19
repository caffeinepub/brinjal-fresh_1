import Map "mo:core/Map";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // ── Legacy types (generation 1) – kept for stable-variable compat ────────
  type OldUnitType = { #kg; #piece; #bundle; #packet };

  type StoreProduct = {
    id          : Nat;
    name        : Text;
    unitType    : OldUnitType;
    pricePerUnit: Nat;
    stock       : Nat;
    imageId     : Text;
  };

  type LegacyOrderItem1 = {
    productId   : Nat;
    productName : Text;
    quantityLabel: Text;
    unitPrice   : Nat;
    itemTotal   : Nat;
  };

  type CustomerOrder = {
    id              : Nat;
    customerName    : Text;
    phone           : Text;
    address         : Text;
    items           : [LegacyOrderItem1];
    subtotal        : Nat;
    discountAmount  : Nat;
    totalAmount     : Nat;
    paymentMethod   : Text;
    status          : Text;
    createdAt       : Int;
  };

  type OldFeedback = {
    id           : Nat;
    customerName : Text;
    message      : Text;
    createdAt    : Int;
  };

  // Generation-1 stable maps – kept only for upgrade compatibility, not used
  let storeProducts  = Map.empty<Nat, StoreProduct>();
  let customerOrders = Map.empty<Nat, CustomerOrder>();
  let feedbacks      = Map.empty<Nat, OldFeedback>();

  // Generation-1 stable scalars – kept for upgrade compatibility
  stable var discountPercentage : Nat  = 0;
  stable var discountMinimum    : Nat  = 0;
  stable var discount           : Text = "";
  stable var nextFeedbackId     : Nat  = 1;

  // ── Legacy types (generation 2) – kept for stable-variable compat ────────
  // These match the EXACT types used by the `products` and `orders` maps
  // that were introduced in the previous deployed version.
  type ProductV2 = {
    id       : Nat;
    name     : Text;
    price    : Nat;
    stock    : Nat;
    imageId  : Text;
    category : Text;   // was used as unit-type string
  };

  type OrderItemV2 = {
    productId   : Nat;
    productName : Text;
    quantity    : Nat;
    price       : Nat;
  };

  type OrderV2 = {
    id              : Nat;
    customerName    : Text;
    customerPhone   : Text;
    customerAddress : Text;
    paymentMethod   : Text;
    items           : [OrderItemV2];
    totalAmount     : Nat;
    status          : Text;
    createdAt       : Int;
  };

  // Keep the SAME variable names with the SAME (gen-2) types – fixes M0170
  let products = Map.empty<Nat, ProductV2>();
  let orders   = Map.empty<Nat, OrderV2>();

  // ── Active (generation 3) types ────────────────────────────────────────
  type Product = {
    id              : Nat;
    name            : Text;
    price           : Nat;
    stock           : Nat;
    imageId         : Text;
    unitType        : Text;        // "kg", "piece", "bundle", "packet"
    productCategory : Text;        // "Vegetables", "Fruits", etc.
    description     : Text;
  };

  type OrderItem = {
    productId    : Nat;
    productName  : Text;
    quantityLabel: Text;           // e.g. "250gm", "1 Piece"
    unitPrice    : Nat;
    itemTotal    : Nat;
  };

  type Order = {
    id              : Nat;
    customerName    : Text;
    customerPhone   : Text;
    customerAddress : Text;
    paymentMethod   : Text;
    items           : [OrderItem];
    subtotal        : Nat;
    discountAmount  : Nat;
    totalAmount     : Nat;
    status          : Text;        // "Processing", "Delivered", "Cancelled"
    createdAt       : Int;
  };

  type CustomerProfile = {
    phone     : Text;
    name      : Text;
    address   : Text;
    updatedAt : Int;
  };

  // ── Active stable state (gen 3) ───────────────────────────────────────
  stable var nextProductId  : Nat  = 1;
  stable var nextOrderId    : Nat  = 1;
  stable var deliveryTiming : Text = "10am - 6pm";
  stable var discountText   : Text = "";

  // New variable names for gen-3 maps
  let productsNew = Map.empty<Nat, Product>();
  let ordersNew   = Map.empty<Nat, Order>();
  let profiles    = Map.empty<Text, CustomerProfile>();

  // ── Product APIs ───────────────────────────────────────────────────────────
  public shared func addProduct(
    name            : Text,
    price           : Nat,
    stock           : Nat,
    imageId         : Text,
    unitType        : Text,
    productCategory : Text,
    description     : Text
  ) : async Nat {
    let id = nextProductId;
    productsNew.add(id, { id; name; price; stock; imageId; unitType; productCategory; description });
    nextProductId += 1;
    id
  };

  public query func getProducts() : async [Product] {
    productsNew.values().toArray()
  };

  public query func getProduct(id : Nat) : async Product {
    switch (productsNew.get(id)) {
      case (?p) { p };
      case (null) { Runtime.trap("Product not found") };
    }
  };

  public shared func updateProduct(
    id              : Nat,
    name            : Text,
    price           : Nat,
    stock           : Nat,
    imageId         : Text,
    unitType        : Text,
    productCategory : Text,
    description     : Text
  ) : async () {
    switch (productsNew.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_)   { productsNew.add(id, { id; name; price; stock; imageId; unitType; productCategory; description }) };
    };
  };

  public shared func deleteProduct(id : Nat) : async () {
    productsNew.remove(id);
  };

  // ── Order APIs ─────────────────────────────────────────────────────────────
  public shared func placeOrder(
    customerName    : Text,
    customerPhone   : Text,
    customerAddress : Text,
    paymentMethod   : Text,
    items           : [OrderItem],
    subtotal        : Nat,
    discountAmount  : Nat,
    totalAmount     : Nat
  ) : async Nat {
    let id = nextOrderId;
    ordersNew.add(id, {
      id;
      customerName;
      customerPhone;
      customerAddress;
      paymentMethod;
      items;
      subtotal;
      discountAmount;
      totalAmount;
      status    = "Processing";
      createdAt = Time.now();
    });
    nextOrderId += 1;
    id
  };

  public query func getOrders() : async [Order] {
    ordersNew.values().toArray()
  };

  public query func getOrdersByPhone(phone : Text) : async [Order] {
    ordersNew.values().filter(func(o : Order) : Bool { o.customerPhone == phone }).toArray()
  };

  public shared func updateOrderStatus(id : Nat, status : Text) : async () {
    switch (ordersNew.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) {
        ordersNew.add(id, {
          id              = o.id;
          customerName    = o.customerName;
          customerPhone   = o.customerPhone;
          customerAddress = o.customerAddress;
          paymentMethod   = o.paymentMethod;
          items           = o.items;
          subtotal        = o.subtotal;
          discountAmount  = o.discountAmount;
          totalAmount     = o.totalAmount;
          status;
          createdAt       = o.createdAt;
        });
      };
    };
  };

  public shared func deleteOrder(id : Nat) : async () {
    ordersNew.remove(id);
  };

  // ── Customer Profiles ──────────────────────────────────────────────────────
  public shared func saveProfile(name : Text, phone : Text, address : Text) : async () {
    profiles.add(phone, { phone; name; address; updatedAt = Time.now() });
  };

  public query func getProfiles() : async [CustomerProfile] {
    profiles.values().toArray()
  };

  // ── Delivery Timing ────────────────────────────────────────────────────────
  public query func getDeliveryTiming() : async Text { deliveryTiming };

  public shared func setDeliveryTiming(timing : Text) : async () {
    deliveryTiming := timing;
  };

  // ── Discount ────────────────────────────────────────────────────────────────
  public query func getDiscount() : async Text { discountText };

  public shared func setDiscount(text : Text) : async () {
    discountText := text;
  };
};

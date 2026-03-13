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

  // ── Legacy types kept for stable-variable upgrade compatibility ───────────
  type OldUnitType = { #kg; #piece; #bundle; #packet };

  type StoreProduct = {
    id : Nat;
    name : Text;
    unitType : OldUnitType;
    pricePerUnit : Nat;
    stock : Nat;
    imageId : Text;
  };

  type OldOrderItem = {
    productId : Nat;
    productName : Text;
    quantityLabel : Text;
    unitPrice : Nat;
    itemTotal : Nat;
  };

  type CustomerOrder = {
    id : Nat;
    customerName : Text;
    phone : Text;
    address : Text;
    items : [OldOrderItem];
    subtotal : Nat;
    discountAmount : Nat;
    totalAmount : Nat;
    paymentMethod : Text;
    status : Text;
    createdAt : Int;
  };

  type OldFeedback = {
    id : Nat;
    customerName : Text;
    message : Text;
    createdAt : Int;
  };

  // Legacy stable maps -- kept only for upgrade compatibility, not used
  let storeProducts  = Map.empty<Nat, StoreProduct>();
  let customerOrders = Map.empty<Nat, CustomerOrder>();
  let feedbacks      = Map.empty<Nat, OldFeedback>();

  // Legacy stable scalars -- kept for upgrade compatibility
  stable var discountPercentage : Nat = 0;
  stable var discountMinimum    : Nat = 0;
  stable var discount           : Text = "";
  stable var nextFeedbackId     : Nat = 1;

  // ── Active types ───────────────────────────────────────────────────────────────
  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    stock : Nat;
    imageId : Text;
    category : Text; // unit type: "kg", "piece", "bundle", "packet"
  };

  type OrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    price : Nat;
  };

  type Order = {
    id : Nat;
    customerName : Text;
    customerPhone : Text;
    customerAddress : Text;
    paymentMethod : Text;
    items : [OrderItem];
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
  };

  // ── Active stable state ────────────────────────────────────────────────────────
  stable var nextProductId  : Nat = 1;
  stable var nextOrderId    : Nat = 1;
  stable var deliveryTiming : Text = "10am - 6pm";
  stable var discountText   : Text = "";

  let products = Map.empty<Nat, Product>();
  let orders   = Map.empty<Nat, Order>();

  // ── Product methods ────────────────────────────────────────────────────────
  public shared func addProduct(
    name     : Text,
    price    : Nat,
    stock    : Nat,
    imageId  : Text,
    category : Text
  ) : async Nat {
    let id = nextProductId;
    products.add(id, { id; name; price; stock; imageId; category });
    nextProductId += 1;
    id
  };

  public query func getProducts() : async [Product] {
    products.values().toArray()
  };

  public query func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (?p) { p };
      case (null) { Runtime.trap("Product not found") };
    }
  };

  public shared func updateProduct(
    id       : Nat,
    name     : Text,
    price    : Nat,
    stock    : Nat,
    imageId  : Text,
    category : Text
  ) : async () {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_)   { products.add(id, { id; name; price; stock; imageId; category }) };
    };
  };

  public shared func deleteProduct(id : Nat) : async () {
    products.remove(id);
  };

  // ── Order methods ──────────────────────────────────────────────────────────
  public shared func placeOrder(
    customerName    : Text,
    customerPhone   : Text,
    customerAddress : Text,
    paymentMethod   : Text,
    items           : [OrderItem]
  ) : async Nat {
    let id = nextOrderId;
    var total : Nat = 0;
    for (item in items.vals()) {
      total += item.price * item.quantity;
    };
    orders.add(id, {
      id;
      customerName;
      customerPhone;
      customerAddress;
      paymentMethod;
      items;
      totalAmount = total;
      status = "pending";
      createdAt = Time.now();
    });
    nextOrderId += 1;
    id
  };

  public query func getOrders() : async [Order] {
    orders.values().toArray()
  };

  public shared func updateOrderStatus(id : Nat, status : Text) : async () {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) {
        orders.add(id, {
          id              = o.id;
          customerName    = o.customerName;
          customerPhone   = o.customerPhone;
          customerAddress = o.customerAddress;
          paymentMethod   = o.paymentMethod;
          items           = o.items;
          totalAmount     = o.totalAmount;
          status;
          createdAt       = o.createdAt;
        });
      };
    };
  };

  public shared func deleteOrder(id : Nat) : async () {
    orders.remove(id);
  };

  // ── Delivery Timing ────────────────────────────────────────────────────────
  public query func getDeliveryTiming() : async Text { deliveryTiming };

  public shared func setDeliveryTiming(timing : Text) : async () {
    deliveryTiming := timing;
  };

  // ── Discount (stored as JSON string) ─────────────────────────────────────
  public query func getDiscount() : async Text { discountText };

  public shared func setDiscount(text : Text) : async () {
    discountText := text;
  };
};

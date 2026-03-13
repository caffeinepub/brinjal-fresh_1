import Map "mo:core/Map";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Nat "mo:core/Nat";

actor {
  // Keep for upgrade compatibility with previous version
  let accessControlState = AccessControl.initState();

  include MixinStorage();

  // ── Old types kept for stable-variable compatibility ──────────────────────
  type OldProduct = {
    id : Nat;
    name : Text;
    price : Nat;
    stock : Nat;
    imageId : Text;
    category : Text;
  };

  type OldOrderItem = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    price : Nat;
  };

  type OldOrder = {
    id : Nat;
    customerName : Text;
    customerPhone : Text;
    customerAddress : Text;
    paymentMethod : Text;
    items : [OldOrderItem];
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
  };

  type OldFeedback = {
    id : Nat;
    customerName : Text;
    message : Text;
    createdAt : Int;
  };

  // Old stable maps -- kept for upgrade compatibility, not used by new logic
  let products = Map.empty<Nat, OldProduct>();
  let orders = Map.empty<Nat, OldOrder>();
  let feedbacks = Map.empty<Nat, OldFeedback>();

  // Old stable vars -- kept for upgrade compatibility
  var nextFeedbackId : Nat = 1;
  var discount : Text = "";

  // ── New types ─────────────────────────────────────────────────────────────
  type UnitType = { #kg; #piece; #bundle; #packet };

  type StoreProduct = {
    id : Nat;
    name : Text;
    unitType : UnitType;
    pricePerUnit : Nat;
    stock : Nat;
    imageId : Text;
  };

  type OrderItem = {
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
    items : [OrderItem];
    subtotal : Nat;
    discountAmount : Nat;
    totalAmount : Nat;
    paymentMethod : Text;
    status : Text;
    createdAt : Int;
  };

  type DiscountSettings = {
    percentage : Nat;
    minimumAmount : Nat;
  };

  // ── New stable state ──────────────────────────────────────────────────────
  var nextProductId : Nat = 1;
  var nextOrderId : Nat = 1;
  var deliveryTiming : Text = "10am - 6pm";
  var discountPercentage : Nat = 0;
  var discountMinimum : Nat = 0;

  let storeProducts = Map.empty<Nat, StoreProduct>();
  let customerOrders = Map.empty<Nat, CustomerOrder>();

  // ── Product methods ───────────────────────────────────────────────────────
  public shared func addProduct(name : Text, unitType : UnitType, pricePerUnit : Nat, stock : Nat, imageId : Text) : async Nat {
    let id = nextProductId;
    storeProducts.add(id, { id; name; unitType; pricePerUnit; stock; imageId });
    nextProductId += 1;
    id
  };

  public shared func updateProduct(id : Nat, name : Text, unitType : UnitType, pricePerUnit : Nat, stock : Nat, imageId : Text) : async () {
    switch (storeProducts.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) { storeProducts.add(id, { id; name; unitType; pricePerUnit; stock; imageId }) };
    };
  };

  public shared func deleteProduct(id : Nat) : async () {
    storeProducts.remove(id);
  };

  public query func getProducts() : async [StoreProduct] {
    storeProducts.values().toArray()
  };

  // ── Order methods ─────────────────────────────────────────────────────────
  public shared func placeOrder(
    customerName : Text,
    phone : Text,
    address : Text,
    items : [OrderItem],
    subtotal : Nat,
    discountAmount : Nat,
    totalAmount : Nat,
    paymentMethod : Text
  ) : async Nat {
    let id = nextOrderId;
    customerOrders.add(id, {
      id;
      customerName;
      phone;
      address;
      items;
      subtotal;
      discountAmount;
      totalAmount;
      paymentMethod;
      status = "pending";
      createdAt = Time.now();
    });
    nextOrderId += 1;
    id
  };

  public query func getOrders() : async [CustomerOrder] {
    customerOrders.values().toArray()
  };

  public shared func updateOrderStatus(id : Nat, status : Text) : async () {
    switch (customerOrders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) {
        customerOrders.add(id, {
          id = o.id;
          customerName = o.customerName;
          phone = o.phone;
          address = o.address;
          items = o.items;
          subtotal = o.subtotal;
          discountAmount = o.discountAmount;
          totalAmount = o.totalAmount;
          paymentMethod = o.paymentMethod;
          status;
          createdAt = o.createdAt;
        });
      };
    };
  };

  public shared func deleteOrder(id : Nat) : async () {
    customerOrders.remove(id);
  };

  // ── Delivery Timing ───────────────────────────────────────────────────────
  public query func getDeliveryTiming() : async Text { deliveryTiming };

  public shared func setDeliveryTiming(timing : Text) : async () {
    deliveryTiming := timing;
  };

  // ── Discount ──────────────────────────────────────────────────────────────
  public query func getDiscount() : async DiscountSettings {
    { percentage = discountPercentage; minimumAmount = discountMinimum }
  };

  public shared func setDiscount(percentage : Nat, minimumAmount : Nat) : async () {
    discountPercentage := percentage;
    discountMinimum := minimumAmount;
  };
};

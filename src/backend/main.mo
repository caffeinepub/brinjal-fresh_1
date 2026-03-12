import Map "mo:core/Map";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  // Migration: keep accessControlState so the upgrade doesn't fail due to
  // a stable variable being implicitly discarded. It is no longer used.
  let accessControlState = AccessControl.initState();

  include MixinStorage();

  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    stock : Nat;
    imageId : Text;
    category : Text;
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

  module Product {
    public func compare(p1 : Product, p2 : Product) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  let products = Map.empty<Nat, Product>();
  let orders = Map.empty<Nat, Order>();

  var nextProductId = 1;
  var nextOrderId = 1;

  var deliveryTiming : Text = "10am - 6pm";
  var discount : Text = "";

  // Product Management
  public shared func addProduct(name : Text, price : Nat, stock : Nat, imageId : Text, category : Text) : async Nat {
    let product : Product = {
      id = nextProductId;
      name;
      price;
      stock;
      imageId;
      category;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
    product.id;
  };

  public shared func updateProduct(id : Nat, name : Text, price : Nat, stock : Nat, imageId : Text, category : Text) : async () {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?_) {
        let updatedProduct : Product = {
          id;
          name;
          price;
          stock;
          imageId;
          category;
        };
        products.add(id, updatedProduct);
      };
    };
  };

  public shared func deleteProduct(id : Nat) : async () {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?_) { products.remove(id) };
    };
  };

  public query func getProducts() : async [Product] {
    products.values().toArray().sort();
  };

  public query func getProduct(id : Nat) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product does not exist") };
      case (?product) { product };
    };
  };

  // Orders
  public shared func placeOrder(customerName : Text, customerPhone : Text, customerAddress : Text, paymentMethod : Text, items : [OrderItem]) : async Nat {
    let totalAmount = items.values().foldLeft(0, func(acc, item) { acc + item.price * item.quantity });
    let order : Order = {
      id = nextOrderId;
      customerName;
      customerPhone;
      customerAddress;
      paymentMethod;
      items;
      totalAmount;
      status = "pending";
      createdAt = Time.now();
    };
    orders.add(nextOrderId, order);
    nextOrderId += 1;
    order.id;
  };

  public query func getOrders() : async [Order] {
    orders.values().toArray();
  };

  public shared func updateOrderStatus(orderId : Nat, status : Text) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order does not exist") };
      case (?order) {
        let updatedOrder : Order = {
          id = order.id;
          customerName = order.customerName;
          customerPhone = order.customerPhone;
          customerAddress = order.customerAddress;
          paymentMethod = order.paymentMethod;
          items = order.items;
          totalAmount = order.totalAmount;
          status;
          createdAt = order.createdAt;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public query func getDeliveryTiming() : async Text {
    deliveryTiming;
  };

  public shared func setDeliveryTiming(timing : Text) : async () {
    deliveryTiming := timing;
  };

  public query func getDiscount() : async Text {
    discount;
  };

  public shared func setDiscount(discountText : Text) : async () {
    discount := discountText;
  };
};

import Array "mo:base/Array";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Result "mo:base/Result";

actor {
  let ADMIN_PASSWORD = "adita96319";

  type Product = {
    id: Nat;
    name: Text;
    pricePerKg: Nat;
    stock: Nat;
    imageUrl: Text;
  };

  type OrderItem = {
    productId: Nat;
    productName: Text;
    quantity: Text;
    priceAtOrder: Nat;
  };

  type CustomerOrder = {
    id: Nat;
    customerName: Text;
    phone: Text;
    address: Text;
    items: [OrderItem];
    paymentMethod: Text;
    status: Text;
    createdAt: Int;
  };

  stable var products: [Product] = [];
  stable var customerOrders: [CustomerOrder] = [];
  stable var deliveryTiming: Text = "";
  stable var discountPct: Nat = 0;
  stable var discountMinOrder: Nat = 0;
  stable var nextProductId: Nat = 1;
  stable var nextOrderId: Nat = 1;

  func isAdmin(password: Text): Bool {
    password == ADMIN_PASSWORD
  };

  public query func checkAdmin(password: Text): async Bool {
    isAdmin(password)
  };

  public query func getProducts(): async [Product] {
    products
  };

  public shared func addProduct(name: Text, pricePerKg: Nat, stock: Nat, imageUrl: Text, adminPassword: Text): async Result.Result<Nat, Text> {
    if (not isAdmin(adminPassword)) { return #err("Unauthorized") };
    let id = nextProductId;
    nextProductId += 1;
    let product: Product = { id; name; pricePerKg; stock; imageUrl };
    products := Array.append(products, [product]);
    #ok(id)
  };

  public shared func updateProduct(id: Nat, name: Text, pricePerKg: Nat, stock: Nat, imageUrl: Text, adminPassword: Text): async Result.Result<(), Text> {
    if (not isAdmin(adminPassword)) { return #err("Unauthorized") };
    products := Array.map<Product, Product>(products, func(p) {
      if (p.id == id) { { id; name; pricePerKg; stock; imageUrl } } else { p }
    });
    #ok(())
  };

  public shared func deleteProduct(id: Nat, adminPassword: Text): async Result.Result<(), Text> {
    if (not isAdmin(adminPassword)) { return #err("Unauthorized") };
    products := Array.filter<Product>(products, func(p) { p.id != id });
    #ok(())
  };

  public shared func placeOrder(customerName: Text, phone: Text, address: Text, items: [OrderItem], paymentMethod: Text): async Nat {
    let id = nextOrderId;
    nextOrderId += 1;
    let order: CustomerOrder = {
      id;
      customerName;
      phone;
      address;
      items;
      paymentMethod;
      status = "Pending";
      createdAt = Time.now();
    };
    customerOrders := Array.append(customerOrders, [order]);
    id
  };

  public query func getOrders(adminPassword: Text): async Result.Result<[CustomerOrder], Text> {
    if (not isAdmin(adminPassword)) { return #err("Unauthorized") };
    #ok(customerOrders)
  };

  public shared func updateOrderStatus(id: Nat, status: Text, adminPassword: Text): async Result.Result<(), Text> {
    if (not isAdmin(adminPassword)) { return #err("Unauthorized") };
    customerOrders := Array.map<CustomerOrder, CustomerOrder>(customerOrders, func(o) {
      if (o.id == id) {
        { id = o.id; customerName = o.customerName; phone = o.phone; address = o.address; items = o.items; paymentMethod = o.paymentMethod; status; createdAt = o.createdAt }
      } else { o }
    });
    #ok(())
  };

  public shared func deleteOrder(id: Nat, adminPassword: Text): async Result.Result<(), Text> {
    if (not isAdmin(adminPassword)) { return #err("Unauthorized") };
    customerOrders := Array.filter<CustomerOrder>(customerOrders, func(o) { o.id != id });
    #ok(())
  };

  public shared func setDeliveryTiming(timing: Text, adminPassword: Text): async Result.Result<(), Text> {
    if (not isAdmin(adminPassword)) { return #err("Unauthorized") };
    deliveryTiming := timing;
    #ok(())
  };

  public query func getDeliveryTiming(): async Text {
    deliveryTiming
  };

  public shared func setDiscount(pct: Nat, minOrder: Nat, adminPassword: Text): async Result.Result<(), Text> {
    if (not isAdmin(adminPassword)) { return #err("Unauthorized") };
    discountPct := pct;
    discountMinOrder := minOrder;
    #ok(())
  };

  public query func getDiscount(): async (Nat, Nat) {
    (discountPct, discountMinOrder)
  };
};

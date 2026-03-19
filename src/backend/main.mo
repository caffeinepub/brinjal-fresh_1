import Map "mo:core/Map";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";



actor {
  type OldUnitType = { #kg; #piece; #bundle; #packet };

  type StoreProduct = {
    id : Nat;
    name : Text;
    unitType : OldUnitType;
    pricePerUnit : Nat;
    stock : Nat;
    imageId : Text;
  };

  type LegacyOrderItem1 = {
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
    items : [LegacyOrderItem1];
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

  let storeProducts = Map.empty<Nat, StoreProduct>();
  let customerOrders = Map.empty<Nat, CustomerOrder>();
  let feedbacks = Map.empty<Nat, OldFeedback>();

  stable var discountPercentage : Nat = 0;
  stable var discountMinimum : Nat = 0;
  stable var discount : Text = "";
  stable var nextFeedbackId : Nat = 1;

  type ProductV2 = {
    id : Nat;
    name : Text;
    price : Nat;
    stock : Nat;
    imageId : Text;
    category : Text;
  };

  type OrderItemV2 = {
    productId : Nat;
    productName : Text;
    quantity : Nat;
    price : Nat;
  };

  type OrderV2 = {
    id : Nat;
    customerName : Text;
    customerPhone : Text;
    customerAddress : Text;
    paymentMethod : Text;
    items : [OrderItemV2];
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
  };

  let products = Map.empty<Nat, ProductV2>();
  let orders = Map.empty<Nat, OrderV2>();

  type Product = {
    id : Nat;
    name : Text;
    price : Nat;
    stock : Nat;
    imageId : Text;
    unitType : Text;
    productCategory : Text;
    description : Text;
  };

  type OrderItem = {
    productId : Nat;
    productName : Text;
    quantityLabel : Text;
    unitPrice : Nat;
    itemTotal : Nat;
  };

  type Order = {
    id : Nat;
    customerName : Text;
    customerPhone : Text;
    customerAddress : Text;
    paymentMethod : Text;
    items : [OrderItem];
    subtotal : Nat;
    discountAmount : Nat;
    totalAmount : Nat;
    status : Text;
    createdAt : Int;
  };

  type CustomerProfile = {
    phone : Text;
    name : Text;
    address : Text;
    updatedAt : Int;
  };

  public type UserProfile = {
    name : Text;
    phone : Text;
    address : Text;
  };

  stable var nextProductId : Nat = 1;
  stable var nextOrderId : Nat = 1;
  stable var deliveryTiming : Text = "10am - 6pm";
  stable var discountText : Text = "";

  let productsNew = Map.empty<Nat, Product>();
  let ordersNew = Map.empty<Nat, Order>();
  let profiles = Map.empty<Text, CustomerProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addProduct(
    name : Text,
    price : Nat,
    stock : Nat,
    imageId : Text,
    unitType : Text,
    productCategory : Text,
    description : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add products");
    };
    let id = nextProductId;
    productsNew.add(id, { id; name; price; stock; imageId; unitType; productCategory; description });
    nextProductId += 1;
    id;
  };

  public query func getProducts() : async [Product] {
    productsNew.values().toArray();
  };

  public query func getProduct(id : Nat) : async Product {
    switch (productsNew.get(id)) {
      case (?p) { p };
      case (null) { Runtime.trap("Product not found") };
    };
  };

  public shared ({ caller }) func updateProduct(
    id : Nat,
    name : Text,
    price : Nat,
    stock : Nat,
    imageId : Text,
    unitType : Text,
    productCategory : Text,
    description : Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    switch (productsNew.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        productsNew.add(id, { id; name; price; stock; imageId; unitType; productCategory; description });
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    productsNew.remove(id);
  };

  // placeOrder is open to all anonymous customers - no login required
  public shared func placeOrder(
    customerName : Text,
    customerPhone : Text,
    customerAddress : Text,
    paymentMethod : Text,
    items : [OrderItem],
    subtotal : Nat,
    discountAmount : Nat,
    totalAmount : Nat,
  ) : async Nat {
    let id = nextOrderId;
    ordersNew.add(
      id,
      {
        id;
        customerName;
        customerPhone;
        customerAddress;
        paymentMethod;
        items;
        subtotal;
        discountAmount;
        totalAmount;
        status = "Processing";
        createdAt = Time.now();
      },
    );
    nextOrderId += 1;
    id;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    ordersNew.values().toArray();
  };

  // getOrdersByPhone open to all - customers look up by their own phone number
  public query func getOrdersByPhone(phone : Text) : async [Order] {
    ordersNew.values().filter(func(o : Order) : Bool { o.customerPhone == phone }).toArray();
  };

  public shared ({ caller }) func updateOrderStatus(id : Nat, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (ordersNew.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?o) {
        ordersNew.add(
          id,
          {
            id = o.id;
            customerName = o.customerName;
            customerPhone = o.customerPhone;
            customerAddress = o.customerAddress;
            paymentMethod = o.paymentMethod;
            items = o.items;
            subtotal = o.subtotal;
            discountAmount = o.discountAmount;
            totalAmount = o.totalAmount;
            status;
            createdAt = o.createdAt;
          },
        );
      };
    };
  };

  public shared ({ caller }) func deleteOrder(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete orders");
    };
    ordersNew.remove(id);
  };

  // saveProfile open to all anonymous customers - no login required
  public shared func saveProfile(name : Text, phone : Text, address : Text) : async () {
    profiles.add(phone, { phone; name; address; updatedAt = Time.now() });
  };

  public query ({ caller }) func getProfiles() : async [CustomerProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all profiles");
    };
    profiles.values().toArray();
  };

  public query func getDeliveryTiming() : async Text {
    deliveryTiming;
  };

  public shared ({ caller }) func setDeliveryTiming(timing : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set delivery timing");
    };
    deliveryTiming := timing;
  };

  public query func getDiscount() : async Text {
    discountText;
  };

  public shared ({ caller }) func setDiscount(text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set discount");
    };
    discountText := text;
  };
};

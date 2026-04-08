import Map "mo:core/Map";
import Time "mo:core/Time";

actor {

  // ── Legacy type stubs (kept solely for stable-variable upgrade compatibility) ──
  type OldUnitType         = { #kg; #piece; #bundle; #packet };
  type LegacyStoreProduct  = { id : Nat; name : Text; unitType : OldUnitType; pricePerUnit : Nat; stock : Nat; imageId : Text };
  type LegacyOrderItem1    = { productId : Nat; productName : Text; quantityLabel : Text; unitPrice : Nat; itemTotal : Nat };
  type LegacyCustomerOrder = { id : Nat; customerName : Text; phone : Text; address : Text; items : [LegacyOrderItem1]; subtotal : Nat; discountAmount : Nat; totalAmount : Nat; paymentMethod : Text; status : Text; createdAt : Int };
  type LegacyFeedback      = { id : Nat; customerName : Text; message : Text; createdAt : Int };
  type LegacyProductV2     = { id : Nat; name : Text; price : Nat; stock : Nat; imageId : Text; category : Text };
  type LegacyOrderItemV2   = { productId : Nat; productName : Text; quantity : Nat; price : Nat };
  type LegacyOrderV2       = { id : Nat; customerName : Text; customerPhone : Text; customerAddress : Text; paymentMethod : Text; items : [LegacyOrderItemV2]; totalAmount : Nat; status : Text; createdAt : Int };
  type LegacyProductNew    = { id : Nat; name : Text; price : Nat; stock : Nat; imageId : Text; unitType : Text; productCategory : Text; description : Text };
  type LegacyOrderItemNew  = { productId : Nat; productName : Text; quantityLabel : Text; unitPrice : Nat; itemTotal : Nat };
  type LegacyOrderNew      = { id : Nat; customerName : Text; customerPhone : Text; customerAddress : Text; paymentMethod : Text; items : [LegacyOrderItemNew]; subtotal : Nat; discountAmount : Nat; totalAmount : Nat; status : Text; createdAt : Int };
  type LegacyProfile       = { phone : Text; name : Text; address : Text; updatedAt : Int };
  type LegacyUserProfile   = { name : Text; phone : Text; address : Text };
  type LegacyUserRole      = { #admin; #guest; #user };
  type LegacyACState       = { var adminAssigned : Bool; userRoles : Map.Map<Principal, LegacyUserRole> };

  // ── Legacy stable bindings — names must match previous actor exactly ──────────
  // Old plain stable vars
  var discountPercentage  : Nat  = 0;
  var discountMinimum     : Nat  = 0;
  var discount            : Text = "";
  var nextFeedbackId      : Nat  = 1;
  var discountText        : Text = "";
  var bannerEnabled       : Bool = true;
  var trustBadgesEnabled  : Bool = true;
  var bannerCustomText    : Text = "Fresh Vegetables Daily";
  var minimumOrder        : Nat  = 0;

  // Legacy accessControlState — must be present to allow upgrade from previous version
  let accessControlState : LegacyACState = {
    var adminAssigned = false;
    userRoles = Map.empty<Principal, LegacyUserRole>();
  };

  // Old Map-based stores (names must match exactly)
  let storeProducts  = Map.empty<Nat, LegacyStoreProduct>();
  let customerOrders = Map.empty<Nat, LegacyCustomerOrder>();
  let feedbacks      = Map.empty<Nat, LegacyFeedback>();
  let products       = Map.empty<Nat, LegacyProductV2>();
  let orders         = Map.empty<Nat, LegacyOrderV2>();
  let productsNew    = Map.empty<Nat, LegacyProductNew>();
  let ordersNew      = Map.empty<Nat, LegacyOrderNew>();
  let profiles       = Map.empty<Text, LegacyProfile>();
  let userProfiles   = Map.empty<Principal, LegacyUserProfile>();

  // ── Current types ───────────────────────────────────────────────────────
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
    discountType : Text;
    freeItem : Text;
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

  type DiscountSettings = {
    percentageOff : Nat;
    percentageMinOrder : Nat;
    flatOff : Nat;
    flatMinOrder : Nat;
    freeItemName : Text;
    freeItemMinOrder : Nat;
  };

  type AppSettings = {
    heroBannerEnabled : Bool;
    heroBannerHeadline : Text;
  };

  // ── Current stable state ────────────────────────────────────────────────
  var nextProductId : Nat  = 1;
  var nextOrderId   : Nat  = 1;
  var deliveryTiming : Text = "10am - 6pm";
  var heroBannerEnabled  : Bool = true;
  var heroBannerHeadline : Text = "Fresh Vegetables Daily";

  var discountPercentageOff      : Nat  = 0;
  var discountPercentageMinOrder : Nat  = 0;
  var discountFlatOff            : Nat  = 0;
  var discountFlatMinOrder       : Nat  = 0;
  var discountFreeItemName       : Text = "";
  var discountFreeItemMinOrder   : Nat  = 0;

  let productsMap = Map.empty<Nat, Product>();
  let ordersMap   = Map.empty<Nat, Order>();
  let profilesMap = Map.empty<Text, CustomerProfile>();

  // ── Custom Hero Banner Slides ───────────────────────────────────────────
  var nextSlideId : Nat = 1;
  let customSlidesMap = Map.empty<Nat, Text>();

  // ── Products ──────────────────────────────────────────────────────────

  public shared func addProduct(
    name : Text,
    price : Nat,
    stock : Nat,
    imageId : Text,
    unitType : Text,
    productCategory : Text,
    description : Text,
  ) : async Nat {
    let id = nextProductId;
    productsMap.add(id, { id; name; price; stock; imageId; unitType; productCategory; description });
    nextProductId += 1;
    id;
  };

  public query func getProducts() : async [Product] {
    productsMap.values().toArray();
  };

  public shared func updateProduct(
    id : Nat,
    name : Text,
    price : Nat,
    stock : Nat,
    imageId : Text,
    unitType : Text,
    productCategory : Text,
    description : Text,
  ) : async Bool {
    switch (productsMap.get(id)) {
      case (null) { false };
      case (?_) {
        productsMap.add(id, { id; name; price; stock; imageId; unitType; productCategory; description });
        true;
      };
    };
  };

  public shared func deleteProduct(id : Nat) : async Bool {
    switch (productsMap.get(id)) {
      case (null) { false };
      case (?_) {
        productsMap.remove(id);
        true;
      };
    };
  };

  // ── Orders ────────────────────────────────────────────────────────────

  public shared func placeOrder(
    customerName : Text,
    customerPhone : Text,
    customerAddress : Text,
    paymentMethod : Text,
    items : [OrderItem],
    subtotal : Nat,
    discountAmount : Nat,
    discountType : Text,
    freeItem : Text,
    totalAmount : Nat,
  ) : async Nat {
    let id = nextOrderId;
    ordersMap.add(
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
        discountType;
        freeItem;
        totalAmount;
        status    = "Processing";
        createdAt = Time.now();
      },
    );
    nextOrderId += 1;
    id;
  };

  public query func getOrders() : async [Order] {
    ordersMap.values().toArray();
  };

  public query func getOrdersByPhone(phone : Text) : async [Order] {
    ordersMap.values().filter(func(o : Order) : Bool { o.customerPhone == phone }).toArray();
  };

  public shared func updateOrderStatus(id : Nat, status : Text) : async Bool {
    switch (ordersMap.get(id)) {
      case (null) { false };
      case (?o) {
        ordersMap.add(id, {
          id              = o.id;
          customerName    = o.customerName;
          customerPhone   = o.customerPhone;
          customerAddress = o.customerAddress;
          paymentMethod   = o.paymentMethod;
          items           = o.items;
          subtotal        = o.subtotal;
          discountAmount  = o.discountAmount;
          discountType    = o.discountType;
          freeItem        = o.freeItem;
          totalAmount     = o.totalAmount;
          status;
          createdAt       = o.createdAt;
        });
        true;
      };
    };
  };

  public shared func deleteOrder(id : Nat) : async Bool {
    switch (ordersMap.get(id)) {
      case (null) { false };
      case (?_) {
        ordersMap.remove(id);
        true;
      };
    };
  };

  // ── Profiles ────────────────────────────────────────────────────────────

  public shared func saveProfile(phone : Text, name : Text, address : Text) : async Bool {
    profilesMap.add(phone, { phone; name; address; updatedAt = Time.now() });
    true;
  };

  public query func getProfile(phone : Text) : async ?CustomerProfile {
    profilesMap.get(phone);
  };

  public query func getAllProfiles() : async [CustomerProfile] {
    profilesMap.values().toArray();
  };

  // ── Delivery Timing ────────────────────────────────────────────────────

  public query func getDeliveryTiming() : async Text {
    deliveryTiming;
  };

  public shared func setDeliveryTiming(timing : Text) : async Bool {
    deliveryTiming := timing;
    true;
  };

  // ── Discount Settings ──────────────────────────────────────────────────

  public query func getDiscountSettings() : async DiscountSettings {
    {
      percentageOff      = discountPercentageOff;
      percentageMinOrder = discountPercentageMinOrder;
      flatOff            = discountFlatOff;
      flatMinOrder       = discountFlatMinOrder;
      freeItemName       = discountFreeItemName;
      freeItemMinOrder   = discountFreeItemMinOrder;
    };
  };

  public shared func setDiscountSettings(
    percentageOff      : Nat,
    percentageMinOrder : Nat,
    flatOff            : Nat,
    flatMinOrder       : Nat,
    freeItemName       : Text,
    freeItemMinOrder   : Nat,
  ) : async Bool {
    discountPercentageOff      := percentageOff;
    discountPercentageMinOrder := percentageMinOrder;
    discountFlatOff            := flatOff;
    discountFlatMinOrder       := flatMinOrder;
    discountFreeItemName       := freeItemName;
    discountFreeItemMinOrder   := freeItemMinOrder;
    true;
  };

  // ── App Settings ─────────────────────────────────────────────────────────

  public query func getAppSettings() : async AppSettings {
    { heroBannerEnabled; heroBannerHeadline };
  };

  public shared func setAppSettings(enabled : Bool, headline : Text) : async Bool {
    heroBannerEnabled  := enabled;
    heroBannerHeadline := headline;
    true;
  };

  // ── Custom Hero Banner Slides ─────────────────────────────────────────────

  public shared func addCustomSlide(text : Text) : async Nat {
    let id = nextSlideId;
    customSlidesMap.add(id, text);
    nextSlideId += 1;
    id;
  };

  public shared func deleteCustomSlide(id : Nat) : async Bool {
    switch (customSlidesMap.get(id)) {
      case (null) { false };
      case (?_) {
        customSlidesMap.remove(id);
        true;
      };
    };
  };

  public query func getCustomSlides() : async [(Nat, Text)] {
    customSlidesMap.entries().toArray();
  };

};

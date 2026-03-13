export const idlFactory = ({ IDL }) => {
  const Product = IDL.Record({
    id: IDL.Nat,
    name: IDL.Text,
    pricePerKg: IDL.Nat,
    stock: IDL.Nat,
    imageUrl: IDL.Text,
  });
  const OrderItem = IDL.Record({
    productId: IDL.Nat,
    productName: IDL.Text,
    quantity: IDL.Text,
    priceAtOrder: IDL.Nat,
  });
  const CustomerOrder = IDL.Record({
    id: IDL.Nat,
    customerName: IDL.Text,
    phone: IDL.Text,
    address: IDL.Text,
    items: IDL.Vec(OrderItem),
    paymentMethod: IDL.Text,
    status: IDL.Text,
    createdAt: IDL.Int,
  });
  const Result_nat = IDL.Variant({ ok: IDL.Nat, err: IDL.Text });
  const Result_unit = IDL.Variant({ ok: IDL.Null, err: IDL.Text });
  const Result_orders = IDL.Variant({ ok: IDL.Vec(CustomerOrder), err: IDL.Text });
  return IDL.Service({
    checkAdmin: IDL.Func([IDL.Text], [IDL.Bool], ['query']),
    getProducts: IDL.Func([], [IDL.Vec(Product)], ['query']),
    addProduct: IDL.Func([IDL.Text, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text], [Result_nat], []),
    updateProduct: IDL.Func([IDL.Nat, IDL.Text, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text], [Result_unit], []),
    deleteProduct: IDL.Func([IDL.Nat, IDL.Text], [Result_unit], []),
    placeOrder: IDL.Func([IDL.Text, IDL.Text, IDL.Text, IDL.Vec(OrderItem), IDL.Text], [IDL.Nat], []),
    getOrders: IDL.Func([IDL.Text], [Result_orders], ['query']),
    updateOrderStatus: IDL.Func([IDL.Nat, IDL.Text, IDL.Text], [Result_unit], []),
    deleteOrder: IDL.Func([IDL.Nat, IDL.Text], [Result_unit], []),
    setDeliveryTiming: IDL.Func([IDL.Text, IDL.Text], [Result_unit], []),
    getDeliveryTiming: IDL.Func([], [IDL.Text], ['query']),
    setDiscount: IDL.Func([IDL.Nat, IDL.Nat, IDL.Text], [Result_unit], []),
    getDiscount: IDL.Func([], [IDL.Nat, IDL.Nat], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };

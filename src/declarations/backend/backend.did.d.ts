import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Product {
  id: bigint;
  name: string;
  pricePerKg: bigint;
  stock: bigint;
  imageUrl: string;
}

export interface OrderItem {
  productId: bigint;
  productName: string;
  quantity: string;
  priceAtOrder: bigint;
}

export interface CustomerOrder {
  id: bigint;
  customerName: string;
  phone: string;
  address: string;
  items: Array<OrderItem>;
  paymentMethod: string;
  status: string;
  createdAt: bigint;
}

export type Result_nat = { ok: bigint } | { err: string };
export type Result_unit = { ok: null } | { err: string };
export type Result_orders = { ok: Array<CustomerOrder> } | { err: string };

export interface _SERVICE {
  checkAdmin: ActorMethod<[string], boolean>;
  getProducts: ActorMethod<[], Array<Product>>;
  addProduct: ActorMethod<[string, bigint, bigint, string, string], Result_nat>;
  updateProduct: ActorMethod<[bigint, string, bigint, bigint, string, string], Result_unit>;
  deleteProduct: ActorMethod<[bigint, string], Result_unit>;
  placeOrder: ActorMethod<[string, string, string, Array<OrderItem>, string], bigint>;
  getOrders: ActorMethod<[string], Result_orders>;
  updateOrderStatus: ActorMethod<[bigint, string, string], Result_unit>;
  deleteOrder: ActorMethod<[bigint, string], Result_unit>;
  setDeliveryTiming: ActorMethod<[string, string], Result_unit>;
  getDeliveryTiming: ActorMethod<[], string>;
  setDiscount: ActorMethod<[bigint, bigint, string], Result_unit>;
  getDiscount: ActorMethod<[], [bigint, bigint]>;
}

export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: ({ IDL }: { IDL: IDL }) => IDL.Type[];

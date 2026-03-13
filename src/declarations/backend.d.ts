import type { ActorMethod } from '@dfinity/agent';

export type UnitType = { kg: null } | { piece: null } | { bundle: null } | { packet: null };

export interface Product {
  id: bigint;
  name: string;
  unitType: UnitType;
  pricePerUnit: bigint;
  stock: bigint;
  imageId: string;
}

export interface OrderItem {
  productId: bigint;
  productName: string;
  quantityLabel: string;
  unitPrice: bigint;
  itemTotal: bigint;
}

export interface CustomerOrder {
  id: bigint;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  subtotal: bigint;
  discountAmount: bigint;
  totalAmount: bigint;
  paymentMethod: string;
  status: string;
  createdAt: bigint;
}

export interface DiscountSettings {
  percentage: bigint;
  minimumAmount: bigint;
}

export interface _SERVICE {
  addProduct: ActorMethod<[string, UnitType, bigint, bigint, string], bigint>;
  updateProduct: ActorMethod<[bigint, string, UnitType, bigint, bigint, string], void>;
  deleteProduct: ActorMethod<[bigint], void>;
  getProducts: ActorMethod<[], Product[]>;
  placeOrder: ActorMethod<[string, string, string, OrderItem[], bigint, bigint, bigint, string], bigint>;
  getOrders: ActorMethod<[], CustomerOrder[]>;
  updateOrderStatus: ActorMethod<[bigint, string], void>;
  deleteOrder: ActorMethod<[bigint], void>;
  getDeliveryTiming: ActorMethod<[], string>;
  setDeliveryTiming: ActorMethod<[string], void>;
  getDiscount: ActorMethod<[], DiscountSettings>;
  setDiscount: ActorMethod<[bigint, bigint], void>;
  uploadBlob: ActorMethod<[Uint8Array, string], string>;
  getBlobUrl: ActorMethod<[string], string>;
}

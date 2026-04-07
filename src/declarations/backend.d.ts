import type { ActorMethod } from '@dfinity/agent';

export interface Product {
  id: bigint;
  name: string;
  price: bigint;
  stock: bigint;
  imageId: string;
  unitType: string;
  productCategory: string;
  description: string;
}

export interface OrderItem {
  productId: bigint;
  productName: string;
  quantityLabel: string;
  unitPrice: bigint;
  itemTotal: bigint;
}

export interface Order {
  id: bigint;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  paymentMethod: string;
  items: OrderItem[];
  subtotal: bigint;
  discountAmount: bigint;
  discountType: string;
  freeItem: string;
  totalAmount: bigint;
  status: string;
  createdAt: bigint;
}

export interface CustomerProfile {
  phone: string;
  name: string;
  address: string;
  updatedAt: bigint;
}

export interface DiscountSettings {
  percentageOff: bigint;
  percentageMinOrder: bigint;
  flatOff: bigint;
  flatMinOrder: bigint;
  freeItemName: string;
  freeItemMinOrder: bigint;
}

export interface AppSettings {
  heroBannerEnabled: boolean;
  heroBannerHeadline: string;
}

export interface _SERVICE {
  addProduct: ActorMethod<[string, bigint, bigint, string, string, string, string], bigint>;
  getProducts: ActorMethod<[], Product[]>;
  updateProduct: ActorMethod<[bigint, string, bigint, bigint, string, string, string, string], boolean>;
  deleteProduct: ActorMethod<[bigint], boolean>;
  placeOrder: ActorMethod<[string, string, string, string, OrderItem[], bigint, bigint, string, string, bigint], bigint>;
  getOrders: ActorMethod<[], Order[]>;
  getOrdersByPhone: ActorMethod<[string], Order[]>;
  updateOrderStatus: ActorMethod<[bigint, string], boolean>;
  deleteOrder: ActorMethod<[bigint], boolean>;
  saveProfile: ActorMethod<[string, string, string], boolean>;
  getProfile: ActorMethod<[string], [CustomerProfile] | []>;
  getAllProfiles: ActorMethod<[], CustomerProfile[]>;
  getDeliveryTiming: ActorMethod<[], string>;
  setDeliveryTiming: ActorMethod<[string], boolean>;
  getDiscountSettings: ActorMethod<[], DiscountSettings>;
  setDiscountSettings: ActorMethod<[bigint, bigint, bigint, bigint, string, bigint], boolean>;
  getAppSettings: ActorMethod<[], AppSettings>;
  setAppSettings: ActorMethod<[boolean, string], boolean>;
  uploadBlob: ActorMethod<[Uint8Array, string], string>;
  getBlobUrl: ActorMethod<[string], string>;
}

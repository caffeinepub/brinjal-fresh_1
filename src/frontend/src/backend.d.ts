import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DiscountSettings {
    flatMinOrder: bigint;
    percentageMinOrder: bigint;
    freeItemName: string;
    percentageOff: bigint;
    freeItemMinOrder: bigint;
    flatOff: bigint;
}
export interface CustomerProfile {
    name: string;
    updatedAt: bigint;
    address: string;
    phone: string;
}
export interface AppSettings {
    heroBannerEnabled: boolean;
    heroBannerHeadline: string;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: string;
    freeItem: string;
    paymentMethod: string;
    customerPhone: string;
    discountAmount: bigint;
    createdAt: bigint;
    discountType: string;
    customerAddress: string;
    totalAmount: bigint;
    items: Array<OrderItem>;
    subtotal: bigint;
}
export interface Product {
    id: bigint;
    unitType: string;
    productCategory: string;
    name: string;
    description: string;
    stock: bigint;
    imageId: string;
    price: bigint;
}
export interface OrderItem {
    itemTotal: bigint;
    productId: bigint;
    productName: string;
    quantityLabel: string;
    unitPrice: bigint;
}
export interface backendInterface {
    addCustomSlide(text: string): Promise<bigint>;
    addProduct(name: string, price: bigint, stock: bigint, imageId: string, unitType: string, productCategory: string, description: string): Promise<bigint>;
    deleteCustomSlide(id: bigint): Promise<boolean>;
    deleteOrder(id: bigint): Promise<boolean>;
    deleteProduct(id: bigint): Promise<boolean>;
    getAllProfiles(): Promise<Array<CustomerProfile>>;
    getAppSettings(): Promise<AppSettings>;
    getCustomSlides(): Promise<Array<[bigint, string]>>;
    getDeliveryTiming(): Promise<string>;
    getDiscountSettings(): Promise<DiscountSettings>;
    getOrders(): Promise<Array<Order>>;
    getOrdersByPhone(phone: string): Promise<Array<Order>>;
    getProducts(): Promise<Array<Product>>;
    getProfile(phone: string): Promise<CustomerProfile | null>;
    placeOrder(customerName: string, customerPhone: string, customerAddress: string, paymentMethod: string, items: Array<OrderItem>, subtotal: bigint, discountAmount: bigint, discountType: string, freeItem: string, totalAmount: bigint): Promise<bigint>;
    saveProfile(phone: string, name: string, address: string): Promise<boolean>;
    setAppSettings(enabled: boolean, headline: string): Promise<boolean>;
    setDeliveryTiming(timing: string): Promise<boolean>;
    setDiscountSettings(percentageOff: bigint, percentageMinOrder: bigint, flatOff: bigint, flatMinOrder: bigint, freeItemName: string, freeItemMinOrder: bigint): Promise<boolean>;
    updateOrderStatus(id: bigint, status: string): Promise<boolean>;
    updateProduct(id: bigint, name: string, price: bigint, stock: bigint, imageId: string, unitType: string, productCategory: string, description: string): Promise<boolean>;
}

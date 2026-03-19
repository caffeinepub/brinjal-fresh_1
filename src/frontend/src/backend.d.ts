import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface OrderItem {
    itemTotal: bigint;
    productId: bigint;
    productName: string;
    quantityLabel: string;
    unitPrice: bigint;
}
export interface CustomerProfile {
    name: string;
    updatedAt: bigint;
    address: string;
    phone: string;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: string;
    paymentMethod: string;
    customerPhone: string;
    discountAmount: bigint;
    createdAt: bigint;
    customerAddress: string;
    totalAmount: bigint;
    items: Array<OrderItem>;
    subtotal: bigint;
}
export interface UserProfile {
    name: string;
    address: string;
    phone: string;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addProduct(name: string, price: bigint, stock: bigint, imageId: string, unitType: string, productCategory: string, description: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteOrder(id: bigint): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDeliveryTiming(): Promise<string>;
    getDiscount(): Promise<string>;
    getOrders(): Promise<Array<Order>>;
    getOrdersByPhone(phone: string): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    getProfiles(): Promise<Array<CustomerProfile>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerName: string, customerPhone: string, customerAddress: string, paymentMethod: string, items: Array<OrderItem>, subtotal: bigint, discountAmount: bigint, totalAmount: bigint): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    saveProfile(name: string, phone: string, address: string): Promise<void>;
    setDeliveryTiming(timing: string): Promise<void>;
    setDiscount(text: string): Promise<void>;
    updateOrderStatus(id: bigint, status: string): Promise<void>;
    updateProduct(id: bigint, name: string, price: bigint, stock: bigint, imageId: string, unitType: string, productCategory: string, description: string): Promise<void>;
}

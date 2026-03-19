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
    items: Array<OrderItem>;
    subtotal: bigint;
    discountAmount: bigint;
    totalAmount: bigint;
    status: string;
    createdAt: bigint;
}
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
export interface CustomerProfile {
    phone: string;
    name: string;
    address: string;
    updatedAt: bigint;
}
export interface backendInterface {
    addProduct(name: string, price: bigint, stock: bigint, imageId: string, unitType: string, productCategory: string, description: string): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getDeliveryTiming(): Promise<string>;
    getDiscount(): Promise<string>;
    getOrders(): Promise<Array<Order>>;
    getOrdersByPhone(phone: string): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    placeOrder(customerName: string, customerPhone: string, customerAddress: string, paymentMethod: string, items: Array<OrderItem>, subtotal: bigint, discountAmount: bigint, totalAmount: bigint): Promise<bigint>;
    setDeliveryTiming(timing: string): Promise<void>;
    setDiscount(discountText: string): Promise<void>;
    updateOrderStatus(id: bigint, status: string): Promise<void>;
    updateProduct(id: bigint, name: string, price: bigint, stock: bigint, imageId: string, unitType: string, productCategory: string, description: string): Promise<void>;
    saveProfile(name: string, phone: string, address: string): Promise<void>;
    getProfiles(): Promise<Array<CustomerProfile>>;
}

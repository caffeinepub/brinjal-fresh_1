export interface OrderItem {
    productId: bigint;
    productName: string;
    quantity: bigint;
    price: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    status: string;
    paymentMethod: string;
    customerPhone: string;
    createdAt: bigint;
    customerAddress: string;
    totalAmount: bigint;
    items: Array<OrderItem>;
}
export interface Product {
    id: bigint;
    name: string;
    stock: bigint;
    category: string;
    imageId: string;
    price: bigint;
}
export interface backendInterface {
    addProduct(name: string, price: bigint, stock: bigint, imageId: string, category: string): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getDeliveryTiming(): Promise<string>;
    getDiscount(): Promise<string>;
    getOrders(): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product>;
    getProducts(): Promise<Array<Product>>;
    placeOrder(customerName: string, customerPhone: string, customerAddress: string, paymentMethod: string, items: Array<OrderItem>): Promise<bigint>;
    setDeliveryTiming(timing: string): Promise<void>;
    setDiscount(discountText: string): Promise<void>;
    updateOrderStatus(orderId: bigint, status: string): Promise<void>;
    updateProduct(id: bigint, name: string, price: bigint, stock: bigint, imageId: string, category: string): Promise<void>;
}

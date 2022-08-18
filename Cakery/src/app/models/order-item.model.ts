export interface OrderItem {
    orderID: number;
    productID: number;
    name: string;
    description: string;
    price: number;
    promotion: number;
    quantity: number;
    sum: number;
}
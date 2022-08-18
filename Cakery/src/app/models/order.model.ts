export interface Order {
    orderID: number;
    userID: string;
    username: string;
    firstName: string;
    lastName: string;
    address: string;
    time: Date;
    delivery: string;
    paymentMethod: string;
    sum: number;
}
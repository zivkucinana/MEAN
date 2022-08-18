import { OrderItem } from './../models/order-item.model';
import { Order } from './../models/order.model';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators'

const api = environment.serviceApi;

@Injectable({ providedIn: 'root' })
export class OrdersDataService {

  public cart: { productId: number, name: string, quantity: number, price: number, promotion: number }[] = [];

  constructor(private http: HttpClient) { }

  getOrders() {
    return this.http.get<Order[]>(api + "orders");
  }

  getOrderById(orderId: number) {
    return this.http.get<Order>(api + "orders/" + orderId).pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    return throwError(error);
  }

  getOrderItemsByOrderId(orderId: number) {
    return this.http.get<OrderItem[]>(api + "orders/items/" + orderId).pipe(catchError(this.handleError));
  }

  getLatestOrderByCurrentUser() {
    return this.http.get<Order>(api + "orders/latest");
  }

  addOrderItem(orderId: number, item: { productId: number, quantity: number }) {
    const headerDict = {
      'Content-Type': 'text/json'
    }

    const requestOptions = {
      headers: new HttpHeaders(headerDict)
    };

    this.http.post(api + "orders/items/" + orderId,
      JSON.stringify(item), requestOptions).subscribe(() => { });
  }

  addOrder(
    order: {
      userId: string,
      delivery: string,
      paymentMethod: string,
      orderItems: {
        productId: number,
        quantity: number
      }[]
    }) {

    const headerDict = {
      'Content-Type': 'text/json'
    }

    const requestOptions = {
      headers: new HttpHeaders(headerDict)
    };

    return this.http.post(api + "orders", JSON.stringify(order),
      requestOptions).pipe(catchError(this.handleError));
  }


  deleteOrder(orderId: number) {
    return this.http.delete(api + "orders/" + orderId).pipe(catchError(this.handleError));
  }

  addToCart(productID: number, name: string, price: number, promotion: number) {
    let item = this.cart.find(item => item.productId === productID);
    let index = this.cart.indexOf(item);

    if (index !== -1) {
      this.cart[index].quantity = item.quantity += 1;
    } else {
      this.cart.push({ productId: productID, name: name, quantity: 1, price: price, promotion: promotion });
    }
  }

  removeFromCart(productID: number) {
    let item = this.cart.find(item => item.productId === productID);
    let index = this.cart.indexOf(item);

    if (index !== -1) {
      this.cart[index].quantity -= 1;
      if (this.cart[index].quantity <= 0) {
        this.cart.splice(index, 1);
      }
    }
  }

  getTotalSum(): number {
    let sum = 0;
    this.cart.forEach(item => {
      sum += item.quantity * (item.price - (item.price * (item.promotion / 100)));
    });

    return sum;
  }

  getCart() {
    console.log("from service: ", this.cart);
    return this.cart;
  }

  deleteFromCart() {
    this.cart = [];
  }
}
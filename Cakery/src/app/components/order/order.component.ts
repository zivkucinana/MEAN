import { OrderItem } from './../../models/order-item.model';
import { OrdersDataService } from './../../services/orders.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Order } from 'src/app/models/order.model';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  public isLoading = false;
  public isDataAvailable = false;

  id: number;
  private sub: any;

  order: Order;
  orderItems: OrderItem[];

  public error: any;

  constructor(private route: ActivatedRoute, private ordersDataService: OrdersDataService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.sub = this.route.params.subscribe(params => {
       this.id = +params['id']; 

       this.getOrder().then(() => {
         this.getOrderItems().then(() => {
           this.isDataAvailable = true;
           this.isLoading = false;
         });
       });
    });
  }

  async getOrder() {
    await new Promise((resolve, _) => {
      this.ordersDataService.getOrderById(this.id).subscribe(order => {
        this.order = order;
        resolve(order);
      }, error => {
        this.error = error;
        this.isDataAvailable = false;
        this.isLoading = false;
        console.log("Error: ", error);
      });
    });
  }

  async getOrderItems() {
    await new Promise((resolve, _) => {
      this.ordersDataService.getOrderItemsByOrderId(this.id).subscribe(orderItems => {
        this.orderItems = orderItems;
        resolve(orderItems);
      }, error => {
        this.isDataAvailable = false;
        this.isLoading = false;
        console.log("Error: ", error);
      });
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}

import { Router } from '@angular/router';
import { OrdersDataService } from './../../services/orders.service';
import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order.model';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {

  public isLoading = false;

  orders: Order[];

  public totalSum: number = 0;

  constructor(private ordersDataService: OrdersDataService, private router: Router) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.getOrders().then(() => {
      if (this.orders.length > 0) {
        this.getTotalSum();
      }
      this.isLoading = false;
    })
  }

  async getOrders() {
    await new Promise((resolve, _) => {
      this.ordersDataService.getOrders().subscribe(orders => {
        this.orders = orders;
        resolve(orders);
      });
    });
  }

  getTotalSum() {
    this.orders.forEach(order => {
      this.totalSum += order.sum;
    })
  }

  onClick(id: number) {
    this.router.navigate(['/order-details', id]);
  }

  onDelete(id: number) {
    this.ordersDataService.deleteOrder(id).subscribe(response => {
      console.log("Resp:", response);
      this.ngOnInit();
    }, error => {
      console.log("Err", error);
      this.ngOnInit();
    })
  }
}

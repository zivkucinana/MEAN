import { environment } from 'src/environments/environment';
import { OrdersDataService } from './../../services/orders.service';
import { UsersDataService } from './../../services/users.service';
import { ProductsDataService } from './../../services/products.service';
import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product.model';
import { Subscription } from 'rxjs';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent implements OnInit {

  public isLoading = false;
  public isDataAvailable = false;

  public products: Product[];

  public cart: { productId: number, name: string, quantity: number, price: number, promotion: number }[] = [];

  public totalSum: number = 0;

  public user: User;

  public isSent: boolean = false;

  userIsAuthenticated = false;
  private authListenerSubs: Subscription;
  
  delivery: string = "PICKUP";
  paymentMethod: string = "INVOICE"

  message: any;

  private api = environment.imageApi;

  constructor(private productsDataService: ProductsDataService, 
              private usersDataService: UsersDataService, 
              private ordersDataService: OrdersDataService) { }

  ngOnInit(): void {
    this.isSent = false;
    this.userIsAuthenticated = this.usersDataService.getIsAuth();
    this.authListenerSubs = this.usersDataService.getAuthStatusListener()
        .subscribe(isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
        });
    this.getProducts().then(() => {
      if (this.userIsAuthenticated) {
        this.getCurrentUser().then(user => {
          if (this.products.length > 0) {
            this.isLoading = false;
            this.isDataAvailable = true;
          } else {
            this.isLoading = false;
            this.isDataAvailable = false;
          }
        })
      } else {
        this.isDataAvailable = true;
        this.isLoading = false;
      }
    }).catch(error => {
      this.isDataAvailable = false;
      this.isLoading = false;
    });
  }

  getImage(image) {
    let imageUrl = this.api + image;
    return imageUrl;
  }

  async getProducts() {
    this.isLoading = true;
    await new Promise((resolve, _) => {
      this.productsDataService.getProducts().subscribe((products: Product[]) => {
        this.products = products;
        this.products.forEach(product => {
          if (product.imagePath == null || product.imagePath == '') {
            product.imagePath = 'no-image.png';
          }
        })
        resolve(products);
      })
    })
  }

  async getCurrentUser() {
    await new Promise((resolve, _) => {
      this.usersDataService.getCurrentUser().subscribe(user => {
        this.user = user;
        console.log(this.user);
        resolve(user);
      });
    });
  }

  async sendOrder() {
    await new Promise(async (resolve, reject) => {

      this.isSent = false;

      const orderItems: { productId: number, quantity: number }[] = [];

      this.cart.forEach(item => {
        orderItems.push({ productId: item.productId, quantity: item.quantity });
      })

      const order = {
        userId: this.user.userID,
        delivery: this.delivery,
        paymentMethod: this.paymentMethod,
        orderItems: orderItems
      };

      this.ordersDataService.addOrder(order).subscribe(response => {
        this.message = response;
        resolve(order);
      }, error => {
        reject(error);
      });
    }).then(() => {
      this.isSent = true;
      this.cart = [];
      this.ordersDataService.deleteFromCart();
      this.totalSum = this.ordersDataService.getTotalSum();

    }).catch(error => {
      console.log("Error: ", error);
    })
  }

  addToCart(productID: number, name: string, price: number, promotion: number) {
    this.ordersDataService.addToCart(productID, name, price, promotion);
    this.cart = this.ordersDataService.getCart();
    this.totalSum = this.ordersDataService.getTotalSum();
  }

  removeFromCart(productID: number) {
    this.ordersDataService.removeFromCart(productID);
    this.cart = this.ordersDataService.getCart();
    this.totalSum = this.ordersDataService.getTotalSum();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }

  onCash(obj: any) {
    this.paymentMethod = obj.target.defaultValue;
  }

  onDeliveryChange(obj: any) {
    let state: boolean = obj.target.checked;
    this.delivery = state ? "DELIVERY" : "PICKUP";
  }
}

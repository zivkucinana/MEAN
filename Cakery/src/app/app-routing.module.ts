import { ProductComponent } from './components/product/product.component';
import { RegisterComponent } from './components/register/register.component';
import { LoginComponent } from './components/login/login.component';
import { OrdersComponent } from './components/orders/orders.component';
import { OrderComponent } from './components/order/order.component';
import { ProductsComponent } from './components/products/products.component';
import { AboutUsComponent } from './components/about-us/about-us.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/products', 
    pathMatch: 'full'
  }, {
    path: 'about-us',
    component: AboutUsComponent
  }, {
    path: 'products',
    component: ProductsComponent
  }, {
    path: 'product-details/:id',
    component: ProductComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'products/new',
    component: ProductComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'orders',
    component: OrdersComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'order-details/:id',
    component: OrderComponent,
    canActivate: [AuthGuard]
  }, {
    path: 'login',
    component: LoginComponent
  }, {
    path: 'register',
    component: RegisterComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from './../../environments/environment';
import { Product } from '../models/product.model';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

const api = environment.serviceApi;

@Injectable({providedIn: 'root'})
export class ProductsDataService {
    constructor(private http: HttpClient) {}

    handleError(error: HttpErrorResponse) {
        return throwError(error);
    }
      
    getProducts() {
        return this.http.get<Product[]>(api + "products");
    }

    getProductById(productId: number) {
        return this.http.get<Product>(api + "products/" + productId)
            .pipe(catchError(this.handleError));
    }

    addProduct(product: Product) {
        const headerDict = {
            'Content-Type': 'text/json'
          }
      
          const requestOptions = {
            headers: new HttpHeaders(headerDict)
          };
          
        return this.http.post(api + "products/", JSON.stringify(product), 
            requestOptions).pipe(catchError(this.handleError));
    }

    updateProduct(productId: number, newProduct: Product) {
        const headerDict = {
            'Content-Type': 'text/json'
          }
      
          const requestOptions = {
            headers: new HttpHeaders(headerDict)
          };
          
        return this.http.put(api + "products/update/" + productId, 
            JSON.stringify(newProduct), requestOptions)
                .pipe(catchError(this.handleError));
    }

    deleteProduct(productId: number) {
        return this.http.delete(api + "products/" + productId)
            .pipe(catchError(this.handleError));
    }

    uploadImage(path: string, image:any) {
        const formData: FormData = new FormData();
        formData.append('Image', image, image.name);
        return this.http.post(api + path +  '/image', formData);
    }

    removeImage(productId: number){
        this.http.put(api + "products/" + productId + "/remove-image", null).subscribe();
    }
}
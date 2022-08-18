import { UsersDataService } from 'src/app/services/users.service';
import { environment } from 'src/environments/environment';
import { ProductsDataService } from './../../services/products.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {

  id: number;
  private sub: any;

  public newProduct: boolean = false;

  public product: Product;

  public isLoading = false;
  public isDataAvailable = false;

  isUpdated: boolean = false;
  hasError: boolean = false;
  error: any = undefined;

  fileToUpload: any;

  public imgPreview: any;

  private api = environment.imageApi;

  public message;

  private user: User;

  constructor(private route: ActivatedRoute, private router: Router, private productsDataService: ProductsDataService, private usersDataService: UsersDataService) { }

  ngOnInit(): void {
    this.getCurrentUser().then(() => {
      if (!this.user.isAdmin){

        this.router.navigate(['/products']);
      }
    });

    console.log(this.router.url)
    if (this.router.url === '/products/new') {
      this.newProduct = true;
      this.product = {
        productID: undefined,
        name: null,
        description: null,
        price: null,
        promotion: null,
        imagePath: "no-image.png"
      };
      this.isLoading = false;
      this.isDataAvailable = true;
    } else {
      this.sub = this.route.params.subscribe(params => {
          this.isLoading = true;
          this.isDataAvailable = false;
          this.id = +params['id'];
          this.newProduct = false;
          this.getProductById(this.id).then(() => {
            if (this.product != null) {
              this.isDataAvailable = true;
              this.isLoading = false;
            }
          }).catch(error => {
            this.isDataAvailable = false;
            this.isLoading = false;
            console.log("Error: ", error);
          });
    });
    }
  }

  ngOnDestroy() {
    if (this.sub != undefined) {
      this.sub.unsubscribe();
    }
  }

  async getCurrentUser() {
    await new Promise((resolve, reject) => {
      this.usersDataService.getCurrentUser().subscribe(user => {
        this.user = user;
        resolve(user);
      }, error => {
        console.log("Error", error);
        reject(error);
      })
    });
  }

  getImage(image) {
    let imageUrl = this.api + image;
    return imageUrl;
  }
  
  async getProductById(id: number) {
    this.error = undefined;
    await new Promise((resolve, reject) => {
      this.productsDataService.getProductById(id).subscribe(product => {
        this.product = product;
        if (this.product.imagePath == null || this.product.imagePath == '') {
          this.product.imagePath = 'no-image.png';
        }
        resolve(product);
      }, error => {
        this.error = error;
        reject(error);
      })
    })
  }

  onDelete() {
    this.hasError = false;
    this.productsDataService.deleteProduct(this.id).subscribe(() => {
      this.router.navigate(['/products']);
    }, error => {
      this.message = error.error.message;
      this.hasError = true;
    });
  }

  onSave(Image: any) {
    this.isUpdated = false;
    if (this.newProduct) {
      console.log(this.product);
      this.productsDataService.addProduct(this.product).subscribe(response => {
        this.id = +response.toString().split('/')[1];
        this.product.productID = this.id;
        if (this.fileToUpload != null) {
          this.uploadImage(response + "", Image);
        }
        this.message = "Product " + this.product.name + " has been successfully added into the database."
        this.newProduct = false;
        this.isUpdated = true;
      }, error => {
        this.isUpdated = false;
        console.log("Error: ", error);
      });
    } else {
      this.productsDataService.updateProduct(this.id, this.product).subscribe(response => {
        if (this.fileToUpload != null) {
          this.uploadImage(response + "", Image);
        }
        this.message = "Product has been successfully updated.";
        this.isUpdated = true;
      }, error => {
        this.isUpdated = false;
        console.log("Error: ", error);
      });
    }
  }

  uploadImage(productPath: string, Image: any) {
    this.productsDataService.uploadImage(productPath, this.fileToUpload).subscribe(
      imagePath => {
        Image.value = null;
        this.imgPreview = null;
        this.product.imagePath = "" + imagePath;
      }
    );
  }

  handleFileInput(obj: any) {
    this.fileToUpload = obj.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(this.fileToUpload); 
    reader.onload = (_event) => { 
      this.imgPreview = reader.result; 
    }
  }

  onRemoveImage() {
    this.productsDataService.removeImage(this.product.productID);
    this.product.imagePath = "no-image.png";
  }
}

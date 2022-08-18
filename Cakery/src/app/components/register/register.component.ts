import { NewUser } from './../../models/new-user.model';
import { UsersDataService } from 'src/app/services/users.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  hasError = false;
  public error: any;

  public user: NewUser = {
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    password: "",
    confirmPassword: ""
  };

  constructor(private usersDataService: UsersDataService) { }

  ngOnInit(): void {
    this.user = {
      email: "",
      firstName: "",
      lastName: "",
      address: "",
      password: "",
      confirmPassword: ""
    };
  }

  async onRegister() {
    console.log(this.user);
    this.usersDataService.register(this.user).then(() => {
    }).catch(error => {
      console.log("Error", error);
      this.error = error;
      this.hasError = true;
    });
  }

}

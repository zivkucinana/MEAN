import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UsersDataService } from 'src/app/services/users.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  userIsAuthenticated = false;
  private authListenerSubs: Subscription;


  constructor(private usersDataService: UsersDataService, private router: Router) {}

  ngOnInit() {
    this.userIsAuthenticated = this.usersDataService.getIsAuth();
    this.authListenerSubs = this.usersDataService.getAuthStatusListener()
        .subscribe(isAuthenticated => {
          this.userIsAuthenticated = isAuthenticated;
        });
  }

  logOut() {
    this.usersDataService.logOut();
  }

  ngOnDestroy() {
    this.authListenerSubs.unsubscribe();
  }

}

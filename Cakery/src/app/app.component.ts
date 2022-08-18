import { UsersDataService } from './services/users.service';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Cakery';

  constructor(private usersDataService: UsersDataService) {}

  ngOnInit() {
    this.usersDataService.autoAuthUser();
  }
}

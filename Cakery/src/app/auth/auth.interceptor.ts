import { UsersDataService } from './../services/users.service';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private usersDataService: UsersDataService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        const authToken = this.usersDataService.getToken();
        const authRequest = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + authToken)
        });
        return next.handle(authRequest);
    }

}
import { NewUser } from './../models/new-user.model';

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { User } from '../models/user.model';
import { environment } from 'src/environments/environment';
import { Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

const api = environment.serviceApi;
const loginApi = environment.loginApi;

@Injectable({providedIn: 'root'})
export class UsersDataService {

    private isAuthenticated = false;
    private token: string;
    private username: string;
    private authStatusListener = new Subject<boolean>();

    private tokenTimer: any;

    constructor(private http: HttpClient, private router: Router) {}

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    getUsername() {
        return this.username;
    }

    getCurrentUser() {
        return this.http.get<User>(api + "users/current")
    }

    async register(newUser: NewUser) {
        await new Promise((resolve, reject) => {
            const headerDict = {
                'Content-Type': 'text/json'
            };
    
            const requestOptions = {
                headers: new HttpHeaders(headerDict)
            };
    
            return this.http.post(api + '/account/register', JSON.stringify(newUser), requestOptions)
            .subscribe(response => {
                this.router.navigate(['/login']);
                resolve(response);
            }, error => {
                this.authStatusListener.next(false);
                reject(error);
            })
        });
    }

    handleError(error: HttpErrorResponse) {
        return throwError(error);
      }

    async login(username: string, password: string) {
        const authData = "username=" + username + "&password=" + password + "&grant_type=password";
        await new Promise((resolve, reject) => {
            const observable = this.http.post<{ access_token: string, expires_in: number; userName: string }>
            (loginApi, authData).pipe(catchError(this.handleError));
            observable.subscribe(response => {
                const token = response.access_token;
                this.token = token;
                if (token) {
                    const expiresInDuration = response.expires_in;
                    this.setAuthTimer(expiresInDuration);
                    this.isAuthenticated = true;
                    this.authStatusListener.next(true);
                    this.username = response.userName;
                    const now = new Date();
                    const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
                    this.saveAuthData(token, expirationDate, this.username);
                    resolve(this.getAuthData());
                    this.router.navigate(['/products']);
                }
            }, error => {
                console.log("Error: ", error);
                reject(error);
            });
        });
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logOut();
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date, username: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('username', username);
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('username');
    }

    logOut() {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.username = null;
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/login']);
    }

    autoAuthUser() {
        const authInformation = this.getAuthData();
        if (!authInformation){
            return;
        }
        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
        if (expiresIn>0) {
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.username = authInformation.username;
            this.setAuthTimer(expiresIn/1000);
            this.authStatusListener.next(true);
        }
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const username = localStorage.getItem('username');
        if (!token || !expirationDate) {
            return;
        }

        return {
            token: token,
            expirationDate: new Date(expirationDate),
            username: username
        }
    }
}
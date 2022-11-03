import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { catchError, Observable, throwError } from 'rxjs';
import { AuthService } from '../_services/auth.service';
import { Router } from "@angular/router";

@Injectable({
    providedIn: 'root'
})
export class AuthErrorInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService, private router: Router) { }
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            if([401, 403].indexOf(err.status) !== -1) {
                this.authService.logout().subscribe({
                    next: data => {
                        this.router.navigate(['/login']);
                    }
                });
            }
            
            return throwError(() => err);
        }));
    }

}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Role } from '../_model/Role';
import { Principal } from '../_security/Principal';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  principalSubject: BehaviorSubject<Principal | null>;
  principal: Observable<Principal | null>;

  constructor(
    private http: HttpClient,
    private router: Router
  ) { 
    const storedPrincipalStr = localStorage.getItem('principal');

    if(storedPrincipalStr == null) {
      this.principalSubject = new BehaviorSubject<Principal | null>(null);
    } else {
      const principal: Principal = 
        Principal.fromData(JSON.parse(storedPrincipalStr));
      this.principalSubject = new BehaviorSubject<Principal | null>(principal);
    }

    this.principal = this.principalSubject.asObservable();
  }

  public get principalValue(): Principal | null {
    return this.principalSubject.value;
  }

  login(username: string, password: string): Observable<Principal> {
    return this.http.post<Principal>(environment.restUrl + '/api/v1/auth/login', {username: username, password: password}, {withCredentials: true})
      .pipe(map(data => {
        const recivedPrincipal = Principal.fromData(data);
        localStorage.setItem('principal', JSON.stringify(recivedPrincipal));
        this.principalSubject.next(recivedPrincipal);
        console.log(recivedPrincipal);
        return recivedPrincipal;
      }));
  }

  logout(): Observable<any> {
    return this.http.get(environment.restUrl + '/api/v1/auth/logout', {withCredentials: true})
      .pipe(tap(data => {
        localStorage.removeItem('principal');
        this.principalSubject.next(null);
      }));
  }

  hasRole(roles: Array<Role>): boolean {
    if(this.principalValue && this.principalValue.roles && this.principalValue.roles.length > 0) {
      for(let role of roles) {
        if(this.principalValue.roles.indexOf(role) !== -1) {
          return true;
        }
      }
    }

    return false;
  }
}

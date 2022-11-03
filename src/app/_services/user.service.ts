import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../_model/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  selectedUser: BehaviorSubject<User | null>;

  constructor(
    private http: HttpClient,
  ) {
    this.selectedUser = new BehaviorSubject<User | null>(null);
   }

  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(environment.restUrl + '/api/v1/users/' + userId, {withCredentials: true})
      .pipe(map(data => User.fromData(data)));
  }

  updateUserFullName(userId: number, formData: any): Observable<User> {
    return this.http.put<User>(environment.restUrl + '/api/v1/users/' + userId + '/full-name',
    formData, 
    {withCredentials: true})
      .pipe(map(data => User.fromData(data)));
  }
}

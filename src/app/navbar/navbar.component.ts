import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Role } from '../_model/Role';
import { AuthService } from '../_services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  Role = Role;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  isAuthenticated(): boolean {
    return !(this.authService.principalValue == null);
  }

  hasRole(roles: Array<Role>): boolean {
    return this.authService.hasRole(roles);
  }

  logout() {
    this.authService.logout()
      .subscribe(_ => {
        this.router.navigate(['/login']);
      });
  }

}

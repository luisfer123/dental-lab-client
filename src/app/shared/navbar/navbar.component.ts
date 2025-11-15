import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { filter, Subscription } from 'rxjs';

declare const bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private auth = inject(AuthService);

  private routerSubscription!: Subscription;
  private userSub?: Subscription;

  isLoggedIn = false;
  username = '';

  ngOnInit(): void {
    // Actualiza automáticamente cuando el AuthService cambia
    this.userSub = this.auth.currentUser$.subscribe(user => {
      console.log('Navbar detecta cambio de usuario:', user);
      this.isLoggedIn = !!user;
      this.username = user?.username ?? '';
    });

    // Re-inicializa dropdowns al navegar
    this.routerSubscription = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.initializeBootstrapDropdowns());
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  onLoginLogout(): void {
    if (this.isLoggedIn) {
      this.auth.logout().subscribe(() => this.router.navigate(['/']));
    } else {
      this.router.navigate(['/auth/login']);
    }
  }

  goHome(): void        { this.router.navigate(['/']); }
  goToClients(): void   { this.router.navigate(['/clients']); }

  goToDentists(): void {
    this.router.navigate(['/clients'], { queryParams: { filter: 'dentists' } });
  }

  goToStudents(): void {
    this.router.navigate(['/clients'], { queryParams: { filter: 'students' } });
  }

  goToTechnicians(): void {
    this.router.navigate(['/clients'], { queryParams: { filter: 'technicians' } });
  }

  goToWorks(): void {
    this.router.navigate(['/works']);
  }

  private initializeBootstrapDropdowns(): void {
    const toggles = document.querySelectorAll('[data-bs-toggle="dropdown"]');
    toggles.forEach(t => bootstrap.Dropdown.getOrCreateInstance(t));
  }
}
